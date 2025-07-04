package com.example.booksmanagement.controller;

import com.example.booksmanagement.entity.Book;
import com.example.booksmanagement.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllActiveBooks();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<Book>> getAllBooksPaginated(Pageable pageable) {
        Page<Book> books = bookService.getAllActiveBooksPaginated(pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<Book> getBookByIsbn(@PathVariable String isbn) {
        Book book = bookService.getBookByIsbn(isbn);
        return ResponseEntity.ok(book);
    }

    @PostMapping
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book) {
        Book createdBook = bookService.createBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable String id, @Valid @RequestBody Book book) {
        Book updatedBook = bookService.updateBook(id, book);
        return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String query) {
        List<Book> books = bookService.searchBooks(query);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search/title")
    public ResponseEntity<List<Book>> searchBooksByTitle(@RequestParam String title) {
        List<Book> books = bookService.searchBooksByTitle(title);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search/author")
    public ResponseEntity<List<Book>> searchBooksByAuthor(@RequestParam String author) {
        List<Book> books = bookService.searchBooksByAuthor(author);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search/genre")
    public ResponseEntity<List<Book>> searchBooksByGenre(@RequestParam String genre) {
        List<Book> books = bookService.searchBooksByGenre(genre);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Book>> getBooksByGenre(@PathVariable String genre) {
        List<Book> books = bookService.getBooksByGenre(genre);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAvailableBooks() {
        List<Book> books = bookService.getAvailableBooks();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Book>> getOutOfStockBooks() {
        List<Book> books = bookService.getOutOfStockBooks();
        return ResponseEntity.ok(books);
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<Book> updateBookAvailability(@PathVariable String id, @RequestParam Integer availableCopies) {
        Book updatedBook = bookService.updateBookAvailability(id, availableCopies);
        return ResponseEntity.ok(updatedBook);
    }

    @PutMapping("/{id}/borrow")
    public ResponseEntity<Book> borrowBook(@PathVariable String id) {
        Book borrowedBook = bookService.borrowBook(id);
        return ResponseEntity.ok(borrowedBook);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Book> returnBook(@PathVariable String id) {
        Book returnedBook = bookService.returnBook(id);
        return ResponseEntity.ok(returnedBook);
    }

    @GetMapping("/stats/total")
    public ResponseEntity<Long> getTotalBooksCount() {
        Long count = bookService.getTotalBooksCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/available")
    public ResponseEntity<Long> getAvailableBooksCount() {
        Long count = bookService.getAvailableBooksCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/genre/{genre}")
    public ResponseEntity<Long> getBooksByGenreCount(@PathVariable String genre) {
        Long count = bookService.getBooksByGenreCount(genre);
        return ResponseEntity.ok(count);
    }
}
