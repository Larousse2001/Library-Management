package com.example.userservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_books")
public class UserBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String category;

    @Column(name = "total_pages")
    private Integer totalPages = 0;

    @Column(name = "current_page")
    private Integer currentPage = 0;

    private Double progress = 0.0;

    @Enumerated(EnumType.STRING)
    private BookStatus status = BookStatus.WISHLIST;

    private Integer rating = 0;

    private String notes;

    @Column(name = "date_added")
    private LocalDateTime dateAdded = LocalDateTime.now();

    @Column(name = "date_started")
    private LocalDateTime dateStarted;

    @Column(name = "date_finished")
    private LocalDateTime dateFinished;

    public enum BookStatus {
        WISHLIST, READING, READ, DNF
    }

    // Constructors
    public UserBook() {}

    public UserBook(User user, String title, String author) {
        this.user = user;
        this.title = title;
        this.author = author;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTotalPages() { return totalPages; }
    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }

    public Integer getCurrentPage() { return currentPage; }
    public void setCurrentPage(Integer currentPage) { 
        this.currentPage = currentPage;
        if (totalPages != null && totalPages > 0) {
            this.progress = (currentPage.doubleValue() / totalPages) * 100;
        }
    }

    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }

    public BookStatus getStatus() { return status; }
    public void setStatus(BookStatus status) { this.status = status; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDateTime dateAdded) { this.dateAdded = dateAdded; }

    public LocalDateTime getDateStarted() { return dateStarted; }
    public void setDateStarted(LocalDateTime dateStarted) { this.dateStarted = dateStarted; }

    public LocalDateTime getDateFinished() { return dateFinished; }
    public void setDateFinished(LocalDateTime dateFinished) { this.dateFinished = dateFinished; }
}
