package smarthost.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private Long reservationId;
    private Long apartmentId;
    private Long clientId;
    private Integer rating; // 1-5
    private String comment;
    private LocalDateTime createdAt;

    // Related data
    private ReservationSummary reservation;
    private ApartmentSummary apartment;
    private ClientSummary client;

    @Data
    public static class ReservationSummary {
        private Long id;
        private String checkIn;
        private String checkOut;
        private GuestSummary guestInformation;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

    @Data
    public static class ApartmentSummary {
        private Long id;
        private String name;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    @Data
    public static class ClientSummary {
        private Long id;
        private String firstName;
        private String lastName;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

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


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ReservationSummary getReservation() {
        return reservation;
    }

    public void setReservation(ReservationSummary reservation) {
        this.reservation = reservation;
    }

    public ApartmentSummary getApartment() {
        return apartment;
    }

    public void setApartment(ApartmentSummary apartment) {
        this.apartment = apartment;
    }

    public ClientSummary getClient() {
        return client;
    }

    public void setClient(ClientSummary client) {
        this.client = client;
    }
}
