package com.example.KURSACH.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.example.KURSACH.dto.ParkingSpotDto;
import com.example.KURSACH.dto.ReservationDto;
import com.example.KURSACH.service.ParkingSpotService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class WebSocketController {
    
    private final ParkingSpotService parkingSpotService;
    
    public WebSocketController(ParkingSpotService parkingSpotService) {
        this.parkingSpotService = parkingSpotService;
    }

    @MessageMapping("/parking.getSpots")
    @SendTo("/topic/parking")
    public List<ParkingSpotDto> getParkingSpots() {
        return parkingSpotService.getAllSpots();
    }

    @MessageMapping("/parking.reserve")
    @SendTo("/topic/parking.updates")
    public ParkingSpotDto reserveSpot(ReservationDto request) {
        return parkingSpotService.reserveSpot(request);
    }

    @MessageExceptionHandler
    @SendTo("/topic/errors")
    public String handleException(Throwable exception) {
        log.error("WS Error:", exception);
        return exception.getMessage();
    }
}