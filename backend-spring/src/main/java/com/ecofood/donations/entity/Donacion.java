package com.ecofood.donations.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "donations", indexes = {
    @Index(name = "idx_donation_uuid", columnList = "donation_uuid"),
    @Index(name = "idx_idempotency_key", columnList = "idempotency_key"),
    @Index(name = "idx_status_pickup_end", columnList = "status, pickup_end_at")
})
public class Donacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donation_uuid", unique = true, nullable = false, length = 64)
    private String donationUuid;

    @Column(name = "idempotency_key", length = 64)
    private String idempotencyKey;

    @Column(name = "donor_id", nullable = false)
    private String donorId;

    @Column(name = "reserved_by_comedor_id")
    private String reservedByComedorId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;
    
    @Column(name = "quantity_value")
    private Double quantityValue;
    
    @Column(name = "unit_measure")
    private String unitMeasure;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "pickup_start_at", nullable = false)
    private Instant pickupStartAt;

    @Column(name = "pickup_end_at", nullable = false)
    private Instant pickupEndAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DonationStatus status = DonationStatus.AVAILABLE;

    @Column(name = "intentos_fallidos_pin", nullable = false)
    private Integer intentosFallidosPin = 0;

    @Column(name = "pin_bloqueado", nullable = false)
    private Boolean pinBloqueado = false;

    private Double latitude;
    private Double longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Donacion() {}

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.intentosFallidosPin == null) {
            this.intentosFallidosPin = 0;
        }
        if (this.pinBloqueado == null) {
            this.pinBloqueado = false;
        }
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDonationUuid() { return donationUuid; }
    public void setDonationUuid(String donationUuid) { this.donationUuid = donationUuid; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getDonorId() { return donorId; }
    public void setDonorId(String donorId) { this.donorId = donorId; }

    public String getReservedByComedorId() { return reservedByComedorId; }
    public void setReservedByComedorId(String reservedByComedorId) { this.reservedByComedorId = reservedByComedorId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getQuantityValue() { return quantityValue; }
    public void setQuantityValue(Double quantityValue) { this.quantityValue = quantityValue; }

    public String getUnitMeasure() { return unitMeasure; }
    public void setUnitMeasure(String unitMeasure) { this.unitMeasure = unitMeasure; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getPickupStartAt() { return pickupStartAt; }
    public void setPickupStartAt(Instant pickupStartAt) { this.pickupStartAt = pickupStartAt; }

    public Instant getPickupEndAt() { return pickupEndAt; }
    public void setPickupEndAt(Instant pickupEndAt) { this.pickupEndAt = pickupEndAt; }

    public DonationStatus getStatus() { return status; }
    public void setStatus(DonationStatus status) { this.status = status; }

    public Integer getIntentosFallidosPin() { return intentosFallidosPin != null ? intentosFallidosPin : 0; }
    public void setIntentosFallidosPin(Integer intentosFallidosPin) { this.intentosFallidosPin = intentosFallidosPin; }

    public Boolean getPinBloqueado() { return pinBloqueado != null ? pinBloqueado : false; }
    public void setPinBloqueado(Boolean pinBloqueado) { this.pinBloqueado = pinBloqueado; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
