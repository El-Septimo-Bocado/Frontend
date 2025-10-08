package com.example.Backend.service;

import com.example.Backend.dto.ReceiptDto;
import com.example.Backend.modelos.Order;
import com.example.Backend.modelos.OrderLine;
import com.example.Backend.modelos.SeatStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    @Autowired private ShowtimeService showtimes;
    @Autowired private MovieService movies;
    @Autowired private MenuItemService menu;
    @Autowired
    private SeatingService seating;

    private final java.util.Map<String, Order> db = new java.util.concurrent.ConcurrentHashMap<>();

    public Order createFromHold(String showtimeId, String holdId, java.util.List<OrderLine> itemLines) {
        var st = showtimes.findById(showtimeId);
        if (st == null) throw new RuntimeException("SHOWTIME_NOT_FOUND");


        java.util.List<String> heldSeats = seating.getMap(showtimeId).stream().filter(s -> "HELD".equals(s.getStatus()) && holdId.equals(s.getHoldId())).map(SeatStatus::getSeatCode).toList();

        if (heldSeats.isEmpty()) throw new RuntimeException("HOLD_EMPTY_OR_EXPIRED");

        Order o = new Order();
        o.setId(java.util.UUID.randomUUID().toString());
        o.setShowtimeId(showtimeId);
        o.setStatus("PENDING");

        int boletas = 0;
        for (String code : heldSeats) {
            OrderLine l = new OrderLine();
            l.setType("TICKET"); l.setReference(code); l.setQty(1); l.setUnitPrice(st.getBasePrice());
            o.getLines().add(l);
            boletas += st.getBasePrice();
        }


        int comida = 0;
        if (itemLines != null) {
            for (OrderLine in : itemLines) {
                var mi = menu.findById(in.getReference()); // menuItemId
                if (mi == null) continue;
                OrderLine l = new OrderLine();
                l.setType("MENU_ITEM"); l.setReference(mi.getId()); l.setQty(in.getQty());
                l.setUnitPrice((int) mi.getPrecio());
                o.getLines().add(l);
                comida += in.getQty() * (int) mi.getPrecio();
            }
        }

        o.setTotalBoletas(boletas);
        o.setTotalComida(comida);
        o.setCargoServicio(0);
        o.setTotal(boletas + comida);

        db.put(o.getId(), o);
        return o;
    }

    public Order pay(String orderId, String holdId) {
        Order o = db.get(orderId);
        if (o == null) throw new RuntimeException("ORDER_NOT_FOUND");
        seating.confirmSold(o.getShowtimeId(), holdId);
        o.setStatus("PAID");
        return o;
    }

    public ReceiptDto receipt(String orderId) {
        Order o = db.get(orderId);
        if (o == null) throw new RuntimeException("ORDER_NOT_FOUND");
        var st = showtimes.findById(o.getShowtimeId());
        var mv = movies.findById(st.getMovieId());

        ReceiptDto r = new ReceiptDto();
        r.meta = new ReceiptDto.Meta();
        r.meta.titulo = mv.getTitulo();
        r.meta.poster = mv.getPoster();
        r.meta.director = mv.getDirector();
        r.meta.generos = mv.getGeneros();
        r.meta.duracion = mv.getDuracion();

        r.fecha = java.time.LocalDate.now().toString();
        r.fechaLarga = java.time.ZonedDateTime.now(java.time.ZoneId.of("America/Bogota"))
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        r.horario = st.getEtiqueta();

        r.asientos = o.getLines().stream()
                .filter(l -> "TICKET".equals(l.getType()))
                .map(OrderLine::getReference).toList();

        r.comidas = o.getLines().stream()
                .filter(l -> "MENU_ITEM".equals(l.getType()))
                .map(l -> {
                    var mi = menu.findById(l.getReference());
                    return (mi != null) ? mi.getNombre() : "Producto";
                }).toList();

        r.costos = new ReceiptDto.Costos();
        r.costos.boletas = o.getTotalBoletas();
        r.costos.comida  = o.getTotalComida();
        r.costos.cargo   = o.getCargoServicio();
        r.costos.total   = o.getTotal();

        return r;
    }
}