package com.example.KURSACH.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.KURSACH.dto.DailyStats;
import com.example.KURSACH.dto.HourlyStats;
import com.example.KURSACH.dto.ParkingSpotDto;
import com.example.KURSACH.dto.ReservationDto;
import com.example.KURSACH.exception.CustomResourceNotFoundException;
import com.example.KURSACH.mapper.EntityMapper;
import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.model.SpotStatus;
import com.example.KURSACH.repository.ParkingSpotRepository;
import com.example.KURSACH.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParkingSpotService {
    private final ParkingSpotRepository parkingSpotRepository;
    private final ReservationRepository reservationRepository;
    private final EntityMapper entityMapper;

    public List<ParkingSpotDto> getAllSpots() {
        return entityMapper.toParkingSpotDtoList(parkingSpotRepository.findAll());
    }

    public List<ParkingSpot> getAvailableSpots() {
        return parkingSpotRepository.findByStatus(SpotStatus.AVAILABLE);
    }

    public ParkingSpot updateSpot(Long id, ParkingSpot updatedSpot) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new CustomResourceNotFoundException("Parking spot not found"));
        
        spot.setSpotNumber(updatedSpot.getSpotNumber());
        spot.setType(updatedSpot.getType());
        spot.setPricePerHour(updatedSpot.getPricePerHour());
        spot.setStatus(updatedSpot.getStatus());        
        return parkingSpotRepository.save(spot);
    }

    public List<ParkingSpot> getAvailableSpots(LocalDateTime startTime, LocalDateTime endTime) {
        validateTimeRange(startTime, endTime);
        return parkingSpotRepository.findByStatus(SpotStatus.AVAILABLE).stream()
                .filter(spot -> isSpotAvailableForPeriod(spot.getId(), startTime, endTime))
                .collect(Collectors.toList());
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("Время начала должно быть раньше времени окончания");
        }
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Нельзя бронировать в прошлом");
        }
    }

    private boolean isSpotAvailableForPeriod(Long spotId, LocalDateTime start, LocalDateTime end) {
        return reservationRepository.findOverlappingReservations(spotId, start, end).isEmpty();
    }

    public ParkingSpot createSpot(ParkingSpot spot) { 
        return parkingSpotRepository.save(spot);
    }

    public ParkingSpot getSpotById(Long id) {
        return parkingSpotRepository.findById(id)
                .orElseThrow(() -> new CustomResourceNotFoundException("Parking spot not found"));
    }

    public long countTotal() {
        return parkingSpotRepository.count();
    }

    public long countAvailable() {
        return parkingSpotRepository.findByStatus(SpotStatus.AVAILABLE).size();
    }    

    public List<HourlyStats> getHourlyStats(LocalDateTime since) {
        try {
            return parkingSpotRepository.getHourlyStatsRaw(since).stream()
                .map(row -> new HourlyStats(
                    ((Number) row[0]).intValue(),
                    ((Number) row[1]).longValue(),
                    ((Number) row[2]).doubleValue()
                ))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting hourly stats: ", e);
            return Collections.emptyList();
        }
    }

    public List<DailyStats> getDailyStats(LocalDateTime since) {
        try {
            return parkingSpotRepository.getDailyStatsRaw(since).stream()
                .map(row -> new DailyStats(
                    ((Number) row[0]).intValue(),
                    ((Number) row[1]).longValue(),
                    ((Number) row[2]).doubleValue()
                ))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting daily stats: ", e);
            return Collections.emptyList();
        }
    }

    public ParkingSpotDto reserveSpot(ReservationDto request) {
        throw new UnsupportedOperationException("Unimplemented method 'reserveSpot'");
    }

    public ParkingSpot updateStatus(Long id, String statusStr) {
        ParkingSpot spot = getSpotById(id);
        spot.setStatus(SpotStatus.valueOf(statusStr.toUpperCase()));
        return parkingSpotRepository.save(spot);
    }
}
