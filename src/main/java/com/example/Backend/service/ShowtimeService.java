package com.example.Backend.service;

import java.time.LocalDateTime;
import java.util.List;

import com.example.Backend.modelos.Movie;
import com.example.Backend.modelos.Showtime;
import com.example.Backend.repository.MovieRepository;
import com.example.Backend.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ShowtimeService {
    private final ShowtimeRepository repo;
    private final MovieRepository movies;
    private final SeatingService seating;

    public ShowtimeService(ShowtimeRepository repo, MovieRepository movies, SeatingService seating) {
        this.repo = repo;
        this.movies = movies;
        this.seating = seating;
        // initSample();  <-- si quieres sembrar, asegúrate de tener películas primero
    }

    public Showtime save(Showtime s) {
        Showtime saved = repo.save(s);
        seating.initForShowtime(saved.getId());
        return saved;
    }

    public Showtime findById(String idStr) {
        Long id = Long.valueOf(idStr);
        return repo.findById(id).orElse(null);
    }

    public java.util.List<Showtime> findAllByMovie(String movieIdStr) {
        Long movieId = Long.valueOf(movieIdStr);
        var m = movies.findById(movieId).orElse(null);
        if (m == null) return java.util.List.of();
        return repo.findByPelicula(m);
    }
}
