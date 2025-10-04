package smarthost.backend.services;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import smarthost.backend.dto.EmailMessageDto;
import smarthost.backend.model.Reservation;
import smarthost.backend.repository.ReservationRepository;

import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;


@Service
public class EmailService {

    private final JavaMailSender emailSender;

    private final ReservationRepository reservationRepository;

    public EmailService(JavaMailSender emailSender, ReservationRepository reservationRepository) {
        this.emailSender = emailSender;
        this.reservationRepository = reservationRepository;
    }

    public void sendBookingEmail(Integer reservationId) {
        // fetch reservation details from database using reservationId
        Reservation res = reservationRepository.findById(reservationId.longValue()).orElse(null);
        if (res == null) {
            System.out.println("Reservation not found for ID: " + reservationId);
            return;
        }

        // Send confirmation email to user
        sendUserBookingConfirmation(res);
        // Send notification to owner
        sendOwnerBookingNotification(res);
    }

    private void sendUserBookingConfirmation(Reservation res) {
        MimeMessage message = emailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nivancev02@gmail.com");
            helper.setTo(res.getGuestInformation().getEmail());
            helper.setSubject("Booking Confirmation - Reservation #" + res.getId());

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
            String checkIn = res.getCheckIn().format(dateFormatter);
            String checkOut = res.getCheckOut().format(dateFormatter);
            long nights = ChronoUnit.DAYS.between(res.getCheckIn(), res.getCheckOut());

            String htmlContent = "<html><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: #2c3e50; color: white; padding: 20px; text-align: center;'>"
                    + "<h1>SmartHost</h1>"
                    + "<p>Booking Confirmation</p>"
                    + "</div>"

                    + "<div style='padding: 30px; background: #f9f9f9;'>"
                    + "<h2>Thank You, " + res.getGuestInformation().getFirstName() + "!</h2>"
                    + "<p>Your reservation has been confirmed.</p>"

                    + "<div style='background: white; padding: 20px; margin: 20px 0;'>"
                    + "<h3>Reservation Details</h3>"
                    + "<p><strong>Reservation ID:</strong> #" + res.getId() + "</p>"
                    + "<p><strong>Apartment:</strong> " + res.getApartment().getName() + "</p>"
                    + "<p><strong>Check-in:</strong> " + checkIn + " (after 3:00 PM)</p>"
                    + "<p><strong>Check-out:</strong> " + checkOut + " (before 11:00 AM)</p>"
                    + "<p><strong>Nights:</strong> " + nights + " | <strong>Guests:</strong> " + res.getGuests() + "</p>"
                    + "<p><strong>Total:</strong> €" + res.getTotalPrice() + "</p>"
                    + "</div>"

                    + "<div style='background: #fff3cd; padding: 20px; margin: 20px 0;'>"
                    + "<h3>Access Code</h3>"
                    + "<p style='font-size: 24px; font-family: monospace;'><strong>" + res.getAccessCode() + "</strong></p>"
                    + "<p style='font-size: 14px;'>Save this code - you'll need it to access the apartment.</p>"
                    + "</div>"

                    + "<div style='background: white; padding: 20px; margin: 20px 0;'>"
                    + "<h3>Important</h3>"
                    + "<ul>"
                    + "<li>Bring a valid ID for check-in</li>"
                    + "<li>No smoking inside the apartment</li>"
                    + "<li>Quiet hours: 10:00 PM - 8:00 AM</li>"
                    + "</ul>"
                    + "</div>"

                    + "<p>Questions? Contact us at support@smarthost.com</p>"
                    + "<p><strong>Best regards,</strong><br>SmartHost Team</p>"
                    + "</div>"

                    + "<div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>"
                    + "<p>© 2025 SmartHost. All rights reserved.</p>"
                    + "</div>"
                    + "</body></html>";

            helper.setText(htmlContent, true);
            emailSender.send(message);

            System.out.println("Confirmation email sent to: " + res.getGuestInformation().getEmail());

        } catch (MessagingException e) {
            System.err.println("Failed to send confirmation email");
            e.printStackTrace();
        }
    }

    private void sendOwnerBookingNotification(Reservation res) {
        MimeMessage message = emailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nivancev02@gmail.com");
//            helper.setTo(res.getApartment().getOwner().getEmail()); // Owner's email
            helper.setTo("nivancev02@gmail.com"); // this is for test purposes
            helper.setSubject("New Booking - Reservation #" + res.getId());

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
            String checkIn = res.getCheckIn().format(dateFormatter);
            String checkOut = res.getCheckOut().format(dateFormatter);
            long nights = ChronoUnit.DAYS.between(res.getCheckIn(), res.getCheckOut());

            String htmlContent = "<html><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: #27ae60; color: white; padding: 20px; text-align: center;'>"
                    + "<h1>SmartHost</h1>"
                    + "<p>New Booking Notification</p>"
                    + "</div>"

                    + "<div style='padding: 30px; background: #f9f9f9;'>"
                    + "<h2>New Reservation Confirmed</h2>"
                    + "<p>You have received a new booking for your apartment.</p>"

                    + "<div style='background: white; padding: 20px; margin: 20px 0;'>"
                    + "<h3>Booking Details</h3>"
                    + "<p><strong>Reservation ID:</strong> #" + res.getId() + "</p>"
                    + "<p><strong>Apartment:</strong> " + res.getApartment().getName() + "</p>"
                    + "<p><strong>Check-in:</strong> " + checkIn + "</p>"
                    + "<p><strong>Check-out:</strong> " + checkOut + "</p>"
                    + "<p><strong>Nights:</strong> " + nights + " | <strong>Guests:</strong> " + res.getGuests() + "</p>"
                    + "<p><strong>Revenue:</strong> €" + res.getTotalPrice() + "</p>"
                    + "</div>"

                    + "<div style='background: white; padding: 20px; margin: 20px 0;'>"
                    + "<h3>Guest Information</h3>"
                    + "<p><strong>Name:</strong> " + res.getGuestInformation().getFirstName() + " " + res.getGuestInformation().getLastName() + "</p>"
                    + "<p><strong>Email:</strong> " + res.getGuestInformation().getEmail() + "</p>"
                    + "<p><strong>Phone:</strong> " + res.getGuestInformation().getPhone() + "</p>"
                    + (res.getGuestInformation().getAddress() != null
                    ? "<p><strong>Address:</strong> " + res.getGuestInformation().getAddress() + "</p>"
                    : "")
                    + (res.getSpecialRequest() != null && !res.getSpecialRequest().isEmpty()
                    ? "<p><strong>Special Requests:</strong> " + res.getSpecialRequest() + "</p>"
                    : "")
                    + "</div>"

                    + "<div style='background: #e8f4f8; padding: 20px; margin: 20px 0;'>"
                    + "<p><strong>Access Code:</strong> <span style='font-size: 20px; font-family: monospace;'>" + res.getAccessCode() + "</span></p>"
                    + "</div>"

                    + "<p>Please ensure the apartment is ready for guest arrival.</p>"
                    + "<p><strong>SmartHost Team</strong></p>"
                    + "</div>"

                    + "<div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>"
                    + "<p>© 2025 SmartHost. All rights reserved.</p>"
                    + "</div>"
                    + "</body></html>";

            helper.setText(htmlContent, true);
            emailSender.send(message);

            System.out.println("Owner notification sent to: " + res.getApartment().getOwner().getEmail());

        } catch (MessagingException e) {
            System.err.println("Failed to send owner notification");
            e.printStackTrace();
        }
    }

    public void sendEmail(EmailMessageDto emailMessage) {
        // Send confirmation email to user
        sendUserConfirmation(emailMessage);

        // Send notification to owner
        sendOwnerNotification(emailMessage);
    }

    private void sendUserConfirmation(EmailMessageDto emailMessage) {
        MimeMessage message = emailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nivancev02@gmail.com");
            helper.setTo(emailMessage.getEmail());
            helper.setSubject(emailMessage.getSubject());

            String htmlContent = "<html><body>"
                    + "<h1 style='color: navy;'>SmartHost</h1>"
                    + "<p>Poštovani " + emailMessage.getName() + ",</p>"
                    + "<p>Hvala Vam što ste nas kontaktirali. Vaša poruka je uspešno poslata sa sledećim sadržajem: </p>"
                    + "<br>"
                    + "<h3 style='color: navy;'>" + emailMessage.getSubject() + "</h3>"
                    + "<p><b>Name:</b> " + emailMessage.getName() + "</p>"
                    + "<p><b>Email:</b> " + emailMessage.getEmail() + "</p>"
                    + "<p><b>Message:</b></p><p>" + emailMessage.getMessage() + "</p>"
                    + "<p style='color: grey;'>Očekujte odgovor u najkraćem mogućem roku. Hvala!</p>"
                    + "<br>"
                    + "<p>Srdačan pozdrav,</p>"
                    + "<p>SmartHost</p>"
                    + "</body></html>";

            helper.setText(htmlContent, true);
            emailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private void sendOwnerNotification(EmailMessageDto emailMessage) {
        MimeMessage message = emailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nivancev02@gmail.com");
            helper.setTo("nivancev02@gmail.com");
            helper.setSubject("Nova poruka od: " + emailMessage.getName());

            String htmlContent = "<html><body>"
                    + "<h2>Nova poruka sa sajta</h2>"
                    + "<p><b>Od:</b> " + emailMessage.getName() + "</p>"
                    + "<p><b>Email:</b> " + emailMessage.getEmail() + "</p>"
                    + "<p><b>Naslov:</b> " + emailMessage.getSubject() + "</p>"
                    + "<p><b>Poruka:</b></p>"
                    + "<p>" + emailMessage.getMessage() + "</p>"
                    + "</body></html>";

            helper.setText(htmlContent, true);
            emailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}

