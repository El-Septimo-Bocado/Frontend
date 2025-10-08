package com.example.Backend.controllers;

import java.util.List;

import com.example.Backend.modelos.MenuItem;
import com.example.Backend.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/menu")
@Tag(name = "Menú", description = "API para la gestión de productos de comida/bebida")
public class MenuController {
    private final MenuItemService service;

    @Autowired
    public MenuController(MenuItemService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Obtener todos los productos del menú")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista obtenida con éxito"),
            @ApiResponse(responseCode = "500", description = "Error interno")
    })
    public ResponseEntity<List<MenuItem>> getAll() {
        return new ResponseEntity<>(service.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto del menú por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "No encontrado")
    })
    public ResponseEntity<MenuItem> getById(@PathVariable @Parameter(description = "ID del producto") String id) {
        MenuItem item = service.findById(id);
        return (item != null) ? new ResponseEntity<>(item, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo producto del menú")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Creado con éxito"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<MenuItem> create(@RequestBody @Parameter(description = "Datos del producto") MenuItem item) {
        MenuItem created = service.save(item);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un producto del menú")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Actualizado con éxito"),
            @ApiResponse(responseCode = "404", description = "No encontrado")
    })
    public ResponseEntity<MenuItem> update(@PathVariable String id,
                                           @RequestBody @Parameter(description = "Datos actualizados") MenuItem item) {
        MenuItem existing = service.findById(id);
        if (existing == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        item.setId(id);
        MenuItem updated = service.update(item);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un producto del menú")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Eliminado con éxito"),
            @ApiResponse(responseCode = "404", description = "No encontrado")
    })
    public ResponseEntity<Void> delete(@PathVariable String id) {
        MenuItem existing = service.findById(id);
        if (existing == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        service.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar productos por filtros (nombre, categoría, activo, precio)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Búsqueda exitosa"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos")
    })
    public ResponseEntity<List<MenuItem>> buscar(
            @RequestParam(required = false) @Parameter(description = "Nombre (parcial)") String nombre,
            @RequestParam(required = false) @Parameter(description = "Categoría (BEBIDA, SNACK, COMBO, etc.)") String categoria,
            @RequestParam(required = false) @Parameter(description = "Solo activos/inactivos") Boolean activo,
            @RequestParam(required = false) @Parameter(description = "Precio mínimo") Double precioMin,
            @RequestParam(required = false) @Parameter(description = "Precio máximo") Double precioMax) {

        return new ResponseEntity<>(
                service.buscarPorFiltros(nombre, categoria, activo, precioMin, precioMax),
                HttpStatus.OK
        );
    }
}
