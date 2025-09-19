package smarthost.backend.mapper;

import org.springframework.stereotype.Component;
import smarthost.backend.enums.ApartmentStatus;
import smarthost.backend.model.Apartment;
import smarthost.backend.requests.CreateApartmentRequest;


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

}
