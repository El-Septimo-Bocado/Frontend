package com.example.Backend.modelos;

import java.time.LocalDateTime;
import java.util.UUID;

public class Showtime {
    private String id;
    private String movieId;
    private String etiqueta;
    private LocalDateTime fechaHora;
    private int basePrice;

    public Showtime() {
        this.id = UUID.randomUUID().toString();
    }

    public Showtime(String movieId, String etiqueta, LocalDateTime fechaHora, int basePrice) {
        this.id = UUID.randomUUID().toString();
        this.movieId = movieId;
        this.etiqueta = etiqueta;
        this.fechaHora = fechaHora;
        this.basePrice = basePrice;
    }


    public String getId() {
        return id;
    }

    public String getMovieId() {
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public int getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(int basePrice) {
        this.basePrice = basePrice;
    }

}
