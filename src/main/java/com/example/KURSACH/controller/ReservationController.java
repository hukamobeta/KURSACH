package com.example.KURSACH.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.KURSACH.dto.ReservationDto;
import com.example.KURSACH.dto.ReservationResponse;
import com.example.KURSACH.mapper.EntityMapper;
import com.example.KURSACH.service.ReservationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;
    private final EntityMapper mapper;

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody ReservationDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        var reservation = reservationService.createReservation(dto, userDetails.getUsername());
        return ResponseEntity.ok(mapper.toReservationResponse(reservation));
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getUserReservations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            reservationService.getUserReservations(userDetails.getUsername()).stream()
                .map(mapper::toReservationResponse)
                .collect(Collectors.toList())
        );
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        reservationService.cancelReservation(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}