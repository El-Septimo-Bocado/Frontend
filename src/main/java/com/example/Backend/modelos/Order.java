package com.example.Backend.modelos;

import java.util.List;

public class Order {
    private String id;
    private String showtimeId;
    private String status; // PENDING | PAID | CANCELLED
    private java.util.List<OrderLine> lines = new java.util.ArrayList<>();
    private int totalBoletas;
    private int totalComida;
    private int cargoServicio;
    private int total;


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(String showtimeId) {
        this.showtimeId = showtimeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<OrderLine> getLines() {
        return lines;
    }

    public void setLines(List<OrderLine> lines) {
        this.lines = lines;
    }

    public int getTotalBoletas() {
        return totalBoletas;
    }

    public void setTotalBoletas(int totalBoletas) {
        this.totalBoletas = totalBoletas;
    }

    public int getTotalComida() {
        return totalComida;
    }

    public void setTotalComida(int totalComida) {
        this.totalComida = totalComida;
    }

    public int getCargoServicio() {
        return cargoServicio;
    }

    public void setCargoServicio(int cargoServicio) {
        this.cargoServicio = cargoServicio;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}

