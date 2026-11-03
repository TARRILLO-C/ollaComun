package com.ecofood.auth.service;

import com.ecofood.auth.dto.AuthResponse;
import com.ecofood.auth.dto.RegisterBodegaRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    /**
     * Procesa el registro seguro de una bodega donante.
     * Valida DNI/RUC, procesa la foto de fachada para auditoría visual y genera credenciales.
     */
    public AuthResponse registrarBodega(RegisterBodegaRequest request, MultipartFile facadePhoto) {
        log.info("Iniciando registro para bodega: {} con doc: {}", request.getBusinessName(), request.getDocNumber());

        // 1. Validaciones de Documento
        validarDocumento(request.getDocType(), request.getDocNumber());

        // 2. Validación de archivo de fachada
        if (facadePhoto == null || facadePhoto.isEmpty()) {
            throw new IllegalArgumentException("Es obligatoria la foto de la fachada para validar el negocio.");
        }

        String contentType = facadePhoto.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo de fachada debe ser una imagen válida (JPG, PNG o WEBP).");
        }

        // 3. Simulación de almacenamiento en Cloud Storage (S3 / Cloudinary / GCS)
        String photoExtension = obtenerExtension(facadePhoto.getOriginalFilename());
        String generatedFileName = "facades/" + UUID.randomUUID() + "." + photoExtension;
        String simulatedCloudUrl = "https://storage.ecofood.pe/" + generatedFileName;

        log.info("Foto de fachada cargada satisfactoriamente en: {}", simulatedCloudUrl);

        // 4. Simulación de persistencia en PostgreSQL con PostGIS
        String generatedUserId = UUID.randomUUID().toString();
        log.info("Usuario Bodeguero creado con ID: {} en PostGIS (geom: Point)", generatedUserId);

        // 5. Generación de Token JWT simulado
        String simulatedJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJvZGVnYURvblBlcGUiLCJyb2xlIjoiQk9ERUdBIiwiZXhwIjoxNzk5OTk5OTk5fQ." +
                "ecofood_secure_signature_demo";

        return AuthResponse.success(
                generatedUserId,
                request.getBusinessName(),
                request.getDocNumber(),
                simulatedCloudUrl,
                simulatedJwtToken
        );
    }

    private void validarDocumento(String docType, String docNumber) {
        if (docNumber == null || docNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de documento no puede estar vacío.");
        }

        String cleanNumber = docNumber.trim();

        if ("DNI".equalsIgnoreCase(docType)) {
            if (!cleanNumber.matches("^\\d{8}$")) {
                throw new IllegalArgumentException("El DNI peruano debe contener exactamente 8 dígitos numéricos.");
            }
        } else if ("RUC".equalsIgnoreCase(docType)) {
            if (!cleanNumber.matches("^(10|20)\\d{9}$")) {
                throw new IllegalArgumentException("El RUC peruano debe contener 11 dígitos y comenzar con 10 o 20.");
            }
        } else {
            throw new IllegalArgumentException("Tipo de documento no soportado: " + docType);
        }
    }

    private String obtenerExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
