package com.example.Backend.repository;

import java.util.ArrayList;
import java.util.List;

import com.example.Backend.modelos.MenuItem;
import org.springframework.stereotype.Repository;

@Repository
public class MenuItemRepository {
    private final List<MenuItem> baseDeDatos = new ArrayList<>();

    public MenuItem save(MenuItem item) {
        baseDeDatos.add(item);
        return item;
    }

    public MenuItem findById(String id) {
        for (MenuItem item : baseDeDatos) {
            if (item.getId().equals(id)) return item;
        }
        return null;
    }

    public List<MenuItem> findAll() {
        return new ArrayList<>(baseDeDatos);
    }

    public void deleteById(String id) {
        for (int i = 0; i < baseDeDatos.size(); i++) {
            if (baseDeDatos.get(i).getId().equals(id)) {
                baseDeDatos.remove(i);
                return;
            }
        }
    }

    public MenuItem update(MenuItem item) {
        for (int i = 0; i < baseDeDatos.size(); i++) {
            if (baseDeDatos.get(i).getId().equals(item.getId())) {
                baseDeDatos.set(i, item);
                return item;
            }
        }
        return null;
    }

    public List<MenuItem> buscarPorFiltros(String nombre, String categoria, Boolean activo, Double precioMin, Double precioMax) {
        List<MenuItem> resultado = new ArrayList<>();
        for (MenuItem item : baseDeDatos) {
            boolean coincideNombre = (nombre == null || item.getNombre().toLowerCase().contains(nombre.toLowerCase()));
            boolean coincideCategoria = (categoria == null || categoria.equalsIgnoreCase(item.getCategoria()));
            boolean coincideActivo = (activo == null || item.isActivo() == activo);
            boolean coincidePrecioMin = (precioMin == null || item.getPrecio() >= precioMin);
            boolean coincidePrecioMax = (precioMax == null || item.getPrecio() <= precioMax);
            if (coincideNombre && coincideCategoria && coincideActivo && coincidePrecioMin && coincidePrecioMax) {
                resultado.add(item);
            }
        }
        return resultado;
    }
}
