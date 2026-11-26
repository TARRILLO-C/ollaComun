package com.ecofood.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class YupayIdentityService {

    private static final Logger log = LoggerFactory.getLogger(YupayIdentityService.class);

    @Value("${yupay.api.url:https://api.yupay.dev}")
    private String yupayApiUrl;

    @Value("${yupay.api.key:ypk_thNZgBQjWChQRIFYPXGhbdigDMzLYchgdIjuVgNlPpctJNOEawhlNevogauhVdMP}")
    private String yupayApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> consultarDni(String dni) {
        String url = yupayApiUrl + "/v1/dni/" + dni;
        return realizarConsulta(url, "DNI " + dni);
    }

    public Map<String, Object> consultarRuc(String ruc) {
        String url = yupayApiUrl + "/v1/ruc/" + ruc;
        return realizarConsulta(url, "RUC " + ruc);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> realizarConsulta(String url, String entidad) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(yupayApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Cache-Bypass", "false");

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    Map.class
            );

            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Yupay: No se encontraron resultados para {}", entidad);
            throw new IllegalArgumentException("No se encontraron resultados para " + entidad);
        } catch (HttpClientErrorException e) {
            log.error("Yupay error HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Error al validar con proveedor de identidad: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Error al conectar con Yupay API: {}", e.getMessage());
            throw new RuntimeException("Servicio de validación temporalmente no disponible.");
        }
    }
}
