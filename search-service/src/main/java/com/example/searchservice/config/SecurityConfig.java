package com.example.searchservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // allow everything
                )
                .csrf(csrf -> csrf.disable()) // disable CSRF for H2
                .headers(headers -> headers.disable()); // allow H2 in iframe

        return http.build();
    }
}
