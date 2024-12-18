package com.example.KURSACH.dto;

import java.time.LocalDateTime;

import com.example.KURSACH.model.ReservationStatus;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationDto {
    private Long id;
    
    @NotNull(message = "ID места обязательно")
    private Long spotId;
    
    @Future(message = "Время начала должно быть в будущем")
    @NotNull(message = "Время начала обязательно")
    private LocalDateTime startTime;
    
    @Future(message = "Время окончания должно быть в будущем")
    @NotNull(message = "Время окончания обязательно")
    private LocalDateTime endTime;
    
    @NotBlank(message = "Номер автомобиля обязателен")
    private String vehicleNumber;
    
    private ReservationStatus status;
    private double totalPrice;
}