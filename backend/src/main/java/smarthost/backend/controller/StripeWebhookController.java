package smarthost.backend.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smarthost.backend.services.PaymentService;

@RestController
@RequestMapping("/webhooks")
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        System.out.println("========================================");
        System.out.println("WEBHOOK RECEIVED!");
        System.out.println("========================================");

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            System.out.println("Event Type: " + event.getType());

            if ("checkout.session.completed".equals(event.getType())) {
                com.google.gson.JsonParser parser = new com.google.gson.JsonParser();
                com.google.gson.JsonObject eventJson = parser.parse(payload).getAsJsonObject();
                com.google.gson.JsonObject data = eventJson.getAsJsonObject("data");
                com.google.gson.JsonObject object = data.getAsJsonObject("object");
                String sessionId = object.get("id").getAsString();

                // Retrieve the full session from Stripe API
                Session session = Session.retrieve(sessionId);
                String reservationId = session.getMetadata().get("reservationId");

                if (reservationId == null || reservationId.isEmpty()) {
                    System.err.println("ERROR: reservationId not found in metadata!");
                    System.err.println("Available metadata keys: " + session.getMetadata().keySet());
                    return ResponseEntity.status(400).body("Missing reservationId in metadata");
                }

                switch (event.getType()) {
                    case "checkout.session.completed":
                        System.out.println("Payment successful for reservation: " + reservationId);
                        paymentService.handleSuccessfulPayment(
                                Long.parseLong(reservationId),
                                session.getId(),
                                session.getPaymentIntent()
                        );
                        break;

                    case "checkout.session.expired":
                        System.out.println("Session expired, deleting reservation: " + reservationId);
                        paymentService.deleteReservation(Long.parseLong(reservationId));
                        break;

                    default:
                        System.out.println("Unhandled event type: " + event.getType());
                }

            }

            return ResponseEntity.ok("Webhook received");

        } catch (SignatureVerificationException e) {
            System.err.println("WEBHOOK SIGNATURE VERIFICATION FAILED!");
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            System.err.println("WEBHOOK ERROR!");
            e.printStackTrace();
            return ResponseEntity.status(500).body("Webhook error: " + e.getMessage());
        }
    }
}