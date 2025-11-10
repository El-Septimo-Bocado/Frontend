package com.example.Backend.repository;

import com.example.Backend.modelos.Order;
import com.example.Backend.modelos.OrderLine;
import com.example.Backend.modelos.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderLineRepository extends JpaRepository<OrderLine, Long> {
    List<OrderLine> findByReserva(Order reserva);
    boolean existsBySeat(SeatStatus seat);
}