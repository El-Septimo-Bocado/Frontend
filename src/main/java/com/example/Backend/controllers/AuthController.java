package com.example.Backend.controllers;

import com.example.Backend.modelos.Usuario;
import com.example.Backend.service.AuthService;
import com.example.Backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.example.Backend.security.JwtUtil;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final JwtUtil jwt;
    private final UsuarioService usuarios;

    public AuthController(AuthService auth, JwtUtil jwt, UsuarioService usuarios) {
        this.auth = auth;
        this.jwt = jwt;
        this.usuarios = usuarios;
    }

    // DTOs mínimos
    record RegisterDto(String nombre, String email, String password) {}
    record LoginDto(String email, String password) {}

    static class UserView {
        public Long id;
        public String nombre;
        public String email;
        public String rol;
        UserView(Usuario u) {
            this.id = u.getId();
            this.nombre = u.getNombre();
            this.email = u.getEmail();
            this.rol = String.valueOf(u.getRol());
        }
    }
    static class AuthResponse {
        public String token;
        public UserView user;
        AuthResponse(String token, Usuario u) {
            this.token = token;
            this.user = new UserView(u);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto dto) {
        try {
            var r = auth.register(dto.nombre(), dto.email(), dto.password());
            String token = jwt.generate(r.user());  // 24h según tu JwtUtil
            return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, r.user()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("EMAIL_ALREADY_EXISTS");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("INVALID_INPUT");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto dto) {
        try {
            var r = auth.login(dto.email(), dto.password());
            String token = jwt.generate(r.user());
            return ResponseEntity.ok(new AuthResponse(token, r.user()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("INVALID_CREDENTIALS");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractBearer(authHeader);
        if (token.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long uid;
        try { uid = jwt.userId(token); }
        catch (Exception ex) { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); }

        var u = usuarios.findById(String.valueOf(uid));
        return (u == null) ? ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
                : ResponseEntity.ok(new UserView(u));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless: el cliente borra el JWT. (Opcional: blacklist en servidor)
        return ResponseEntity.noContent().build();
    }

    private String extractBearer(String header) {
        if (header == null) return "";
        String v = header.trim();
        return v.toLowerCase().startsWith("bearer ") ? v.substring(7).trim() : v;
    }
}