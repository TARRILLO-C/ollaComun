package com.ecofood.donations.dto;

import java.time.Instant;

public class DetalleEntregaResponse {

    private String donationUuid;
    private String title;
    private String category;
    private String quantity;
    private String status;
    private Instant pickupEndAt;

    // Datos del Comedor Popular que apartó el lote
    private String comedorId;
    private String comedorNombre;
    private String representanteNombre;
    private String comedorTelefono;
    private String comedorDireccion;

    // Estado de seguridad de PIN
    private int intentosFallidosPin;
    private boolean pinBloqueado;

    public DetalleEntregaResponse() {}

    public static DetalleEntregaResponse from(
            String donationUuid,
            String title,
            String category,
            String quantity,
            String status,
            Instant pickupEndAt,
            String comedorId,
            String comedorNombre,
            String representanteNombre,
            String comedorTelefono,
            String comedorDireccion,
            int intentosFallidosPin,
            boolean pinBloqueado
    ) {
        DetalleEntregaResponse res = new DetalleEntregaResponse();
        res.donationUuid = donationUuid;
        res.title = title;
        res.category = category;
        res.quantity = quantity;
        res.status = status;
        res.pickupEndAt = pickupEndAt;
        res.comedorId = comedorId;
        res.comedorNombre = comedorNombre;
        res.representanteNombre = representanteNombre;
        res.comedorTelefono = comedorTelefono;
        res.comedorDireccion = comedorDireccion;
        res.intentosFallidosPin = intentosFallidosPin;
        res.pinBloqueado = pinBloqueado;
        return res;
    }

    public String getDonationUuid() { return donationUuid; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getQuantity() { return quantity; }
    public String getStatus() { return status; }
    public Instant getPickupEndAt() { return pickupEndAt; }
    public String getComedorId() { return comedorId; }
    public String getComedorNombre() { return comedorNombre; }
    public String getRepresentanteNombre() { return representanteNombre; }
    public String getComedorTelefono() { return comedorTelefono; }
    public String getComedorDireccion() { return comedorDireccion; }
    public int getIntentosFallidosPin() { return intentosFallidosPin; }
    public boolean isPinBloqueado() { return pinBloqueado; }
}
