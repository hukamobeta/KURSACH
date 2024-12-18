package com.example.KURSACH.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.KURSACH.dto.ReservationDto;
import com.example.KURSACH.exception.BadRequestException;
import com.example.KURSACH.handler.ParkingWebSocketHandler;
import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.model.Reservation;
import com.example.KURSACH.model.ReservationStatus;
import com.example.KURSACH.model.SpotStatus;
import com.example.KURSACH.model.User;
import com.example.KURSACH.repository.ParkingSpotRepository;
import com.example.KURSACH.repository.ReservationRepository;
import com.example.KURSACH.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;
    private final ParkingWebSocketHandler webSocketHandler;


    @Transactional
    public Reservation createReservation(ReservationDto dto, String email) {
        ParkingSpot spot = parkingSpotRepository.findById(dto.getSpotId())
            .orElseThrow(() -> new RuntimeException("Место не найдено"));
            
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    
        validateReservationTime(dto.getStartTime(), dto.getEndTime());
        checkSpotAvailability(spot, dto.getStartTime(), dto.getEndTime());
    
        Reservation reservation = new Reservation();
        reservation.setParkingSpot(spot);
        reservation.setUser(user);
        reservation.setStartTime(dto.getStartTime());
        reservation.setEndTime(dto.getEndTime());
        reservation.setVehicleNumber(dto.getVehicleNumber());
        reservation.setStatus(ReservationStatus.ACTIVE);
    
        Duration duration = Duration.between(dto.getStartTime(), dto.getEndTime());
        long minutes = duration.toMinutes();
        double hours = Math.ceil(minutes / 60.0);
        double price = hours * spot.getPricePerHour();
        reservation.setTotalPrice(price);
    
        spot.setStatus(SpotStatus.OCCUPIED);
        parkingSpotRepository.save(spot);
        
        Reservation saved = reservationRepository.save(reservation);
        
        webSocketHandler.sendSpotUpdate(spot);
        webSocketHandler.sendReservationNotification(saved);
        
        return saved;
    }


    @Transactional
    public void cancelReservation(Long id, String email) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Бронирование не найдено"));

        if (!reservation.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Нет прав на отмену этого бронирования");
        }

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new RuntimeException("Невозможно отменить это бронирование");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        
        ParkingSpot spot = reservation.getParkingSpot();
        spot.setStatus(SpotStatus.AVAILABLE);
        parkingSpotRepository.save(spot);
        
        reservationRepository.save(reservation);
    }

    private void validateReservationTime(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();
        if (start.isBefore(now)) {
            throw new BadRequestException("Время начала должно быть в будущем");
        }
        if (end.isBefore(start)) {
            throw new BadRequestException("Время окончания должно быть после начала");
        }
    }

    private void checkSpotAvailability(ParkingSpot spot, LocalDateTime start, LocalDateTime end) {
        if (spot.getStatus() != SpotStatus.AVAILABLE) {
            throw new BadRequestException("Место уже занято");
        }
        
        boolean hasOverlapping = reservationRepository
            .findOverlappingReservations(spot.getId(), start, end)
            .stream()
            .anyMatch(r -> r.getStatus() == ReservationStatus.ACTIVE);
            
        if (hasOverlapping) {
            throw new BadRequestException("На это время уже есть бронирование");
        }
    }

    public List<Reservation> getUserReservations(String userEmail) {
        return reservationRepository.findByUserEmail(userEmail);
    }
}