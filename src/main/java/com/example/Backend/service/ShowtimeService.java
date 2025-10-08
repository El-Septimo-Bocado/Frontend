package com.example.Backend.service;

import java.time.LocalDateTime;
import java.util.List;

import com.example.Backend.modelos.Movie;
import com.example.Backend.modelos.Showtime;
import com.example.Backend.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ShowtimeService {
    private final ShowtimeRepository repo;
    private final MovieService movies;
    private final SeatingService seating;

    @Autowired
    public ShowtimeService(ShowtimeRepository repo, MovieService movies, SeatingService seating) {
        this.repo = repo;
        this.movies = movies;
        this.seating = seating;
        initSample();
    }

    private void initSample() {
        // Para cada movie, 3 horarios que calzan con tu UI ("Hoy", "Mañana", "Jueves")
        for (Movie m : movies.findAll()) {
            Showtime st1 = save(new Showtime(m.getId(), "Hoy - 22:00",
                    LocalDateTime.now().withHour(22).withMinute(0), 8000));
            seating.initForShowtime(st1.getId());

            Showtime st2 = save(new Showtime(m.getId(), "Mañana - 23:30",
                    LocalDateTime.now().plusDays(1).withHour(23).withMinute(30), 8000));
            seating.initForShowtime(st2.getId());

            Showtime st3 = save(new Showtime(m.getId(), "Jueves - 00:40",
                    LocalDateTime.now().plusDays(2).withHour(0).withMinute(40), 8000));
            seating.initForShowtime(st3.getId());
        }
    }

    public Showtime save(Showtime s) {
        return repo.save(s);
    }



    public Showtime findById(String id) {
        return repo.findById(id);
    }
    public List<Showtime> findAllByMovie(String movieId) {
        return repo.findAllByMovieId(movieId);
    }
}
