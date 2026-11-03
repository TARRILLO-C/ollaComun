package com.ecofood.donations.dto;

import java.time.LocalDateTime;

public class NuevaDonacionRequest {

    private String donorId;             // ID del usuario bodega que publica
    private String categoria;           // "PANADERIA", "FRUTAS_VERDURAS", "ABARROTES"
    private String cantidadRango;       // "MENOS_5_KG", "5_10_KG", "10_20_KG", "MAS_20_KG", "EXACTO"
    private Double cantidadExacta;      // Opcional, ej. 12.5
    private String horarioLimite;       // "1_HORA", "2_HORAS", "4_HORAS", "CIERRE_HOY", "PERSONALIZADO"
    private LocalDateTime pickupEndAt;  // Timestamp calculado o definido
    private String notasEstado;         // Texto libre opcional del bodeguero
    private Double latitude;            // Coordenadas para cálculo espacial PostGIS
    private Double longitude;

    public NuevaDonacionRequest() {
    }

    public NuevaDonacionRequest(String categoria, String cantidadRango, String horarioLimite, String notasEstado) {
        this.categoria = categoria;
        this.cantidadRango = cantidadRango;
        this.horarioLimite = horarioLimite;
        this.notasEstado = notasEstado;
    }

    // Getters y Setters
    public String getDonorId() {
        return donorId;
    }

    public void setDonorId(String donorId) {
        this.donorId = donorId;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getCantidadRango() {
        return cantidadRango;
    }

    public void setCantidadRango(String cantidadRango) {
        this.cantidadRango = cantidadRango;
    }

    public Double getCantidadExacta() {
        return cantidadExacta;
    }

    public void setCantidadExacta(Double cantidadExacta) {
        this.cantidadExacta = cantidadExacta;
    }

    public String getHorarioLimite() {
        return horarioLimite;
    }

    public void setHorarioLimite(String horarioLimite) {
        this.horarioLimite = horarioLimite;
    }

    public LocalDateTime getPickupEndAt() {
        return pickupEndAt;
    }

    public void setPickupEndAt(LocalDateTime pickupEndAt) {
        this.pickupEndAt = pickupEndAt;
    }

    public String getNotasEstado() {
        return notasEstado;
    }

    public void setNotasEstado(String notasEstado) {
        this.notasEstado = notasEstado;
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
