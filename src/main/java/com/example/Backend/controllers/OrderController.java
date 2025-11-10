package com.example.Backend.controllers;

import com.example.Backend.dto.ReceiptDto;
import com.example.Backend.enums.DetalleTipo;
import com.example.Backend.modelos.Order;
import com.example.Backend.modelos.OrderLine;
import com.example.Backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/orders")
@Tag(name = "Órdenes", description = "Crear, pagar y recibo")
public class OrderController {

    private final OrderService orders;
    public OrderController(OrderService orders) { this.orders = orders; }

    record CreateOrderDto(String showtimeId, String holdId, java.util.List<LineDto> items) {}
    record LineDto(String reference, int qty) {}

    @PostMapping
    @Operation(summary = "Crear orden")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Creada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<Order> create(@RequestBody CreateOrderDto dto) {
        var itemLines = (dto.items()==null) ? java.util.List.<OrderLine>of()
                : dto.items().stream().map(d -> {
            OrderLine l = new OrderLine();
            l.setType(DetalleTipo.MENU);
            l.setReference(d.reference());
            l.setQty(d.qty());
            return l;
        }).toList();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orders.createFromHold(dto.showtimeId(), dto.holdId(), itemLines));
    }

    record PayDto(String holdId) {}
    @PostMapping("/{orderId}/pay")
    @Operation(summary = "Pagar orden")
    public ResponseEntity<Order> pay(@PathVariable String orderId, @RequestBody PayDto dto) {
        return ResponseEntity.ok(orders.pay(orderId, dto.holdId()));
    }

    @GetMapping("/{orderId}/receipt")
    @Operation(summary = "Obtener recibo")
    public ResponseEntity<ReceiptDto> receipt(@PathVariable String orderId) {
        return ResponseEntity.ok(orders.receipt(orderId));
    }
}
