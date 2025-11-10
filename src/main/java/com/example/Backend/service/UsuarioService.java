package com.example.Backend.service;

import java.util.List;

import com.example.Backend.repository.UsuarioRepository;
import com.example.Backend.modelos.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
    private final UsuarioRepository repo;
    public UsuarioService(UsuarioRepository repo) { this.repo = repo; }

    public Usuario save(Usuario u) { return repo.save(u); }
    public Usuario findById(String id) { return repo.findById(Long.valueOf(id)).orElse(null); }
    public List<Usuario> findAll() { return repo.findAll(); }
    public Usuario update(Usuario u) { return repo.save(u); }
    public void deleteById(String id) { repo.deleteById(Long.valueOf(id)); }

    public List<Usuario> buscarPorFiltros(String nombre, String email) {
        return repo.findAll().stream().filter(u -> {
            boolean n = (nombre == null || (u.getNombre()!=null && u.getNombre().contains(nombre)));
            boolean e = (email  == null || (u.getEmail()!=null  && u.getEmail().contains(email)));
            return n && e;
        }).toList();
    }
/*public Usuario findByAuthToken(String token) {
    try {
        //tenerlo listo por si las moscas
        return null; // ya no hace falta debido a que /api/auth/me del AuthService ya lo cumle
    } catch (Exception e) {
        return null;
    }
}*/
}