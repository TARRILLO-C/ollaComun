package com.ecofood.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_uuid", unique = true, nullable = false)
    private String userUuid;

    @Column(nullable = false)
    private String role; // "BODEGA" | "COMEDOR"

    @Column(name = "doc_type", nullable = false)
    private String docType; // "DNI" | "RUC"

    @Column(name = "doc_number", unique = true, nullable = false)
    private String docNumber;

    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "representative_name")
    private String representativeName;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(name = "address_line", nullable = false)
    private String addressLine;

    private String district;

    @Column(name = "facade_photo_url")
    private String facadePhotoUrl;

    private Double latitude;
    private Double longitude;

    @Column(name = "is_verified")
    private Boolean isVerified = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Usuario() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserUuid() { return userUuid; }
    public void setUserUuid(String userUuid) { this.userUuid = userUuid; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public String getDocNumber() { return docNumber; }
    public void setDocNumber(String docNumber) { this.docNumber = docNumber; }

    public String getPinHash() { return pinHash; }
    public void setPinHash(String pinHash) { this.pinHash = pinHash; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getRepresentativeName() { return representativeName; }
    public void setRepresentativeName(String representativeName) { this.representativeName = representativeName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getFacadePhotoUrl() { return facadePhotoUrl; }
    public void setFacadePhotoUrl(String facadePhotoUrl) { this.facadePhotoUrl = facadePhotoUrl; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
