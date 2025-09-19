package smarthost.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "price_rules")
@Data
public class PriceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apartment_id", nullable = false)
    private Long apartmentId;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "day_of_week", length = 20)
    private String dayOfWeek; // e.g., "FRI,SAT,SUN"

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage; // +20.00 = +20%

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", insertable = false, updatable = false)
    private Apartment apartment;
}