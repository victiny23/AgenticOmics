package com.agenticomics.auth;

import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getUsername() == null || request.getPassword() == null || request.getEmail() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing fields");
            }
            
            User user = userService.registerUser(request.getUsername(), request.getPassword(), request.getEmail(), request.getTelephone());
            return ResponseEntity.ok("Registration successful for user: " + user.getUsername());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        if (request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        
        Optional<User> userOpt;
        if (request.getUsername() != null) {
            // Login by username
            userOpt = userService.authenticateUser(request.getUsername(), request.getPassword());
        } else if (request.getTelephone() != null) {
            // Login by telephone
            userOpt = userService.authenticateUserByTelephone(request.getTelephone(), request.getPassword());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok(new LoginResponse("Login successful", token, user.getUsername()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
        }
        
        String resetToken = userService.generatePasswordResetToken(request.getEmail());
        if (resetToken != null) {
            // In a real application, you would send an email here
            // For now, we'll return the token (in production, send it via email)
            return ResponseEntity.ok("Password reset link sent to your email. Token: " + resetToken);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found");
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getResetToken() == null || request.getNewPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reset token and new password are required");
        }
        
        boolean success = userService.resetPassword(request.getResetToken(), request.getNewPassword());
        if (success) {
            return ResponseEntity.ok("Password reset successful");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired reset token");
        }
    }

    @GetMapping("/users/count")
    public ResponseEntity<UserCountResponse> getUserCount() {
        long count = userService.getActiveUserCount();
        return ResponseEntity.ok(new UserCountResponse(count));
    }

    // Request/Response DTOs
    static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String telephone;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
    }

    static class LoginRequest {
        private String username;
        private String telephone;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class LoginResponse {
        private String message;
        private String token;
        private String username;

        public LoginResponse(String message, String token, String username) {
            this.message = message;
            this.token = token;
            this.username = username;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    static class ForgotPasswordRequest {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    static class ResetPasswordRequest {
        private String resetToken;
        private String newPassword;

        public String getResetToken() { return resetToken; }
        public void setResetToken(String resetToken) { this.resetToken = resetToken; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    static class UserCountResponse {
        private long count;

        public UserCountResponse(long count) {
            this.count = count;
        }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}