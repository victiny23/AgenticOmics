package com.agenticomics.auth.config;

import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.repository.UserRepository;
import com.agenticomics.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializationConfig {

    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * Initialize database with sample data only if empty
     * This ensures no real user data is committed to the repository
     */
    @Bean
    @Profile("!prod") // Only run in non-production environments
    public CommandLineRunner initializeSampleData() {
        return args -> {
            if (userRepository.count() == 0) {
                log.info("Initializing database with sample data...");
                createSampleUsers();
                log.info("Sample data initialization completed");
            } else {
                log.info("Database already contains data, skipping sample initialization");
            }
        };
    }

    private void createSampleUsers() {
        // Create sample admin user
        User adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setPassword(userService.encodePassword("admin123"));
        adminUser.setEmail("admin@agenticomics.com");
        adminUser.setTelephone("+1234567890");
        adminUser.setRole("Lab PI");
        adminUser.setIsActive(true);
        adminUser.setCreatedAt(LocalDateTime.now());
        adminUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(adminUser);

        // Create sample demo user
        User demoUser = new User();
        demoUser.setUsername("demo");
        demoUser.setPassword(userService.encodePassword("demo123"));
        demoUser.setEmail("demo@agenticomics.com");
        demoUser.setTelephone("+1987654321");
        demoUser.setRole("PhD student");
        demoUser.setIsActive(true);
        demoUser.setCreatedAt(LocalDateTime.now());
        demoUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(demoUser);

        log.info("Created sample users: admin/admin123, demo/demo123");
    }
} 