package com.example.KURSACH.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationDto {
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    @Size(min = 6)
    private String password;
    
    @NotBlank
    private String passwordConfirm;
    
    @NotBlank
    private String fullName;
    
    @Pattern(regexp = "\\d{10}")
    private String phoneNumber;
}