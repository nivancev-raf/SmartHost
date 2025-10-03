package smarthost.backend.services;

import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import smarthost.backend.dto.ReservationDto;
import smarthost.backend.enums.ReservationStatus;
import smarthost.backend.mapper.ReservationMapper;
import smarthost.backend.model.Apartment;
import smarthost.backend.model.GuestInformation;
import smarthost.backend.model.Reservation;
import smarthost.backend.model.User;
import smarthost.backend.repository.ReservationRepository;
import smarthost.backend.repository.ApartmentRepository;
import smarthost.backend.repository.UserRepository;
import smarthost.backend.requests.CreateReservationRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Transactional
    public ReservationDto createReservation(CreateReservationRequest request) throws StripeException {
        // Check if apartment is available
        List<ReservationStatus> activeStatuses = List.of(
                ReservationStatus.CONFIRMED,
                ReservationStatus.PENDING
        );

        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                request.getApartmentId(),
                request.getCheckIn(),
                request.getCheckOut(),
                activeStatuses
        );

        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Apartment not available for selected dates");
        }

        // Get current user (if authenticated)
        Long clientId = null;
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Authenticated user: " + email);
            User user = userRepository.findByEmail(email);
            if (user != null) {
                clientId = user.getId();
            }
        } catch (Exception e) {
            // Guest user - not authenticated
        }

        Reservation reservation = reservationMapper.mapToReservation(request);
        reservation.setClientId(clientId); // null for guest reservations
        reservation.setAccessCode(generateAccessCode());
        reservation.setCancellationToken(UUID.randomUUID().toString()); // Unique token for cancellation
        System.out.println("Generated cancellation token: " + reservation.getCancellationToken());
        Reservation savedReservation = reservationRepository.save(reservation);

        GuestInformation guestInfo = reservationMapper.mapToGuestInformation(
                request.getGuestInformation(), 
                savedReservation.getId()
        );

        savedReservation.setGuestInformation(guestInfo);
        reservationRepository.save(savedReservation);

        // Create Stripe checkout session
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Apartment not found"));

        String checkoutUrl = stripeService.createCheckoutSession(savedReservation, apartment.getName());

        ReservationDto dto = reservationMapper.mapToDto(savedReservation);
        dto.setCheckoutUrl(checkoutUrl);

        return dto;
    }

    private String generateAccessCode() {
        // Generate random 6-digit code
        return String.format("%06d", (int)(Math.random() * 1000000));
    }

    /**
     * Get all reservations
     */
    public List<ReservationDto> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();
        return reservations.stream()
                .map(reservationMapper::mapToDto)
                .toList();
    }

    /**
     * Get reservation by ID
     */
    public ReservationDto getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
        return reservationMapper.mapToDto(reservation);
    }

    /**
     * Get reservations by client ID
     */
    public List<ReservationDto> getReservationsByClient(Long clientId) {
        List<Reservation> reservations = reservationRepository.findByClientId(clientId);
        return reservations.stream()
                .map(reservationMapper::mapToDto)
                .toList();
    }

    /**
     * Get reservations by apartment ID
     */
    public List<ReservationDto> getReservationsByApartment(Long apartmentId) {
        List<Reservation> reservations = reservationRepository.findByApartmentId(apartmentId);
        return reservations.stream()
                .map(reservationMapper::mapToDto)
                .toList();
    }

    @Transactional
    public void deleteReservationWithToken(Long reservationId, String token) {
        System.out.println("Attempting to delete reservation ID: " + reservationId + " with token: " + token);
        Optional<Reservation> optionalReservation = reservationRepository.findById(reservationId);

        if (optionalReservation.isEmpty()) {
            System.out.println("Reservation not found - may have already been deleted");
            return; // Silently succeed if already deleted
        }
        Reservation reservation = optionalReservation.get();

        // Validate token
        if (!token.equals(reservation.getCancellationToken())) {
            throw new RuntimeException("Invalid cancellation token");
        }

        // Only delete PENDING reservations
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new RuntimeException("Cannot delete confirmed reservation");
        }

        reservationRepository.delete(reservation);
    }

}