package com.example.Backend.modelos;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "funcion", indexes = {
        @Index(name = "idx_funcion_pelicula", columnList = "pelicula_id")
})
public class Showtime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "pelicula_id")
    private Movie pelicula;

    @Column(name = "horario", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "precio_base")
    private Integer basePrice;

    @Column(name = "sala")
    private String sala;

    @Transient
    private String etiqueta;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Movie getPelicula() {
        return pelicula;
    }

    public void setPelicula(Movie pelicula) {
        this.pelicula = pelicula;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public Integer getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Integer basePrice) {
        this.basePrice = basePrice;
    }

    public String getSala() {
        return sala;
    }

    public void setSala(String sala) {
        this.sala = sala;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }
}
