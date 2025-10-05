package smarthost.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import smarthost.backend.model.Reservation;
import smarthost.backend.enums.ReservationStatus;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    List<Reservation> findByApartmentId(Long apartmentId);
    
    List<Reservation> findByClientId(Long clientId);
    
    /**
     * Check if apartment is available for the given date range.
     * Returns any existing reservations that overlap with the requested dates.
     */
    @Query("SELECT r FROM Reservation r WHERE r.apartmentId = :apartmentId " +
           "AND r.status IN :statuses " +
           "AND NOT (r.checkOut <= :checkIn OR r.checkIn >= :checkOut)")
    List<Reservation> findOverlappingReservations(
            @Param("apartmentId") Long apartmentId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<ReservationStatus> statuses);
    
    /**
     * Find all apartments that are available for the given date range.
     * Returns apartment IDs that have no conflicting reservations.
     */
    @Query("SELECT DISTINCT a.id FROM Apartment a WHERE a.id NOT IN " +
           "(SELECT r.apartmentId FROM Reservation r WHERE " +
           "r.status IN :statuses AND " +
           "NOT (r.checkOut <= :checkIn OR r.checkIn >= :checkOut))")
    List<Long> findAvailableApartmentIds(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<ReservationStatus> statuses);

    // findByApartmentOwnerId
    @Query("SELECT r FROM Reservation r JOIN Apartment a ON r.apartmentId = a.id WHERE a.ownerId = :ownerId")
    List<Reservation> findByApartmentOwnerId(@Param("ownerId") Long ownerId);
}
