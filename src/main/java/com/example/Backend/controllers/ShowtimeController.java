package com.example.Backend.controllers;

import java.util.List;

import com.example.Backend.modelos.Showtime;
import com.example.Backend.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/showtimes")
@Tag(name = "Funciones", description = "Horarios por película")
public class ShowtimeController {

    private final ShowtimeService service;
    public ShowtimeController(ShowtimeService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar funciones por movieId")
    public ResponseEntity<List<Showtime>> listByMovie(@RequestParam String movieId) {
        return ResponseEntity.ok(service.findAllByMovie(movieId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener función por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "No encontrada")
    })
    public ResponseEntity<Showtime> get(@PathVariable String id) {
        Showtime s = service.findById(id);
        return (s != null) ? ResponseEntity.ok(s) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}