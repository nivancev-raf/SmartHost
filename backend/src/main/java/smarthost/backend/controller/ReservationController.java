package smarthost.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smarthost.backend.dto.ReservationDto;
import smarthost.backend.requests.CreateReservationRequest;
import smarthost.backend.services.ReservationService;

@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationDto> createReservation(
            @RequestBody CreateReservationRequest request) {
        ReservationDto reservation = reservationService.createReservation(request);
        return ResponseEntity.status(201).body(reservation);
    }
}