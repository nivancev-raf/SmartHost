package smarthost.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import smarthost.backend.model.Apartment;

import java.util.List;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    List<Apartment> findByOwnerId(Long ownerId);
    
    /**
     * Find apartments by IDs that can accommodate the specified number of guests
     */
    @Query("SELECT a FROM Apartment a WHERE a.id IN :apartmentIds AND a.maxGuests >= :guests")
    List<Apartment> findByIdInAndMaxGuestsGreaterThanEqual(
            @Param("apartmentIds") List<Long> apartmentIds, 
            @Param("guests") Integer guests);
}
