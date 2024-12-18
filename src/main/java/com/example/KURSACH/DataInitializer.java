package com.example.KURSACH;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.KURSACH.model.ParkingSpot;
import com.example.KURSACH.model.Reservation;
import com.example.KURSACH.model.ReservationStatus;
import com.example.KURSACH.model.SpotStatus;
import com.example.KURSACH.model.SpotType;
import com.example.KURSACH.model.User;
import com.example.KURSACH.model.UserRole;
import com.example.KURSACH.repository.ParkingSpotRepository;
import com.example.KURSACH.repository.ReservationRepository;
import com.example.KURSACH.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeParkingSpots();
        initializeReservations();
    }

    private void initializeUsers() {
        log.info("Initializing users...");
        
        String adminEmail = "admin@example.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(UserRole.ADMIN);
            admin.setFullName("Администратор");
            admin.setPhoneNumber("+7(999)888-77-66");
            userRepository.save(admin);
            log.info("Admin created");
        }

        List<User> testUsers = new ArrayList<>();
        
        // Пользователь 1
        if (userRepository.findByEmail("user1@example.com").isEmpty()) {
            User user1 = new User();
            user1.setEmail("user1@example.com");
            user1.setPassword(passwordEncoder.encode("user1"));
            user1.setRole(UserRole.USER);
            user1.setFullName("Иванов Иван");
            user1.setPhoneNumber("+7(999)111-11-11");
            testUsers.add(user1);
        }

        // Пользователь 2
        if (userRepository.findByEmail("user2@example.com").isEmpty()) {
            User user2 = new User();
            user2.setEmail("user2@example.com");
            user2.setPassword(passwordEncoder.encode("user2"));
            user2.setRole(UserRole.USER);
            user2.setFullName("Петров Петр");
            user2.setPhoneNumber("+7(999)222-22-22");
            testUsers.add(user2);
        }

        if (!testUsers.isEmpty()) {
            userRepository.saveAll(testUsers);
            log.info("Test users created");
        }
    }

    private void initializeParkingSpots() {
        log.info("Initializing parking spots...");
        
        if (parkingSpotRepository.count() == 0) {
            List<ParkingSpot> spots = new ArrayList<>();
            
            // Секция A - микс стандартных и VIP мест
            spots.addAll(createSpotsForSection("A", new SpotDistribution[]{
                new SpotDistribution(1, 3, SpotType.VIP, 200.0),      
                new SpotDistribution(4, 7, SpotType.STANDARD, 100.0), 
                new SpotDistribution(8, 9, SpotType.ELECTRIC, 150.0), 
                new SpotDistribution(10, 10, SpotType.VIP, 200.0)     
            }));
    
            // Секция B - премиум секция
            spots.addAll(createSpotsForSection("B", new SpotDistribution[]{
                new SpotDistribution(1, 3, SpotType.VIP, 250.0),     
                new SpotDistribution(4, 4, SpotType.ELECTRIC, 200.0), 
                new SpotDistribution(5, 6, SpotType.VIP, 250.0)      
            }));
    
            // Секция C - эко-секция
            spots.addAll(createSpotsForSection("C", new SpotDistribution[]{
                new SpotDistribution(1, 4, SpotType.ELECTRIC, 150.0), 
                new SpotDistribution(5, 6, SpotType.STANDARD, 120.0)  
            }));
    
            // Секция D - специальная секция
            spots.addAll(createSpotsForSection("D", new SpotDistribution[]{
                new SpotDistribution(1, 2, SpotType.DISABLED, 80.0),  
                new SpotDistribution(3, 4, SpotType.STANDARD, 100.0), 
                new SpotDistribution(5, 5, SpotType.ELECTRIC, 150.0)  
            }));
    
            parkingSpotRepository.saveAll(spots);
            log.info("Parking spots created");
        }
    }

    private void initializeReservations() {
        log.info("Initializing reservations...");
        
        if (reservationRepository.count() == 0) {
            List<User> users = userRepository.findAll();
            List<ParkingSpot> spots = parkingSpotRepository.findAll();
            LocalDateTime now = LocalDateTime.now();
            
            List<Reservation> reservations = new ArrayList<>();

            // Для первого пользователя
            User user1 = users.stream()
                .filter(u -> "user1@example.com".equals(u.getEmail()))
                .findFirst()
                .orElse(null);

            if (user1 != null) {
                // Активные бронирования
                reservations.add(createReservation(user1, spots.get(0), 
                    now.minusHours(1), now.plusHours(2), "А111АА777", ReservationStatus.ACTIVE));
                reservations.add(createReservation(user1, spots.get(1), 
                    now.plusDays(1), now.plusDays(1).plusHours(3), "А111АА777", ReservationStatus.ACTIVE));

                // Завершенные бронирования
                reservations.add(createReservation(user1, spots.get(2), 
                    now.minusDays(1), now.minusDays(1).plusHours(2), "А111АА777", ReservationStatus.COMPLETED));
                reservations.add(createReservation(user1, spots.get(3), 
                    now.minusDays(2), now.minusDays(2).plusHours(4), "А111АА777", ReservationStatus.COMPLETED));
            }

            // Для второго пользователя
            User user2 = users.stream()
                .filter(u -> "user2@example.com".equals(u.getEmail()))
                .findFirst()
                .orElse(null);

            if (user2 != null) {
                // Активные бронирования
                reservations.add(createReservation(user2, spots.get(4), 
                    now.plusHours(2), now.plusHours(5), "В222ВВ777", ReservationStatus.ACTIVE));
                
                // Завершенные бронирования
                reservations.add(createReservation(user2, spots.get(5), 
                    now.minusDays(3), now.minusDays(3).plusHours(3), "В222ВВ777", ReservationStatus.COMPLETED));
                
                // Отмененные бронирования
                reservations.add(createReservation(user2, spots.get(6), 
                    now.minusDays(1), now.minusDays(1).plusHours(2), "В222ВВ777", ReservationStatus.CANCELLED));
            }
            // Для админа
            User admin = users.stream()
                .filter(u -> "admin@example.com".equals(u.getEmail()))
                .findFirst()
                .orElse(null);

            if (admin != null) {
                // Активные бронирования
                reservations.add(createReservation(admin, spots.get(7), 
                    now.plusHours(1), now.plusHours(4), "М777ММ777", ReservationStatus.ACTIVE));
                
                // Завершенные бронирования
                reservations.add(createReservation(admin, spots.get(8), 
                    now.minusDays(4), now.minusDays(4).plusHours(5), "М777ММ777", ReservationStatus.COMPLETED));
                reservations.add(createReservation(admin, spots.get(9), 
                    now.minusDays(5), now.minusDays(5).plusHours(3), "М777ММ777", ReservationStatus.COMPLETED));
                
                // Отмененное бронирование
                reservations.add(createReservation(admin, spots.get(10), 
                    now.minusDays(2), now.minusDays(2).plusHours(2), "М777ММ777", ReservationStatus.CANCELLED));
            }
            reservationRepository.saveAll(reservations);
            log.info("Test reservations created");
            System.out.println("Server timezone: " + TimeZone.getDefault().getID());
            System.out.println("Current server time: " + LocalDateTime.now());
        }
    }

    private Reservation createReservation(User user, ParkingSpot spot, 
                                        LocalDateTime start, LocalDateTime end, 
                                        String vehicleNumber, ReservationStatus status) {
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setParkingSpot(spot);
        reservation.setStartTime(start);
        reservation.setEndTime(end);
        reservation.setStatus(status);
        reservation.setVehicleNumber(vehicleNumber);

        // Рассчитываем стоимость
        long hours = java.time.Duration.between(start, end).toHours();
        if (hours < 1) hours = 1; // Минимум 1 час
        reservation.setTotalPrice(spot.getPricePerHour() * hours);

        // Обновляем статус места при активном бронировании
        if (status == ReservationStatus.ACTIVE) {
        spot.setStatus(SpotStatus.OCCUPIED);
        parkingSpotRepository.save(spot);
        }

        return reservation;
    }
    
    private static class SpotDistribution {
        final int startNumber;
        final int endNumber;
        final SpotType type;
        final double price;
    
        SpotDistribution(int startNumber, int endNumber, SpotType type, double price) {
            this.startNumber = startNumber;
            this.endNumber = endNumber;
            this.type = type;
            this.price = price;
        }
    }
    
    private List<ParkingSpot> createSpotsForSection(String section, SpotDistribution[] distributions) {
        List<ParkingSpot> sectionSpots = new ArrayList<>();
        
        for (SpotDistribution dist : distributions) {
            for (int i = dist.startNumber; i <= dist.endNumber; i++) {
                ParkingSpot spot = new ParkingSpot();
                spot.setSpotNumber(section + i);
                spot.setType(dist.type);
                spot.setStatus(SpotStatus.AVAILABLE);
                spot.setPricePerHour(dist.price);
                sectionSpots.add(spot);
            }
        }
        
        return sectionSpots;
    }
}