package com.agenticomics.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class UserController {
    private final Map<String, User> users = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getPassword() == null || user.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing fields");
        }
        if (users.containsKey(user.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
        }
        users.put(user.getUsername(), user);
        return ResponseEntity.ok("Registration successful");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User login) {
        User user = users.get(login.getUsername());
        if (user == null || !user.getPassword().equals(login.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        return ResponseEntity.ok("Login successful");
    }

    static class User {
        private String username;
        private String password;
        private String email;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}