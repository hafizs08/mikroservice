package com.example.catalog.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Where;

@Entity
@Table(name = "books")
@Data
@Where(clause = "is_deleted = false")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String publisher;

    @Column(nullable = false, unique = true)
    private String isbn;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "cover_url", length = 1000)
    private String coverUrl;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}