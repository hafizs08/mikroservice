package com.example.review.controller;

import com.example.review.dto.ApiResponse;
import com.example.review.entity.Recommendation;
import com.example.review.entity.Review;
import com.example.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/review/{bookId}")
    public ResponseEntity<ApiResponse<Review>> addReview(
            @PathVariable String bookId,
            @RequestBody Review review) {
        try {
            Review savedReview = reviewService.addReview(bookId, review);
            return ResponseEntity.ok(
                    new ApiResponse<>("success", "Review berhasil ditambahkan", savedReview)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("error", "Gagal menambahkan review: " + e.getMessage(), null));
        }
    }

    @GetMapping("/review/{bookId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviews(@PathVariable String bookId) {
        try {
            List<Review> reviews = reviewService.getReviewsByBookId(bookId);
            return ResponseEntity.ok(
                    new ApiResponse<>("success", "Daftar review berhasil diambil", reviews)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("error", "Gagal mengambil review: " + e.getMessage(), null));
        }
    }

    @GetMapping("/recommendation/{userId}")
    public ResponseEntity<ApiResponse<Recommendation>> getRecommendations(@PathVariable String userId) {
        try {
            Recommendation rec = reviewService.getRecommendations(userId);
            if (rec == null) {
                return ResponseEntity.ok(
                        new ApiResponse<>("success", "Belum ada rekomendasi untuk user ini", null)
                );
            }
            return ResponseEntity.ok(
                    new ApiResponse<>("success", "Rekomendasi berhasil diambil", rec)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("error", e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("error", "Gagal mengambil rekomendasi: " + e.getMessage(), null));
        }
    }
}