package com.example.review.service;

import com.example.review.entity.Recommendation;
import com.example.review.entity.Review;
import com.example.review.repository.RecommendationRepository;
import com.example.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RecommendationRepository recommendationRepository;

    // Tambah Review
    public Review addReview(String bookId, Review review) {
        if (bookId == null || bookId.trim().isEmpty()) {
            throw new IllegalArgumentException("bookId cannot be null or empty");
        }
        if (review == null || review.getUserId() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Invalid review: userId and rating (1-5) are required");
        }

        review.setBookId(bookId);
        review.setTimestamp(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);

        // Update rekomendasi setelah menambah ulasan
        updateRecommendationsAfterReview(review.getUserId());

        return savedReview;
    }

    // Ambil semua review berdasarkan bookId
    public List<Review> getReviewsByBookId(String bookId) {
        if (bookId == null || bookId.trim().isEmpty()) {
            throw new IllegalArgumentException("bookId cannot be null or empty");
        }
        return reviewRepository.findByBookId(bookId);
    }

    // Ambil rekomendasi berdasarkan userId
    public Recommendation getRecommendations(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("userId cannot be null or empty");
        }
        return recommendationRepository.findByUserId(userId).orElse(null);
    }

    // Update rekomendasi menggunakan collaborative filtering
    private void updateRecommendationsAfterReview(String userId) {
        List<String> recommendedBookIds = computeCollaborativeFilteringRecommendations(userId);
        Recommendation recommendation = new Recommendation();
        recommendation.setUserId(userId);
        recommendation.setBookIds(recommendedBookIds);
        recommendationRepository.save(recommendation);
    }

    // Implementasi sederhana collaborative filtering
    private List<String> computeCollaborativeFilteringRecommendations(String userId) {
        List<Review> allReviews = reviewRepository.findAll();
        Set<String> users = allReviews.stream().map(Review::getUserId).collect(Collectors.toSet());
        Set<String> books = allReviews.stream().map(Review::getBookId).collect(Collectors.toSet());

        List<String> userList = new ArrayList<>(users);
        List<String> bookList = new ArrayList<>(books);

        double[][] ratingMatrix = new double[userList.size()][bookList.size()];
        for (Review review : allReviews) {
            int userIndex = userList.indexOf(review.getUserId());
            int bookIndex = bookList.indexOf(review.getBookId());
            ratingMatrix[userIndex][bookIndex] = review.getRating();
        }

        double[] targetUserRatings = ratingMatrix[userList.indexOf(userId)];
        List<Double> similarities = new ArrayList<>();
        for (int i = 0; i < userList.size(); i++) {
            if (i != userList.indexOf(userId)) {
                similarities.add(cosineSimilarity(targetUserRatings, ratingMatrix[i]));
            } else {
                similarities.add(0.0);
            }
        }

        int topN = 3;
        List<Integer> similarUserIndices = new ArrayList<>();
        for (int i = 0; i < topN; i++) {
            int maxIndex = similarities.indexOf(Collections.max(similarities));
            similarUserIndices.add(maxIndex);
            similarities.set(maxIndex, -1.0);
        }

        List<Double> predictedRatings = new ArrayList<>();
        for (int j = 0; j < bookList.size(); j++) {
            if (targetUserRatings[j] == 0) {
                double sumSimilarityRating = 0;
                double sumSimilarity = 0;
                for (int simUserIndex : similarUserIndices) {
                    double sim = cosineSimilarity(targetUserRatings, ratingMatrix[simUserIndex]);
                    sumSimilarityRating += sim * ratingMatrix[simUserIndex][j];
                    sumSimilarity += sim;
                }
                predictedRatings.add(sumSimilarity > 0 ? sumSimilarityRating / sumSimilarity : 0);
            } else {
                predictedRatings.add(0.0);
            }
        }

        List<String> recommendedBookIds = new ArrayList<>();
        for (int i = 0; i < topN; i++) {
            int maxIndex = predictedRatings.indexOf(Collections.max(predictedRatings));
            recommendedBookIds.add(bookList.get(maxIndex)); // Langsung gunakan String dari bookList
            predictedRatings.set(maxIndex, -1.0);
        }
        return recommendedBookIds;
    }

    private double cosineSimilarity(double[] vec1, double[] vec2) {
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        for (int i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += Math.pow(vec1[i], 2);
            norm2 += Math.pow(vec2[i], 2);
        }
        double denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        return denominator > 0 ? dotProduct / denominator : 0;
    }
}