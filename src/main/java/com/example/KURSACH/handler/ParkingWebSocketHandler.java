package com.example.KURSACH.handler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.model.Reservation;
import com.example.KURSACH.model.SpotStatus;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ParkingWebSocketHandler {
    
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public void sendSpotUpdate(ParkingSpot spot) {
        ParkingUpdateMessage message = new ParkingUpdateMessage(
            "SPOT_UPDATE",
            spot.getId(),
            spot.getStatus() == SpotStatus.AVAILABLE 
        );
        try {
            String payload = objectMapper.writeValueAsString(message);
            sessions.forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(payload));
                    }
                } catch (IOException e) {
                    log.error("Error sending message", e);
                }
            });
        } catch (IOException e) {
            log.error("Error serializing message", e);
        }
    }

    public void sendReservationNotification(Reservation reservation) {
        ReservationMessage message = new ReservationMessage(
            "NEW_RESERVATION",
            reservation.getId(),
            reservation.getParkingSpot().getId(),
            reservation.getStartTime(),
            reservation.getEndTime()
        );
        try {
            String payload = objectMapper.writeValueAsString(message);
            sessions.forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(payload));
                    }
                } catch (IOException e) {
                    log.error("Error sending message", e);
                }
            });
        } catch (IOException e) {
            log.error("Error serializing message", e);
        }
    }

    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("New WebSocket connection: {}", session.getId());
    }

    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("WebSocket connection closed: {}", session.getId());
    }
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class ParkingUpdateMessage {
    private String type;
    private Long spotId;
    private boolean available;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class ReservationMessage {
    private String type;
    private Long reservationId;
    private Long spotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}