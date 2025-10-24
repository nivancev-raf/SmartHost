package smarthost.backend.mapper;

import org.springframework.stereotype.Component;
import smarthost.backend.dto.ReviewDto;
import smarthost.backend.model.Review;
import smarthost.backend.model.Reservation;

@Component
public class ReviewMapper {

    public ReviewDto toDto(Review review) {
        if (review == null) return null;

        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setReservationId(review.getReservationId());
        dto.setApartmentId(review.getApartmentId());
        dto.setClientId(review.getClientId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());

        // reservation summary
        Reservation reservation = review.getReservation();
        if (reservation != null) {
            ReviewDto.ReservationSummary rs = new ReviewDto.ReservationSummary();
            rs.setId(reservation.getId());
            rs.setCheckIn(reservation.getCheckIn().toString());
            rs.setCheckOut(reservation.getCheckOut().toString());
            if (reservation.getGuestInformation() != null) {
                ReviewDto.GuestSummary gs = new ReviewDto.GuestSummary();
                gs.setFirstName(reservation.getGuestInformation().getFirstName());
                gs.setLastName(reservation.getGuestInformation().getLastName());
                rs.setGuestInformation(gs);
            }
            dto.setReservation(rs);
        }

        // apartment summary
        if (review.getApartment() != null) {
            ReviewDto.ApartmentSummary as = new ReviewDto.ApartmentSummary();
            as.setId(review.getApartment().getId());
            as.setName(review.getApartment().getName());
            dto.setApartment(as);
        }

        // client summary
        if (review.getClient() != null) {
            ReviewDto.ClientSummary cs = new ReviewDto.ClientSummary();
            cs.setId(review.getClient().getId());
            cs.setFirstName(review.getClient().getFirstName());
            cs.setLastName(review.getClient().getLastName());
            dto.setClient(cs);
        }

        return dto;
    }
}
