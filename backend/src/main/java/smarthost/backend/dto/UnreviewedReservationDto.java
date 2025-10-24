package smarthost.backend.dto;

import lombok.Data;

@Data
public class UnreviewedReservationDto {
    private Long reservationId;
    private Long apartmentId;
    private String checkIn;
    private String checkOut;
    private GuestSummary guestInformation;

    @Data
    public static class GuestSummary {
        private String firstName;
        private String lastName;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }


    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(String checkIn) {
        this.checkIn = checkIn;
    }

    public String getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(String checkOut) {
        this.checkOut = checkOut;
    }

    public GuestSummary getGuestInformation() {
        return guestInformation;
    }

    public void setGuestInformation(GuestSummary guestInformation) {
        this.guestInformation = guestInformation;
    }
}
