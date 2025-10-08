package com.example.Backend.repository;

import java.util.*;

import com.example.Backend.modelos.Usuario;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepository {
    private final List<Usuario> baseDeDatos = new ArrayList<>();
    // token -> userId
    private final Map<String, String> tokenStore = new HashMap<>();

    public Usuario save(Usuario usuario) {
        baseDeDatos.add(usuario);
        return usuario;
    }

    public Usuario findById(String id) {
        for (Usuario u : baseDeDatos) {
            if (u.getId().equals(id)) return u;
        }
        return null;
    }

    public List<Usuario> findAll() { return new ArrayList<>(baseDeDatos); }

    public void deleteById(String id) {
        baseDeDatos.removeIf(u -> u.getId().equals(id));
    }

    public Usuario update(Usuario usuario) {
        for (int i = 0; i < baseDeDatos.size(); i++) {
            if (baseDeDatos.get(i).getId().equals(usuario.getId())) {
                baseDeDatos.set(i, usuario);
                return usuario;
            }
        }
        return null;
    }

    public List<Usuario> buscarPorFiltros(String nombre, String email) {
        List<Usuario> resultado = new ArrayList<>();
        for (Usuario u : baseDeDatos) {
            boolean byName  = (nombre == null || (u.getNombre() != null && u.getNombre().contains(nombre)));
            boolean byEmail = (email  == null || (u.getEmail()  != null && u.getEmail().contains(email)));
            if (byName && byEmail) resultado.add(u);
        }
        return resultado;
    }

    public Usuario findByEmail(String email) {
        for (Usuario u : baseDeDatos) {
            if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(email)) return u;
        }
        return null;
    }

    /** Genera y guarda un token nuevo para el userId, y lo devuelve */
    public String saveToken(String userId) {
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, userId);
        return token;
    }

    /** Resuelve un token y devuelve el usuario asociado (o null) */
    public Usuario findByAuthToken(String token) {
        String userId = tokenStore.get(token);
        return userId == null ? null : findById(userId);
    }

    // logout:
    public void revokeToken(String token) {
        tokenStore.remove(token);
    }
}