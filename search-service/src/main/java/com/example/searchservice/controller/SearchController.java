package com.example.searchservice.controller;

import com.example.searchservice.entity.Book;
import com.example.searchservice.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private BookRepository bookRepo;

    @GetMapping("/title")
    public List<Book> searchByTitle(@RequestParam String title) {
        return bookRepo.findByTitleContainingIgnoreCase(title);
    }

    @GetMapping("/author")
    public List<Book> searchByAuthor(@RequestParam String author) {
        return bookRepo.findByAuthorContainingIgnoreCase(author);
    }

    @GetMapping("/category")
    public List<Book> searchByCategory(@RequestParam String category) {
        return bookRepo.findByCategoryContainingIgnoreCase(category);
    }
}

