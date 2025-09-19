package smarthost.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smarthost.backend.dto.ApartmentDto;
import smarthost.backend.requests.CreateApartmentRequest;
import smarthost.backend.model.Apartment;
import smarthost.backend.requests.UpdateApartmentRequest;
import smarthost.backend.services.ApartmentService;

import java.util.List;

@RestController
@RequestMapping("/apartments")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
public class ApartmentController {

    private final ApartmentService apartmentService;

    @Autowired
    public ApartmentController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @GetMapping
    public ResponseEntity<List<ApartmentDto>> getAllApartments() {
        List<ApartmentDto> apartments = apartmentService.getAllApartments();
        return ResponseEntity.ok(apartments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApartmentDto> getApartmentById(@PathVariable Long id) {
        ApartmentDto apartment = apartmentService.getApartmentById(id);
        return ResponseEntity.ok(apartment);
    }


    @PostMapping
    public ResponseEntity<ApartmentDto> createApartment(@RequestBody CreateApartmentRequest request) {
        ApartmentDto apartment = apartmentService.createApartment(request);
        return ResponseEntity.status(201).body(apartment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApartmentDto> updateApartment(
            @PathVariable Long id,
            @RequestBody UpdateApartmentRequest request) {
        ApartmentDto apartment = apartmentService.updateApartment(id, request);
        return ResponseEntity.ok(apartment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApartment(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ApartmentDto>> getApartmentsByOwner(@PathVariable Long ownerId) {
        List<ApartmentDto> apartments = apartmentService.getApartmentsByOwner(ownerId);
        return ResponseEntity.ok(apartments);
    }

}