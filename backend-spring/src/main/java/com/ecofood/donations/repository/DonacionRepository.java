package com.ecofood.donations.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonacionRepository {

    /**
     * Consulta Nativa Adaptada para MySQL 8+:
     * 
     * Utiliza la función geoespacial ST_Distance_Sphere para calcular la distancia
     * esférica terrestre directamente en METROS entre el campo POINT de la donación
     * y el punto geográfico del comedor popular POINT(:longitud, :latitud).
     * 
     * Filtra donaciones en estado 'Donado' o 'AVAILABLE' que estén a menos de :radioMetros (ej. 2000 m = 2 km)
     * y las ordena por proximidad ascendente.
     *
     * @param latitud     Latitud del comedor receptor
     * @param longitud    Longitud del comedor receptor
     * @param radioMetros Radio máximo de búsqueda en metros (ej. 2000.0)
     * @return Lista de proyecciones con los datos de la donación y su distancia en metros
     */
    @Query(value = """
        SELECT 
            d.id AS id,
            d.title AS title,
            d.category AS category,
            CONCAT(d.quantity_value, ' ', d.unit_measure) AS quantity,
            d.description AS notes,
            d.pickup_end_at AS pickupEndAt,
            d.status AS status,
            u.business_name AS donorBusinessName,
            u.phone AS donorPhone,
            u.address_line AS donorAddress,
            ROUND(
                ST_Distance_Sphere(
                    d.location, 
                    POINT(:longitud, :latitud)
                ), 
                1
            ) AS distanceMeters
        FROM donations d
        JOIN users u ON d.donor_id = u.id
        WHERE (d.status = 'Donado' OR d.status = 'AVAILABLE')
          AND d.pickup_end_at > NOW()
          AND ST_Distance_Sphere(
                d.location, 
                POINT(:longitud, :latitud)
          ) <= :radioMetros
        ORDER BY distanceMeters ASC
        """, nativeQuery = true)
    List<DonacionCercanaProjection> findDonacionesCercanas(
            @Param("latitud") Double latitud,
            @Param("longitud") Double longitud,
            @Param("radioMetros") Double radioMetros
    );
}
