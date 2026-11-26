package com.ecofood.donations.service;

import com.ecofood.deliveries.entity.Entrega;
import com.ecofood.deliveries.repository.EntregaRepository;
import com.ecofood.donations.dto.NuevaDonacionRequest;
import com.ecofood.donations.entity.Donacion;
import com.ecofood.donations.entity.DonationStatus;
import com.ecofood.donations.exception.DonationConflictException;
import com.ecofood.donations.repository.DonacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.*;

@Service
public class DonacionService {

    private static final Logger log = LoggerFactory.getLogger(DonacionService.class);
    private static final Duration MIN_TIME_BEFORE_PICKUP = Duration.ofMinutes(15);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DonacionRepository donacionRepository;
    private final EntregaRepository entregaRepository;

    public DonacionService(DonacionRepository donacionRepository, EntregaRepository entregaRepository) {
        this.donacionRepository = donacionRepository;
        this.entregaRepository = entregaRepository;
    }

    /**
     * Publicar nueva donación con fechas en UTC
     */
    @Transactional
    public Donacion crearDonacion(NuevaDonacionRequest request) {
        if (request.getCategoria() == null || request.getCategoria().trim().isEmpty()) {
            throw new IllegalArgumentException("La categoría es obligatoria.");
        }

        Instant now = Instant.now();
        Instant pickupEndAt = request.getPickupEndAt() != null
                ? request.getPickupEndAt().toInstant(ZoneOffset.UTC)
                : now.plus(Duration.ofHours(2));

        if (!pickupEndAt.isAfter(now.plus(MIN_TIME_BEFORE_PICKUP))) {
            throw new IllegalArgumentException("El horario límite de recojo debe ser al menos 15 minutos en el futuro.");
        }

        String donationUuid = "don-" + UUID.randomUUID().toString().substring(0, 8);

        Donacion donacion = new Donacion();
        donacion.setDonationUuid(donationUuid);
        donacion.setDonorId(request.getDonorId() != null ? request.getDonorId() : "usr-bodega-01");
        donacion.setCategory(request.getCategoria());
        donacion.setTitle(request.getNotasEstado() != null && !request.getNotasEstado().isBlank()
                ? request.getNotasEstado()
                : "Alimentos variados del día");
        donacion.setDescription(request.getNotasEstado());
        donacion.setQuantityValue(request.getCantidadExacta() != null ? request.getCantidadExacta() : 5.0);
        donacion.setUnitMeasure(formatearCantidad(request.getCantidadRango(), request.getCantidadExacta()));
        donacion.setPickupStartAt(now);
        donacion.setPickupEndAt(pickupEndAt);
        donacion.setStatus(DonationStatus.AVAILABLE);

        return donacionRepository.save(donacion);
    }

