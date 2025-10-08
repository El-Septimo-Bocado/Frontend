package com.example.Backend.modelos;

import java.util.List;
import java.util.UUID;


public class Movie {
    private String id;
    private String titulo;

    private String caratula; // Imagen tipo CD (usada en la cartelera principal)
    private String poster; // Póster vertical (vista de reserva)
    private String fondo; // Imagen de fondo difuminada (detalle o reserva)



    private String director;
    private String generos;
    private String duracion;
    private double rating;
    private boolean activo;
    private String trailerUrl; // Enlace al video de YouTube o Vimeo

    public Movie() {
        this.id = UUID.randomUUID().toString();
        this.activo = true;
    }

    public Movie(String titulo, String caratula, String poster, String fondo,
                 String director, String generos, String duracion,
                 double rating, boolean activo, String trailerUrl) {
        this.id = UUID.randomUUID().toString();
        this.titulo = titulo;
        this.caratula = caratula;
        this.poster = poster;
        this.fondo = fondo;
        this.director = director;
        this.generos = generos;
        this.duracion = duracion;
        this.rating = rating;
        this.activo = activo;
        this.trailerUrl = trailerUrl;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getCaratula() {
        return caratula;
    }

    public void setCaratula(String caratula) {
        this.caratula = caratula;
    }


    public String getPoster() {
        return poster;
    }

    public void setPoster(String poster) {
        this.poster = poster;
    }

    public String getFondo() {
        return fondo;

    }

    public void setFondo(String fondo) {
        this.fondo = fondo;
    }


    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public String getGeneros() {
        return generos;
    }

    public void setGeneros(String generos) {
        this.generos = generos;
    }

    public String getDuracion() {
        return duracion;

    }
    public void setDuracion(String duracion) {
        this.duracion = duracion;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }


    public boolean isActivo() {

        return activo;
    }
    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
