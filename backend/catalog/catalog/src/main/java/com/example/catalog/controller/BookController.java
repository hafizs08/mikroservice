package com.example.catalog.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.catalog.dto.ApiResponse;
import com.example.catalog.dto.BookRequestDTO;
import com.example.catalog.entity.Book;
import com.example.catalog.service.BookService;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class BookController {

    @Autowired
    private BookService bookService;

    // Tambah buku dengan cover (opsional)
    @PostMapping(value = "/books", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Book>> addBook(
            @Valid @RequestPart("book") BookRequestDTO dto,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        Book book = bookService.addBook(dto, coverImage);
        return ResponseEntity.ok(new ApiResponse<>("success", "Book added successfully", book));
    }

    // Ambil semua buku
    @GetMapping("/books")
    public ResponseEntity<ApiResponse<List<Book>>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        return ResponseEntity.ok(new ApiResponse<>("success", "Books retrieved successfully", books));
    }

    // Ambil detail buku berdasarkan ID
    @GetMapping("/books/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(book -> ResponseEntity.ok(new ApiResponse<>("success", "Book retrieved successfully", book)))
                .orElse(ResponseEntity.ok(new ApiResponse<>("error", "Book not found")));
    }

    // Update buku dengan cover baru (opsional)
    @PutMapping(value = "/books/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Book>> updateBook(
            @PathVariable Long id,
            @Valid @RequestPart("book") BookRequestDTO dto,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        Book book = bookService.updateBook(id, dto, coverImage);
        return ResponseEntity.ok(new ApiResponse<>("success", "Book updated successfully", book));
    }

    // Soft delete buku
    @DeleteMapping("/books/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.softDeleteBook(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Book deleted successfully (soft delete)"));
    }

    // Ambil buku yang tersedia (stok > 0)
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Book>>> getAvailableBooks() {
        List<Book> availableBooks = bookService.getAvailableBooks();
        return ResponseEntity.ok(new ApiResponse<>("success", "Available books retrieved", availableBooks));
    }
}
