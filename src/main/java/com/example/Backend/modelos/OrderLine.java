package com.example.Backend.modelos;

import com.example.Backend.enums.DetalleTipo;
import jakarta.persistence.*;

@Entity
@Table(name = "detalle_reserva", indexes = {
        @Index(name = "idx_detalle_reserva", columnList = "reserva_id"),
        @Index(name = "idx_detalle_producto", columnList = "producto_id")
})
public class OrderLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "reserva_id")
    private Order reserva;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private DetalleTipo type; // BOLETA | MENU

    // Si MENU
    @ManyToOne @JoinColumn(name = "producto_id")
    private MenuItem producto;

    // Si BOLETA
    @ManyToOne @JoinColumn(name = "seat_status_id")
    private SeatStatus seat;

    @Column(name = "cantidad")
    private Integer qty = 1;

    @Column(name = "precio_unitario")
    private Integer unitPrice = 0;

    @Column(name = "total")
    private Integer total = 0;

    @Transient
    private String reference; // para compatibilidad con tu controlador actual

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getReserva() {
        return reserva;
    }

    public void setReserva(Order reserva) {
        this.reserva = reserva;
    }

    public DetalleTipo getType() {
        return type;
    }

    public void setType(DetalleTipo type) {
        this.type = type;
    }

    public MenuItem getProducto() {
        return producto;
    }

    public void setProducto(MenuItem producto) {
        this.producto = producto;
    }

    public SeatStatus getSeat() {
        return seat;
    }

    public void setSeat(SeatStatus seat) {
        this.seat = seat;
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public Integer getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Integer unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    // getters/setters
}
