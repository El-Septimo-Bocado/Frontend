package com.example.Backend.modelos;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "menu")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) // nombre VARCHAR(200) NOT NULL
    private String nombre;

    @Column(columnDefinition = "TEXT") // descripcion TEXT
    private String descripcion;

    @Column(nullable = false)// precio INT NOT NULL
    private Integer precio;

    @Column(name = "imagen") // imagen VARCHAR(500)
    private String imageUrl;

    /**
     * En BD: ENUM('plato','postre','bebida')
     * Aquí lo manejamos como String. Usar valores en minúscula para coincidir con la BD.
     */
    @Column(nullable = false)
    private String categoria;

    // Estos dos no existen en la BD: quedan como datos calculados/temporales
    @Transient
    private int stock;

    @Transient
    private boolean activo = true;

    // ===== getters/setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = (categoria == null) ? null : categoria.toLowerCase(); }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
