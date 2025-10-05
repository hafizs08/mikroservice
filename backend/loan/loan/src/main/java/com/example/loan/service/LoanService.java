package com.example.loan.service;


import com.example.loan.dto.ApiResponse;
import com.example.loan.dto.JwtRequest;
import com.example.loan.dto.JwtResponse;
import com.example.loan.dto.LoanResponse;
import com.example.loan.dto.NotificationEvent;
import com.example.loan.dto.UserDTO;
import com.example.loan.entity.Loan;
import com.example.loan.repository.LoanRepository;
import com.example.loan.config.JwtUtil;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private static final String CATALOG_SERVICE_URL = "http://catalog-service/api/catalog/books/";
    private static final String USER_SERVICE_URL = "http://user-service/api/auth/internal/user/";
    private static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    private static final String NOTIFICATION_ROUTING_KEY = "notification.email";

    public Loan borrowBook(Long userId, Long bookId, String authHeader) {
        Long verifiedUserId = verifyUserFromToken(authHeader);
        if (!verifiedUserId.equals(userId)) {
            System.out.println("Warning: userId from token (" + verifiedUserId + ") differs from provided userId (" + userId + "). Using token userId.");
            userId = verifiedUserId;
        }

        ResponseEntity<ApiResponse<LoanResponse>> catalogResponse = restTemplate.exchange(
                CATALOG_SERVICE_URL + bookId,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<LoanResponse>>() {}
        );

        if (catalogResponse.getStatusCode().is2xxSuccessful()) {
            ApiResponse<LoanResponse> response = catalogResponse.getBody();
            if (response != null && response.getData() != null && response.getData().getStock() > 0) {
                LoanResponse book = response.getData();

                Loan loan = new Loan();
                loan.setUserId(userId);
                loan.setBookId(bookId);
                loan.setLoanDate(LocalDate.now().toString());
                loan.setStatus("BORROWED");
                loan.setPenalty(0);
                loan = loanRepository.save(loan);

                updateBookStock(bookId, book.getStock() - 1, book);

                String email = getUserEmail(userId, authHeader);
                NotificationEvent event = new NotificationEvent(
                    userId,
                    email,
                    "Book Borrowed",
                    "You have borrowed book ID: " + bookId + " on " + LocalDate.now()
                );
                try {
                    rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, event);
                    System.out.println("Sent event to RabbitMQ: " + event.getSubject() + " to " + event.getEmail());
                } catch (Exception e) {
                    System.err.println("Failed to send event to RabbitMQ: " + e.getMessage());
                    e.printStackTrace();
                }

                return loan;
            } else {
                throw new RuntimeException("Book not available or insufficient stock");
            }
        } else {
            ApiResponse<LoanResponse> response = catalogResponse.getBody();
            String errorMessage = (response != null && response.getMessage() != null) ? response.getMessage() : "Unknown error";
            throw new RuntimeException("Failed to check book availability: " + catalogResponse.getStatusCode() + " - " + errorMessage);
        }
    }

    public Loan returnBook(Long loanId, String authHeader) {
        Long verifiedUserId = verifyUserFromToken(authHeader);
        Long loanUserId = getUserIdFromLoan(loanId);
        if (!verifiedUserId.equals(loanUserId)) {
            throw new RuntimeException("User is not authorized to return this loan");
        }

        Optional<Loan> optionalLoan = loanRepository.findById(loanId);
        if (optionalLoan.isPresent()) {
            Loan loan = optionalLoan.get();
            loan.setReturnDate(LocalDate.now().toString());
            loan.setStatus("RETURNED");

            if (LocalDate.parse(loan.getReturnDate()).minusDays(7).isAfter(LocalDate.parse(loan.getLoanDate()))) {
                loan.setPenalty(1000);
            }
            loan = loanRepository.save(loan);

            ResponseEntity<ApiResponse<LoanResponse>> catalogResponse = restTemplate.exchange(
                    CATALOG_SERVICE_URL + loan.getBookId(),
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<LoanResponse>>() {}
            );
            if (catalogResponse.getStatusCode().is2xxSuccessful()) {
                ApiResponse<LoanResponse> response = catalogResponse.getBody();
                if (response != null && response.getData() != null) {
                    updateBookStock(loan.getBookId(), response.getData().getStock() + 1, response.getData());
                }
            }

            String email = getUserEmail(loan.getUserId(), authHeader);
            NotificationEvent event = new NotificationEvent(
                loan.getUserId(),
                email,
                "Book Returned",
                "You have returned book ID: " + loan.getBookId() + " on " + LocalDate.now() +
                    (loan.getPenalty() > 0 ? ". Penalty: " + loan.getPenalty() : "")
            );
            try {
                rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, event);
                System.out.println("Sent event to RabbitMQ: " + event.getSubject() + " to " + event.getEmail());
            } catch (Exception e) {
                System.err.println("Failed to send event to RabbitMQ: " + e.getMessage());
                e.printStackTrace();
            }

            return loan;
        }
        throw new RuntimeException("Loan not found");
    }

    public List<Loan> getLoanHistory(Long userId, String authHeader) {
        Long verifiedUserId = verifyUserFromToken(authHeader);
        if (!verifiedUserId.equals(userId)) {
            throw new RuntimeException("User ID from token does not match provided userId");
        }
        return loanRepository.findByUserId(userId);
    }

    private String getServiceAccountToken() {
        String loginUrl = "http://user-service/api/auth/login";
        JwtRequest request = new JwtRequest("admin", "adminpassword");
        try {
            ResponseEntity<JwtResponse> response = restTemplate.postForEntity(loginUrl, request, JwtResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                System.out.println("Service account token obtained successfully");
                return "Bearer " + response.getBody().getToken();
            }
        } catch (Exception e) {
            System.err.println("Failed to get service account token: " + e.getMessage());
            e.printStackTrace();
        }
        throw new RuntimeException("Failed to get service account token");
    }

    private String getUserEmail(Long userId, String authHeader) {
        try {
            String email = jwtUtil.getEmailFromToken(authHeader);
            if (email == null) {
                throw new RuntimeException("Email not found in token for userId: " + userId);
            }
            System.out.println("Fetched email from token for userId " + userId + ": " + email);
            return email;
        } catch (Exception e) {
            System.err.println("Failed to fetch email from token: " + e.getMessage());
            return getUserEmailFromUserService(userId);
        }
    }

    private String getUserEmailFromUserService(Long userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", getServiceAccountToken());
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<UserDTO> userResponse = restTemplate.exchange(
                    USER_SERVICE_URL + userId,
                    HttpMethod.GET,
                    entity,
                    UserDTO.class
            );
            UserDTO user = userResponse.getStatusCode().is2xxSuccessful() ? userResponse.getBody() : null;
            if (user == null || user.getEmail() == null) {
                throw new RuntimeException("User email not found for userId: " + userId);
            }
            System.out.println("Fetched email for userId " + userId + ": " + user.getEmail());
            return user.getEmail();
        } catch (Exception e) {
            System.err.println("Failed to fetch user email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch user email for userId: " + userId);
        }
    }

    private Long getUserIdFromLoan(Long loanId) {
        Optional<Loan> loan = loanRepository.findById(loanId);
        return loan.map(Loan::getUserId).orElseThrow(() -> new RuntimeException("Loan not found"));
    }

    private Long verifyUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing Authorization token");
        }
        return jwtUtil.getUserIdFromToken(authHeader);
    }

    private void updateBookStock(Long bookId, int newStock, LoanResponse existingBook) {
        LoanResponse bookUpdate = new LoanResponse();
        bookUpdate.setId(existingBook.getId());
        bookUpdate.setTitle(existingBook.getTitle());
        bookUpdate.setStock(newStock);
        bookUpdate.setIsbn(existingBook.getIsbn());
        bookUpdate.setAuthor(existingBook.getAuthor());
        bookUpdate.setPublisher(existingBook.getPublisher());
        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    CATALOG_SERVICE_URL + bookId,
                    HttpMethod.PUT,
                    new HttpEntity<>(bookUpdate),
                    Void.class
            );
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to update book stock: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to update book stock: " + e.getMessage());
        }
    }
}