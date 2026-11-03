package com.ecofood.deliveries.controller;

import com.ecofood.deliveries.dto.ValidarEntregaRequest;
import com.ecofood.deliveries.dto.ValidarEntregaResponse;
import com.ecofood.deliveries.service.EntregaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/entregas")
@CrossOrigin(origins = "*") // Permite la comunicación con el frontend React
public class EntregaController {

    private final EntregaService entregaService;

    public EntregaController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    /**
     * Endpoint final para el cierre del ciclo de la donación:
     * POST /api/entregas/validar
     *
     * Valida el código PIN o QR, cambia el estado a "Entregado" y asigna la fecha de cierre.
     *
     * @param request DTO con el código (PIN o QR) y datos de auditoría
     * @return ResponseEntity con ValidarEntregaResponse
     */
    @PostMapping("/validar")
    public ResponseEntity<ValidarEntregaResponse> validarEntrega(@RequestBody ValidarEntregaRequest request) {
        try {
            ValidarEntregaResponse response = entregaService.validarYCompletarEntrega(request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ValidarEntregaResponse.error(e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ValidarEntregaResponse.error(e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ValidarEntregaResponse.error("Error al procesar la entrega: " + e.getMessage()));
        }
    }
}
