package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import smarthost.backend.dto.AmenityDto;
import smarthost.backend.dto.ApartmentDto;
import smarthost.backend.dto.ApartmentImageDto;
import smarthost.backend.enums.ReservationStatus;
import smarthost.backend.mapper.ApartmentMapper;
import smarthost.backend.model.Amenity;
import smarthost.backend.model.ApartmentImage;
import smarthost.backend.model.Reservation;
import smarthost.backend.repository.AmenityRepository;
import smarthost.backend.repository.ApartmentImageRepository;
import smarthost.backend.repository.ReservationRepository;
import smarthost.backend.requests.CreateApartmentRequest;
import smarthost.backend.model.Apartment;
import smarthost.backend.repository.ApartmentRepository;
import smarthost.backend.requests.UpdateApartmentRequest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;

@Service
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final ApartmentImageRepository apartmentImageRepository;
    private final AmenityRepository amenityRepository;
    private final ReservationRepository reservationRepository;
    private final ApartmentMapper apartmentMapper;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public ApartmentService(ApartmentRepository apartmentRepository,
                            ApartmentImageRepository apartmentImageRepository,
                            AmenityRepository amenityRepository,
                            ReservationRepository reservationRepository,
                            ApartmentMapper apartmentMapper, 
                            CloudinaryService cloudinaryService) {
        this.apartmentRepository = apartmentRepository;
        this.apartmentImageRepository = apartmentImageRepository;
        this.amenityRepository = amenityRepository;
        this.reservationRepository = reservationRepository;
        this.apartmentMapper = apartmentMapper;
        this.cloudinaryService = cloudinaryService;
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
        apartmentMapper.updateApartmentFromRequest(apartment, request);
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

    public List<ApartmentImageDto> saveApartmentImages(Long apartmentId, MultipartFile[] files, int featuredIndex) {
        if (!apartmentRepository.existsById(apartmentId)) {
            throw new RuntimeException("Apartment not found with id: " + apartmentId);
        }
        List<ApartmentImageDto> savedImages = new ArrayList<>();
        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            if (!isValidImageFile(file)) {
                throw new RuntimeException("Invalid file format: " + file.getOriginalFilename());
            }
            try {
                String imageUrl = cloudinaryService.uploadImage(file, apartmentId, i);
                ApartmentImage apartmentImage = new ApartmentImage();
                apartmentImage.setApartmentId(apartmentId);
                apartmentImage.setUrl(imageUrl); // Store full Cloudinary URL
                apartmentImage.setIsFeatured(i == featuredIndex);
                ApartmentImage saved = apartmentImageRepository.save(apartmentImage);
                savedImages.add(apartmentMapper.mapImageToDto(saved));
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image: " + file.getOriginalFilename(), e);
            }
        }
        return savedImages;
    }
    private boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && 
               (contentType.equals("image/jpeg") || 
                contentType.equals("image/png") || 
                contentType.equals("image/webp"));
    }

    public List<ApartmentImageDto> getApartmentImages(Long apartmentId) {
        List<ApartmentImage> images = apartmentImageRepository.findByApartmentId(apartmentId);
        return images.stream().map(apartmentMapper::mapImageToDto).collect(Collectors.toList());
    }

    private ApartmentDto mapToDto(Apartment apartment) {
        List<ApartmentImage> images = apartmentImageRepository.findByApartmentId(apartment.getId());
        return apartmentMapper.mapToDto(apartment, images);
    }

    public void deleteApartmentImage(Long imageId) {
        ApartmentImage image = apartmentImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Apartment image not found with id: " + imageId));
        // Extract public ID from URL
        String url = image.getUrl();
        String publicId = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
        try {
            cloudinaryService.deleteImage("smarthost/apartments/" + image.getApartmentId() + "/" + publicId);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary: " + publicId, e);
        }
        apartmentImageRepository.deleteById(imageId);
    }

    public void setFeaturedImage(Long apartmentId, Long imageId) {
        List<ApartmentImage> images = apartmentImageRepository.findByApartmentId(apartmentId);
        images.stream()
                .filter(ApartmentImage::getIsFeatured)
                .forEach(image -> {
                    image.setIsFeatured(false);
                    apartmentImageRepository.save(image);
                });
        ApartmentImage newFeaturedImage = images.stream()
                .filter(image -> image.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        newFeaturedImage.setIsFeatured(true);
        apartmentImageRepository.save(newFeaturedImage);
    }

    /**
     * Check if a specific apartment is available for the given date range
     */
    public boolean isApartmentAvailable(Long apartmentId, LocalDate checkIn, LocalDate checkOut) {
        // Validate input dates
        if (checkIn.isAfter(checkOut) || checkIn.isBefore(LocalDate.now())) {
            return false;
        }

        // Check if apartment exists
        if (!apartmentRepository.existsById(apartmentId)) {
            throw new RuntimeException("Apartment not found with id: " + apartmentId);
        }

        // Define statuses that should block availability (confirmed and pending reservations)
        List<ReservationStatus> blockingStatuses = Arrays.asList(
                ReservationStatus.CONFIRMED, 
                ReservationStatus.PENDING
        );

        // Find overlapping reservations
        List<Reservation> overlappingReservations = reservationRepository.findOverlappingReservations(
                apartmentId, checkIn, checkOut, blockingStatuses);

        return overlappingReservations.isEmpty();
    }

    /**
     * Get all apartments that are available for the given date range and can accommodate the number of guests
     */
    public List<ApartmentDto> getAvailableApartments(LocalDate checkIn, LocalDate checkOut, Integer guests) {
        // Validate input dates
        if (checkIn.isAfter(checkOut) || checkIn.isBefore(LocalDate.now())) {
            return new ArrayList<>();
        }

        // Validate guests parameter
        if (guests == null || guests <= 0) {
            return new ArrayList<>();
        }

        // Define statuses that should block availability
        List<ReservationStatus> blockingStatuses = Arrays.asList(
                ReservationStatus.CONFIRMED, 
                ReservationStatus.PENDING
        );

        // Get available apartment IDs
        List<Long> availableApartmentIds = reservationRepository.findAvailableApartmentIds(
                checkIn, checkOut, blockingStatuses);

        // If no apartments are available by date, return empty list
        if (availableApartmentIds.isEmpty()) {
            return new ArrayList<>();
        }

        // Fetch available apartments that can accommodate the guests (database-level filtering)
        List<Apartment> availableApartments = apartmentRepository.findByIdInAndMaxGuestsGreaterThanEqual(
                availableApartmentIds, guests);
        
        return availableApartments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

}