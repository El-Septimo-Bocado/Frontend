package com.example.Backend.controllers;

import java.util.List;

import com.example.Backend.modelos.MenuItem;
import com.example.Backend.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/menu")
@Tag(name = "Menú", description = "Productos de comida/bebida")
public class MenuController {

    private final MenuItemService service;
    public MenuController(MenuItemService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar menú")
    public ResponseEntity<List<MenuItem>> getAll() { return ResponseEntity.ok(service.findAll()); }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener item por ID")
    public ResponseEntity<MenuItem> getById(@PathVariable String id) {
        MenuItem item = service.findById(id);
        return (item != null) ? ResponseEntity.ok(item) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Crear item (ADMIN)")
    public ResponseEntity<MenuItem> create(@RequestBody MenuItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(item));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar item (ADMIN)")
    public ResponseEntity<MenuItem> update(@PathVariable String id, @RequestBody MenuItem item) {
        MenuItem existing = service.findById(id);
        if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        item.setId(Long.valueOf(id));
        return ResponseEntity.ok(service.update(item));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar item (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        MenuItem existing = service.findById(id);
        if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar por filtros")
    public ResponseEntity<List<MenuItem>> buscar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) Integer precioMin,
            @RequestParam(required = false) Integer precioMax) {
        return ResponseEntity.ok(
                service.buscarPorFiltros(nombre, categoria, activo, precioMin, precioMax)
        );
    }
}
