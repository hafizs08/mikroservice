package com.example.loan.dto;

import lombok.Data;

@Data
public class BorrowRequest {
    private Long bookId;
    private String email;
}