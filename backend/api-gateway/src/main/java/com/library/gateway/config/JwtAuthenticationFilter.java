package com.library.gateway.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import com.library.gateway.lib.utility.JwtUtil;
import reactor.core.publisher.Mono;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtUtil jwtUtil;
    private static final Map<String, Boolean> tokenBlacklist = new ConcurrentHashMap<>();

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public static void blacklistToken(String token) {
        tokenBlacklist.put(token, true);
    }

    private boolean isTokenBlacklisted(String token) {
        return tokenBlacklist.containsKey(token);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return chain.filter(exchange); // Lanjutkan jika tidak ada token
        }

        String token = authHeader.substring(7);

        // Cek token di blacklist
        if (isTokenBlacklisted(token)) {
            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
                    .bufferFactory().wrap("Token has been revoked".getBytes())));
        }

        try {
            String username = jwtUtil.extractUsername(token);

            if (username != null) {
                UserDetails userDetails = User.builder()
                        .username(username)
                        .password("")
                        .authorities("USER")
                        .build();

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                // Cek apakah konteks autentikasi sudah ada
                return ReactiveSecurityContextHolder.getContext()
                        .hasElement() // Mengembalikan Mono<Boolean>
                        .flatMap(hasContext -> {
                            if (!hasContext) {
                                // Jika tidak ada autentikasi, set secara reaktif
                                return chain.filter(exchange)
                                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authToken));
                            }
                            // Jika sudah ada autentikasi, lanjutkan saja
                            return chain.filter(exchange);
                        });
            }
        } catch (ExpiredJwtException e) {
            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
                    .bufferFactory().wrap("Token expired".getBytes())));
        } catch (JwtException e) {
            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
                    .bufferFactory().wrap("Invalid token".getBytes())));
        }

        return chain.filter(exchange); // Lanjutkan jika tidak ada username
    }
}