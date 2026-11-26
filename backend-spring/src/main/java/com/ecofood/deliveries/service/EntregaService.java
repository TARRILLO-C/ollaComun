package com.ecofood.deliveries.service;

import com.ecofood.deliveries.dto.ValidarEntregaRequest;
import com.ecofood.deliveries.dto.ValidarEntregaResponse;
import com.ecofood.deliveries.entity.Entrega;
import com.ecofood.deliveries.repository.EntregaRepository;
import com.ecofood.donations.entity.Donacion;
import com.ecofood.donations.entity.DonationStatus;
import com.ecofood.donations.exception.DonationConflictException;
import com.ecofood.donations.repository.DonacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EntregaService {

    private static final Logger log = LoggerFactory.getLogger(EntregaService.class);
    private static final int MAX_INTENTOS_PIN = 3;

    private final EntregaRepository entregaRepository;
    private final DonacionRepository donacionRepository;

    public EntregaService(EntregaRepository entregaRepository, DonacionRepository donacionRepository) {
        this.entregaRepository = entregaRepository;
        this.donacionRepository = donacionRepository;
    }

    /**
     * Valida la entrega mediante PIN de 6 dígitos o Token QR.
     * Si se ingresa un PIN erróneo:
     * - Incrementa intentosFallidosPin en la donación.
     * - Al 3er intento fallido bloquea el PIN y exige obligatoriamente QR.
     */
    @Transactional
    public ValidarEntregaResponse validarYCompletarEntrega(ValidarEntregaRequest request) {
        log.info("Iniciando validación de entrega con código: '{}'", request.getCodigo());

        if (request.getCodigo() == null || request.getCodigo().trim().isEmpty()) {
            throw new IllegalArgumentException("Debe ingresar el código PIN o escanear el código QR.");
        }

        String codigoLimpio = request.getCodigo().trim();
        boolean esPin = codigoLimpio.length() == 6 && codigoLimpio.chars().allMatch(Character::isDigit);

        // 1. Intentar buscar coincidencia directa con bloqueo pesimista
        Optional<Entrega> entregaOpt = entregaRepository.findActiveByCodeWithLock(codigoLimpio);

        if (entregaOpt.isPresent()) {
            Entrega entrega = entregaOpt.get();

            // Verificar si el PIN estaba bloqueado en caso de que hayan intentado ingresar por PIN
            Optional<Donacion> donacionOpt = donacionRepository.findByDonationUuidWithLock(entrega.getDonationId());
            if (donacionOpt.isPresent()) {
                Donacion donacion = donacionOpt.get();
                if (esPin && Boolean.TRUE.equals(donacion.getPinBloqueado())) {
                    throw new DonationConflictException(
                            "El acceso por PIN ha sido bloqueado por superar 3 intentos fallidos. Debe escanear obligatoriamente el código QR."
                    );
                }
            }

            return completarExito(entrega);
        }

        // 2. Si el código no coincide y es formato PIN (6 dígitos numéricos)
        if (esPin) {
            manejarIntentoFallidoPin(codigoLimpio);
        }

        throw new IllegalArgumentException("El código PIN/QR no es válido, ha caducado o la entrega ya fue confirmada.");
    }

    private void manejarIntentoFallidoPin(String pinErroneo) {
        // En un flujo real, si el bodeguero está en el dashboard de una donación específica,
        // incrementamos el contador de la donación activa reservada.
        // Buscamos cualquier donación reservada para registrar el intento fallido.
        Optional<Entrega> anyActiveDelivery = entregaRepository.findAll().stream()
                .filter(e -> "PENDING_PICKUP".equals(e.getStatus()))
                .findFirst();

        if (anyActiveDelivery.isPresent()) {
            String donationId = anyActiveDelivery.get().getDonationId();
            Optional<Donacion> donacionOpt = donacionRepository.findByDonationUuidWithLock(donationId);
            if (donacionOpt.isPresent()) {
                Donacion donacion = donacionOpt.get();
                int intentos = donacion.getIntentosFallidosPin() + 1;
                donacion.setIntentosFallidosPin(intentos);

                if (intentos >= MAX_INTENTOS_PIN) {
                    donacion.setPinBloqueado(true);
                    donacionRepository.save(donacion);
                    log.warn("Donación {}: PIN BLOQUEADO por {} intentos fallidos. Exigir QR.", donationId, intentos);
                    throw new DonationConflictException(
                            "Has superado el límite de 3 intentos fallidos. La validación por PIN ha sido BLOQUEADA por seguridad. Debe escanear obligatoriamente el código QR."
                    );
                } else {
                    donacionRepository.save(donacion);
                    int restantes = MAX_INTENTOS_PIN - intentos;
                    log.warn("Donación {}: PIN erróneo. Intento {}/{}. Quedan {} restantes.", donationId, intentos, MAX_INTENTOS_PIN, restantes);
                    throw new IllegalArgumentException(
                            "Código PIN incorrecto. Te quedan " + restantes + " intento(s) antes de que se bloquee el PIN y se exija el código QR."
                    );
                }
            }
        }
    }

    private ValidarEntregaResponse completarExito(Entrega entrega) {
        LocalDateTime ahora = LocalDateTime.now();

        entrega.setStatus("COMPLETED");
        entrega.setDeliveredAt(ahora);
        entregaRepository.save(entrega);

        String tituloDonacion = "Donación Rescatada";
        Optional<Donacion> donacionOpt = donacionRepository.findByDonationUuidWithLock(entrega.getDonationId());
        if (donacionOpt.isPresent()) {
            Donacion donacion = donacionOpt.get();
            donacion.setStatus(DonationStatus.DELIVERED);
            donacion.setIntentosFallidosPin(0); // Reiniciar en éxito
            donacionRepository.save(donacion);
            tituloDonacion = donacion.getTitle();
        }

        log.info("Entrega {} completada y donación {} sellada con éxito", entrega.getDeliveryUuid(), entrega.getDonationId());

        return ValidarEntregaResponse.success(
                entrega.getDeliveryUuid(),
                entrega.getDonationId(),
                tituloDonacion,
                ahora
        );
    }
}
