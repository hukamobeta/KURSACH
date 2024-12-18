package com.example.KURSACH.dto;

import com.example.KURSACH.model.SpotStatus;
import com.example.KURSACH.model.SpotType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ParkingSpotDto {
    private Long id;
    
    @NotBlank(message = "Номер места обязателен")
    private String spotNumber;
    
    @NotNull(message = "Тип места обязателен")
    private SpotType type;
    
    @Positive(message = "Цена должна быть положительной")
    private double pricePerHour;
    
    private SpotStatus status; 
}