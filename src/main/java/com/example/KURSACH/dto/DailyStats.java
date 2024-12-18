package com.example.KURSACH.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {
    private Integer dayOfWeek;
    private Long count;
    private Double occupancyRate;
}