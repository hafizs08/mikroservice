package com.example.review.repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.review.entity.Recommendation;

import java.util.Optional;

public interface RecommendationRepository extends MongoRepository<Recommendation, String> {
    Optional<Recommendation> findByUserId(String userId);
}