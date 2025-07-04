package com.esprit.ms.loanservice.repository;

import com.esprit.ms.loanservice.model.Borrowing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {

    List<Borrowing> findByUserId(Long userId);
    
    Page<Borrowing> findByUserIdOrderByBorrowDateDesc(Long userId, Pageable pageable);
    
    List<Borrowing> findByBookIdOrderByBorrowDateDesc(Long bookId);
    
    Page<Borrowing> findByStatusOrderByBorrowDateDesc(String status, Pageable pageable);
    
    @Query("SELECT b FROM Borrowing b WHERE b.userId = :userId AND b.bookId = :bookId AND b.status = 'BORROWED'")
    Optional<Borrowing> findActiveBorrowingByUserAndBook(@Param("userId") Long userId, @Param("bookId") Long bookId);
    
    @Query("SELECT b FROM Borrowing b WHERE b.status = 'BORROWED' AND b.dueDate < :currentDate")
    List<Borrowing> findOverdueLoans(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT COUNT(b) FROM Borrowing b WHERE b.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Borrowing b WHERE b.userId = :userId AND b.status = 'RETURNED'")
    Long countReturnedBooksByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Borrowing b WHERE b.userId = :userId AND b.status = 'BORROWED'")
    Long countActiveBorrowingsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Borrowing b WHERE b.bookId = :bookId")
    Long countByBookId(@Param("bookId") Long bookId);
    
    @Query("SELECT b FROM Borrowing b WHERE b.userId = :userId AND b.returnDate BETWEEN :startDate AND :endDate")
    List<Borrowing> findUserBorrowingsBetweenDates(@Param("userId") Long userId, 
                                                  @Param("startDate") LocalDate startDate, 
                                                  @Param("endDate") LocalDate endDate);
}
