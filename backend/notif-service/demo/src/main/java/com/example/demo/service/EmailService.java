package com.example.demo.service;

import com.example.demo.dto.NotificationEvent;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @RabbitListener(queues = "notification.queue")
    public void receiveNotification(String messageJson) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        NotificationEvent event = mapper.readValue(messageJson, NotificationEvent.class);

        System.out.println("📩 Received event: " + event);
        sendEmail(event.getEmail(), event.getSubject(), event.getMessage());
    }

    public   void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}

