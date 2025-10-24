package smarthost.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smarthost.backend.model.Review;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
	List<Review> findByApartmentId(Long apartmentId);
	List<Review> findByClientId(Long clientId);
	Review findByReservationId(Long reservationId);

}
