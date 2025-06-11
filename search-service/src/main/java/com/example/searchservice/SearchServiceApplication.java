package com.example.searchservice;

import com.example.searchservice.entity.Book;
import com.example.searchservice.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SearchServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SearchServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner init(BookRepository repo) {
        return args -> {
            repo.save(new Book(null, "Clean Code", "Robert C. Martin", "Programming"));
            repo.save(new Book(null, "Le Petit Prince", "Antoine de Saint-Exupéry", "Fiction"));
            repo.save(new Book(null, "Spring in Action", "Craig Walls", "Programming"));
        };
    }
}

