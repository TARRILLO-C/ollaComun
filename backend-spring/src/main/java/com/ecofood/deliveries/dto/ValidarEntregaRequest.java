package com.ecofood.deliveries.dto;

import java.time.LocalDateTime;

public class ValidarEntregaRequest {

    private String codigo;        // Código PIN (6 dígitos) o Hash del QR
    private String bodegaId;      // Identificador de la bodega que valida
    private String metodo;        // "PIN_INPUT" o "QR_SCAN"

    public ValidarEntregaRequest() {
    }

    public ValidarEntregaRequest(String codigo, String bodegaId, String metodo) {
        this.codigo = codigo;
        this.bodegaId = bodegaId;
        this.metodo = metodo;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getBodegaId() {
        return bodegaId;
    }

    public void setBodegaId(String bodegaId) {
        this.bodegaId = bodegaId;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }
}
