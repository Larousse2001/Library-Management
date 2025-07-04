package com.example.booksmanagement.repository;

import com.example.booksmanagement.entity.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {

    List<Book> findByIsActive(boolean isActive);

    Optional<Book> findByIsbnAndIsActive(String isbn, boolean isActive);

    @Query("{ 'title': { $regex: ?0, $options: 'i' }, 'isActive': true }")
    List<Book> findByTitleContainingIgnoreCase(String title);

    @Query("{ 'author': { $regex: ?0, $options: 'i' }, 'isActive': true }")
    List<Book> findByAuthorContainingIgnoreCase(String author);

    @Query("{ 'genre': { $regex: ?0, $options: 'i' }, 'isActive': true }")
    List<Book> findByGenreContainingIgnoreCase(String genre);

    @Query("{ '$or': [" +
           "{ 'title': { $regex: ?0, $options: 'i' } }, " +
           "{ 'author': { $regex: ?0, $options: 'i' } }, " +
           "{ 'genre': { $regex: ?0, $options: 'i' } }, " +
           "{ 'isbn': { $regex: ?0, $options: 'i' } }" +
           "], 'isActive': true }")
    List<Book> findByTitleOrAuthorOrGenreOrIsbnContainingIgnoreCase(String searchTerm);

    List<Book> findByAvailableCopiesGreaterThanAndIsActive(Integer copies, boolean isActive);

    List<Book> findByGenreAndIsActive(String genre, boolean isActive);

    List<Book> findByPublicationYearBetweenAndIsActive(Integer startYear, Integer endYear, boolean isActive);

    @Query("{ 'tags': { $in: ?0 }, 'isActive': true }")
    List<Book> findByTagsIn(List<String> tags);

    long countByIsActive(boolean isActive);

    long countByGenreAndIsActive(String genre, boolean isActive);

    @Query("{ 'availableCopies': { $gt: 0 }, 'isActive': true }")
    List<Book> findAvailableBooks();

    @Query("{ 'availableCopies': { $eq: 0 }, 'isActive': true }")
    List<Book> findOutOfStockBooks();
}
