package com.example.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class NotificationEvent {
    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("email")
    private String email;

    @JsonProperty("subject")
    private String subject;

    @JsonProperty("message")
    private String message;

    public NotificationEvent(Long userId, String email, String subject, String message) {
        this.userId = userId;
        this.email = email;
        this.subject = subject;
        this.message = message;
    }
}
