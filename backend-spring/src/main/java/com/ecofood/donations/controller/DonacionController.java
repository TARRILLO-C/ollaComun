package com.ecofood.donations.controller;

import com.ecofood.donations.dto.DonacionResponse;
import com.ecofood.donations.dto.NuevaDonacionRequest;
import com.ecofood.donations.entity.Donacion;
import com.ecofood.donations.repository.DonacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/donaciones", "/api/donations"})
@CrossOrigin(origins = "*")
public class DonacionController {

    private static final Logger log = LoggerFactory.getLogger(DonacionController.class);

    private final DonacionRepository donacionRepository;

    public DonacionController(DonacionRepository donacionRepository) {
        this.donacionRepository = donacionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Donacion>> listarDonaciones() {
        return ResponseEntity.ok(donacionRepository.findAllAvailable());
    }

    @GetMapping("/cercanas")
    public ResponseEntity<?> obtenerDonacionesCercanas(
            @RequestParam("latitud") Double latitud,
            @RequestParam("longitud") Double longitud,
            @RequestParam(value = "radioMetros", defaultValue = "2000.0") Double radioMetros
    ) {
        log.info("Buscando donaciones para [{}, {}] en radio de {}m", latitud, longitud, radioMetros);
        try {
            List<Donacion> disponibles = donacionRepository.findAllAvailable();
            if (!disponibles.isEmpty()) {
                return ResponseEntity.ok(disponibles);
            }
        } catch (Exception e) {
            log.warn("Excepción al consultar BD: {}", e.getMessage());
        }
        return ResponseEntity.ok(crearDonacionesMock(latitud, longitud));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<DonacionResponse> crearDonacion(@RequestBody NuevaDonacionRequest request) {
        try {
            if (request.getCategoria() == null || request.getCategoria().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(DonacionResponse.error("La categoría es obligatoria."));
            }

            LocalDateTime pickupEndAt = request.getPickupEndAt() != null 
                    ? request.getPickupEndAt() 
                    : LocalDateTime.now().plusHours(2);

            String donationUuid = "don-" + UUID.randomUUID().toString().substring(0, 8);
            String cantidadTexto = formatearCantidad(request.getCantidadRango(), request.getCantidadExacta());

            Donacion donacion = new Donacion();
            donacion.setDonationUuid(donationUuid);
            donacion.setDonorId(request.getDonorId() != null ? request.getDonorId() : "usr-bodega-01");
            donacion.setCategory(request.getCategoria());
            donacion.setTitle(request.getNotasEstado() != null && !request.getNotasEstado().isBlank() 
                    ? request.getNotasEstado() 
                    : "Alimentos variados del día");
            donacion.setDescription(request.getNotasEstado());
            donacion.setQuantityValue(request.getCantidadExacta() != null ? request.getCantidadExacta() : 5.0);
            donacion.setUnitMeasure(cantidadTexto);
            donacion.setPickupStartAt(LocalDateTime.now());
            donacion.setPickupEndAt(pickupEndAt);
            donacion.setStatus("AVAILABLE");

            donacionRepository.save(donacion);

            DonacionResponse response = DonacionResponse.success(
                    donationUuid,
                    request.getCategoria(),
                    cantidadTexto,
                    pickupEndAt,
                    4
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error al registrar donación: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DonacionResponse.error("Error al procesar: " + e.getMessage()));
        }
    }

    private String formatearCantidad(String rango, Double exacta) {
        if ("EXACTO".equalsIgnoreCase(rango) && exacta != null) return exacta + " kg";
        if ("1_5_KG".equalsIgnoreCase(rango)) return "1 a 5 kg (~10 raciones)";
        if ("5_10_KG".equalsIgnoreCase(rango)) return "5 a 10 kg (~20 raciones)";
        if ("MAS_10_KG".equalsIgnoreCase(rango)) return "Más de 10 kg (Gran lote solidario)";
        return "Cantidad estimada del día";
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
