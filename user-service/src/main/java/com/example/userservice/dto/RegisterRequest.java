package com.example.userservice.dto;

import com.example.userservice.entity.Role;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private Role role; // ETUDIANT ou ADMIN
}

