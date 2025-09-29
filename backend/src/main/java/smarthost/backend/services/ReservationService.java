package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import smarthost.backend.dto.ReservationDto;
import smarthost.backend.enums.ReservationStatus;
import smarthost.backend.mapper.ReservationMapper;
import smarthost.backend.model.GuestInformation;
import smarthost.backend.model.Reservation;
import smarthost.backend.model.User;
import smarthost.backend.repository.ReservationRepository;
import smarthost.backend.repository.UserRepository;
import smarthost.backend.requests.CreateReservationRequest;

import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationMapper reservationMapper;

    @Transactional
    public ReservationDto createReservation(CreateReservationRequest request) {
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
        Reservation savedReservation = reservationRepository.save(reservation);

        GuestInformation guestInfo = reservationMapper.mapToGuestInformation(
                request.getGuestInformation(), 
                savedReservation.getId()
        );

        savedReservation.setGuestInformation(guestInfo);
        reservationRepository.save(savedReservation);

        return reservationMapper.mapToDto(savedReservation);
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

}