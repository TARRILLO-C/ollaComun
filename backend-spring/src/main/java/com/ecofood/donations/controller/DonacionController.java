package com.ecofood.donations.controller;

import com.ecofood.donations.dto.DonacionResponse;
import com.ecofood.donations.dto.NuevaDonacionRequest;
import com.ecofood.donations.entity.Donacion;
import com.ecofood.donations.entity.DonationStatus;
import com.ecofood.donations.exception.DonationConflictException;
import com.ecofood.donations.service.DonacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping({"/api/donaciones", "/api/donations"})
@CrossOrigin(origins = "*")
public class DonacionController {

    private static final Logger log = LoggerFactory.getLogger(DonacionController.class);

    private final DonacionService donacionService;

    public DonacionController(DonacionService donacionService) {
        this.donacionService = donacionService;
    }

    @GetMapping
    public ResponseEntity<List<Donacion>> listarDonaciones() {
        return ResponseEntity.ok(donacionService.listarDisponibles());
    }

    @GetMapping("/cercanas")
    public ResponseEntity<?> obtenerDonacionesCercanas(
            @RequestParam("latitud") Double latitud,
            @RequestParam("longitud") Double longitud,
            @RequestParam(value = "radioMetros", defaultValue = "2000.0") Double radioMetros
    ) {
        List<Donacion> disponibles = donacionService.listarDisponibles();
        if (!disponibles.isEmpty()) {
            return ResponseEntity.ok(disponibles);
        }
        return ResponseEntity.ok(crearDonacionesMock(latitud, longitud));
    }

    @PostMapping
    public ResponseEntity<DonacionResponse> crearDonacion(@RequestBody NuevaDonacionRequest request) {
        try {
            Donacion donacion = donacionService.crearDonacion(request);

            DonacionResponse response = DonacionResponse.success(
                    donacion.getDonationUuid(),
                    donacion.getCategory(),
                    donacion.getUnitMeasure(),
                    LocalDateTime.ofInstant(donacion.getPickupEndAt(), ZoneOffset.UTC),
                    4
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(DonacionResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error al registrar donación: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DonacionResponse.error("Error al procesar: " + e.getMessage()));
        }
    }

    /**
     * Endpoint transaccional para apartar/reservar un lote con bloqueo pesimista
     * POST /api/donaciones/{uuid}/apartar
     */
    @PostMapping("/{uuid}/apartar")
    public ResponseEntity<?> apartarDonacion(
            @PathVariable("uuid") String uuid,
            @RequestParam(value = "comedorId", required = false) String comedorId
    ) {
        try {
            Map<String, Object> resultado = donacionService.apartarDonacion(uuid, comedorId);
            return ResponseEntity.ok(resultado);
        } catch (DonationConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "status", 409,
                    "error", "Conflict",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "error", "Internal Error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint transaccional para liberar una reserva activa
     * POST /api/donaciones/{uuid}/liberar
     */
    @PostMapping("/{uuid}/liberar")
    public ResponseEntity<?> liberarReserva(
            @PathVariable("uuid") String uuid,
            @RequestParam(value = "comedorId", required = false) String comedorId
    ) {
        try {
            Donacion donacion = donacionService.liberarReserva(uuid, comedorId);
            return ResponseEntity.ok(Map.of(
                    "message", "Reserva liberada con éxito. Donación devuelta a AVAILABLE.",
                    "donationUuid", donacion.getDonationUuid(),
                    "status", donacion.getStatus()
            ));
        } catch (DonationConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "status", 409,
                    "error", "Conflict",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "error", "Internal Error",
                    "message", e.getMessage()
            ));
        }
    }

    private List<Map<String, Object>> crearDonacionesMock(Double lat, Double lng) {
        List<Map<String, Object>> mocks = new ArrayList<>();
        mocks.add(Map.of(
                "id", "don-mock-01",
                "title", "40 panes ciabatta y franceses surtidos",
                "category", "PANADERIA",
                "quantity", "8.5 kg (~17 raciones)",
                "donorBusinessName", "Bodega & Minimarket Don Pepe",
                "donorPhone", "+51 987 654 321",
                "donorAddress", "Av. Próceres de la Independencia 1420",
                "distanceMeters", 420.0,
                "pickupEndAt", LocalDateTime.now().plusHours(3).toString()
        ));
        return mocks;
    }
}
