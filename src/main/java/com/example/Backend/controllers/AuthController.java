package com.example.Backend.controllers;

import com.example.Backend.modelos.Usuario;
import com.example.Backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    record RegisterDto(String nombre, String email, int edad, String password) {}
    record LoginDto(String email, String password) {}
    record TokenRes(String token) {}

    @Autowired
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register")
    public ResponseEntity<Usuario> register(@RequestBody RegisterDto dto) {
        try {
            var u = auth.register(dto.nombre(), dto.email(), dto.edad(), dto.password());
            return new ResponseEntity<>(u, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.CONFLICT); // email ya existe
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<TokenRes> login(@RequestBody LoginDto dto) {
        try {
            String token = auth.login(dto.email(), dto.password());
            return ResponseEntity.ok(new TokenRes(token));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Usuario> me(@RequestHeader("Authorization") String authHeader) {
        // admite "Bearer <token>" o solo "<token>"
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        var u = auth.me(token);
        return (u == null) ? new ResponseEntity<>(HttpStatus.UNAUTHORIZED)
                           : new ResponseEntity<>(u, HttpStatus.OK);
    }
}