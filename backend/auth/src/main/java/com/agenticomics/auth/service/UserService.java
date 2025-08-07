package com.agenticomics.auth.service;

import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User registerUser(String username, String password, String email, String telephone, String role) {
        // Check if user already exists
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        if (telephone != null && !telephone.trim().isEmpty() && userRepository.existsByTelephone(telephone)) {
            throw new RuntimeException("Telephone number already exists");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setTelephone(telephone);
        user.setRole(role);
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
    
    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Update last login time
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                return Optional.of(user);
            }
        }
        
        return Optional.empty();
    }
    
    public Optional<User> authenticateUserByTelephone(String telephone, String password) {
        Optional<User> userOpt = userRepository.findActiveUserByTelephone(telephone);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Update last login time
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                return Optional.of(user);
            }
        }
        
        return Optional.empty();
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findActiveUserByUsername(username);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean existsByTelephone(String telephone) {
        return userRepository.existsByTelephone(telephone);
    }
    
    public String generatePasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findActiveUserByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String resetToken = java.util.UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Token expires in 24 hours
            userRepository.save(user);
            return resetToken;
        }
        return null;
    }
    
    public boolean resetPassword(String resetToken, String newPassword) {
        Optional<User> userOpt = userRepository.findActiveUserByResetToken(resetToken);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
    
    public long getActiveUserCount() {
        return userRepository.countActiveUsers();
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
} 