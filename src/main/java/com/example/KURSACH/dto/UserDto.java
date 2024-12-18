package com.example.KURSACH.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    @NotBlank(message = "Email обязателен")
    @Email(message = "Неверный формат email")
    private String email;
    @NotBlank(message = "Пароль обязателен")
    private String password;
    @NotBlank(message = "Имя обязательно")
    private String fullName;
    private String phoneNumber;
    private String role;
}