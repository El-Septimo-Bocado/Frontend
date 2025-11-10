package com.example.Backend.controllers;

import java.util.List;

import com.example.Backend.enums.RolUsuario;
import com.example.Backend.service.UsuarioService;
import com.example.Backend.modelos.Usuario;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Gestión de usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    public UsuarioController(UsuarioService usuarioService) { this.usuarioService = usuarioService; }

    private RolUsuario parseRol(String raw) {
        if (raw == null) throw new IllegalArgumentException("ROL_REQUIRED");
        return switch (raw.trim().toUpperCase()) {
            case "ADMIN" -> RolUsuario.ADMIN;
            case "USER"  -> RolUsuario.USER;
            default -> throw new IllegalArgumentException("ROL_INVALID");
        };
    }

    @GetMapping
    @Operation(summary = "Listar usuarios")
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable String id) {
        Usuario u = usuarioService.findById(id);
        return (u != null) ? ResponseEntity.ok(u) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Crear por aquí NO pone contraseña ni eleva rol; el registro real es /api/auth/register
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Crear usuario (ADMIN) - sin password")
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario in) {
        in.setId(null);
        in.setPasswordHash(null);
        in.setRol(RolUsuario.USER);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.save(in));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario (ADMIN): nombre/email")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable String id, @RequestBody Usuario in) {
        Usuario existing = usuarioService.findById(id);
        if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        if (in.getNombre() != null) existing.setNombre(in.getNombre());
        if (in.getEmail()  != null) existing.setEmail(in.getEmail());

        return ResponseEntity.ok(usuarioService.update(existing));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario (ADMIN)")
    public ResponseEntity<Void> deleteUsuario(@PathVariable String id) {
        Usuario existing = usuarioService.findById(id);
        if (existing == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        usuarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar por nombre/email")
    public ResponseEntity<List<Usuario>> buscarUsuarios(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String email) {
        return ResponseEntity.ok(usuarioService.buscarPorFiltros(nombre, email));
    }

    static class RoleDto { public String rol; }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    @Operation(summary = "Cambiar rol (ADMIN)")
    @ApiResponse(responseCode = "400", description = "Rol inválido")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    public ResponseEntity<?> updateRole(@PathVariable String id, @RequestBody RoleDto body) {
        Usuario u = usuarioService.findById(id);
        if (u == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        try {
            RolUsuario role = parseRol(body == null ? null : body.rol);
            u.setRol(role);
            return ResponseEntity.ok(usuarioService.update(u));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}