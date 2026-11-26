package com.ecofood.deliveries.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
public class Entrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "delivery_uuid", unique = true, nullable = false)
    private String deliveryUuid;

    @Column(name = "donation_id", nullable = false)
    private String donationId;

    @Column(name = "beneficiary_id", nullable = false)
    private String beneficiaryId; // UUID del comedor popular

    @Column(name = "pickup_pin", nullable = false)
    private String pickupPin;

    @Column(name = "qr_auth_token", nullable = false)
    private String qrAuthToken;

    @Column(nullable = false)
    private String status = "PENDING_PICKUP"; // "PENDING_PICKUP" | "COMPLETED" | "CANCELLED"

    @Column(name = "reserved_at")
    private LocalDateTime reservedAt = LocalDateTime.now();

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    public Entrega() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeliveryUuid() { return deliveryUuid; }
    public void setDeliveryUuid(String deliveryUuid) { this.deliveryUuid = deliveryUuid; }

    public String getDonationId() { return donationId; }
    public void setDonationId(String donationId) { this.donationId = donationId; }

    public String getBeneficiaryId() { return beneficiaryId; }
    public void setBeneficiaryId(String beneficiaryId) { this.beneficiaryId = beneficiaryId; }

    public String getPickupPin() { return pickupPin; }
    public void setPickupPin(String pickupPin) { this.pickupPin = pickupPin; }

    public String getQrAuthToken() { return qrAuthToken; }
    public void setQrAuthToken(String qrAuthToken) { this.qrAuthToken = qrAuthToken; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getReservedAt() { return reservedAt; }
    public void setReservedAt(LocalDateTime reservedAt) { this.reservedAt = reservedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
}
