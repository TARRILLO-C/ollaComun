package com.ecofood.donations.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donation_uuid", unique = true)
    private String donationUuid;

    @Column(name = "donor_id")
    private String donorId;

    private String title;
    private String category;
    
    @Column(name = "quantity_value")
    private Double quantityValue;
    
    @Column(name = "unit_measure")
    private String unitMeasure;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "pickup_start_at")
    private LocalDateTime pickupStartAt;

    @Column(name = "pickup_end_at")
    private LocalDateTime pickupEndAt;
    
    private String status = "AVAILABLE"; // "AVAILABLE" | "RESERVED" | "DELIVERED" | "EXPIRED"

    private Double latitude;
    private Double longitude;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Donacion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDonationUuid() { return donationUuid; }
    public void setDonationUuid(String donationUuid) { this.donationUuid = donationUuid; }

    public String getDonorId() { return donorId; }
    public void setDonorId(String donorId) { this.donorId = donorId; }

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

    public LocalDateTime getPickupStartAt() { return pickupStartAt; }
    public void setPickupStartAt(LocalDateTime pickupStartAt) { this.pickupStartAt = pickupStartAt; }

    public LocalDateTime getPickupEndAt() { return pickupEndAt; }
    public void setPickupEndAt(LocalDateTime pickupEndAt) { this.pickupEndAt = pickupEndAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
