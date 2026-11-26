package com.ecofood.deliveries.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "deliveries", indexes = {
    @Index(name = "idx_deliveries_uuid", columnList = "delivery_uuid"),
    @Index(name = "idx_deliveries_donation", columnList = "donation_id"),
    @Index(name = "idx_deliveries_beneficiary", columnList = "beneficiary_id"),
    @Index(name = "idx_deliveries_pin_status", columnList = "pickup_pin, status"),
    @Index(name = "idx_deliveries_qr_status", columnList = "qr_auth_token, status")
})
public class Entrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "delivery_uuid", unique = true, nullable = false, length = 64)
    private String deliveryUuid;

    @Column(name = "donation_id", nullable = false, length = 64)
    private String donationId;

    @Column(name = "beneficiary_id", nullable = false, length = 64)
    private String beneficiaryId; // UUID del comedor popular

    @Column(name = "pickup_pin", nullable = false, length = 10)
    private String pickupPin;

    @Column(name = "qr_auth_token", nullable = false, length = 255)
    private String qrAuthToken;

    @Column(nullable = false, length = 30)
    private String status = "PENDING_PICKUP"; // "PENDING_PICKUP" | "COMPLETED" | "CANCELLED"

    @Column(name = "reserved_at", nullable = false, updatable = false)
    private Instant reservedAt = Instant.now();

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    public Entrega() {}

    @PrePersist
    public void prePersist() {
        if (this.reservedAt == null) {
            this.reservedAt = Instant.now();
        }
    }

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

    public Instant getReservedAt() { return reservedAt; }
    public void setReservedAt(Instant reservedAt) { this.reservedAt = reservedAt; }

    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
}
