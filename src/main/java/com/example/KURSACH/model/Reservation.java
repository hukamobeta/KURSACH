package com.example.KURSACH.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "spot_id", nullable = false)
    private ParkingSpot parkingSpot;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    @Column(nullable = false)
    private LocalDateTime endTime;
    
    private String vehicleNumber;
    
    @Enumerated(EnumType.STRING)
    private ReservationStatus status = ReservationStatus.PENDING;
    
    private double totalPrice;
}
