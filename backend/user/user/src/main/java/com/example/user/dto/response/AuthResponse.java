package com.example.user.dto.response;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String role;
}
