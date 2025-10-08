package com.example.Backend.controllers;

import java.util.List;

import com.example.Backend.service.UsuarioService;
import com.example.Backend.modelos.Usuario;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@Tag(name = "Usuarios", description = "API para la gestión de usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @Operation(summary = "Obtener todos los usuarios", description = "Devuelve una lista de todos los usuarios registrados.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida con éxito"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.findAll();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Devuelve un usuario específico basado en su ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable @Parameter(description = "ID del usuario") String id) {
        Usuario usuario = usuarioService.findById(id);
        if (usuario != null) {
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo usuario", description = "Crea un nuevo usuario con los datos proporcionados.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario creado con éxito"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<Usuario> createUsuario(@RequestBody @Parameter(description = "Datos del usuario a crear") Usuario usuario) {
        Usuario newUsuario = usuarioService.save(usuario);
        return new ResponseEntity<>(newUsuario, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un usuario", description = "Actualiza los datos de un usuario existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario actualizado con éxito"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Usuario> updateUsuario(@PathVariable @Parameter(description = "ID del usuario") String id,
                                                 @RequestBody @Parameter(description = "Datos actualizados del usuario") Usuario usuario) {
        Usuario existingUsuario = usuarioService.findById(id);
        if (existingUsuario != null) {
            usuario.setId(id);
            Usuario updatedUsuario = usuarioService.update(usuario);
            return new ResponseEntity<>(updatedUsuario, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un usuario", description = "Elimina un usuario basado en su ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuario eliminado con éxito"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Void> deleteUsuario(@PathVariable @Parameter(description = "ID del usuario") String id) {
        Usuario existingUsuario = usuarioService.findById(id);
        if (existingUsuario != null) {
            usuarioService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar usuarios por filtros", description = "Busca usuarios por nombre, email y edad.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuarios encontrados"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos")
    })
    public ResponseEntity<List<Usuario>> buscarUsuarios(
            @RequestParam @Parameter(description = "Nombre del usuario (parcial o completo)") String nombre,
            @RequestParam(required = false) @Parameter(description = "Email del usuario (opcional)") String email,
            @RequestParam @Parameter(description = "Edad del usuario") int edad) {
        List<Usuario> usuarios = usuarioService.buscarPorFiltros(nombre, email);
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @GetMapping("/auth")
    public ResponseEntity<Usuario> getUserByToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String token = authHeader.trim();
        if (token.toLowerCase().startsWith("bearer ")) token = token.substring(7).trim();

        Usuario usuario = usuarioService.findByAuthToken(token);
        if (usuario != null) {
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    // ====== CAMBIAR ROL DE USUARIO (ADMIN) ======
    @PutMapping("/{id}/role")
    @Operation(
            summary = "Cambiar rol de usuario",
            description = "Actualiza el rol del usuario a USER o ADMIN"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rol actualizado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "400", description = "Rol inválido")
    })
    public ResponseEntity<Usuario> updateRole(
            @PathVariable @Parameter(description = "ID del usuario") String id,
            @RequestBody @Parameter(description = "Nuevo rol (USER o ADMIN)") RoleDto body) {

        Usuario u = usuarioService.findById(id);
        if (u == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        String newRole = (body == null || body.rol == null) ? "" : body.rol.trim().toUpperCase();
        if (!newRole.equals("USER") && !newRole.equals("ADMIN")) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        u.setRol(newRole);
        Usuario up = usuarioService.update(u);
        return new ResponseEntity<>(up, HttpStatus.OK);
    }

    // DTO simple para el rol
    static class RoleDto { public String rol; }
}