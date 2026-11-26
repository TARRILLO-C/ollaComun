package com.ecofood.donations.repository;

import java.time.Instant;

/**
 * Spring Data JPA Projection para mapear los resultados de la consulta de radar en MySQL.
 * Retorna datos de la donación, datos del comercio donante, distancia en metros y tiempo a pie.
 */
public interface DonacionCercanaProjection {

    Long getId();
    String getDonationUuid();
    String getTitle();
    String getCategory();
    Double getQuantityValue();
    String getUnitMeasure();
    String getDescription();
    Instant getPickupEndAt();
    String getStatus();
    Double getLatitude();
    Double getLongitude();

    // Datos del comercio donante (Bodega)
    String getDonorBusinessName();
    String getDonorPhone();
    String getDonorAddress();

    // Distancia espacial en metros calculada mediante Haversine
    Double getDistanceMeters();

    // Tiempo estimado caminando en minutos (distancia / 75 m/min)
    Double getWalkingMinutes();
}
