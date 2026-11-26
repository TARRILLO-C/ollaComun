package com.ecofood.auth.controller;

import com.ecofood.auth.service.YupayIdentityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/identity")
@CrossOrigin(origins = "*")
public class IdentityController {

    private final YupayIdentityService yupayIdentityService;

    public IdentityController(YupayIdentityService yupayIdentityService) {
        this.yupayIdentityService = yupayIdentityService;
    }

    @GetMapping("/dni/{number}")
    public ResponseEntity<?> consultarDni(@PathVariable("number") String number) {
        String cleanNumber = number.trim().replaceAll("\\D", "");
        if (cleanNumber.length() != 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "El DNI debe tener 8 dígitos numéricos."));
        }
        try {
            Map<String, Object> data = yupayIdentityService.consultarDni(cleanNumber);
            return ResponseEntity.ok(data);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ruc/{number}")
    public ResponseEntity<?> consultarRuc(@PathVariable("number") String number) {
        String cleanNumber = number.trim().replaceAll("\\D", "");
        if (cleanNumber.length() != 11) {
            return ResponseEntity.badRequest().body(Map.of("error", "El RUC debe tener 11 dígitos numéricos."));
        }
        try {
            Map<String, Object> data = yupayIdentityService.consultarRuc(cleanNumber);
            return ResponseEntity.ok(data);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
