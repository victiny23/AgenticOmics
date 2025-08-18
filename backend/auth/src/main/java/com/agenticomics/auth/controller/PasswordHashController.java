package com.agenticomics.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordHashController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/hash")
    public Map<String, String> hashPassword(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        String hashedPassword = passwordEncoder.encode(password);
        
        Map<String, String> response = new HashMap<>();
        response.put("originalPassword", password);
        response.put("hashedPassword", hashedPassword);
        
        return response;
    }
} 