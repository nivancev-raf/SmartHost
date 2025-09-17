package smarthost.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_id", nullable = false)
    private Long reservationId;

    @Column(name = "apartment_id", nullable = false)
    private Long apartmentId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column
    @Check(constraints = "rating >= 1 AND rating <= 5")
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", insertable = false, updatable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", insertable = false, updatable = false)
    private Apartment apartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", insertable = false, updatable = false)
    private User client;
}