package com.example.KURSACH.exception;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ApiError {
    private LocalDateTime timestamp;
    private int status;
    private String message;
    private List<String> errors;

    public ApiError(int status, String message, List<String> errors) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.message = message;
        this.errors = errors;
    }
}