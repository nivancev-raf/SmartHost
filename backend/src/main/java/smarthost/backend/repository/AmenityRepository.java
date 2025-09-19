package smarthost.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smarthost.backend.model.Amenity;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {
}
