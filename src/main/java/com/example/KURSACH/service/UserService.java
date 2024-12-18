package com.example.KURSACH.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.KURSACH.dto.UserDto;
import com.example.KURSACH.mapper.EntityMapper;
import com.example.KURSACH.model.User;
import com.example.KURSACH.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email уже используется");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }
    @Transactional
    public User updateUserProfile(String email, String fullName, String phoneNumber) {
        User user = getUserByEmail(email);
        user.setFullName(fullName);
        user.setPhoneNumber(phoneNumber);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean verifyPassword(User user, String password) {
        return passwordEncoder.matches(password, user.getPassword());
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = getUserByEmail(email);
        
        if (!verifyPassword(user, oldPassword)) {
            throw new RuntimeException("Неверный текущий пароль");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User currentUser = getUserByEmail(SecurityContextHolder.getContext()
                .getAuthentication().getName());
        
        if (currentUser.getId().equals(id)) {
            throw new RuntimeException("Невозможно удалить текущего пользователя");
        }
    
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Пользователь не найден");
        }
        
        userRepository.deleteById(id);
    }

    @Transactional
    public User updateUser(String email, UserDto userDto) {
        User user = getUserByEmail(email);
        if (userDto.getFullName() != null) {
            user.setFullName(userDto.getFullName());
        }
        if (userDto.getPhoneNumber() != null) {
            user.setPhoneNumber(userDto.getPhoneNumber());
        }
        return userRepository.save(user);
    }
}