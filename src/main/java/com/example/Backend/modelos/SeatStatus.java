package com.example.Backend.modelos;

import com.example.Backend.enums.SeatState;
import jakarta.persistence.*;

@Entity
@Table(name = "seat_status",
        uniqueConstraints = @UniqueConstraint(name="uk_seat_status_funcion_seat", columnNames = {"funcion_id","seat_code"}),
        indexes = {
                @Index(name="idx_seat_status_funcion", columnList = "funcion_id"),
                @Index(name="idx_seat_status_reserva", columnList = "reserva_id")
        })
public class SeatStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "funcion_id")
    private Showtime showtime;

    @Column(name = "seat_code", length = 10, nullable = false)
    private String seatCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SeatState status = SeatState.DISPONIBLE;

    @Column(name = "hold_id")
    private String holdId;

    @Column(name = "hold_expires_at")
    private Long holdExpiresAt;

    @ManyToOne @JoinColumn(name = "reserva_id")
    private Order reserva;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Showtime getShowtime() {
        return showtime;
    }

    public void setShowtime(Showtime showtime) {
        this.showtime = showtime;
    }

    public String getSeatCode() {
        return seatCode;
    }

    public void setSeatCode(String seatCode) {
        this.seatCode = seatCode;
    }

    public SeatState getStatus() {
        return status;
    }

    public void setStatus(SeatState status) {
        this.status = status;
    }

    public String getHoldId() {
        return holdId;
    }

    public void setHoldId(String holdId) {
        this.holdId = holdId;
    }

    public Long getHoldExpiresAt() {
        return holdExpiresAt;
    }

    public void setHoldExpiresAt(Long holdExpiresAt) {
        this.holdExpiresAt = holdExpiresAt;
    }

    public Order getReserva() {
        return reserva;
    }

    public void setReserva(Order reserva) {
        this.reserva = reserva;
    }

    // getters/setters
}
