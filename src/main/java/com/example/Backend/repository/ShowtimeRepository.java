package com.example.Backend.repository;

import java.util.ArrayList;
import java.util.List;

import com.example.Backend.modelos.Showtime;
import org.springframework.stereotype.Repository;

@Repository
public class ShowtimeRepository {
    private final List<Showtime> db = new ArrayList<>();

    public Showtime save(Showtime s) { db.add(s); return s; }

    public Showtime findById(String id) {
        for (Showtime s : db) if (s.getId().equals(id)) return s;
        return null;
    }

    public List<Showtime> findAllByMovieId(String movieId) {
        List<Showtime> out = new ArrayList<>();
        for (Showtime s : db) if (s.getMovieId().equals(movieId)) out.add(s);
        return out;
    }
}