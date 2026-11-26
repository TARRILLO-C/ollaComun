package com.ecofood.deliveries.repository;

import com.ecofood.deliveries.entity.Entrega;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntregaRepository extends JpaRepository<Entrega, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Entrega e WHERE (e.pickupPin = :codigo OR e.qrAuthToken = :codigo) AND e.status = 'PENDING_PICKUP'")
    Optional<Entrega> findActiveByCodeWithLock(@Param("codigo") String codigo);

    Optional<Entrega> findByDonationId(String donationId);
}
