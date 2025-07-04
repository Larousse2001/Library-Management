package com.example.userservice.dto;

public class ReadingStatsResponse {
    private Long totalBooks;
    private Long booksRead;
    private Long booksInProgress;
    private Long booksInWishlist;
    private Long totalPagesRead;
    private Double averageRating;

    // Constructors
    public ReadingStatsResponse() {}

    public ReadingStatsResponse(Long totalBooks, Long booksRead, Long booksInProgress, 
                                Long booksInWishlist, Long totalPagesRead, Double averageRating) {
        this.totalBooks = totalBooks;
        this.booksRead = booksRead;
        this.booksInProgress = booksInProgress;
        this.booksInWishlist = booksInWishlist;
        this.totalPagesRead = totalPagesRead;
        this.averageRating = averageRating;
    }

    // Getters and Setters
    public Long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(Long totalBooks) { this.totalBooks = totalBooks; }

    public Long getBooksRead() { return booksRead; }
    public void setBooksRead(Long booksRead) { this.booksRead = booksRead; }

    public Long getBooksInProgress() { return booksInProgress; }
    public void setBooksInProgress(Long booksInProgress) { this.booksInProgress = booksInProgress; }

    public Long getBooksInWishlist() { return booksInWishlist; }
    public void setBooksInWishlist(Long booksInWishlist) { this.booksInWishlist = booksInWishlist; }

    public Long getTotalPagesRead() { return totalPagesRead; }
    public void setTotalPagesRead(Long totalPagesRead) { this.totalPagesRead = totalPagesRead; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}
