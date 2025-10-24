package smarthost.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smarthost.backend.dto.ReviewDto;
import smarthost.backend.requests.CreateReviewRequest;
import smarthost.backend.services.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private smarthost.backend.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(@RequestBody CreateReviewRequest request) {
        try {
            ReviewDto dto = reviewService.createReview(request);
            return ResponseEntity.status(201).body(dto);
        } catch (Exception e) {
            logger.error("Error creating review", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ReviewDto>> getAll() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDto> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reviewService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<ReviewDto>> getByApartment(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(reviewService.getByApartment(apartmentId));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ReviewDto>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(reviewService.getByClient(clientId));
    }

    @GetMapping("/unreviewed")
    public ResponseEntity<List<smarthost.backend.dto.UnreviewedReservationDto>> getUnreviewedForCurrentUser() {
        try {
            String principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null || principal.equals("anonymousUser")) {
                return ResponseEntity.status(401).build();
            }
            // find user id by email
            smarthost.backend.model.User user = userRepository.findByEmail(principal);
            if (user == null) {
                return ResponseEntity.status(401).build();
            }
            List<smarthost.backend.dto.UnreviewedReservationDto> list = reviewService.getUnreviewedReservationsForClient(user.getId());
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            logger.error("Error getting unreviewed reservations", e);
            return ResponseEntity.status(500).build();
        }
    }
}
