package com.ecofood.auth.service;

import com.ecofood.auth.dto.AuthResponse;
import com.ecofood.auth.dto.RegisterBodegaRequest;
import com.ecofood.auth.entity.Usuario;
import com.ecofood.auth.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public AuthResponse registrarBodega(RegisterBodegaRequest request, MultipartFile facadePhoto) {
        log.info("Registrando bodega: {} (Doc: {})", request.getBusinessName(), request.getDocNumber());

        validarDocumento(request.getDocType(), request.getDocNumber());

        if (usuarioRepository.existsByDocNumber(request.getDocNumber())) {
            throw new IllegalArgumentException(
                    "Ya existe un usuario registrado con el documento " + request.getDocNumber());
        }

        String photoUrl = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80";
        if (facadePhoto != null && !facadePhoto.isEmpty()) {
            photoUrl = "https://storage.ecofood.pe/facades/" + UUID.randomUUID() + ".jpg";
        }

        String userUuid = "usr-bodega-" + UUID.randomUUID().toString().substring(0, 8);

        Usuario user = new Usuario();
        user.setUserUuid(userUuid);
        user.setRole("BODEGA");
        user.setDocType(request.getDocType());
        user.setDocNumber(request.getDocNumber());
        user.setPinHash("HASH_" + UUID.randomUUID().toString().substring(0, 8)); // Simulado o BCrypt
        user.setBusinessName(request.getBusinessName());
        user.setPhone(request.getPhone());
        user.setAddressLine(request.getAddress());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setFacadePhotoUrl(photoUrl);

        usuarioRepository.save(user);

        log.info("Bodega registrada exitosamente en BD con UUID: {}", userUuid);

        String token = "jwt_" + UUID.randomUUID().toString().replace("-", "");

        return AuthResponse.success(
                userUuid,
                user.getBusinessName(),
                user.getDocNumber(),
                photoUrl,
                token);
    }

    @Transactional
    public AuthResponse registrarComedor(com.ecofood.auth.dto.RegisterComedorRequest request) {
        log.info("Registrando comedor popular: {} (Doc: {})", request.getBusinessName(), request.getDocNumber());

        validarDocumento(request.getDocType() != null ? request.getDocType() : "DNI", request.getDocNumber());

        if (usuarioRepository.existsByDocNumber(request.getDocNumber())) {
            throw new IllegalArgumentException(
                    "Ya existe un usuario registrado con el documento " + request.getDocNumber());
        }

        String userUuid = "usr-comedor-" + UUID.randomUUID().toString().substring(0, 8);
        String photoUrl = "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80";

        Usuario user = new Usuario();
        user.setUserUuid(userUuid);
        user.setRole("COMEDOR");
        user.setDocType(request.getDocType() != null ? request.getDocType() : "DNI");
        user.setDocNumber(request.getDocNumber());
        user.setPinHash("HASH_" + UUID.randomUUID().toString().substring(0, 8));
        user.setBusinessName(request.getBusinessName());
        user.setRepresentativeName(request.getRepresentativeName());
        user.setPhone(request.getPhone());
        user.setAddressLine(request.getAddress());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setFacadePhotoUrl(photoUrl);

        usuarioRepository.save(user);

        log.info("Comedor popular registrado exitosamente en BD con UUID: {}", userUuid);

        String token = "jwt_" + UUID.randomUUID().toString().replace("-", "");

        AuthResponse res = AuthResponse.success(
                userUuid,
                user.getBusinessName(),
                user.getDocNumber(),
                photoUrl,
                token
        );
        res.setRole("COMEDOR");
        return res;
    }

    private void validarDocumento(String docType, String docNumber) {
        if (docType == null || docNumber == null) {
            throw new IllegalArgumentException("El tipo y número de documento son obligatorios.");
        }
        String cleanDoc = docNumber.trim();
        if ("DNI".equalsIgnoreCase(docType) && !cleanDoc.matches("^\\d{8}$")) {
            throw new IllegalArgumentException("El DNI debe contener exactamente 8 dígitos numéricos.");
        }
        if ("RUC".equalsIgnoreCase(docType) && !cleanDoc.matches("^(10|20)\\d{9}$")) {
            throw new IllegalArgumentException("El RUC debe comenzar con 10 o 20 y tener 11 dígitos.");
        }
    }
}
