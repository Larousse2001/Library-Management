package com.example.booksmanagement.service;

import com.example.booksmanagement.entity.Book;
import com.example.booksmanagement.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllActiveBooks() {
        return bookRepository.findByIsActive(true);
    }

    public Page<Book> getAllActiveBooksPaginated(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    public Book getBookById(String id) {
        Optional<Book> book = bookRepository.findById(id);
        if (book.isPresent() && book.get().isActive()) {
            return book.get();
        }
        throw new RuntimeException("Book not found with id: " + id);
    }

    public Book getBookByIsbn(String isbn) {
        Optional<Book> book = bookRepository.findByIsbnAndIsActive(isbn, true);
        if (book.isPresent()) {
            return book.get();
        }
        throw new RuntimeException("Book not found with ISBN: " + isbn);
    }

    public Book createBook(Book book) {
        // Check if book with same ISBN already exists
        Optional<Book> existingBook = bookRepository.findByIsbnAndIsActive(book.getIsbn(), true);
        if (existingBook.isPresent()) {
            throw new RuntimeException("Book with ISBN " + book.getIsbn() + " already exists");
        }
        
        // Set available copies equal to total copies for new book
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        
        return bookRepository.save(book);
    }

    public Book updateBook(String id, Book bookDetails) {
        Book book = getBookById(id);
        
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setIsbn(bookDetails.getIsbn());
        book.setDescription(bookDetails.getDescription());
        book.setPublicationYear(bookDetails.getPublicationYear());
        book.setGenre(bookDetails.getGenre());
        book.setPublisher(bookDetails.getPublisher());
        book.setTotalCopies(bookDetails.getTotalCopies());
        book.setCoverImageUrl(bookDetails.getCoverImageUrl());
        book.setTags(bookDetails.getTags());
        
        // Update available copies if total copies changed
        if (bookDetails.getAvailableCopies() != null) {
            book.setAvailableCopies(bookDetails.getAvailableCopies());
        }
        
        return bookRepository.save(book);
    }

    public void deleteBook(String id) {
        Book book = getBookById(id);
        book.setActive(false);
        bookRepository.save(book);
    }

    public List<Book> searchBooks(String query) {
        return bookRepository.findByTitleOrAuthorOrGenreOrIsbnContainingIgnoreCase(query);
    }

    public List<Book> searchBooksByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Book> searchBooksByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }

    public List<Book> searchBooksByGenre(String genre) {
        return bookRepository.findByGenreContainingIgnoreCase(genre);
    }

    public List<Book> getBooksByGenre(String genre) {
        return bookRepository.findByGenreAndIsActive(genre, true);
    }

    public List<Book> getAvailableBooks() {
        return bookRepository.findAvailableBooks();
    }

    public List<Book> getOutOfStockBooks() {
        return bookRepository.findOutOfStockBooks();
    }

    public Book updateBookAvailability(String id, Integer availableCopies) {
        Book book = getBookById(id);
        
        if (availableCopies < 0) {
            throw new RuntimeException("Available copies cannot be negative");
        }
        
        if (availableCopies > book.getTotalCopies()) {
            throw new RuntimeException("Available copies cannot exceed total copies");
        }
        
        book.setAvailableCopies(availableCopies);
        return bookRepository.save(book);
    }

    public Book borrowBook(String id) {
        Book book = getBookById(id);
        
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No copies available for borrowing");
        }
        
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        return bookRepository.save(book);
    }

    public Book returnBook(String id) {
        Book book = getBookById(id);
        
        if (book.getAvailableCopies() >= book.getTotalCopies()) {
            throw new RuntimeException("All copies are already returned");
        }
        
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        return bookRepository.save(book);
    }

    public Long getTotalBooksCount() {
        return bookRepository.countByIsActive(true);
    }

    public Long getAvailableBooksCount() {
        return bookRepository.findAvailableBooks().stream().count();
    }

    public Long getBooksByGenreCount(String genre) {
        return bookRepository.countByGenreAndIsActive(genre, true);
    }
}
