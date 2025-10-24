package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import smarthost.backend.dto.ReviewDto;
import smarthost.backend.mapper.ReviewMapper;
import smarthost.backend.model.Apartment;
import smarthost.backend.model.Review;
import smarthost.backend.model.Reservation;
import smarthost.backend.model.User;
import smarthost.backend.repository.ReviewRepository;
import smarthost.backend.repository.ReservationRepository;
import smarthost.backend.requests.CreateReviewRequest;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private EntityManager entityManager;

    @Transactional
    public ReviewDto createReview(CreateReviewRequest req) {
        // Ensure reservation exists
        Reservation reservation = reservationRepository.findById(req.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        System.out.println("Creating review for reservation ID: " + req.getReservationId());

        // Ensure one review per reservation
        Review existing = reviewRepository.findByReservationId(req.getReservationId());
        if (existing != null) {
            throw new RuntimeException("A review for this reservation already exists");
        }

        // Get clientId
        Long clientId = req.getClientId();
        if (clientId == null) {
            clientId = reservation.getClientId();
        }

        // Build Review entity
        Review review = new Review();
        review.setReservationId(req.getReservationId());
        review.setApartmentId(req.getApartmentId());
        review.setClientId(clientId);
        review.setRating(req.getRating());
        review.setComment(req.getComment());

        // Manually set the relationship objects using EntityManager references
        review.setReservation(entityManager.getReference(Reservation.class, req.getReservationId()));
        review.setApartment(entityManager.getReference(Apartment.class, req.getApartmentId()));
        review.setClient(entityManager.getReference(User.class, clientId));

        Review saved = reviewRepository.save(review);

        // Reload with relationships
        Review loaded = reviewRepository.findById(saved.getId()).orElseThrow();

        // Initialize lazy fields
        if (loaded.getReservation() != null) {
            loaded.getReservation().getId();
            if (loaded.getReservation().getGuestInformation() != null) {
                loaded.getReservation().getGuestInformation().getFirstName();
            }
        }
        if (loaded.getApartment() != null) {
            loaded.getApartment().getName();
        }
        if (loaded.getClient() != null) {
            loaded.getClient().getFirstName();
        }

        return reviewMapper.toDto(loaded);
    }

    public ReviewDto getById(Long id) {
        Review r = reviewRepository.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
        return reviewMapper.toDto(r);
    }

    public List<ReviewDto> getAll() {
        return reviewRepository.findAll().stream().map(reviewMapper::toDto).collect(Collectors.toList());
    }

    public List<ReviewDto> getByApartment(Long apartmentId) {
        return reviewRepository.findByApartmentId(apartmentId).stream().map(reviewMapper::toDto).collect(Collectors.toList());
    }

    public List<ReviewDto> getByClient(Long clientId) {
        return reviewRepository.findByClientId(clientId).stream().map(reviewMapper::toDto).collect(Collectors.toList());
    }

    public List<smarthost.backend.dto.UnreviewedReservationDto> getUnreviewedReservationsForClient(Long clientId) {
        java.time.LocalDate today = java.time.LocalDate.now();
        List<Reservation> reservations = reservationRepository.findConfirmedPastWithoutReview(clientId, today);
        return reservations.stream().map(r -> {
            smarthost.backend.dto.UnreviewedReservationDto dto = new smarthost.backend.dto.UnreviewedReservationDto();
            dto.setReservationId(r.getId());
            dto.setApartmentId(r.getApartmentId());
            dto.setCheckIn(r.getCheckIn().toString());
            dto.setCheckOut(r.getCheckOut().toString());
            if (r.getGuestInformation() != null) {
                smarthost.backend.dto.UnreviewedReservationDto.GuestSummary gs = new smarthost.backend.dto.UnreviewedReservationDto.GuestSummary();
                gs.setFirstName(r.getGuestInformation().getFirstName());
                gs.setLastName(r.getGuestInformation().getLastName());
                dto.setGuestInformation(gs);
            }
            return dto;
        }).collect(Collectors.toList());
    }
}
