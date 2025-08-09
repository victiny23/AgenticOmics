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
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEmail("admin@agenticomics.com");
        admin.setTelephone("+1234567890");
        admin.setRole("Lab PI");
        admin.setIsActive(true);
        userRepository.save(admin);

        // Create demo user
        User demo = new User();
        demo.setUsername("demo");
        demo.setPassword(passwordEncoder.encode("demo123"));
        demo.setEmail("demo@agenticomics.com");
        demo.setTelephone("+1987654321");
        demo.setRole("PhD Student");
        demo.setIsActive(true);
        userRepository.save(demo);

        System.out.println("Sample users created:");
        System.out.println("- admin/admin123 (tel: +1234567890, role: Lab PI)");
        System.out.println("- demo/demo123 (tel: +1987654321, role: PhD Student)");
    }
} 