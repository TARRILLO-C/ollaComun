package com.ecofood.donations.repository;

import com.ecofood.donations.entity.Donacion;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    Optional<Donacion> findByDonationUuid(String donationUuid);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Donacion d WHERE d.donationUuid = :uuid AND d.status = 'AVAILABLE'")
    Optional<Donacion> findAvailableByUuidWithLock(@Param("uuid") String uuid);

    @Query("SELECT d FROM Donacion d WHERE d.status = 'AVAILABLE' ORDER BY d.createdAt DESC")
    List<Donacion> findAllAvailable();
}
