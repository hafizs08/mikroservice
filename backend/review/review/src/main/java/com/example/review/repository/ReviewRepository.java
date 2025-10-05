package com.example.review.repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.review.entity.Review;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByBookId(String bookId);
}