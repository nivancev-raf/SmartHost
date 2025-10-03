package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import smarthost.backend.enums.PaymentStatus;
import smarthost.backend.enums.ReservationStatus;
import smarthost.backend.model.Payment;
import smarthost.backend.model.Reservation;
import smarthost.backend.repository.PaymentRepository;
import smarthost.backend.repository.ReservationRepository;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Transactional
    public void handleSuccessfulPayment(Long reservationId, String sessionId, String paymentIntentId) {
        // Update reservation status
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        // Create payment record
        Payment payment = new Payment();
        payment.setReservationId(reservationId);
        payment.setAmount(reservation.getTotalPrice());
        payment.setProvider("STRIPE");
        payment.setStripeSessionId(sessionId);
        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setStatus(PaymentStatus.PAID);

        paymentRepository.save(payment);
    }

    @Transactional
    public void deleteReservation(Long reservationId) {
        System.out.println("=== DELETING RESERVATION ===");
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElse(null);

        if (reservation != null) {
            // Delete will cascade to GuestInformation and Payments due to ON DELETE CASCADE
            reservationRepository.delete(reservation);
            System.out.println("Reservation deleted successfully");
        } else {
            System.out.println("Reservation not found, may have been already deleted");
        }

        System.out.println("=== DELETION COMPLETE ===");
    }
}