    /**
     * Apartar donación con Bloqueo Pesimista (@Lock PESSIMISTIC_WRITE).
     * Valida atomicamente que el estado sea AVAILABLE y que falten >= 15 minutos para pickupEndAt.
     */
    @Transactional
    public Map<String, Object> apartarDonacion(String donationUuid, String comedorId) {
        log.info("Intento transaccional de apartar donación {} por comedor {}", donationUuid, comedorId);

        Instant now = Instant.now();

        // 1. Obtener donación con Lock pesimista en base de datos
        Donacion donacion = donacionRepository.findByDonationUuidWithLock(donationUuid)
                .orElseThrow(() -> new DonationConflictException("La donación solicitada no existe."));

        // 2. Validación de Estado: Solo AVAILABLE puede ser apartada
        if (donacion.getStatus() != DonationStatus.AVAILABLE) {
            log.warn("Conflicto al apartar: Donación {} tiene estado {}", donationUuid, donacion.getStatus());
            throw new DonationConflictException("La donación ya no está disponible. Estado actual: " + donacion.getStatus());
        }

        // 3. Validación de Ventana Temporal: Deben faltar al menos 15 minutos antes del vencimiento
        Duration tiempoRestante = Duration.between(now, donacion.getPickupEndAt());
        if (tiempoRestante.compareTo(MIN_TIME_BEFORE_PICKUP) < 0) {
            log.warn("Conflicto al apartar: Donación {} está a menos de 15 minutos de expirar ({})",
                    donationUuid, donacion.getPickupEndAt());
            throw new DonationConflictException(
                    "No se puede apartar este lote: faltan menos de 15 minutos para la hora límite de recojo (" +
                    Math.max(0, tiempoRestante.toMinutes()) + " min restantes)."
            );
        }

        // 4. Transición atómica de Estado a RESERVED
        donacion.setStatus(DonationStatus.RESERVED);
        donacion.setReservedByComedorId(comedorId);
        donacionRepository.save(donacion);

        // 5. Creación atómica de la Entrega (PIN de 6 dígitos y token QR)
        String pin = String.format("%06d", RANDOM.nextInt(1000000));
        String qrToken = "qr_auth_" + UUID.randomUUID().toString().replace("-", "");
        String deliveryUuid = "deliv-" + UUID.randomUUID().toString().substring(0, 8);

        Entrega entrega = new Entrega();
        entrega.setDeliveryUuid(deliveryUuid);
        entrega.setDonationId(donacion.getDonationUuid());
        entrega.setBeneficiaryId(comedorId != null ? comedorId : "usr-comedor-anon");
        entrega.setPickupPin(pin);
        entrega.setQrAuthToken(qrToken);
        entrega.setStatus("PENDING_PICKUP");
        entrega.setReservedAt(java.time.LocalDateTime.now()); // Para compatibilidad
        entregaRepository.save(entrega);

        log.info("Donación {} reservada exitosamente por {}. Entrega {} generada con PIN",
                donationUuid, comedorId, deliveryUuid);

        Map<String, Object> response = new HashMap<>();
        response.put("donationUuid", donacion.getDonationUuid());
        response.put("status", donacion.getStatus());
        response.put("pickupEndAt", donacion.getPickupEndAt().toString());
        response.put("deliveryUuid", deliveryUuid);
        response.put("pickupPin", pin);
        response.put("qrAuthToken", qrToken);

        return response;
    }

    /**
     * Liberar reserva de donación: Regresa de RESERVED a AVAILABLE
     * Solo si aún queda tiempo antes de pickupEndAt.
     */
    @Transactional
    public Donacion liberarReserva(String donationUuid, String comedorId) {
        log.info("Intento de liberar reserva de donación {} por comedor {}", donationUuid, comedorId);

        Instant now = Instant.now();

        Donacion donacion = donacionRepository.findByDonationUuidWithLock(donationUuid)
                .orElseThrow(() -> new DonationConflictException("La donación solicitada no existe."));

        if (donacion.getStatus() != DonationStatus.RESERVED) {
            throw new DonationConflictException("La donación no se encuentra en estado RESERVED (Estado actual: " + donacion.getStatus() + ").");
        }

        // Si ya expiró el horario límite, no puede volver a estar AVAILABLE
        if (now.isAfter(donacion.getPickupEndAt())) {
            donacion.setStatus(DonationStatus.EXPIRED);
            donacionRepository.save(donacion);
            throw new DonationConflictException("La reserva no puede reabrirse porque el horario de recojo ya expiró.");
        }

        // Cancelar entrega asociada
        entregaRepository.findByDonationId(donationUuid).ifPresent(entrega -> {
            entrega.setStatus("CANCELLED");
            entregaRepository.save(entrega);
        });

        // Regresar a disponible
        donacion.setStatus(DonationStatus.AVAILABLE);
        donacion.setReservedByComedorId(null);
        Donacion actualizada = donacionRepository.save(donacion);

        log.info("Donación {} liberada satisfactoriamente y devuelta a AVAILABLE", donationUuid);
        return actualizada;
    }

    @Transactional(readOnly = true)
    public List<Donacion> listarDisponibles() {
        return donacionRepository.findByStatus(DonationStatus.AVAILABLE);
    }

    private String formatearCantidad(String rango, Double exacta) {
        if ("EXACTO".equalsIgnoreCase(rango) && exacta != null) return exacta + " kg";
        if ("1_5_KG".equalsIgnoreCase(rango)) return "1 a 5 kg (~10 raciones)";
        if ("5_10_KG".equalsIgnoreCase(rango)) return "5 a 10 kg (~20 raciones)";
        if ("MAS_10_KG".equalsIgnoreCase(rango)) return "Más de 10 kg (Gran lote solidario)";
        return "Cantidad estimada del día";
    }
}
