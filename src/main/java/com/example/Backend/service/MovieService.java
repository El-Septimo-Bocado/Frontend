package com.example.Backend.service;

import java.util.List;

import com.example.Backend.modelos.Movie;
import com.example.Backend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class MovieService {
    private final MovieRepository repo;
    public MovieService(MovieRepository repo) { this.repo = repo; }

    public Movie save(Movie m) { return repo.save(m); }
    public Movie findById(String id) { return repo.findById(Long.valueOf(id)).orElse(null); }
    public List<Movie> findAll() { return repo.findAll(); }
    public Movie update(Movie m) { return repo.save(m); }
    public void deleteById(String id) { repo.deleteById(Long.valueOf(id)); }
}