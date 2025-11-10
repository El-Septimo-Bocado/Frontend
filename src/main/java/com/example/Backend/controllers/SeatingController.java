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
@RestController
@RequestMapping("/api/showtimes")
@Tag(name = "Asientos", description = "Mapa, bloqueo y liberación de asientos por función")
public class SeatingController {   // ✅ AHORA ES PUBLIC
    private final SeatingService seating;

    @Autowired
    public SeatingController(SeatingService s){
        this.seating = s;
    }

    @GetMapping("/{showtimeId}/seats")
    @Operation(
            summary = "Ver mapa de asientos",
            description = "Devuelve el estado de todos los asientos (DISPONIBLE, RESERVADO, OCUPADO) para la función."
    )
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Mapa obtenido correctamente") })
    public ResponseEntity<List<SeatStatus>> seats(@PathVariable String showtimeId){
        return ResponseEntity.ok(seating.getMap(showtimeId));
    }

    record HoldReq(List<String> seatCodes){}
    record HoldRes(String holdId, long expiresAt){}
    @PostMapping("/{showtimeId}/seats/hold")
    @Operation(
            summary = "Bloquear asientos",
            description = "Bloquea temporalmente los asientos seleccionados durante 5 minutos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asientos bloqueados"),
            @ApiResponse(responseCode = "409", description = "Alguno ya no está disponible")
    })
    public ResponseEntity<HoldRes> hold(@PathVariable String showtimeId, @RequestBody HoldReq req){
        String hid = seating.hold(showtimeId, req.seatCodes(), 5 * 60_000);
        return ResponseEntity.ok(new HoldRes(hid, System.currentTimeMillis() + 5*60_000));
    }

    record ReleaseReq(String holdId){}
    @PostMapping("/{showtimeId}/seats/release")
    @Operation(summary = "Liberar asientos", description = "Libera asientos previamente bloqueados.")
    @ApiResponses({ @ApiResponse(responseCode = "204", description = "Asientos liberados") })
    public ResponseEntity<Void> release(@PathVariable String showtimeId, @RequestBody ReleaseReq req){
        seating.release(showtimeId, req.holdId());
        return ResponseEntity.noContent().build();
    }
}
