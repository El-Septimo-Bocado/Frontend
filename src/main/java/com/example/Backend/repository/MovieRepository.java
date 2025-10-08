package com.example.Backend.repository;

import java.util.ArrayList;
import java.util.List;

import com.example.Backend.modelos.Movie;
import org.springframework.stereotype.Repository;


@Repository
public class MovieRepository {
    private final List<Movie> db = new ArrayList<>();

    public Movie save(Movie m) { db.add(m); return m; }

    public Movie findById(String id) {
        for (Movie m : db) if (m.getId().equals(id)) return m;
        return null;
    }

    public List<Movie> findAll() { return new ArrayList<>(db); }

    public Movie update(Movie movie) {
        for (int i = 0; i < db.size(); i++) {
            if (db.get(i).getId().equals(movie.getId())) { db.set(i, movie); return movie; }
        }
        return null;
    }

    public void deleteById(String id) {
        db.removeIf(m -> m.getId().equals(id));
    }
}