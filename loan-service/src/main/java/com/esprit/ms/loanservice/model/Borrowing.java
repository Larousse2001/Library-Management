package com.esprit.ms.loanservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "borrowings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Borrowing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "book_id", nullable = false)
    private Long bookId;
    
    @Column(name = "borrow_date", nullable = false)
    private LocalDate borrowDate;
    
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "return_date")
    private LocalDate returnDate;
    
    @Column(name = "status", nullable = false)
    private String status; // BORROWED, RETURNED, OVERDUE
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "renewal_count", nullable = false)
    private Integer renewalCount = 0;
    
    @Column(name = "fine_amount")
    private Double fineAmount = 0.0;

    // Helper methods
    public boolean isOverdue() {
        return "BORROWED".equals(status) && LocalDate.now().isAfter(dueDate);
    }
    
    public boolean isActive() {
        return "BORROWED".equals(status);
    }
    
    public long getDaysOverdue() {
        if (!isOverdue()) return 0;
        return ChronoUnit.DAYS.between(dueDate, LocalDate.now());
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
