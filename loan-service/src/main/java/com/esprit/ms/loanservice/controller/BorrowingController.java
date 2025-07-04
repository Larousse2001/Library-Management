package com.esprit.ms.loanservice.controller;

import com.esprit.ms.loanservice.model.Borrowing;
import com.esprit.ms.loanservice.repository.BorrowingRepository;
import com.esprit.ms.loanservice.service.BorrowingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = {"http://localhost", "http://localhost:80", "http://localhost:3000"}, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Loan Management", description = "Book borrowing and returning operations")
public class BorrowingController {

    @Autowired
    private BorrowingRepository repository;
    
    @Autowired
    private BorrowingService borrowingService;

    @PostMapping("/borrow")
    @Operation(summary = "Borrow a book", description = "Create a new book borrowing record")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Book borrowed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "404", description = "User or book not found"),
        @ApiResponse(responseCode = "409", description = "Book already borrowed by user")
    })
    public ResponseEntity<Borrowing> borrowBook(@RequestBody Borrowing borrowing) {
        log.info("Processing borrow request for user {} and book {}", borrowing.getUserId(), borrowing.getBookId());
        
        // Validate user exists
        if (!borrowingService.validateUser(borrowing.getUserId())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate book exists
        if (!borrowingService.validateBook(borrowing.getBookId())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Check if user already has this book borrowed
        if (borrowingService.isBookAlreadyBorrowed(borrowing.getUserId(), borrowing.getBookId())) {
            return ResponseEntity.status(409).build();
        }
        
        borrowing.setBorrowDate(LocalDate.now());
        borrowing.setStatus("BORROWED");
        borrowing.setDueDate(LocalDate.now().plusDays(14)); // 2 weeks loan period
        
        Borrowing savedBorrowing = repository.save(borrowing);
        
        // Notify gamification service
        borrowingService.notifyGamificationService(borrowing.getUserId(), "BOOK_BORROWED");
        
        return ResponseEntity.ok(savedBorrowing);
    }
//by id
    @PutMapping("/return/{id}")
    @Operation(summary = "Return a book", description = "Mark a borrowed book as returned")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Book returned successfully"),
        @ApiResponse(responseCode = "404", description = "Borrowing record not found")
    })
    public ResponseEntity<Borrowing> returnBook(@PathVariable Long id) {
        log.info("Processing return request for borrowing {}", id);
        
        Borrowing borrowing = repository.findById(id).orElse(null);
        if (borrowing == null) {
            return ResponseEntity.notFound().build();
        }
        
        borrowing.setReturnDate(LocalDate.now());
        borrowing.setStatus("RETURNED");
        
        Borrowing updatedBorrowing = repository.save(borrowing);
        
        // Notify gamification service
        borrowingService.notifyGamificationService(borrowing.getUserId(), "BOOK_RETURNED");
        
        return ResponseEntity.ok(updatedBorrowing);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user borrowings", description = "Retrieve all borrowing records for a specific user")
    public ResponseEntity<Page<Borrowing>> getUserBorrowings(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching borrowings for user {}", userId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Borrowing> borrowings = repository.findByUserIdOrderByBorrowDateDesc(userId, pageable);
        
        return ResponseEntity.ok(borrowings);
    }

    @GetMapping("/book/{bookId}")
    @Operation(summary = "Get book borrowing history", description = "Retrieve borrowing history for a specific book")
    public ResponseEntity<List<Borrowing>> getBookBorrowingHistory(@PathVariable Long bookId) {
        log.info("Fetching borrowing history for book {}", bookId);
        
        List<Borrowing> borrowings = repository.findByBookIdOrderByBorrowDateDesc(bookId);
        return ResponseEntity.ok(borrowings);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active loans", description = "Retrieve all currently active borrowing records")
    public ResponseEntity<Page<Borrowing>> getActiveLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching active loans");
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Borrowing> activeLoans = repository.findByStatusOrderByBorrowDateDesc("BORROWED", pageable);
        
        return ResponseEntity.ok(activeLoans);
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get overdue loans", description = "Retrieve all overdue borrowing records")
    public ResponseEntity<List<Borrowing>> getOverdueLoans() {
        log.info("Fetching overdue loans");
        
        List<Borrowing> overdueLoans = repository.findOverdueLoans(LocalDate.now());
        return ResponseEntity.ok(overdueLoans);
    }

    @GetMapping("/stats/{userId}")
    @Operation(summary = "Get user borrowing statistics", description = "Retrieve borrowing statistics for a specific user")
    public ResponseEntity<Map<String, Object>> getUserBorrowingStats(@PathVariable Long userId) {
        log.info("Fetching borrowing stats for user {}", userId);
        
        Map<String, Object> stats = borrowingService.getUserBorrowingStats(userId);
        return ResponseEntity.ok(stats);
    }
}
