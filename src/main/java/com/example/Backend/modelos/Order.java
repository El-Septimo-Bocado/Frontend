package com.example.Backend.modelos;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reserva", indexes = {
        @Index(name = "idx_reserva_usuario", columnList = "usuario_id"),
        @Index(name = "idx_reserva_funcion", columnList = "funcion_id")
})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(optional = false) @JoinColumn(name = "funcion_id")
    private Showtime showtime;

    @Column(name = "fecha")
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(name = "subtotal_boletas")
    private Integer totalBoletas;

    @Column(name = "subtotal_comidas")
    private Integer totalComida;

    @Column(name = "total")
    private Integer total;

    @Column(name = "estado")
    private String status; // "ACTIVA","CANCELADA","PAGADA"

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    @Transient
    private Integer cargoServicio = 0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Showtime getShowtime() {
        return showtime;
    }

    public void setShowtime(Showtime showtime) {
        this.showtime = showtime;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Integer getTotalBoletas() {
        return totalBoletas;
    }

    public void setTotalBoletas(Integer totalBoletas) {
        this.totalBoletas = totalBoletas;
    }

    public Integer getTotalComida() {
        return totalComida;
    }

    public void setTotalComida(Integer totalComida) {
        this.totalComida = totalComida;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
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

    public Integer getCargoServicio() {
        return cargoServicio;
    }

    public void setCargoServicio(Integer cargoServicio) {
        this.cargoServicio = cargoServicio;
    }

    // getters/setters
}

