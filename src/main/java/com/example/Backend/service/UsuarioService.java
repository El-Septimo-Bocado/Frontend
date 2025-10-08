package com.example.Backend.service;

import java.util.List;

import com.example.Backend.repository.UsuarioRepository;
import com.example.Backend.modelos.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        initSampleData();
    }

    private void initSampleData() {
        Usuario juan = new Usuario("Juan Pérez", "juan@example.com", 30);
        Usuario maria = new Usuario("María López", "maria@example.com", 25);
        Usuario carlos = new Usuario("Carlos Ruiz", "carlos@example.com", 40);
        Usuario admin = new Usuario("Admin", "admin@example.com", 0);
        admin.setRol("ADMIN");
        save(maria);
        save(carlos);
        save(admin);
        save(juan);
    }

    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Usuario findById(String id) {
        return usuarioRepository.findById(id);
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Usuario update(Usuario usuario) {
        return usuarioRepository.update(usuario);
    }

    public void deleteById(String id) {
        usuarioRepository.deleteById(id);
    }

    public List<Usuario> buscarPorFiltros(String nombre, String email) {
        return usuarioRepository.buscarPorFiltros(nombre, email);
    }

    public Usuario findByAuthToken(String authToken) {
        return usuarioRepository.findByAuthToken(authToken);
    }
}