package com.ecofood.donations.dto;

import java.time.LocalDateTime;

public class DonacionResponse {

    private boolean success;
    private String message;
    private String donationId;
    private String categoria;
    private String cantidadTexto;
    private String status;
    private LocalDateTime pickupEndAt;
    private int comedoresAlertadosCount;
    private LocalDateTime createdAt;

    public DonacionResponse() {
        this.createdAt = LocalDateTime.now();
    }

    public static DonacionResponse success(String donationId, String categoria, String cantidadTexto, LocalDateTime pickupEndAt, int comedoresCount) {
        DonacionResponse res = new DonacionResponse();
        res.success = true;
        res.message = "Donación registrada exitosamente. Alertas geoespaciales emitidas a comedores cercanos.";
        res.donationId = donationId;
        res.categoria = categoria;
        res.cantidadTexto = cantidadTexto;
        res.status = "AVAILABLE";
        res.pickupEndAt = pickupEndAt;
        res.comedoresAlertadosCount = comedoresCount;
        return res;
    }

    public static DonacionResponse error(String message) {
        DonacionResponse res = new DonacionResponse();
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

    public String getDonationId() {
        return donationId;
    }

    public void setDonationId(String donationId) {
        this.donationId = donationId;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getCantidadTexto() {
        return cantidadTexto;
    }

    public void setCantidadTexto(String cantidadTexto) {
        this.cantidadTexto = cantidadTexto;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getPickupEndAt() {
        return pickupEndAt;
    }

    public void setPickupEndAt(LocalDateTime pickupEndAt) {
        this.pickupEndAt = pickupEndAt;
    }

    public int getComedoresAlertadosCount() {
        return comedoresAlertadosCount;
    }

    public void setComedoresAlertadosCount(int comedoresAlertadosCount) {
        this.comedoresAlertadosCount = comedoresAlertadosCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
