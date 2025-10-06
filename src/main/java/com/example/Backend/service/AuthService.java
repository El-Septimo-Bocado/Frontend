package com.example.Backend.service;

import com.example.Backend.modelos.Usuario;
import com.example.Backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository repo;

    @Autowired
    public AuthService(UsuarioRepository repo) {
        this.repo = repo;
    }

    public Usuario register(String nombre, String email, int edad, String password) {
        if (email == null || email.isBlank() || password == null || password.length() < 4)
            throw new IllegalArgumentException("Email o password inválidos");

        if (repo.findByEmail(email) != null)
            throw new IllegalStateException("EMAIL_ALREADY_EXISTS");

        Usuario u = new Usuario(nombre, email, edad);
        u.setPasswordHash(Hashing.sha256(password));
        u.setRol("USER");
        return repo.save(u);
    }

    public String login(String email, String password) {
        Usuario u = (Usuario) repo.findByEmail(email);
        if (u == null) throw new IllegalArgumentException("USER_NOT_FOUND");
        String hash = Hashing.sha256(password);
        if (!hash.equals(u.getPasswordHash()))
            throw new IllegalArgumentException("INVALID_CREDENTIALS");
        return repo.saveToken(u.getId());
    }

    public Usuario me(String token) {
        return repo.findByAuthToken(token);
    }
}