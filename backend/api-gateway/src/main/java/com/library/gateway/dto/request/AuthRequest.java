package com.library.gateway.dto.request;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
