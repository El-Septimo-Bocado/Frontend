package com.example.Backend.service;

import com.example.Backend.enums.RolUsuario;
import com.example.Backend.modelos.Usuario;
import com.example.Backend.repository.UsuarioRepository;
import com.example.Backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;
    private final String pepper;

    public record AuthResult(String token, Usuario user) {}

    public AuthService(UsuarioRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
        this.pepper = System.getenv().getOrDefault("APP_PEPPER", "dev_pepper_cambia_esto");
    }

    public AuthResult register(String nombre, String email, String rawPassword) {
        String normEmail = (email == null) ? null : email.trim().toLowerCase();
        if (normEmail == null || normEmail.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("INVALID_INPUT");
        }
        if (repo.existsByEmail(normEmail)) throw new IllegalStateException("EMAIL_ALREADY_EXISTS");

        var u = new Usuario();
        u.setNombre(nombre);
        u.setEmail(normEmail);
        u.setPasswordHash(encoder.encode(pepper + rawPassword));
        u = repo.save(u);

        String token = jwt.generate(u);
        return new AuthResult(token, u);
    }

    public AuthResult login(String email, String rawPassword) {
        String normEmail = (email == null) ? null : email.trim().toLowerCase();
        var u = repo.findByEmail(normEmail).orElseThrow(() -> new IllegalArgumentException("INVALID_CREDENTIALS"));
        if (!encoder.matches(pepper + rawPassword, u.getPasswordHash())) {
            throw new IllegalArgumentException("INVALID_CREDENTIALS");
        }
        return new AuthResult(jwt.generate(u), u);
    }

    public Usuario me(String token) {
        try {
            Long uid = jwt.userId(token);
            return repo.findById(uid).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    public void logout(String token) {
        // solo en caso de ser necesario, por ahora no
    }
}
