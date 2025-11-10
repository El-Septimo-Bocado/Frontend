package com.example.Backend.controllers;

import java.util.List;

import com.example.Backend.modelos.Movie;
import com.example.Backend.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/movies")
@Tag(name = "Películas", description = "API de cartelera")
public class MovieController {

    private final MovieService service;
    public MovieController(MovieService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar películas")
    @ApiResponse(responseCode = "200", description = "OK")
    public ResponseEntity<List<Movie>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener película por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "No encontrada")
    })
    public ResponseEntity<Movie> get(@PathVariable String id) {
        Movie m = service.findById(id);
        return (m != null) ? ResponseEntity.ok(m) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Crear película (ADMIN)")
    @ApiResponse(responseCode = "201", description = "Creada")
    public ResponseEntity<Movie> create(@RequestBody Movie m) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(m));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar película (ADMIN)")
    public ResponseEntity<Movie> update(@PathVariable String id, @RequestBody Movie m) {
        Movie exist = service.findById(id);
        if (exist == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        m.setId(Long.valueOf(id));
        return ResponseEntity.ok(service.update(m));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar película (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        Movie exist = service.findById(id);
        if (exist == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}