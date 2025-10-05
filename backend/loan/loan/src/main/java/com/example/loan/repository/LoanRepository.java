package com.example.loan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.loan.entity.Loan;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);
    List<Loan> findByUserIdAndStatus(Long userId, String status);
    
}
