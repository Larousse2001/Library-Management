package com.example.userservice.dto;

import com.example.userservice.entity.UserBook;

public class UserBookRequest {
    private String title;
    private String author;
    private String category;
    private Integer totalPages;
    private Integer currentPage;
    private UserBook.BookStatus status;
    private Integer rating;
    private String notes;

    // Constructors
    public UserBookRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTotalPages() { return totalPages; }
    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }

    public Integer getCurrentPage() { return currentPage; }
    public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }

    public UserBook.BookStatus getStatus() { return status; }
    public void setStatus(UserBook.BookStatus status) { this.status = status; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
