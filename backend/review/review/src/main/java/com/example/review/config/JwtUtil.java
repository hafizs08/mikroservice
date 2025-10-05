package com.example.review.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        System.out.println("ReviewService: Initialized secret key with length: " 
                + secret.getBytes(StandardCharsets.UTF_8).length + " bytes");
    }

    public Long getUserIdFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid or missing Authorization token");
        }
        token = token.substring(7);
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            String subject = claims.getSubject();
            if (subject == null || !subject.matches("\\d+")) {
                throw new RuntimeException("Subject is not a valid userId: " + subject);
            }
            return Long.parseLong(subject);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT signature or subject: " + e.getMessage());
        }
    }

    public String getEmailFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid or missing Authorization token");
        }
        token = token.substring(7);
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("email", String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract email from token: " + e.getMessage());
        }
    }
}
