package com.example.KURSACH.exception;

public class CustomResourceNotFoundException extends RuntimeException {
    public CustomResourceNotFoundException(String message) {
        super(message);
    }
}
