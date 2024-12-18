package com.example.KURSACH.controller;

import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.example.KURSACH.dto.UserDto;
import com.example.KURSACH.mapper.EntityMapper;
import com.example.KURSACH.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final EntityMapper mapper;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        var user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(mapper.toUserDto(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUser(
            @RequestBody UserDto userDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userService.updateUser(userDetails.getUsername(), userDto);
        return ResponseEntity.ok(mapper.toUserDto(user));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDto userDto) {
        var user = userService.updateUserProfile(
            userDetails.getUsername(),
            userDto.getFullName(),
            userDto.getPhoneNumber()
        );
        return ResponseEntity.ok(mapper.toUserDto(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers().stream()
                .map(user -> mapper.toUserDto(user))
                .collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}