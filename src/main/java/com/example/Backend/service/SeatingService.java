package com.example.Backend.service;

import com.example.Backend.enums.SeatState;
import com.example.Backend.modelos.*;
import com.example.Backend.repository.SeatStatusRepository;
import com.example.Backend.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SeatingService {
    private final SeatStatusRepository seatRepo;
    private final ShowtimeRepository showtimeRepo;

    public SeatingService(SeatStatusRepository seatRepo, ShowtimeRepository showtimeRepo) {
        this.seatRepo = seatRepo;
        this.showtimeRepo = showtimeRepo;
    }

    public List<SeatStatus> getMap(String showtimeIdStr){
        Long showtimeId = parseId(showtimeIdStr);
        return seatRepo.findByShowtimeId(showtimeId);
    }

    @Transactional
    public String hold(String showtimeIdStr, List<String> seatCodes, long ttlMs){
        Long showtimeId = parseId(showtimeIdStr);
        long exp = System.currentTimeMillis() + ttlMs;
        String holdId = "H-" + UUID.randomUUID();

        // Validar disponibilidad
        for (String code : seatCodes) {
            SeatStatus s = seatRepo.findByShowtimeIdAndSeatCode(showtimeId, code)
                    .orElseThrow(() -> new RuntimeException("SEAT_NOT_FOUND: " + code));
            if (s.getStatus() != SeatState.DISPONIBLE) {
                throw new RuntimeException("SEAT_ALREADY_TAKEN: " + code);
            }
        }
        // Reservar (bloqueo temporal)
        for (String code : seatCodes) {
            SeatStatus s = seatRepo.findByShowtimeIdAndSeatCode(showtimeId, code).get();
            s.setStatus(SeatState.RESERVADO);
            s.setHoldId(holdId);
            s.setHoldExpiresAt(exp);
            seatRepo.save(s);
        }
        return holdId;
    }

    @Transactional
    public void confirmSold(String showtimeIdStr, String holdId){
        Long showtimeId = parseId(showtimeIdStr);
        for (SeatStatus s : seatRepo.findByShowtimeIdAndHoldId(showtimeId, holdId)) {
            s.setStatus(SeatState.OCUPADO);
            s.setHoldId(null);
            s.setHoldExpiresAt(null);
            seatRepo.save(s);
        }
    }

    @Transactional
    public void release(String showtimeIdStr, String holdId){
        Long showtimeId = parseId(showtimeIdStr);
        for (SeatStatus s : seatRepo.findByShowtimeIdAndHoldId(showtimeId, holdId)) {
            s.setStatus(SeatState.DISPONIBLE);
            s.setHoldId(null);
            s.setHoldExpiresAt(null);
            seatRepo.save(s);
        }
    }

    /** Inicializa A1..A8 x filas A..F para una función nueva */
    @Transactional
    public void initForShowtime(Long showtimeId){
        for (char row='A'; row<='F'; row++) {
            for (int col=1; col<=8; col++) {
                String code = row + String.valueOf(col);
                if (seatRepo.findByShowtimeIdAndSeatCode(showtimeId, code).isEmpty()) {
                    SeatStatus s = new SeatStatus();
                    Showtime st = showtimeRepo.findById(showtimeId)
                            .orElseThrow(() -> new RuntimeException("SHOWTIME_NOT_FOUND"));
                    s.setShowtime(st);
                    s.setSeatCode(code);
                    s.setStatus(SeatState.DISPONIBLE);
                    seatRepo.save(s);
                }
            }
        }
    }

    private Long parseId(String idStr){
        try { return Long.valueOf(idStr); }
        catch (Exception e){ throw new RuntimeException("INVALID_ID: " + idStr); }
    }
}
