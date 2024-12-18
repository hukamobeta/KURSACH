package com.example.KURSACH.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.LastModifiedDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Data;

@Entity
@Table(name = "parking_spots")
@Data
public class ParkingSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String spotNumber;
    
    @Enumerated(EnumType.STRING)
    private SpotType type;
    
    @Enumerated(EnumType.STRING)
    private SpotStatus status = SpotStatus.AVAILABLE; 
    
    private double pricePerHour;
    
    private Double latitude;
    private Double longitude;
    
    @Column(name = "floor")
    private Integer floor = 1;
    
    @Column(name = "section")
    private String section;
    
    @OneToMany(mappedBy = "parkingSpot", cascade = CascadeType.ALL)
    private List<Reservation> reservations;
    
    @Version
    private Long version;

    @LastModifiedDate
    private LocalDateTime lastUpdated;
}