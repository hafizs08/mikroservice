package com.example.loan.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "loans")
@Data
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long bookId;

    @Column(nullable = false)
    private String loanDate;

    @Column
    private String returnDate;

    @Column(nullable = false)
    private String status;

    @Column
    private Integer penalty;

    private String email;
}