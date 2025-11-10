package com.example.Backend.repository;

import java.util.ArrayList;
import java.util.List;

import com.example.Backend.modelos.Movie;
import com.example.Backend.modelos.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByPelicula(Movie pelicula);
}