package com.agenticomics.auth.controller;

import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/db")
public class DatabaseController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // In a real application, you'd want to add pagination and filtering
        // For now, we'll return all users (be careful with sensitive data)
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.findByUsername(username);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status")
    public ResponseEntity<DatabaseStatus> getDatabaseStatus() {
        long userCount = userService.getActiveUserCount();
        return ResponseEntity.ok(new DatabaseStatus(userCount, "H2 Database", "Connected"));
    }

    static class DatabaseStatus {
        private long userCount;
        private String databaseType;
        private String status;

        public DatabaseStatus(long userCount, String databaseType, String status) {
            this.userCount = userCount;
            this.databaseType = databaseType;
            this.status = status;
        }

        public long getUserCount() { return userCount; }
        public void setUserCount(long userCount) { this.userCount = userCount; }
        public String getDatabaseType() { return databaseType; }
        public void setDatabaseType(String databaseType) { this.databaseType = databaseType; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
} 