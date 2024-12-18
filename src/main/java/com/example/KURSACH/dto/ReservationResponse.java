package com.example.KURSACH.dto;

import java.time.LocalDateTime;

import com.example.KURSACH.model.ReservationStatus;

import lombok.Data;

@Data
public class ReservationResponse {
    private Long id;
    private String spotNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationStatus status;
    private double totalPrice;
    private String vehicleNumber;
}