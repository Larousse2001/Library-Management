package com.example.userservice.repository;

import com.example.userservice.entity.UserBook;
import com.example.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {
    
    List<UserBook> findByUserOrderByDateAddedDesc(User user);
    
    List<UserBook> findByUserAndStatus(User user, UserBook.BookStatus status);
    
    Optional<UserBook> findByUserAndId(User user, Long id);
    
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.user = :user AND ub.status = :status")
    Long countByUserAndStatus(@Param("user") User user, @Param("status") UserBook.BookStatus status);
    
    @Query("SELECT AVG(ub.rating) FROM UserBook ub WHERE ub.user = :user AND ub.rating > 0")
    Double getAverageRatingByUser(@Param("user") User user);
    
    @Query("SELECT SUM(ub.currentPage) FROM UserBook ub WHERE ub.user = :user")
    Long getTotalPagesReadByUser(@Param("user") User user);
    
    @Query("SELECT ub FROM UserBook ub WHERE ub.user = :user AND (ub.dateFinished IS NOT NULL OR ub.dateStarted IS NOT NULL) ORDER BY COALESCE(ub.dateFinished, ub.dateStarted) DESC")
    List<UserBook> findRecentActivityByUser(@Param("user") User user);
}
