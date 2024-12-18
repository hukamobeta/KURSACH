package com.example.KURSACH.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.KURSACH.dto.DailyStats;
import com.example.KURSACH.dto.HourlyStats;
import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.model.SpotStatus;
import com.example.KURSACH.model.SpotType;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    
    List<ParkingSpot> findByStatus(SpotStatus status);
    List<ParkingSpot> findByType(SpotType type);

    @Query(value = """
        SELECT 
            CAST(EXTRACT(HOUR FROM r.start_time) AS INTEGER) as hour,
            COUNT(r.id) as count,
            CAST(SUM(CASE WHEN ps.status = 'OCCUPIED' THEN 1.0 ELSE 0.0 END) / 
                NULLIF(COUNT(ps.id), 0) AS FLOAT) as occupancy_rate
        FROM parking_spots ps
        LEFT JOIN reservations r ON ps.id = r.spot_id
        WHERE r.start_time >= :startDate
        GROUP BY EXTRACT(HOUR FROM r.start_time)
        ORDER BY hour
    """, nativeQuery = true)
    List<Object[]> getHourlyStatsRaw(@Param("startDate") LocalDateTime startDate);

    @Query(value = """
        SELECT 
            CAST(EXTRACT(DOW FROM r.start_time) AS INTEGER) as day,
            COUNT(r.id) as count,
            CAST(SUM(CASE WHEN ps.status = 'OCCUPIED' THEN 1.0 ELSE 0.0 END) / 
                NULLIF(COUNT(ps.id), 0) AS FLOAT) as occupancy_rate
        FROM parking_spots ps
        LEFT JOIN reservations r ON ps.id = r.spot_id
        WHERE r.start_time >= :startDate
        GROUP BY EXTRACT(DOW FROM r.start_time)
        ORDER BY day
    """, nativeQuery = true)
    List<Object[]> getDailyStatsRaw(@Param("startDate") LocalDateTime startDate);


    @Query(value = """
        SELECT 
            h.hour::integer as hour,
            h.count::bigint,
            h.occupancy_rate::double precision
        FROM (
            SELECT EXTRACT(HOUR FROM r.start_time) as hour,
                COUNT(r.id) as count,
                CAST(SUM(CASE WHEN ps.status = 'OCCUPIED' THEN 1.0 ELSE 0.0 END) / 
                    NULLIF(COUNT(ps.id), 0) AS float) as occupancy_rate
            FROM parking_spots ps
            LEFT JOIN reservations r ON ps.id = r.spot_id
            WHERE r.start_time >= :startDate
            GROUP BY EXTRACT(HOUR FROM r.start_time)
        ) h
    """, nativeQuery = true)
    List<HourlyStats> getHourlyStats(@Param("startDate") LocalDateTime startDate);

    @Query(value = """
        SELECT 
            d.day::integer as day,
            d.count::bigint,
            d.occupancy_rate::double precision
        FROM (
            SELECT EXTRACT(DOW FROM r.start_time) as day,
                COUNT(r.id) as count,
                CAST(SUM(CASE WHEN ps.status = 'OCCUPIED' THEN 1.0 ELSE 0.0 END) / 
                    NULLIF(COUNT(ps.id), 0) AS float) as occupancy_rate
            FROM parking_spots ps
            LEFT JOIN reservations r ON ps.id = r.spot_id
            WHERE r.start_time >= :startDate
            GROUP BY EXTRACT(DOW FROM r.start_time)
        ) d
    """, nativeQuery = true)
    List<DailyStats> getDailyStats(@Param("startDate") LocalDateTime startDate);

    long countByStatus(SpotStatus status);

    @Query("SELECT COUNT(p) FROM ParkingSpot p WHERE p.status = 'OCCUPIED'")
    long countOccupiedSpots();
}