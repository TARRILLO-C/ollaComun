package com.ecofood.donations.service;

import com.ecofood.auth.entity.Usuario;
import com.ecofood.auth.repository.UsuarioRepository;
import com.ecofood.deliveries.entity.Entrega;
import com.ecofood.deliveries.repository.EntregaRepository;
import com.ecofood.donations.dto.DetalleEntregaResponse;
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
    private static final Duration IDEMPOTENCY_WINDOW = Duration.ofMinutes(5);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DonacionRepository donacionRepository;
    private final EntregaRepository entregaRepository;
    private final UsuarioRepository usuarioRepository;

    public DonacionService(
            DonacionRepository donacionRepository,
            EntregaRepository entregaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.donacionRepository = donacionRepository;
        this.entregaRepository = entregaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Publicar nueva donación con Idempotencia (X-Idempotency-Key) y fechas en UTC.
     * Si la clave ya se utilizó en los últimos 5 minutos, devuelve la existente.
     */
    @Transactional
    public Donacion crearDonacionIdempotente(NuevaDonacionRequest request, String idempotencyKey) {
        Instant now = Instant.now();

        // 1. Verificación de Idempotencia en ventana de 5 minutos
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Instant threshold = now.minus(IDEMPOTENCY_WINDOW);
            Optional<Donacion> existente = donacionRepository.findByIdempotencyKeyWithinWindow(idempotencyKey.trim(), threshold);
            if (existente.isPresent()) {
                log.info("Idempotencia activada: Clave {} reutilizada. Devolviendo donación ya registrada: {}",
                        idempotencyKey, existente.get().getDonationUuid());
                return existente.get();
            }
        }

        if (request.getCategoria() == null || request.getCategoria().trim().isEmpty()) {
            throw new IllegalArgumentException("La categoría es obligatoria.");
        }

        Instant pickupEndAt = request.getPickupEndAt() != null
                ? request.getPickupEndAt().toInstant(ZoneOffset.UTC)
                : now.plus(Duration.ofHours(2));

        if (!pickupEndAt.isAfter(now.plus(MIN_TIME_BEFORE_PICKUP))) {
            throw new IllegalArgumentException("El horario límite de recojo debe ser al menos 15 minutos en el futuro.");
        }

        String donationUuid = "don-" + UUID.randomUUID().toString().substring(0, 8);

        Donacion donacion = new Donacion();
        donacion.setDonationUuid(donationUuid);
        donacion.setIdempotencyKey(idempotencyKey != null && !idempotencyKey.isBlank() ? idempotencyKey.trim() : null);
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
        donacion.setIntentosFallidosPin(0);
        donacion.setPinBloqueado(false);

        return donacionRepository.save(donacion);
    }

    /**
     * Apartar donación con Bloqueo Pesimista (@Lock PESSIMISTIC_WRITE).
     */
    @Transactional
    public Map<String, Object> apartarDonacion(String donationUuid, String comedorId) {
        log.info("Intento transaccional de apartar donación {} por comedor {}", donationUuid, comedorId);

        Instant now = Instant.now();

        Donacion donacion = donacionRepository.findByDonationUuidWithLock(donationUuid)
                .orElseThrow(() -> new DonationConflictException("La donación solicitada no existe."));

        if (donacion.getStatus() != DonationStatus.AVAILABLE) {
            throw new DonationConflictException("La donación ya no está disponible. Estado actual: " + donacion.getStatus());
        }

        Duration tiempoRestante = Duration.between(now, donacion.getPickupEndAt());
        if (tiempoRestante.compareTo(MIN_TIME_BEFORE_PICKUP) < 0) {
            throw new DonationConflictException(
                    "No se puede apartar este lote: faltan menos de 15 minutos para la hora límite de recojo (" +
                    Math.max(0, tiempoRestante.toMinutes()) + " min restantes)."
            );
        }

        donacion.setStatus(DonationStatus.RESERVED);
        donacion.setReservedByComedorId(comedorId);
        donacionRepository.save(donacion);

        String pin = String.format("%06d", RANDOM.nextInt(1000000));
        String qrToken = "qr_auth_" + UUID.randomUUID().toString().replace("-", "");
        String deliveryUuid = "deliv-" + UUID.randomUUID().toString().substring(0, 8);

        Entrega entrega = new Entrega();
        entrega.setDeliveryUuid(deliveryUuid);
        entrega.setDonationId(donacion.getDonationUuid());
        entrega.setBeneficiaryId(comedorId != null ? comedorId : "usr-comedor-01");
        entrega.setPickupPin(pin);
        entrega.setQrAuthToken(qrToken);
        entrega.setStatus("PENDING_PICKUP");
        entrega.setReservedAt(java.time.LocalDateTime.now());
        entregaRepository.save(entrega);

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
     * Endpoint previo de consulta para verificación visual del bodeguero
     * GET /api/donaciones/{id}/detalle-entrega
     */
    @Transactional(readOnly = true)
    public DetalleEntregaResponse obtenerDetalleEntrega(String donationUuid) {
        Donacion donacion = donacionRepository.findByDonationUuid(donationUuid)
                .orElseThrow(() -> new IllegalArgumentException("Donación no encontrada con ID: " + donationUuid));

        String comedorNombre = "Comedor Popular Registrado";
        String representanteNombre = "Presidenta / Responsable";
        String comedorTelefono = "+51 991 234 567";
        String comedorDireccion = "Dirección registrada del comedor";

        if (donacion.getReservedByComedorId() != null) {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByUserUuid(donacion.getReservedByComedorId());
            if (usuarioOpt.isPresent()) {
                Usuario u = usuarioOpt.get();
                comedorNombre = u.getBusinessName();
                representanteNombre = u.getRepresentativeName() != null ? u.getRepresentativeName() : u.getBusinessName();
                comedorTelefono = u.getPhone();
                comedorDireccion = u.getAddressLine();
            }
        }

        return DetalleEntregaResponse.from(
                donacion.getDonationUuid(),
                donacion.getTitle(),
                donacion.getCategory(),
                donacion.getUnitMeasure(),
                donacion.getStatus().name(),
                donacion.getPickupEndAt(),
                donacion.getReservedByComedorId(),
                comedorNombre,
                representanteNombre,
                comedorTelefono,
                comedorDireccion,
                donacion.getIntentosFallidosPin(),
                donacion.getPinBloqueado()
        );
    }

    /**
     * Liberar reserva activa volviendo a AVAILABLE
     */
    @Transactional
    public Donacion liberarReserva(String donationUuid, String comedorId) {
        Instant now = Instant.now();

        Donacion donacion = donacionRepository.findByDonationUuidWithLock(donationUuid)
                .orElseThrow(() -> new DonationConflictException("La donación solicitada no existe."));

        if (donacion.getStatus() != DonationStatus.RESERVED) {
            throw new DonationConflictException("La donación no se encuentra en estado RESERVED.");
        }

        if (now.isAfter(donacion.getPickupEndAt())) {
            donacion.setStatus(DonationStatus.EXPIRED);
            donacionRepository.save(donacion);
            throw new DonationConflictException("La reserva no puede reabrirse porque el horario de recojo ya expiró.");
        }

        entregaRepository.findByDonationId(donationUuid).ifPresent(entrega -> {
            entrega.setStatus("CANCELLED");
            entregaRepository.save(entrega);
        });

        donacion.setStatus(DonationStatus.AVAILABLE);
        donacion.setReservedByComedorId(null);
        return donacionRepository.save(donacion);
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
