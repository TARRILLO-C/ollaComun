package com.ecofood.donations.repository;

import java.time.LocalDateTime;

/**
 * Spring Data JPA Projection para mapear los resultados de la consulta nativa de PostGIS.
 */
public interface DonacionCercanaProjection {

    String getId();
    String getTitle();
    String getCategory();
    String getQuantity();
    String getNotes();
    LocalDateTime getPickupEndAt();
    String getStatus();
    
    // Datos del comercio donante
    String getDonorBusinessName();
    String getDonorPhone();
    String getDonorAddress();
    
    // Distancia espacial calculada por ST_Distance (en metros)
    Double getDistanceMeters();
}
