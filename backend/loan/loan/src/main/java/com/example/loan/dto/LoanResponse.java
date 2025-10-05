package com.example.loan.dto;

import lombok.Data;

@Data
public class LoanResponse {
    private Long id;
    private String title;
    private int stock;
    private String isbn;
    private String author;
    private String publisher; // Tambahkan field ini
}
