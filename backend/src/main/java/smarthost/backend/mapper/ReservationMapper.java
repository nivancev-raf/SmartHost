package smarthost.backend.mapper;

import org.springframework.stereotype.Component;
import smarthost.backend.dto.GuestInformationDto;
import smarthost.backend.dto.ReservationDto;
import smarthost.backend.enums.ReservationStatus;
import smarthost.backend.model.GuestInformation;
import smarthost.backend.model.Reservation;
import smarthost.backend.requests.CreateReservationRequest;

@Component
public class ReservationMapper {

    /**
     * Map CreateReservationRequest to Reservation entity
     */
    public Reservation mapToReservation(CreateReservationRequest request) {
        Reservation reservation = new Reservation();
        reservation.setApartmentId(request.getApartmentId());
        reservation.setCheckIn(request.getCheckIn());
        reservation.setCheckOut(request.getCheckOut());
        reservation.setGuests(request.getGuests());
        reservation.setTotalPrice(request.getTotalPrice());
        reservation.setSpecialRequest(request.getSpecialRequest());
        reservation.setStatus(ReservationStatus.PENDING);
        return reservation;
    }

    /**
     * Map Reservation entity to ReservationDto
     */
    public ReservationDto mapToDto(Reservation reservation) {
        ReservationDto dto = new ReservationDto();
        dto.setId(reservation.getId());
        dto.setClientId(reservation.getClientId());
        dto.setApartmentId(reservation.getApartmentId());
        dto.setCheckIn(reservation.getCheckIn());
        dto.setCheckOut(reservation.getCheckOut());
        dto.setGuests(reservation.getGuests());
        dto.setTotalPrice(reservation.getTotalPrice());
        dto.setStatus(reservation.getStatus());
        dto.setAccessCode(reservation.getAccessCode());
        dto.setSpecialRequest(reservation.getSpecialRequest());
        dto.setCreatedAt(reservation.getCreatedAt());

        // Map guest information if present
        if (reservation.getGuestInformation() != null) {
            dto.setGuestInformation(mapGuestInformationToDto(reservation.getGuestInformation()));
        }

        return dto;
    }

    /**
     * Map GuestInformation entity to GuestInformationDto
     */
    public GuestInformationDto mapGuestInformationToDto(GuestInformation guestInfo) {
        GuestInformationDto dto = new GuestInformationDto();
        dto.setFirstName(guestInfo.getFirstName());
        dto.setLastName(guestInfo.getLastName());
        dto.setEmail(guestInfo.getEmail());
        dto.setPhone(guestInfo.getPhone());
        dto.setAddress(guestInfo.getAddress());
        dto.setCity(guestInfo.getCity());
        dto.setCountry(guestInfo.getCountry());
        return dto;
    }

    /**
     * Map GuestInformationDto to GuestInformation entity
     */
    public GuestInformation mapToGuestInformation(GuestInformationDto dto, Long reservationId) {
        GuestInformation guestInfo = new GuestInformation();
        guestInfo.setReservationId(reservationId);
        guestInfo.setFirstName(dto.getFirstName());
        guestInfo.setLastName(dto.getLastName());
        guestInfo.setEmail(dto.getEmail());
        guestInfo.setPhone(dto.getPhone());
        guestInfo.setAddress(dto.getAddress());
        guestInfo.setCity(dto.getCity());
        guestInfo.setCountry(dto.getCountry());
        return guestInfo;
    }
}
