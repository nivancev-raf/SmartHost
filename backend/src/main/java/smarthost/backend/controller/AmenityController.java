package smarthost.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smarthost.backend.dto.AmenityDto;
import smarthost.backend.services.AmenityService;

import java.util.List;

@RestController
@RequestMapping("/amenities")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
public class AmenityController {

    private final AmenityService amenityService;


    @Autowired
    public AmenityController(AmenityService amenityService) {
        this.amenityService = amenityService;
    }

    @GetMapping
    public ResponseEntity<List<AmenityDto>> getAllAmenities() {
        List<AmenityDto> amenities = amenityService.getAllAmenities();
        return ResponseEntity.ok(amenities);
    }
    @GetMapping("/{apartmentId}")
    public ResponseEntity<List<AmenityDto>> getAmenitiesByApartmentId(@PathVariable Long apartmentId) {
        List<AmenityDto> amenities = amenityService.getAmenitiesByApartmentId(apartmentId);
        return ResponseEntity.ok(amenities);
    }
}