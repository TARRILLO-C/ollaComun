package com.ecofood.auth.dto;

import java.time.LocalDateTime;

public class RegisterBodegaRequest {

    private String docType;         // "DNI" o "RUC"
    private String docNumber;       // "20601234567" o "45678912"
    private String businessName;    // "Bodega Don Pepe"
    private String phone;           // "+51 987654321"
    private String address;         // "Av. Próceres de la Independencia 1420"
    private Double latitude;        // Coordenada latitud (opcional en registro)
    private Double longitude;       // Coordenada longitud (opcional en registro)

    public RegisterBodegaRequest() {
    }

    public RegisterBodegaRequest(String docType, String docNumber, String businessName, String phone, String address) {
        this.docType = docType;
        this.docNumber = docNumber;
        this.businessName = businessName;
        this.phone = phone;
        this.address = address;
    }

    // Getters y Setters
    public String getDocType() {
        return docType;
    }

    public void setDocType(String docType) {
        this.docType = docType;
    }

    public String getDocNumber() {
        return docNumber;
    }

    public void setDocNumber(String docNumber) {
        this.docNumber = docNumber;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
