package com.example.loan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ReturnRequestDTO {
    @NotNull(message = "Loan ID is required")
    @Positive(message = "Loan ID must be positive")
    private Long loanId;
}