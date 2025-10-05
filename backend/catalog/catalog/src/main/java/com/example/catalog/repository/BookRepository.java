package com.example.catalog.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.catalog.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByStockGreaterThan(int stock);
}
