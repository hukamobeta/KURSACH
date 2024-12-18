package com.example.KURSACH.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.KURSACH.dto.ParkingSpotDto;
import com.example.KURSACH.mapper.EntityMapper;
import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.service.ParkingSpotService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/spots")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ParkingSpotController {

    private final ParkingSpotService parkingSpotService;
    private final EntityMapper mapper;

    @GetMapping
    public ResponseEntity<List<ParkingSpotDto>> getAllSpots(
            @RequestParam(required = false) String type) {
        List<ParkingSpotDto> spots = parkingSpotService.getAllSpots();
        if (type != null) {
            spots = spots.stream()
                    .filter(spot -> spot.getType().toString().equals(type.toUpperCase()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(spots);
    }

    @PostMapping
    public ResponseEntity<ParkingSpotDto> createSpot(@RequestBody @Valid ParkingSpotDto spotDto) {
        ParkingSpot spot = parkingSpotService.createSpot(mapper.toParkingSpot(spotDto));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toParkingSpotDto(spot));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingSpotDto> getSpot(@PathVariable Long id) {
        var spot = parkingSpotService.getSpotById(id);
        return ResponseEntity.ok(mapper.toParkingSpotDto(spot));
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<ParkingSpotDto>> getAvailableSpots(
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime) {
        return ResponseEntity.ok(
            parkingSpotService.getAvailableSpots(startTime, endTime).stream()
                .map(mapper::toParkingSpotDto)
                .collect(Collectors.toList())
        );
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSpots", parkingSpotService.countTotal());
        stats.put("availableSpots", parkingSpotService.countAvailable());
        
        stats.put("hourlyStats", parkingSpotService.getHourlyStats(LocalDateTime.now().minusDays(7)));
        
        stats.put("dailyStats", parkingSpotService.getDailyStats(LocalDateTime.now().minusDays(30)));
        
        return ResponseEntity.ok(stats);
    }
    @PatchMapping("/{id}/status")
    public ResponseEntity<ParkingSpotDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        ParkingSpot spot = parkingSpotService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(mapper.toParkingSpotDto(spot));
    }
}
