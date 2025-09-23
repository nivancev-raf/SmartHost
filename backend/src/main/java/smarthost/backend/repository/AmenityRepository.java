package smarthost.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smarthost.backend.model.Amenity;

import java.util.List;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
}
