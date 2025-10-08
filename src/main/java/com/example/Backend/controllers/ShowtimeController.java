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

    @Autowired
    public ShowtimeController(ShowtimeService service) { this.service = service; }

    @GetMapping
    @Operation(
            summary = "Listar funciones por película",
            description = "Devuelve todas las funciones disponibles filtradas por el parámetro ?movieId={id}."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos")
    })
    public ResponseEntity<List<Showtime>> listByMovie(@RequestParam String movieId) {
        return new ResponseEntity<>(service.findAllByMovie(movieId), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener función por ID",
            description = "Devuelve los detalles de una función específica, incluyendo horario y precio base."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Función encontrada"),
            @ApiResponse(responseCode = "404", description = "Función no encontrada")
    })
    public ResponseEntity<Showtime> get(@PathVariable String id) {
        Showtime s = service.findById(id);
        return (s != null) ? new ResponseEntity<>(s, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}