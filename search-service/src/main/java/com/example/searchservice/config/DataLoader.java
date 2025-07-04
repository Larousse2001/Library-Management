package com.example.searchservice.config;

import com.example.searchservice.entity.Book;
import com.example.searchservice.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private BookRepository bookRepository;

    @Override
    public void run(String... args) throws Exception {
        if (bookRepository.count() == 0) {
            // Add sample books
            bookRepository.save(Book.builder()
                    .title("The Great Gatsby")
                    .author("F. Scott Fitzgerald")
                    .category("Fiction")
                    .build());
// Add sample books
            bookRepository.save(Book.builder()
                    .title("To Kill a Mockingbird")
                    .author("Harper Lee")
                    .category("Fiction")
                    .build());
// Add sample books
            bookRepository.save(Book.builder()
                    .title("1984")
                    .author("George Orwell")
                    .category("Dystopian Fiction")
                    .build());
// Add sample books
            bookRepository.save(Book.builder()
                    .title("Pride and Prejudice")
                    .author("Jane Austen")
                    .category("Romance")
                    .build());
// Add sample books
            bookRepository.save(Book.builder()
                    .title("The Catcher in the Rye")
                    .author("J.D. Salinger")
                    .category("Fiction")
                    .build());
// Add sample books
            bookRepository.save(Book.builder()
                    .title("Lord of the Flies")
                    .author("William Golding")
                    .category("Fiction")
                    .build());
// Add sample books
            bookRepository.save(Book.builder()
                    .title("The Hobbit")
                    .author("J.R.R. Tolkien")
                    .category("Fantasy")
                    .build());

            bookRepository.save(Book.builder()
                    .title("Harry Potter and the Philosopher's Stone")
                    .author("J.K. Rowling")
                    .category("Fantasy")
                    .build());

            bookRepository.save(Book.builder()
                    .title("The Da Vinci Code")
                    .author("Dan Brown")
                    .category("Mystery")
                    .build());

            bookRepository.save(Book.builder()
                    .title("The Alchemist")
                    .author("Paulo Coelho")
                    .category("Philosophy")
                    .build());

            System.out.println("Sample books have been loaded into the database.");
        }
    }
}
