package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smarthost.backend.dto.AmenityDto;
import smarthost.backend.dto.ApartmentDto;
import smarthost.backend.dto.ApartmentImageDto;
import smarthost.backend.mapper.ApartmentMapper;
import smarthost.backend.model.Amenity;
import smarthost.backend.model.ApartmentImage;
import smarthost.backend.repository.AmenityRepository;
import smarthost.backend.repository.ApartmentImageRepository;
import smarthost.backend.requests.CreateApartmentRequest;
import smarthost.backend.model.Apartment;
import smarthost.backend.repository.ApartmentRepository;
import smarthost.backend.requests.UpdateApartmentRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final ApartmentImageRepository apartmentImageRepository;
    private final AmenityRepository amenityRepository;
    private final ApartmentMapper apartmentMapper;

    @Autowired
    public ApartmentService(ApartmentRepository apartmentRepository,
                            ApartmentImageRepository apartmentImageRepository,
                            AmenityRepository amenityRepository,
                            ApartmentMapper apartmentMapper) {
        this.apartmentRepository = apartmentRepository;
        this.apartmentImageRepository = apartmentImageRepository;
        this.amenityRepository = amenityRepository;
        this.apartmentMapper = apartmentMapper;
    }

    public List<ApartmentDto> getAllApartments() {
        List<Apartment> apartments = apartmentRepository.findAll();
        return apartments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ApartmentDto getApartmentById(Long id) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found with id: " + id));
        return mapToDto(apartment);
    }

    public ApartmentDto createApartment(CreateApartmentRequest request) {
        Apartment apartment = apartmentMapper.mapToApartment(request);

        // amenities
        if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
            List<Amenity> amenities = amenityRepository.findAllById(request.getAmenityIds());
            apartment.setAmenities(amenities);
        }
        Apartment savedApartment = apartmentRepository.save(apartment);
        return mapToDto(savedApartment);
    }

    public ApartmentDto updateApartment(Long id, UpdateApartmentRequest request) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found with id: " + id));

        // Update fields
        apartment.setName(request.getName());
        apartment.setDescription(request.getDescription());
        apartment.setAddress(request.getAddress());
        apartment.setCity(request.getCity());
        apartment.setFloor(request.getFloor());
        apartment.setBedrooms(request.getBedrooms());
        apartment.setBathrooms(request.getBathrooms());
        apartment.setMaxGuests(request.getMaxGuests());
        apartment.setSizeM2(request.getSizeM2());
        apartment.setBasePrice(request.getBasePrice());
        if (request.getStatus() != null) {
            apartment.setStatus(request.getStatus());
        }

        // Update amenities
        if (request.getAmenityIds() != null) {
            List<Amenity> amenities = amenityRepository.findAllById(request.getAmenityIds());
            apartment.setAmenities(amenities);
        }

        Apartment savedApartment = apartmentRepository.save(apartment);
        return mapToDto(savedApartment);
    }

    public void deleteApartment(Long id) {
        if (!apartmentRepository.existsById(id)) {
            throw new RuntimeException("Apartment not found with id: " + id);
        }
        apartmentRepository.deleteById(id);
    }

    public List<ApartmentDto> getApartmentsByOwner(Long ownerId) {
        List<Apartment> apartments = apartmentRepository.findByOwnerId(ownerId);
        return apartments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ApartmentDto mapToDto(Apartment apartment) {
        List<ApartmentImage> images = apartmentImageRepository.findByApartmentId(apartment.getId());

        ApartmentDto dto = new ApartmentDto();
        dto.setId(apartment.getId());
        dto.setOwnerId(apartment.getOwnerId());
        dto.setName(apartment.getName());
        dto.setDescription(apartment.getDescription());
        dto.setAddress(apartment.getAddress());
        dto.setCity(apartment.getCity());
        dto.setFloor(apartment.getFloor());
        dto.setBedrooms(apartment.getBedrooms());
        dto.setBathrooms(apartment.getBathrooms());
        dto.setMaxGuests(apartment.getMaxGuests());
        dto.setSizeM2(apartment.getSizeM2());
        dto.setBasePrice(apartment.getBasePrice());
        dto.setStatus(apartment.getStatus());
        dto.setCreatedAt(apartment.getCreatedAt());
        dto.setImages(images.stream().map(this::mapImageToDto).collect(Collectors.toList()));
        dto.setAmenities(apartment.getAmenities().stream().map(this::mapAmenityToDto).collect(Collectors.toList()));

        return dto;
    }

    private ApartmentImageDto mapImageToDto(ApartmentImage image) {
        ApartmentImageDto dto = new ApartmentImageDto();
        dto.setId(image.getId());
        dto.setApartmentId(image.getApartmentId());
        dto.setUrl(image.getUrl());
        dto.setIsFeatured(image.getFeatured());
        return dto;
    }

    private AmenityDto mapAmenityToDto(Amenity amenity) {
        AmenityDto dto = new AmenityDto();
        dto.setId(amenity.getId());
        dto.setName(amenity.getName());
        return dto;
    }
}