package com.example.Backend.service;

import java.util.List;

import com.example.Backend.modelos.MenuItem;
import com.example.Backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MenuItemService {
    private final MenuItemRepository repo;

    public MenuItemService(MenuItemRepository repo) {
        this.repo = repo;
    }

    public MenuItem save(MenuItem item) {
        // forzamos categoria en minúscula para coincidir con ENUM de BD
        if (item.getCategoria() != null) item.setCategoria(item.getCategoria().toLowerCase());
        return repo.save(item);
    }

    public MenuItem findById(String id) {
        return repo.findById(Long.valueOf(id)).orElse(null);
    }

    public List<MenuItem> findAll() {
        return repo.findAll();
    }

    public MenuItem update(MenuItem item) {
        if (item.getCategoria() != null) item.setCategoria(item.getCategoria().toLowerCase());
        return repo.save(item);
    }

    public void deleteById(String id) {
        repo.deleteById(Long.valueOf(id));
    }

    public List<MenuItem> buscarPorFiltros(String nombre, String categoria, Boolean activo,
                                           Integer precioMin, Integer precioMax) {
        String nombreSafe = (nombre == null) ? null : nombre.toLowerCase();
        String categoriaSafe = (categoria == null) ? null : categoria.toLowerCase();

        return repo.findAll().stream().filter(item -> {
            boolean byNombre = (nombreSafe == null) ||
                    (item.getNombre() != null && item.getNombre().toLowerCase().contains(nombreSafe));

            boolean byCategoria = (categoriaSafe == null) ||
                    (item.getCategoria() != null && item.getCategoria().equalsIgnoreCase(categoriaSafe));

            // activo es @Transient; si lo quieres filtrar, vale solo en lo que trae la app
            boolean byActivo = (activo == null) || (item.isActivo() == activo);

            boolean byMin = (precioMin == null) || (item.getPrecio() != null && item.getPrecio() >= precioMin);
            boolean byMax = (precioMax == null) || (item.getPrecio() != null && item.getPrecio() <= precioMax);

            return byNombre && byCategoria && byActivo && byMin && byMax;
        }).toList();
    }
}