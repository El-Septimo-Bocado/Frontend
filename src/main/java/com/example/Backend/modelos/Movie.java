package com.example.Backend.modelos;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;


@Entity
@Table(name = "pelicula")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // títulos/strings con límites razonables (opcional)
    @Column(nullable = false, unique = true, length = 200)
    private String titulo;

    @Column(length = 500)
    private String poster;

    @Column(length = 500)
    private String fondo;

    @Column(length = 200)
    private String director;

    // En BD la columna es singular "genero"
    @Column(name = "genero", length = 200)
    private String generos;

    @Column(length = 50)
    private String duracion;

    // 👇 Tipo correcto para DECIMAL(3,1)
    @Column(name = "calificacion", precision = 3, scale = 1)
    private BigDecimal rating;

    @Transient
    private boolean activo = true;

    @Transient
    private String caratula;

    @Transient
    private String trailerUrl;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }

    public String getFondo() { return fondo; }
    public void setFondo(String fondo) { this.fondo = fondo; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public String getGeneros() { return generos; }
    public void setGeneros(String generos) { this.generos = generos; }

    public String getDuracion() { return duracion; }
    public void setDuracion(String duracion) { this.duracion = duracion; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public String getCaratula() { return caratula; }
    public void setCaratula(String caratula) { this.caratula = caratula; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }
}
