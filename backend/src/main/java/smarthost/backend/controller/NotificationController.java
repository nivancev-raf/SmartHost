package smarthost.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smarthost.backend.dto.EmailMessageDto;
import smarthost.backend.services.EmailService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
public class NotificationController {
    private EmailService emailService;


    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    // post endpoint for sending email
    @PostMapping("/sendEmail")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestBody EmailMessageDto emailMessageDto) {
        // send email
        emailService.sendEmail(emailMessageDto);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email sent");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sendBookingEmail")
    public ResponseEntity<Map<String, String>> sendBookingEmail(@RequestParam Integer reservationId) {
        // send email
        emailService.sendBookingEmail(reservationId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email sent");
        return ResponseEntity.ok(response);
    }
}
