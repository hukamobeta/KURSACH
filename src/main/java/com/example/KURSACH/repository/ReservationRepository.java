package com.example.KURSACH.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.KURSACH.model.Reservation;
import com.example.KURSACH.model.ReservationStatus;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByUserEmail(String email);

    @Query("SELECT r FROM Reservation r " +
        "WHERE r.parkingSpot.id = :spotId " +
        "AND r.status = 'ACTIVE' " +
        "AND (" +
        "(:startTime BETWEEN r.startTime AND r.endTime) OR " +
        "(:endTime BETWEEN r.startTime AND r.endTime) OR " +
        "(r.startTime BETWEEN :startTime AND :endTime)" +
        ")")
    List<Reservation> findOverlappingReservations(
        @Param("spotId") Long spotId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    @Query(value = """
        SELECT HOUR(r.start_time) as hour, 
               COUNT(*) as count 
        FROM reservations r 
        WHERE r.start_time BETWEEN :start AND :end 
        GROUP BY HOUR(r.start_time)
        """, 
        nativeQuery = true)

    List<Map<String, Object>> findHourlyOccupancyStats(
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
     @Query("SELECT COUNT(r) FROM Reservation r " +
           "WHERE r.startTime <= ?2 AND r.endTime >= ?1 AND r.status = ?3")
    long countByStartTimeBetweenAndStatus(LocalDateTime start, LocalDateTime end, ReservationStatus status);

    @Query(value = """
        SELECT date_part('hour', ts) as hour,
        COUNT(DISTINCT r.parking_spot_id) as occupied_spots
        FROM generate_series(:start, :end, interval '1 hour') ts
        LEFT JOIN reservations r ON r.status = 'ACTIVE'
        AND ts BETWEEN r.start_time AND r.end_time
        GROUP BY date_part('hour', ts)
        ORDER BY hour
        """, nativeQuery = true)
    Map<String, Object> getHourlyOccupancy(@Param("start") LocalDateTime start, 
                                        @Param("end") LocalDateTime end);

    @Query(value = """
        SELECT EXTRACT(DOW FROM ts)::integer as day,
        COUNT(DISTINCT r.parking_spot_id) as occupied_spots
        FROM generate_series(:start, :end, interval '1 day') ts
        LEFT JOIN reservations r ON r.status = 'ACTIVE'
        AND ts BETWEEN r.start_time AND r.end_time
        GROUP BY EXTRACT(DOW FROM ts)
        ORDER BY day
        """, nativeQuery = true)
    Map<String, Object> getDailyOccupancy(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);
}
