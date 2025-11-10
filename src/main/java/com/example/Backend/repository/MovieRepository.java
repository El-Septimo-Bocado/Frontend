package com.example.Backend.repository;

import java.util.ArrayList;
import java.util.List;

import com.example.Backend.modelos.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


public interface MovieRepository extends JpaRepository<Movie, Long> {}