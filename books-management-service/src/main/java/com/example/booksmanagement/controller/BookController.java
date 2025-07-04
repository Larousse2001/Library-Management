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
@CrossOrigin(origins = "*") // Permet l'accès à l'API depuis n'importe quelle origine (CORS)
public class BookController {

    @Autowired
    private BookService bookService; // Injection du service métier pour la gestion des livres

    // Récupérer tous les livres actifs (non supprimés, ou disponibles)
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllActiveBooks();
        return ResponseEntity.ok(books);
    }

    // Récupérer tous les livres actifs avec pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<Book>> getAllBooksPaginated(Pageable pageable) {
        Page<Book> books = bookService.getAllActiveBooksPaginated(pageable);
        return ResponseEntity.ok(books);
    }

    // Récupérer un livre par son identifiant
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    // Récupérer un livre par son numéro ISBN
    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<Book> getBookByIsbn(@PathVariable String isbn) {
        Book book = bookService.getBookByIsbn(isbn);
        return ResponseEntity.ok(book);
    }

    // Ajouter un nouveau livre
    @PostMapping
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book) {
        Book createdBook = bookService.createBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
    }

    // Mettre à jour les données d’un livre existant
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable String id, @Valid @RequestBody Book book) {
        Book updatedBook = bookService.updateBook(id, book);
        return ResponseEntity.ok(updatedBook);
    }

    // Supprimer un livre par son ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // Recherche globale de livres (par titre, auteur, etc.)
    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String query) {
        List<Book> books = bookService.searchBooks(query);
        return ResponseEntity.ok(books);
    }

    // Recherche de livres par titre
    @GetMapping("/search/title")
    public ResponseEntity<List<Book>> searchBooksByTitle(@RequestParam String title) {
        List<Book> books = bookService.searchBooksByTitle(title);
        return ResponseEntity.ok(books);
    }

    // Recherche de livres par auteur
    @GetMapping("/search/author")
    public ResponseEntity<List<Book>> searchBooksByAuthor(@RequestParam String author) {
        List<Book> books = bookService.searchBooksByAuthor(author);
        return ResponseEntity.ok(books);
    }

    // Recherche de livres par genre
    @GetMapping("/search/genre")
    public ResponseEntity<List<Book>> searchBooksByGenre(@RequestParam String genre) {
        List<Book> books = bookService.searchBooksByGenre(genre);
        return ResponseEntity.ok(books);
    }

    // Obtenir tous les livres d’un genre spécifique
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Book>> getBooksByGenre(@PathVariable String genre) {
        List<Book> books = bookService.getBooksByGenre(genre);
        return ResponseEntity.ok(books);
    }

    // Obtenir les livres disponibles (copies > 0)
    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAvailableBooks() {
        List<Book> books = bookService.getAvailableBooks();
        return ResponseEntity.ok(books);
    }

    // Obtenir les livres en rupture de stock (copies = 0)
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Book>> getOutOfStockBooks() {
        List<Book> books = bookService.getOutOfStockBooks();
        return ResponseEntity.ok(books);
    }

    // Mettre à jour manuellement le nombre de copies disponibles
    @PutMapping("/{id}/availability")
    public ResponseEntity<Book> updateBookAvailability(@PathVariable String id, @RequestParam Integer availableCopies) {
        Book updatedBook = bookService.updateBookAvailability(id, availableCopies);
        return ResponseEntity.ok(updatedBook);
    }

    // Emprunter un livre (diminue le nombre de copies disponibles)
    @PutMapping("/{id}/borrow")
    public ResponseEntity<Book> borrowBook(@PathVariable String id) {
        Book borrowedBook = bookService.borrowBook(id);
        return ResponseEntity.ok(borrowedBook);
    }

    // Retourner un livre emprunté (augmente le nombre de copies disponibles)
    @PutMapping("/{id}/return")
    public ResponseEntity<Book> returnBook(@PathVariable String id) {
        Book returnedBook = bookService.returnBook(id);
        return ResponseEntity.ok(returnedBook);
    }

    // Obtenir le nombre total de livres
    @GetMapping("/stats/total")
    public ResponseEntity<Long> getTotalBooksCount() {
        Long count = bookService.getTotalBooksCount();
        return ResponseEntity.ok(count);
    }

    // Obtenir le nombre total de livres disponibles
    @GetMapping("/stats/available")
    public ResponseEntity<Long> getAvailableBooksCount() {
        Long count = bookService.getAvailableBooksCount();
        return ResponseEntity.ok(count);
    }

    // Obtenir le nombre de livres dans un genre spécifique
    @GetMapping("/stats/genre/{genre}")
    public ResponseEntity<Long> getBooksByGenreCount(@PathVariable String genre) {
        Long count = bookService.getBooksByGenreCount(genre);
        return ResponseEntity.ok(count);
    }
}
