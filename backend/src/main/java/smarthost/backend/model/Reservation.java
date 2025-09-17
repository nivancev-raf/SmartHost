package smarthost.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import smarthost.backend.enums.ReservationStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reservations")
@Data
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "apartment_id", nullable = false)
    private Long apartmentId;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false)
    private Integer guests;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "access_code", length = 20)
    private String accessCode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", insertable = false, updatable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", insertable = false, updatable = false)
    private Apartment apartment;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Review review;
}