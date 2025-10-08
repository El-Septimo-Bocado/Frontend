package com.example.Backend.dto;

public class ReceiptDto {
    public static class Meta {
        public String titulo;
        public String poster;
        public String director;
        public String generos;
        public String duracion;
    }
    public Meta meta;
    public String fecha;       // "02/10/2025"
    public String fechaLarga;  // "2 oct 2025, 3:20 p. m."
    public String horario;     // "Hoy - 22:00"
    public java.util.List<String> asientos; // ["A1","A2"]

    public java.util.List<String> comidas;

    public static class Costos {
        public int boletas;
        public int comida;
        public int cargo;
        public int total;
    }
    public Costos costos;
}
