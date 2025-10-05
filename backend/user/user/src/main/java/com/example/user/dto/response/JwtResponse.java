package com.example.user.dto.response;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String username;
    private String email;
    private String role;
    private Long userId;
}