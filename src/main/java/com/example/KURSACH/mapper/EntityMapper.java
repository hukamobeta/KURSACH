package com.example.KURSACH.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.KURSACH.dto.ParkingSpotDto;
import com.example.KURSACH.dto.ReservationDto;
import com.example.KURSACH.dto.ReservationResponse;
import com.example.KURSACH.dto.UserDto;
import com.example.KURSACH.dto.UserRegistrationDto;
import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.model.Reservation;
import com.example.KURSACH.model.User;

@Component
public class EntityMapper {

    public User toUser(UserRegistrationDto dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setFullName(dto.getFullName());
        user.setPhoneNumber(dto.getPhoneNumber());
        return user;
    }

    public UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().name());
        return dto;
    }

    public ParkingSpotDto toParkingSpotDto(ParkingSpot spot) {
        if (spot == null) return null;
        ParkingSpotDto dto = new ParkingSpotDto();
        dto.setId(spot.getId());
        dto.setSpotNumber(spot.getSpotNumber());
        dto.setType(spot.getType());
        dto.setPricePerHour(spot.getPricePerHour());
        dto.setStatus(spot.getStatus());
        return dto;
    }

    public List<ParkingSpotDto> toParkingSpotDtoList(List<ParkingSpot> spots) {
        if (spots == null) return new ArrayList<>();
        return spots.stream()
                   .map(this::toParkingSpotDto)
                   .collect(Collectors.toList());
    }

    public ParkingSpot toParkingSpot(ParkingSpotDto dto) {
        if (dto == null) return null;
        ParkingSpot spot = new ParkingSpot();
        spot.setId(dto.getId());
        spot.setSpotNumber(dto.getSpotNumber());
        spot.setType(dto.getType());
        spot.setPricePerHour(dto.getPricePerHour());
        dto.setStatus(spot.getStatus());
        return spot;
    }

    public Reservation toReservation(ReservationDto dto) {
        Reservation reservation = new Reservation();
        reservation.setStartTime(dto.getStartTime());
        reservation.setEndTime(dto.getEndTime());
        reservation.setVehicleNumber(dto.getVehicleNumber());
        return reservation;
    }

    public ReservationResponse toReservationResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setSpotNumber(reservation.getParkingSpot().getSpotNumber());
        response.setStartTime(reservation.getStartTime());
        response.setEndTime(reservation.getEndTime());
        response.setStatus(reservation.getStatus());
        response.setTotalPrice(reservation.getTotalPrice());
        response.setVehicleNumber(reservation.getVehicleNumber());
        return response;
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().name());
        return dto;
    }
}