package smarthost.backend.mapper;

import org.springframework.stereotype.Component;
import smarthost.backend.dto.AmenityDto;
import smarthost.backend.dto.ApartmentDto;
import smarthost.backend.dto.ApartmentImageDto;
import smarthost.backend.enums.ApartmentStatus;
import smarthost.backend.model.Amenity;
import smarthost.backend.model.Apartment;
import smarthost.backend.model.ApartmentImage;
import smarthost.backend.requests.CreateApartmentRequest;
import smarthost.backend.requests.UpdateApartmentRequest;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class ApartmentMapper {

    public Apartment mapToApartment(CreateApartmentRequest request) {
        Apartment apartment = new Apartment();
        apartment.setOwnerId(request.getOwnerId());
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
        apartment.setStatus(ApartmentStatus.AVAILABLE);
        return apartment;
    }

    public ApartmentDto mapToDto(Apartment apartment, List<ApartmentImage> images) {
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

    public ApartmentImageDto mapImageToDto(ApartmentImage image) {
        ApartmentImageDto dto = new ApartmentImageDto();
        dto.setId(image.getId());
        dto.setApartmentId(image.getApartmentId());
        dto.setUrl(image.getUrl());
        dto.setIsFeatured(image.getIsFeatured());
        return dto;
    }

    public AmenityDto mapAmenityToDto(Amenity amenity) {
        AmenityDto dto = new AmenityDto();
        dto.setId(amenity.getId());
        dto.setName(amenity.getName());
        return dto;
    }

    public void updateApartmentFromRequest(Apartment apartment, UpdateApartmentRequest request) {
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
    }

}
