package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smarthost.backend.dto.AmenityDto;
import smarthost.backend.model.Amenity;
import smarthost.backend.repository.AmenityRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmenityService {

    @Autowired
    private AmenityRepository amenityRepository;

    public List<AmenityDto> getAllAmenities() {
        List<Amenity> amenities = amenityRepository.findAll();
        return amenities.stream()
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