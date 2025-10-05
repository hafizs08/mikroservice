package com.example.catalog.service;

import com.example.catalog.dto.BookRequestDTO;
import com.example.catalog.entity.Book;
import com.example.catalog.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private MinioService minioService;

    // Tambah buku dengan opsi upload cover
    public Book addBook(BookRequestDTO dto, MultipartFile coverImage) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setPublisher(dto.getPublisher());
        book.setIsbn(dto.getIsbn());
        book.setStock(dto.getStock());
        book.setIsDeleted(false);

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = minioService.uploadFile(coverImage);
            book.setCoverUrl(imageUrl);
        }

        return bookRepository.save(book);
    }

    // Ambil semua buku
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // Ambil buku berdasarkan ID
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    // Update buku dengan opsi cover baru
    public Book updateBook(Long id, BookRequestDTO dto, MultipartFile coverImage) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setPublisher(dto.getPublisher());
        book.setIsbn(dto.getIsbn());
        book.setStock(dto.getStock());

        if (coverImage != null && !coverImage.isEmpty()) {
            if (book.getCoverUrl() != null) {
                String oldFile = minioService.getObjectNameFromUrl(book.getCoverUrl());
                minioService.deleteFile(oldFile);
            }
            String newUrl = minioService.uploadFile(coverImage);
            book.setCoverUrl(newUrl);
        }

        return bookRepository.save(book);
    }

    // Soft delete buku
    public void softDeleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        book.setIsDeleted(true);

        if (book.getCoverUrl() != null) {
            String fileName = minioService.getObjectNameFromUrl(book.getCoverUrl());
            minioService.deleteFile(fileName);
        }

        bookRepository.save(book);
    }

    // Ambil buku yang stok > 0
    public List<Book> getAvailableBooks() {
        return bookRepository.findByStockGreaterThan(0);
    }
}
