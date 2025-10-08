package com.example.Backend.service;

import com.example.Backend.modelos.SeatStatus;
import com.example.Backend.repository.SeatStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SeatingService {
    private final SeatStatusRepository repo;

    @Autowired
    public SeatingService(SeatStatusRepository repo) {
        this.repo = repo;
        // init: por ahora marcamos FREE A1..A8 filas A..F (igual a tu HTML)
        for (char row='A'; row<='F'; row++) {
            for (int col=1; col<=8; col++) {
                SeatStatus s = new SeatStatus();
                s.setSeatCode(row + String.valueOf(col));
                s.setStatus("FREE");
                // setShowtimeId para cada showtime al generarlos (puedes hacerlo desde ShowtimeService)
            }
        }
    }

    public java.util.List<SeatStatus> getMap(String showtimeId) {
        return repo.findAllByShowtime(showtimeId);
    }

    public String hold(String showtimeId, java.util.List<String> seatCodes, long ttlMs) {
        String holdId = "H-" + java.util.UUID.randomUUID();
        long exp = System.currentTimeMillis() + ttlMs;
        for (String code : seatCodes) {
            SeatStatus s = repo.find(showtimeId, code);
            if (s == null || !"FREE".equals(s.getStatus())) {
                throw new RuntimeException("SEAT_ALREADY_TAKEN: " + code);
            }
        }
        for (String code : seatCodes) {
            SeatStatus s = repo.find(showtimeId, code);
            s.setStatus("HELD"); s.setHoldId(holdId); s.setHoldExpiresAt(exp);
            repo.save(s);
        }
        return holdId;
    }

    public void confirmSold(String showtimeId, String holdId) {
        for (SeatStatus s : repo.findAllByShowtime(showtimeId)) {
            if ("HELD".equals(s.getStatus()) && holdId.equals(s.getHoldId())) {
                s.setStatus("SOLD"); s.setHoldId(null); s.setHoldExpiresAt(0);
                repo.save(s);
            }
        }
    }

    public void release(String showtimeId, String holdId) {
        for (SeatStatus s : repo.findAllByShowtime(showtimeId)) {
            if ("HELD".equals(s.getStatus()) && holdId.equals(s.getHoldId())) {
                s.setStatus("FREE"); s.setHoldId(null); s.setHoldExpiresAt(0);
                repo.save(s);
            }
        }
    }

    public void initForShowtime(String showtimeId) {
        for (char row='A'; row<='F'; row++) {
            for (int col=1; col<=8; col++) {
                SeatStatus s = new SeatStatus();
                s.setShowtimeId(showtimeId);              // ← clave
                s.setSeatCode(row + String.valueOf(col));
                s.setStatus("FREE");
                repo.save(s);
            }
        }
    }

}
