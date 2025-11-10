package com.example.Backend.repository;

import com.example.Backend.modelos.Order;
import com.example.Backend.modelos.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByShowtime(Showtime s);
}