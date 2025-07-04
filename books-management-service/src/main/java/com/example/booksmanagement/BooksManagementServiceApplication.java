package com.example.booksmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class BooksManagementServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BooksManagementServiceApplication.class, args);
    }
}
