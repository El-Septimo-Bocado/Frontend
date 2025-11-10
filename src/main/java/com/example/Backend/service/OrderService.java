package com.example.Backend.service;

import com.example.Backend.dto.ReceiptDto;
import com.example.Backend.enums.DetalleTipo;
import com.example.Backend.enums.SeatState;
import com.example.Backend.modelos.Order;
import com.example.Backend.modelos.OrderLine;
import com.example.Backend.modelos.SeatStatus;
import com.example.Backend.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final ShowtimeService showtimes;
    private final MovieRepository movies;
    private final MenuItemRepository menuRepo;
    private final SeatingService seating;
    private final SeatStatusRepository seatRepo;
    private final OrderRepository orderRepo;
    private final OrderLineRepository lineRepo;

    public OrderService(ShowtimeService showtimes,
                        MovieRepository movies,
                        MenuItemRepository menuRepo,
                        SeatingService seating,
                        SeatStatusRepository seatRepo,
                        OrderRepository orderRepo,
                        OrderLineRepository lineRepo) {
        this.showtimes = showtimes;
        this.movies = movies;
        this.menuRepo = menuRepo;
        this.seating = seating;
        this.seatRepo = seatRepo;
        this.orderRepo = orderRepo;
        this.lineRepo = lineRepo;
    }

    @Transactional
    public Order createFromHold(String showtimeId, String holdId, java.util.List<OrderLine> itemLines) {
        var st = showtimes.findById(showtimeId);
        if (st == null) throw new RuntimeException("SHOWTIME_NOT_FOUND");

        var heldSeats = seatRepo.findByShowtimeIdAndHoldId(Long.valueOf(showtimeId), holdId);
        if (heldSeats.isEmpty()) throw new RuntimeException("HOLD_EMPTY_OR_EXPIRED");

        Order o = new Order();
        o.setShowtime(st);
        o.setStatus("ACTIVA");

        int boletas = 0;
        for (SeatStatus s : heldSeats) {
            OrderLine l = new OrderLine();
            l.setReserva(o);
            l.setType(DetalleTipo.BOLETA);
            l.setSeat(s);
            l.setQty(1);
            l.setUnitPrice(st.getBasePrice());
            l.setTotal(st.getBasePrice());
            o.getLines().add(l);
            boletas += st.getBasePrice();
        }

        int comida = 0;
        if (itemLines != null) {
            for (OrderLine in : itemLines) {
                // in.getReference() trae el id del producto como String (del controlador)
                Long productoId = tryParseLong(in.getReference());
                var mi = (productoId == null) ? null : menuRepo.findById(productoId).orElse(null);
                if (mi == null) continue;
                int qty = (in.getQty() <= 0) ? 1 : in.getQty();

                OrderLine l = new OrderLine();
                l.setReserva(o);
                l.setType(DetalleTipo.MENU);
                l.setProducto(mi);
                l.setQty(qty);
                l.setUnitPrice(mi.getPrecio());
                l.setTotal(mi.getPrecio() * qty);
                o.getLines().add(l);
                comida += mi.getPrecio() * qty;
            }
        }

        o.setTotalBoletas(boletas);
        o.setTotalComida(comida);
        o.setTotal(boletas + comida);

        // Persistir cascada
        Order saved = orderRepo.save(o);
        return saved;
    }

    @Transactional
    public Order pay(String orderIdStr, String holdId) {
        Long orderId = Long.valueOf(orderIdStr);
        Order o = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("ORDER_NOT_FOUND"));
        seating.confirmSold(String.valueOf(o.getShowtime().getId()), holdId);

        // asociar reserva en los asientos OCUPADO
        var seats = seatRepo.findByShowtimeId(Long.valueOf(o.getShowtime().getId()));
        for (SeatStatus s : seats) {
            if (s.getStatus() == SeatState.OCUPADO && holdId.equals(s.getHoldId())) {
                s.setReserva(o);
                s.setHoldId(null);
                s.setHoldExpiresAt(null);
                seatRepo.save(s);
            }
        }

        o.setStatus("PAGADA");
        return orderRepo.save(o);
    }

    @Transactional(readOnly = true)
    public com.example.Backend.dto.ReceiptDto receipt(String orderIdStr) {
        Long orderId = Long.valueOf(orderIdStr);
        Order o = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("ORDER_NOT_FOUND"));
        var st = o.getShowtime();
        var mv = st.getPelicula();

        var r = new com.example.Backend.dto.ReceiptDto();
        r.meta = new com.example.Backend.dto.ReceiptDto.Meta();
        r.meta.titulo = mv.getTitulo();
        r.meta.poster = mv.getPoster();
        r.meta.director = mv.getDirector();
        r.meta.generos = mv.getGeneros();
        r.meta.duracion = mv.getDuracion();

        r.fecha = java.time.LocalDate.now().toString();
        r.fechaLarga = java.time.ZonedDateTime.now(java.time.ZoneId.of("America/Bogota"))
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        r.horario = (st.getFechaHora() == null) ? "" : st.getFechaHora().toString();

        r.asientos = o.getLines().stream()
                .filter(l -> l.getType() == DetalleTipo.BOLETA && l.getSeat()!=null)
                .map(l -> l.getSeat().getSeatCode()).toList();

        r.comidas = o.getLines().stream()
                .filter(l -> l.getType() == DetalleTipo.MENU && l.getProducto()!=null)
                .map(l -> l.getProducto().getNombre()).toList();

        r.costos = new com.example.Backend.dto.ReceiptDto.Costos();
        r.costos.boletas = (o.getTotalBoletas() == null) ? 0 : o.getTotalBoletas();
        r.costos.comida  = (o.getTotalComida() == null) ? 0 : o.getTotalComida();
        r.costos.cargo   = (o.getCargoServicio() == null) ? 0 : o.getCargoServicio();
        r.costos.total   = (o.getTotal() == null) ? 0 : o.getTotal();
        return r;
    }

    private Long tryParseLong(String s){
        try { return (s==null)? null : Long.valueOf(s); }
        catch(Exception e){ return null; }
    }
}