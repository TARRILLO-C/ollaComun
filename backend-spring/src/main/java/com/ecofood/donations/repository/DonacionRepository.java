package com.ecofood.donations.repository;

import com.ecofood.donations.entity.Donacion;
import com.ecofood.donations.entity.DonationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    Optional<Donacion> findByDonationUuid(String donationUuid);

    /**
     * Búsqueda para idempotencia dentro de una ventana de tiempo (ej. últimos 5 minutos)
     */
    @Query("SELECT d FROM Donacion d WHERE d.idempotencyKey = :key AND d.createdAt >= :threshold")
    Optional<Donacion> findByIdempotencyKeyWithinWindow(
            @Param("key") String key,
            @Param("threshold") Instant threshold
    );

    /**
     * Bloqueo pesimista exclusivo (PESSIMISTIC_WRITE) sobre la donación para concurrencia estricta.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Donacion d WHERE d.donationUuid = :uuid")
    Optional<Donacion> findByDonationUuidWithLock(@Param("uuid") String uuid);

    @Query("SELECT d FROM Donacion d WHERE d.status = :status ORDER BY d.createdAt DESC")
    List<Donacion> findByStatus(@Param("status") DonationStatus status);

    @Modifying
    @Query("UPDATE Donacion d SET d.status = 'EXPIRED', d.updatedAt = :now WHERE d.status = 'AVAILABLE' AND d.pickupEndAt <= :now")
    int markExpiredDonations(@Param("now") Instant now);

    @Modifying
    @Query("UPDATE Donacion d SET d.status = 'UNCOLLECTED', d.updatedAt = :now WHERE d.status = 'RESERVED' AND d.pickupEndAt <= :graceThreshold")
    int markUncollectedDonations(@Param("now") Instant now, @Param("graceThreshold") Instant graceThreshold);

    /**
     * Consulta Nativa Optimizada de Radar para Donaciones Cercanas:
     * 1. Bounding Box preliminar indexado en (status, latitude, longitude, pickup_end_at):
     *    Filtra filas descartando aquellas fuera del cuadrilátero rectangular de radio ~3 km.
     * 2. Cálculo esférico exacto con Fórmula de Haversine (Radio de la Tierra R = 6,371,000 m).
     * 3. Estimación de minutos caminando: (distancia en metros / 75 m/minuto) asumiendo 4.5 km/h.
     * 4. Ordenamiento ascendente por distancia y filtro final <= maxRadiusMeters.
     */
    @Query(value = """
        SELECT 
            d.id AS id,
            d.donation_uuid AS donationUuid,
            d.title AS title,
            d.category AS category,
            d.quantity_value AS quantityValue,
            d.unit_measure AS unitMeasure,
            d.description AS description,
            d.pickup_end_at AS pickupEndAt,
            d.status AS status,
            d.latitude AS latitude,
            d.longitude AS longitude,
            COALESCE(u.business_name, 'Bodega Solidaria') AS donorBusinessName,
            COALESCE(u.phone, '') AS donorPhone,
            COALESCE(u.address_line, '') AS donorAddress,
            ROUND(
                6371000 * 2 * ASIN(
                    SQRT(
                        POWER(SIN(RADIANS(d.latitude - :userLat) / 2), 2) +
                        COS(RADIANS(:userLat)) * COS(RADIANS(d.latitude)) *
                        POWER(SIN(RADIANS(d.longitude - :userLng) / 2), 2)
                    )
                ), 1
            ) AS distanceMeters,
            ROUND(
                (6371000 * 2 * ASIN(
                    SQRT(
                        POWER(SIN(RADIANS(d.latitude - :userLat) / 2), 2) +
                        COS(RADIANS(:userLat)) * COS(RADIANS(d.latitude)) *
                        POWER(SIN(RADIANS(d.longitude - :userLng) / 2), 2)
                    )
                )) / 75.0, 1
            ) AS walkingMinutes
        FROM donations d
        LEFT JOIN users u ON d.donor_id = u.user_uuid
        WHERE d.status = 'AVAILABLE'
          AND d.pickup_end_at > :now
          AND d.latitude BETWEEN :minLat AND :maxLat
          AND d.longitude BETWEEN :minLng AND :maxLng
        HAVING distanceMeters <= :maxRadiusMeters
        ORDER BY distanceMeters ASC
        LIMIT 50
        """, nativeQuery = true)
    List<DonacionCercanaProjection> findAvailableDonationsRadar(
            @Param("userLat") double userLat,
            @Param("userLng") double userLng,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng,
            @Param("maxRadiusMeters") double maxRadiusMeters,
            @Param("now") Instant now
    );
}
