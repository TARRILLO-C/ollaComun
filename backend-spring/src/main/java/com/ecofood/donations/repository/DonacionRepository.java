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
     * Bloqueo pesimista exclusivo (PESSIMISTIC_WRITE) sobre la donación para concurrencia estricta.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Donacion d WHERE d.donationUuid = :uuid")
    Optional<Donacion> findByDonationUuidWithLock(@Param("uuid") String uuid);

    @Query("SELECT d FROM Donacion d WHERE d.status = :status ORDER BY d.createdAt DESC")
    List<Donacion> findByStatus(@Param("status") DonationStatus status);

    /**
     * Donaciones AVAILABLE cuyo pickupEndAt ya venció
     */
    @Query("SELECT d FROM Donacion d WHERE d.status = 'AVAILABLE' AND d.pickupEndAt <= :now")
    List<Donacion> findExpiredAvailableDonations(@Param("now") Instant now);

    /**
     * Donaciones RESERVED cuyo pickupEndAt superó el margen de gracia (ej. pickupEndAt + 15 min < now)
     */
    @Query("SELECT d FROM Donacion d WHERE d.status = 'RESERVED' AND d.pickupEndAt <= :graceThreshold")
    List<Donacion> findUncollectedReservations(@Param("graceThreshold") Instant graceThreshold);

    @Modifying
    @Query("UPDATE Donacion d SET d.status = 'EXPIRED', d.updatedAt = :now WHERE d.status = 'AVAILABLE' AND d.pickupEndAt <= :now")
    int markExpiredDonations(@Param("now") Instant now);

    @Modifying
    @Query("UPDATE Donacion d SET d.status = 'UNCOLLECTED', d.updatedAt = :now WHERE d.status = 'RESERVED' AND d.pickupEndAt <= :graceThreshold")
    int markUncollectedDonations(@Param("now") Instant now, @Param("graceThreshold") Instant graceThreshold);
}
