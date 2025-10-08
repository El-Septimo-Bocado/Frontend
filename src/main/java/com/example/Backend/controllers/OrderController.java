package com.example.Backend.controllers;

import com.example.Backend.dto.ReceiptDto;
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

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Órdenes", description = "Crear, pagar y obtener recibo")
public class OrderController {
    @Autowired
    private OrderService orders;

    record CreateOrderDto(String showtimeId, String holdId,
                          java.util.List<LineDto> items) {}
    record LineDto(String reference, int qty) {}

    @PostMapping
    @Operation(
            summary = "Crear orden",
            description = "Crea una orden a partir de un hold de asientos y una lista opcional de ítems del menú."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Orden creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o hold vacío")
    })
    public ResponseEntity<Order> create(@RequestBody CreateOrderDto dto) {
        var itemLines = (dto.items()==null) ? java.util.List.<OrderLine>of()
                : dto.items().stream().map(d -> {
            OrderLine l = new OrderLine();
            l.setType("MENU_ITEM"); l.setReference(d.reference()); l.setQty(d.qty());
            return l;
        }).toList();

        return new ResponseEntity<>(orders.createFromHold(dto.showtimeId(), dto.holdId(), itemLines),
                HttpStatus.CREATED);
    }

    record PayDto(String holdId) {}
    @PostMapping("/{orderId}/pay")
    @Operation(
            summary = "Pagar orden",
            description = "Confirma los asientos (HELD → SOLD) y marca la orden como pagada."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orden pagada correctamente"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<Order> pay(@PathVariable String orderId, @RequestBody PayDto dto) {
        return new ResponseEntity<>(orders.pay(orderId, dto.holdId()), HttpStatus.OK);
    }

    @GetMapping("/{orderId}/receipt")
    @Operation(
            summary = "Obtener recibo",
            description = "Devuelve un objeto con los datos de la película, asientos, comida y totales para mostrar en el recibo."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recibo obtenido correctamente"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<ReceiptDto> receipt(@PathVariable String orderId) {
        return new ResponseEntity<>(orders.receipt(orderId), HttpStatus.OK);
    }
}
