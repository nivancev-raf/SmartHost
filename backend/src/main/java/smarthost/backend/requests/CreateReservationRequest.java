package smarthost.backend.requests;

import lombok.Data;
import smarthost.backend.dto.GuestInformationDto;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateReservationRequest {
    private Long apartmentId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private BigDecimal totalPrice;
    private String specialRequest;
    private GuestInformationDto guestInformation;


    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }

    public Integer getGuests() {
        return guests;
    }

    public void setGuests(Integer guests) {
        this.guests = guests;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getSpecialRequest() {
        return specialRequest;
    }

    public void setSpecialRequest(String specialRequest) {
        this.specialRequest = specialRequest;
    }

    public GuestInformationDto getGuestInformation() {
        return guestInformation;
    }

    public void setGuestInformation(GuestInformationDto guestInformation) {
        this.guestInformation = guestInformation;
    }
}