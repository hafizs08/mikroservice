package com.example.demo.controller;

import javax.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.NotificationEvent;
import com.example.demo.service.EmailService;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    // @GetMapping("/send2") // atau @PostMapping tergantung request
    // public String sendEmail(@RequestParam String to) {
    //     emailService.sendEmail(to, "Test Email", "Hello, this is a test email!");
    //     return "Email sent to " + to;
    // }
    // @GetMapping("/send")
    // public String sendEmail(
    //         @RequestParam String to,
    //         @RequestParam String subject,
    //         @RequestParam String text) {
    //     emailService.sendEmail(to, subject, text);
    //     return "Email sent to " + to;
    // }

    @PostMapping("/test-email")
    public String testEmail(@RequestBody NotificationEvent event) throws MessagingException {
        emailService.sendEmail(event.getEmail(), event.getSubject(), event.getMessage());
        return "Test email sent to " + event.getEmail();
    }
}