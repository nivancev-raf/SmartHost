package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smarthost.backend.dto.AmenityDto;
import smarthost.backend.model.Amenity;
import smarthost.backend.model.Apartment;
import smarthost.backend.repository.AmenityRepository;
import smarthost.backend.repository.ApartmentRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmenityService {


    private final AmenityRepository amenityRepository;


    private final ApartmentRepository apartmentRepository; // Add this

    @Autowired
    public AmenityService(AmenityRepository amenityRepository, ApartmentRepository apartmentRepository) {
        this.amenityRepository = amenityRepository;
        this.apartmentRepository = apartmentRepository;
    }

    public List<AmenityDto> getAllAmenities() {
        List<Amenity> amenities = amenityRepository.findAll();
        return amenities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AmenityDto> getAmenitiesByApartmentId(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        return apartment.getAmenities().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AmenityDto mapToDto(Amenity amenity) {
        AmenityDto dto = new AmenityDto();
        dto.setId(amenity.getId());
        dto.setName(amenity.getName());
        return dto;
    }
}