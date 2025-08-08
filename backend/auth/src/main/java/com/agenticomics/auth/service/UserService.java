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
        
        // Handle telephone field - only set if not null and not empty
        String cleanTelephone = null;
        if (telephone != null && !telephone.trim().isEmpty()) {
            cleanTelephone = telephone.trim();
            if (userRepository.existsByTelephone(cleanTelephone)) {
                throw new RuntimeException("Telephone number already exists");
            }
        }
        
        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setTelephone(cleanTelephone); // Set to null if empty, otherwise set the cleaned value
        user.setRole(role);
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
    
    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findUserByUsername(username);
        
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
        if (telephone == null || telephone.trim().isEmpty()) {
            return Optional.empty(); // Cannot authenticate with null/empty telephone
        }
        Optional<User> userOpt = userRepository.findUserByTelephone(telephone.trim());
        
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
        if (telephone == null || telephone.trim().isEmpty()) {
            return false; // Null or empty telephone doesn't exist
        }
        return userRepository.existsByTelephone(telephone.trim());
    }
    
    public String generatePasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findUserByEmail(email);
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
        Optional<User> userOpt = userRepository.findUserByResetToken(resetToken);
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
    
    // Role management methods for PI administrators
    public List<User> getAllActiveUsers() {
        return userRepository.findAllActiveUsers();
    }
    
    public List<User> getActiveNonPIUsers() {
        return userRepository.findActiveNonPIUsers();
    }
    
    public List<User> getAllNonPIUsers() {
        return userRepository.findAllNonPIUsers();
    }
    
    public List<User> getAllDeactivatedUsers() {
        return userRepository.findAllDeactivatedUsers();
    }
    
    public List<User> getActiveUsersByRole(String role) {
        return userRepository.findActiveUsersByRole(role);
    }
    
    public boolean deactivateUser(Long userId, String adminUsername) {
        // Check if the admin is a Lab PI
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty() || !"Lab PI".equals(adminOpt.get().getRole())) {
            throw new RuntimeException("Only Lab PI users can deactivate accounts");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        if ("Lab PI".equals(user.getRole())) {
            throw new RuntimeException("Cannot deactivate Lab PI accounts");
        }
        
        user.setIsActive(false);
        userRepository.save(user);
        return true;
    }
    
    public boolean activateUser(Long userId, String adminUsername) {
        // Check if the admin is a Lab PI
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty() || !"Lab PI".equals(adminOpt.get().getRole())) {
            throw new RuntimeException("Only Lab PI users can activate accounts");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setIsActive(true);
        userRepository.save(user);
        return true;
    }
    
    public boolean isUserActive(String username) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        return userOpt.isPresent();
    }
    
    public boolean isUserPI(String username) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        return userOpt.isPresent() && "Lab PI".equals(userOpt.get().getRole());
    }
} 