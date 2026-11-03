package com.ecofood.auth.dto;

import java.time.LocalDateTime;

public class AuthResponse {

    private boolean success;
    private String message;
    private String userId;
    private String businessName;
    private String docNumber;
    private String role;
    private String facadePhotoUrl;
    private boolean isVerified;
    private String token;
    private LocalDateTime timestamp;

    public AuthResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public static AuthResponse success(String userId, String businessName, String docNumber, String facadePhotoUrl, String token) {
        AuthResponse res = new AuthResponse();
        res.success = true;
        res.message = "Bodega registrada y verificada exitosamente. ¡Listo para donar!";
        res.userId = userId;
        res.businessName = businessName;
        res.docNumber = docNumber;
        res.role = "BODEGA";
        res.facadePhotoUrl = facadePhotoUrl;
        res.isVerified = true;
        res.token = token;
        return res;
    }

    public static AuthResponse error(String message) {
        AuthResponse res = new AuthResponse();
        res.success = false;
        res.message = message;
        return res;
    }

    // Getters y Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getDocNumber() {
        return docNumber;
    }

    public void setDocNumber(String docNumber) {
        this.docNumber = docNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFacadePhotoUrl() {
        return facadePhotoUrl;
    }

    public void setFacadePhotoUrl(String facadePhotoUrl) {
        this.facadePhotoUrl = facadePhotoUrl;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
