package com.example.KURSACH.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ParkingUpdateMessage {
    private Long spotId;
    private boolean isAvailable;
    private LocalDateTime timestamp = LocalDateTime.now();
}