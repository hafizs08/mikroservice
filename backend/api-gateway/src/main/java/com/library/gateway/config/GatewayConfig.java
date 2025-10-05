package com.library.gateway.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.library.gateway.config.filter.JwtGatewayFilterFactory;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtGatewayFilterFactory jwtFilter;

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Public: GET buku
                .route("catalog-public", r -> r
                        .path("/api/catalog/books")
                        .and()
                        .method("GET")
                        .uri("lb://CATALOG-SERVICE"))

                // Auth (user-service)
                .route("user-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://USER-SERVICE"))

                // Catalog protected (pakai JWT filter)
                .route("catalog-protected", r -> r
                        .path("/api/catalog/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtGatewayFilterFactory.Config())))
                        .uri("lb://CATALOG-SERVICE"))

                // Loan service (pakai JWT filter)
                .route("loan-service", r -> r
                        .path("/api/loan/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtGatewayFilterFactory.Config())))
                        .uri("lb://LOAN-SERVICE"))

                // Peminjaman service (pakai JWT filter)
                .route("peminjaman", r -> r
                        .path("/peminjaman/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtGatewayFilterFactory.Config())))
                        .uri("lb://PEMINJAMAN-SERVICE"))

                // Payment service
                .route("payment", r -> r
                        .path("/payment/**")
                        .uri("lb://PAYMENT-SERVICE"))

                // Notification service
                .route("notif", r -> r
                        .path("/api/email/**")
                        .uri("lb://NOTIF-SERVICE"))

                // Rating service
                .route("rating", r -> r
                        .path("/rating/**")
                        .uri("lb://RATING-SERVICE"))

                // Review service (pakai JWT filter)
                .route("review", r -> r
                        .path("/api/review/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtGatewayFilterFactory.Config())))
                        .uri("lb://REVIEW-SERVICE"))

                .build();
    }
}
