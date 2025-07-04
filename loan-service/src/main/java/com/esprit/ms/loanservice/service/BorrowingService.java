package com.esprit.ms.loanservice.service;

import com.esprit.ms.loanservice.repository.BorrowingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BorrowingService {

    private final BorrowingRepository borrowingRepository;
    private final RestTemplate restTemplate;

    @Value("${USER_SERVICE_URL:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${BOOKS_SERVICE_URL:http://localhost:8085}")
    private String booksServiceUrl;

    @Value("${GAMIFICATION_SERVICE_URL:http://localhost:3000}")
    private String gamificationServiceUrl;

    /**
     * Validate if user exists by calling user-service
     */
    public boolean validateUser(Long userId) {
        try {
            String url = userServiceUrl + "/api/user/validate/" + userId;
            Boolean result = restTemplate.getForObject(url, Boolean.class);
            return result != null && result;
        } catch (RestClientException e) {
            log.warn("Failed to validate user {}: {}", userId, e.getMessage());
            // In case of service unavailability, allow the operation (fail-open)
            return true;
        }
    }

    /**
     * Validate if book exists by calling books-management-service
     */
    public boolean validateBook(Long bookId) {
        try {
            String url = booksServiceUrl + "/api/books/validate/" + bookId;
            Boolean result = restTemplate.getForObject(url, Boolean.class);
            return result != null && result;
        } catch (RestClientException e) {
            log.warn("Failed to validate book {}: {}", bookId, e.getMessage());
            // In case of service unavailability, allow the operation (fail-open)
            return true;
        }
    }

    /**
     * Check if the book is already borrowed by the user
     */
    public boolean isBookAlreadyBorrowed(Long userId, Long bookId) {
        return borrowingRepository.findActiveBorrowingByUserAndBook(userId, bookId).isPresent();
    }

    /**
     * Notify gamification service about user actions
     */
    public void notifyGamificationService(Long userId, String action) {
        try {
            String url = gamificationServiceUrl + "/api/achievements/user-action";
            
            Map<String, Object> actionData = new HashMap<>();
            actionData.put("userId", userId);
            actionData.put("action", action);
            actionData.put("timestamp", LocalDate.now());
            
            restTemplate.postForObject(url, actionData, Object.class);
            log.info("Notified gamification service about action {} for user {}", action, userId);
        } catch (RestClientException e) {
            log.warn("Failed to notify gamification service: {}", e.getMessage());
            // Non-critical failure, continue operation
        }
    }

    /**
     * Get borrowing statistics for a user
     */
    public Map<String, Object> getUserBorrowingStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalBorrowings", borrowingRepository.countByUserId(userId));
        stats.put("returnedBooks", borrowingRepository.countReturnedBooksByUserId(userId));
        stats.put("activeBorrowings", borrowingRepository.countActiveBorrowingsByUserId(userId));
        
        // Calculate recent activity (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        
        int recentReturns = borrowingRepository.findUserBorrowingsBetweenDates(userId, thirtyDaysAgo, today).size();
        stats.put("recentReturns", recentReturns);
        
        return stats;
    }

    /**
     * Get book popularity statistics
     */
    public Map<String, Object> getBookStats(Long bookId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalBorrowings", borrowingRepository.countByBookId(bookId));
        
        return stats;
    }
}
