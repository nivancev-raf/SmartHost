package smarthost.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "apartment-images")
@Data
public class ApartmentImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apartment_id", nullable = false)
    private Long apartmentId;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", insertable = false, updatable = false)
    private Apartment apartment;
}