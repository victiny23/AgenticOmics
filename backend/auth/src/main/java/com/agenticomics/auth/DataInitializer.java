package com.agenticomics.auth;

import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only create sample users if no users exist
        if (userRepository.count() == 0) {
            createSampleUsers();
        }
    }

    private void createSampleUsers() {
        // Create admin user with secure password from environment or default
        User admin = new User();
        admin.setUsername("admin");
        // Use environment variable or generate secure default
        String adminPassword = System.getenv("ADMIN_PASSWORD");
        if (adminPassword == null || adminPassword.trim().isEmpty()) {
            // Generate a secure random password if not provided
            adminPassword = generateSecurePassword();
            System.out.println("⚠️  WARNING: No ADMIN_PASSWORD environment variable set!");
            System.out.println("Generated secure admin password: " + adminPassword);
            System.out.println("Please set ADMIN_PASSWORD environment variable for production use.");
        }
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setEmail("admin@agenticomics.com");
        admin.setTelephone("+1234567890");
        admin.setRole("Super Admin");
        // Super Admin should not have any lab/team memberships
        // They have system-wide access without being part of any organization
        admin.setIsActive(true);
        userRepository.save(admin);

        // Create demo user with secure password
        User demo = new User();
        demo.setUsername("demo");
        String demoPassword = System.getenv("DEMO_PASSWORD");
        if (demoPassword == null || demoPassword.trim().isEmpty()) {
            demoPassword = generateSecurePassword();
            System.out.println("Generated secure demo password: " + demoPassword);
        }
        demo.setPassword(passwordEncoder.encode(demoPassword));
        demo.setEmail("demo@agenticomics.com");
        demo.setTelephone("+1987654321");
        demo.setRole("PhD Student");
        demo.setIsActive(true);
        userRepository.save(demo);

        System.out.println("Sample users created with secure passwords.");
        System.out.println("⚠️  IMPORTANT: Change these passwords immediately in production!");
    }

    private String generateSecurePassword() {
        // Generate a secure random password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        // Ensure at least one of each type
        password.append(chars.charAt(random.nextInt(26))); // uppercase
        password.append(chars.charAt(26 + random.nextInt(26))); // lowercase
        password.append(chars.charAt(52 + random.nextInt(10))); // digit
        password.append(chars.charAt(62 + random.nextInt(8))); // symbol
        
        // Add remaining characters
        for (int i = 4; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        // Shuffle the password
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }
} 