package com.example.Backend.repository;

import com.example.Backend.modelos.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface SeatStatusRepository extends JpaRepository<SeatStatus, Long> {
    Optional<SeatStatus> findByShowtimeIdAndSeatCode(Long showtimeId, String seatCode);
    List<SeatStatus> findByShowtimeId(Long showtimeId);
    List<SeatStatus> findByShowtimeIdAndHoldId(Long showtimeId, String holdId);
}
