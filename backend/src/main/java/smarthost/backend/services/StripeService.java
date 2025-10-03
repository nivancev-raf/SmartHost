package smarthost.backend.services;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import smarthost.backend.model.Reservation;

import java.math.BigDecimal;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.success.url}")
    private String successUrl;

    @Value("${stripe.cancel.url}")
    private String cancelUrl;

    public String createCheckoutSession(Reservation reservation, String apartmentName) throws StripeException {
        Stripe.apiKey = stripeApiKey;

        // Convert price to cents (Stripe uses smallest currency unit)
        long amountInCents = reservation.getTotalPrice().multiply(new BigDecimal(100)).longValue();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}&reservation_id=" + reservation.getId())
                .setCancelUrl(cancelUrl+ "?reservation_id=" + reservation.getId() + "&token=" + reservation.getCancellationToken())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Reservation: " + apartmentName)
                                                                .setDescription(
                                                                        String.format("Check-in: %s, Check-out: %s, Guests: %d",
                                                                                reservation.getCheckIn(),
                                                                                reservation.getCheckOut(),
                                                                                reservation.getGuests())
                                                                )
                                                                .build()
                                                )
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                )
                .putMetadata("reservationId", reservation.getId().toString())
                .setCustomerEmail(reservation.getGuestInformation().getEmail())
                .build();

        Session session = Session.create(params);
        return session.getUrl(); // Stripe hosted checkout page URL
    }
}