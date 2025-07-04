package com.example.searchservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Bean("searchServiceCorsConfigurationSource")
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set specific allowed origins (cannot use patterns with credentials)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost",
            "http://localhost:80", 
            "http://localhost:3000",
            "http://frontend",
            "http://frontend:80"
        ));
        
        // Allow all common HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        // Allow all headers
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials for potential future authentication
        configuration.setAllowCredentials(true);
        
        // Expose common headers including Authorization
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "Content-Length", "X-Requested-With"
        ));
        
        // Cache preflight responses for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
