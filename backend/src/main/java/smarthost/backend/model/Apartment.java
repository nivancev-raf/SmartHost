package smarthost.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import smarthost.backend.enums.ApartmentStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "apartments")
@Data
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column
    private Integer floor;

    @Column
    private Integer bedrooms;

    @Column
    private Integer bathrooms;

    @Column(name = "max_guests")
    private Integer maxGuests;

    @Column(name = "size_m2", precision = 10, scale = 2)
    private BigDecimal sizeM2;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Enumerated(EnumType.STRING)
    @Column
    private ApartmentStatus status = ApartmentStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    private User owner;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ApartmentImage> images;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reservation> reservations;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PriceRule> priceRules;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FinanceReport> financeReports;
}