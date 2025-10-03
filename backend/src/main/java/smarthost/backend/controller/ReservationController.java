package smarthost.backend.controller;

import com.stripe.exception.StripeException;
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
            @RequestBody CreateReservationRequest request) throws StripeException {
        ReservationDto reservation = reservationService.createReservation(request);
        return ResponseEntity.status(201).body(reservation);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDto> getReservationById(@PathVariable Long id) {
        ReservationDto reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(reservation);
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> deleteReservation(
            @PathVariable Long reservationId,
            @RequestParam String token) {
        try {
            reservationService.deleteReservationWithToken(reservationId, token);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(403).build();
        }
    }
}