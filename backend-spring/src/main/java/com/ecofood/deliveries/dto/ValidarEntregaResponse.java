package com.ecofood.deliveries.dto;

import java.time.LocalDateTime;

public class ValidarEntregaResponse {

    private boolean success;
    private String message;
    private String donacionId;
    private String nuevoEstado; // "Entregado"
    private LocalDateTime fechaCierre;
    private Double kilosRescatados;
    private String receptorBusinessName;

    public ValidarEntregaResponse() {
    }

    public static ValidarEntregaResponse success(String donacionId, LocalDateTime fechaCierre, Double kilos, String receptor) {
        ValidarEntregaResponse res = new ValidarEntregaResponse();
        res.success = true;
        res.message = "¡Entrega confirmada y alimentos rescatados exitosamente!";
        res.donacionId = donacionId;
        res.nuevoEstado = "Entregado";
        res.fechaCierre = fechaCierre;
        res.kilosRescatados = kilos;
        res.receptorBusinessName = receptor;
        return res;
    }

    public static ValidarEntregaResponse error(String message) {
        ValidarEntregaResponse res = new ValidarEntregaResponse();
        res.success = false;
        res.message = message;
        return res;
    }

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

    public String getDonacionId() {
        return donacionId;
    }

    public void setDonacionId(String donacionId) {
        this.donacionId = donacionId;
    }

    public String getNuevoEstado() {
        return nuevoEstado;
    }

    public void setNuevoEstado(String nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public Double getKilosRescatados() {
        return kilosRescatados;
    }

    public void setKilosRescatados(Double kilosRescatados) {
        this.kilosRescatados = kilosRescatados;
    }

    public String getReceptorBusinessName() {
        return receptorBusinessName;
    }

    public void setReceptorBusinessName(String receptorBusinessName) {
        this.receptorBusinessName = receptorBusinessName;
    }
}
