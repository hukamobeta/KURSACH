package com.example.KURSACH.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.KURSACH.dto.LoginDto;
import com.example.KURSACH.dto.UserRegistrationDto;
import com.example.KURSACH.mapper.EntityMapper;
import com.example.KURSACH.security.JwtService;
import com.example.KURSACH.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final EntityMapper mapper;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDto registrationDto) {
        if (!registrationDto.getPassword().equals(registrationDto.getPasswordConfirm())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Пароли не совпадают"));
        }
        
        var user = userService.registerUser(mapper.toUser(registrationDto));
        String token = jwtService.generateToken(
            new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), 
                java.util.Collections.emptyList()
            )
        );
        
        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", mapper.toUserDto(user)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
            );
            
            var user = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(user);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "message", "Success"
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Неверные учетные данные пользователя"));
        }
    }
    @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        return ResponseEntity.ok().build();
    }
}