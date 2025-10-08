package com.example.Backend.controllers;

import com.example.Backend.modelos.SeatStatus;
import com.example.Backend.service.SeatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController //Puente
@RequestMapping("/api/showtimes")
@Tag(name = "Asientos", description = "Mapa, bloqueo y liberación de asientos por función")
class SeatingController {
    private final SeatingService seating;
    @Autowired
    SeatingController(SeatingService s){ this.seating = s; }

    @GetMapping("/{showtimeId}/seats")
    @Operation(
            summary = "Ver mapa de asientos",
            description = "Devuelve el estado actual de todos los asientos (FREE, HELD, SOLD) para una función específica."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Mapa obtenido correctamente")
    })
    public ResponseEntity<List<SeatStatus>> seats(@PathVariable String showtimeId){
        return ResponseEntity.ok(seating.getMap(showtimeId));
    }

    record HoldReq(List<String> seatCodes){}
    record HoldRes(String holdId, long expiresAt){}
    @PostMapping("/{showtimeId}/seats/hold")
    @Operation(
            summary = "Bloquear asientos",
            description = "Bloquea temporalmente los asientos seleccionados durante 5 minutos para evitar duplicidad."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asientos bloqueados correctamente"),
            @ApiResponse(responseCode = "409", description = "Alguno de los asientos ya está ocupado")
    })
    public ResponseEntity<HoldRes> hold(@PathVariable String showtimeId, @RequestBody HoldReq req){
        String hid = seating.hold(showtimeId, req.seatCodes(), 5 * 60_000); // 5 min
        return ResponseEntity.ok(new HoldRes(hid, System.currentTimeMillis() + 5*60_000));
    }

    record ReleaseReq(String holdId){}
    @PostMapping("/{showtimeId}/seats/release")
    @Operation(
            summary = "Liberar asientos",
            description = "Libera los asientos previamente bloqueados si el usuario cancela antes del pago."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Asientos liberados correctamente")
    })
    public ResponseEntity<Void> release(@PathVariable String showtimeId, @RequestBody ReleaseReq req){
        seating.release(showtimeId, req.holdId());
        return ResponseEntity.noContent().build();
    }
}
