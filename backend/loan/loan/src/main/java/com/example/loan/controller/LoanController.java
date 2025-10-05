package com.example.loan.controller;

import com.example.loan.entity.Loan;
import com.example.loan.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loan")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(
            @RequestBody Map<String, Long> request,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            Long userId = request.get("userId");
            Long bookId = request.get("bookId");
            if (userId == null || bookId == null) {
                return ResponseEntity.badRequest().body("userId and bookId are required");
            }
            Loan loan = loanService.borrowBook(userId, bookId, authHeader);

            Map<String, Object> response = new HashMap<>();
            response.put("id", loan.getId());
            response.put("userId", loan.getUserId());
            response.put("bookId", loan.getBookId());
            response.put("loanDate", loan.getLoanDate());
            response.put("returnDate", loan.getReturnDate()); // Null saat borrow
            response.put("status", loan.getStatus()); // BORROWED
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/return")
    public ResponseEntity<?> returnBook(
            @RequestBody Map<String, Long> request,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            Long loanId = request.get("loanId");
            if (loanId == null) {
                return ResponseEntity.badRequest().body("loanId is required");
            }
            Loan loan = loanService.returnBook(loanId, authHeader);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", loan.getUserId());
            response.put("bookId", loan.getBookId());
            response.put("loanDate", loan.getLoanDate());
            response.put("returnDate", loan.getReturnDate());
            response.put("status", loan.getStatus());
            response.put("penalty", loan.getPenalty());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getLoanHistory(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            List<Loan> history = loanService.getLoanHistory(userId, authHeader);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}