package smarthost.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smarthost.backend.model.ApartmentImage;

import java.util.List;

public interface ApartmentImageRepository extends JpaRepository<ApartmentImage, Long> {
    List<ApartmentImage> findByApartmentId(Long apartmentId);
}
