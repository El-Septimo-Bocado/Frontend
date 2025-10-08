package com.example.Backend.modelos;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.UUID;

public class Usuario {
    private String id;
    private String nombre;
    private String email;
    private int edad;

    @JsonIgnore                 // Nunca exponer en respuestas
    private String passwordHash; // Hash de la contraseña

    private String rol = "USER"; // USER | ADMIN

    public Usuario() {
        this.id = UUID.randomUUID().toString();
    }

    public Usuario(String nombre, String email, int edad) {
        this.id = UUID.randomUUID().toString();
        this.nombre = nombre;
        this.email = email;
        this.edad = edad;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getEdad() { return edad; }
    public void setEdad(int edad) { this.edad = edad; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}