package smarthost.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import smarthost.backend.enums.PaymentStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_id", nullable = false)
    private Long reservationId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 50)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column
    private PaymentStatus status = PaymentStatus.PENDING;

    @CreationTimestamp
    @Column(name = "payment_date", nullable = false, updatable = false)
    private LocalDateTime paymentDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", insertable = false, updatable = false)
    private Reservation reservation;
}