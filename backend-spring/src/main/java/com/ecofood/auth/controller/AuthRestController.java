package com.ecofood.auth.controller;

import com.ecofood.auth.dto.AuthResponse;
import com.ecofood.auth.dto.RegisterBodegaRequest;
import com.ecofood.auth.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite peticiones desde la PWA en desarrollo
public class AuthRestController {

    private final UsuarioService usuarioService;

    public AuthRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Endpoint para el Registro Seguro del Rol Bodeguero.
     * Recibe los datos comerciales junto con el archivo binario de la fachada en multipart/form-data.
     *
     * @param docType        "DNI" o "RUC"
     * @param docNumber      8 dígitos para DNI, 11 para RUC
     * @param businessName   Nombre de la bodega o minimarket
     * @param phone          Celular peruano de contacto
     * @param address        Dirección física de recojo
     * @param facadePhoto    Archivo de imagen de la fachada tomada por la cámara
     * @return ResponseEntity con DTO AuthResponse y Token JWT
     */
    @PostMapping(value = "/register-bodega", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> registerBodega(
            @RequestParam("docType") String docType,
            @RequestParam("docNumber") String docNumber,
            @RequestParam("businessName") String businessName,
            @RequestParam("phone") String phone,
            @RequestParam("address") String address,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestPart("facadePhoto") MultipartFile facadePhoto
    ) {
        try {
            RegisterBodegaRequest request = new RegisterBodegaRequest(
                    docType,
                    docNumber,
                    businessName,
                    phone,
                    address
            );
            request.setLatitude(latitude);
            request.setLongitude(longitude);

            AuthResponse response = usuarioService.registrarBodega(request, facadePhoto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AuthResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.error("Error interno al procesar el registro: " + e.getMessage()));
        }
    }

    /**
     * Endpoint de verificación rápida de estado del servicio
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth Service EcoFood is running OK");
    }
}
