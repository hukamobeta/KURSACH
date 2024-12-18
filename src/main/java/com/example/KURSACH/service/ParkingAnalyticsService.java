package com.example.KURSACH.service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.model.ReservationStatus;
import com.example.KURSACH.model.SpotStatus;
import com.example.KURSACH.repository.ParkingSpotRepository;
import com.example.KURSACH.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParkingAnalyticsService {
    private final ParkingSpotService parkingSpotService;
    private final ReservationRepository reservationRepository;
    private final ParkingSpotRepository parkingSpotRepository;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalSpots = parkingSpotRepository.count();
        long availableSpots = parkingSpotRepository.countByStatus(SpotStatus.AVAILABLE);
        stats.put("totalSpots", totalSpots);
        stats.put("availableSpots", availableSpots);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        stats.put("hourlyStats", getHourlyStats(startOfDay, endOfDay));
        stats.put("dailyStats", getDailyStats());
        
        return stats;
    }

    private List<Map<String, Object>> getHourlyStats(LocalDateTime start, LocalDateTime end) {
        Map<String, Object> hourlyOccupancy = reservationRepository.getHourlyOccupancy(start, end);
        long totalSpots = parkingSpotRepository.count();
        
        return hourlyOccupancy.entrySet().stream()
            .map(entry -> {
                Map<String, Object> stat = new HashMap<>();
                stat.put("hour", entry.getKey());
                stat.put("occupancyRate", 
                    totalSpots > 0 ? (double)((Long)entry.getValue()) / totalSpots : 0);
                return stat;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getDailyStats() {
        List<Map<String, Object>> dailyStats = new ArrayList<>();
        long totalSpots = parkingSpotRepository.count();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY);

        for (int day = 0; day < 7; day++) {
            LocalDateTime dayStart = startOfWeek.plusDays(day).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = dayStart.plusDays(1);

            long reservationsCount = reservationRepository.countByStartTimeBetweenAndStatus(
                dayStart, dayEnd, ReservationStatus.ACTIVE);

            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("dayOfWeek", day);
            dayStat.put("occupancyRate", totalSpots > 0 ? (double) reservationsCount / totalSpots : 0);
            dailyStats.add(dayStat);
        }

        return dailyStats;
    }

    public Map<String, Object> getOccupancyStats() {
        long totalSpots = parkingSpotRepository.count();
        long occupiedSpots = parkingSpotRepository.countOccupiedSpots();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSpots", totalSpots);
        stats.put("occupiedSpots", occupiedSpots);
        stats.put("occupancyRate", totalSpots > 0 ? (double) occupiedSpots / totalSpots : 0);
        
        return stats;
    }

    public ParkingSpot updateStatus(Long id, String statusStr) {
        ParkingSpot spot = parkingSpotService.getSpotById(id);
        spot.setStatus(SpotStatus.valueOf(statusStr.toUpperCase()));
        return parkingSpotRepository.save(spot);
    }
}