package com.example.Backend.service;

import java.util.List;

import com.example.Backend.modelos.MenuItem;
import com.example.Backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MenuItemService {
    private final MenuItemRepository repo;

    @Autowired
    public MenuItemService(MenuItemRepository repo) {
        this.repo = repo;
        initSampleData();
    }

    private void initSampleData() {
        save(new MenuItem("Combo Interstellar", "Hamburguesa temática + bebida", "COMBO",
                42000, 20, true, "https://img/combointerstellar.png"));
        save(new MenuItem("Gaseosa Grande", "Bebida 22oz", "BEBIDA",
                9000, 100, true, "https://img/gaseosa.png"));
        save(new MenuItem("Palomitas Caramelo", "Dulces, tamaño mediano", "SNACK",
                16000, 60, true, "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688532/popcorn_rgp5or.png"));
    }

    public MenuItem save(MenuItem item) {
        return repo.save(item);
    }

    public MenuItem findById(String id) {
        return repo.findById(id);
    }

    public List<MenuItem> findAll() {
        return repo.findAll();
    }

    public MenuItem update(MenuItem item) {
        return repo.update(item);
    }

    public void deleteById(String id) {
        repo.deleteById(id);
    }

    public List<MenuItem> buscarPorFiltros(String nombre, String categoria, Boolean activo, Double precioMin, Double precioMax) {
        return repo.buscarPorFiltros(nombre, categoria, activo, precioMin, precioMax);
    }
}