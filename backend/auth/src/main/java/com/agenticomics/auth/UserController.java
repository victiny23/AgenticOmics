package com.agenticomics.auth;

import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${app.upload-dir:./data/uploads/profile-photos}")
    private String uploadDir;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getUsername() == null || request.getPassword() == null || request.getEmail() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing fields");
            }
            
            User user = userService.registerUser(request.getUsername(), request.getPassword(), request.getEmail(), request.getTelephone(), request.getRole());
            return ResponseEntity.ok("Registration successful for user: " + user.getUsername());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password is required");
        }
        
        // Check if username or telephone is provided
        if (request.getUsername() == null && request.getTelephone() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username or telephone number is required");
        }
        
        Optional<User> userOpt;
        String identifier = "";
        
        if (request.getUsername() != null) {
            // Login by username
            identifier = request.getUsername();
            userOpt = userService.authenticateUser(request.getUsername(), request.getPassword());
        } else {
            // Login by telephone
            identifier = request.getTelephone();
            userOpt = userService.authenticateUserByTelephone(request.getTelephone(), request.getPassword());
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok(new LoginResponse("Login successful", token, user.getUsername(), user.getRole(), user.getIsActive()));
        } else {
            // Check if user exists but password is wrong
            boolean userExists = false;
            if (request.getUsername() != null) {
                userExists = userService.existsByUsername(request.getUsername());
            } else {
                userExists = userService.existsByTelephone(request.getTelephone());
            }
            
            if (userExists) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password. Please try again.");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found. Please check your username/telephone or register a new account.");
            }
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
        }
        
        String resetToken = userService.generatePasswordResetToken(request.getEmail());
        if (resetToken != null) {
            // Try to send email if mailSender configured
            try {
                if (mailSender != null) {
                    String frontendBase = System.getenv().getOrDefault("FRONTEND_BASE_URL", "http://localhost:12000");
                    String resetLink = frontendBase + "/login?resetToken=" + resetToken;
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(request.getEmail());
                    message.setSubject("AgenticOmics Password Reset");
                    message.setText("You requested a password reset. Click the link below to reset your password:\n\n" + resetLink + "\n\nIf you did not request this, please ignore this email.");
                    mailSender.send(message);
                    return ResponseEntity.ok("Password reset link sent to your email.");
                }
            } catch (Exception e) {
                // Fall through to return token for manual testing
            }
            return ResponseEntity.ok("Password reset link generated. Token: " + resetToken);
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
    
    // Role management endpoints for PI administrators
    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            List<User> users = userService.getAllActiveUsers();
            return ResponseEntity.ok(new UserListResponse(users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/non-pi")
    public ResponseEntity<?> getNonPIUsers(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            List<User> users = userService.getActiveNonPIUsers();
            return ResponseEntity.ok(new UserListResponse(users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/all-non-pi")
    public ResponseEntity<?> getAllNonPIUsers(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            List<User> users = userService.getAllNonPIUsers();
            return ResponseEntity.ok(new UserListResponse(users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/deactivated")
    public ResponseEntity<?> getDeactivatedUsers(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            List<User> users = userService.getAllDeactivatedUsers();
            return ResponseEntity.ok(new UserListResponse(users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/users/{userId}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable Long userId, @RequestHeader("X-Username") String adminUsername) {
        try {
            boolean success = userService.deactivateUser(userId, adminUsername);
            if (success) {
                return ResponseEntity.ok("User deactivated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to deactivate user");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    @PostMapping("/admin/users/{userId}/activate")
    public ResponseEntity<String> activateUser(@PathVariable Long userId, @RequestHeader("X-Username") String adminUsername) {
        try {
            boolean success = userService.activateUser(userId, adminUsername);
            if (success) {
                return ResponseEntity.ok("User activated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to activate user");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/{userId}/status")
    public ResponseEntity<?> getUserStatus(@PathVariable Long userId, @RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            return ResponseEntity.ok(new UserStatusResponse(user.getId(), user.getUsername(), user.getRole(), user.getIsActive()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user status: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/status/{username}")
    public ResponseEntity<?> getUserStatusByUsername(@PathVariable String username, @RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            return ResponseEntity.ok(new UserStatusResponse(user.getId(), user.getUsername(), user.getRole(), user.getIsActive()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user status: " + e.getMessage());
        }
    }
    
    // Self-delete account
    @DeleteMapping("/account")
    public ResponseEntity<String> deleteOwnAccount(@RequestHeader("X-Username") String username) {
        try {
            boolean deleted = userService.deleteByUsername(username);
            if (deleted) {
                return ResponseEntity.ok("Account deleted successfully");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete account: " + e.getMessage());
        }
    }

    // Request/Response DTOs
    static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String telephone;
        private String role;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
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
        private String role;
        private Boolean isActive;

        public LoginResponse(String message, String token, String username, String role, Boolean isActive) {
            this.message = message;
            this.token = token;
            this.username = username;
            this.role = role;
            this.isActive = isActive;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
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
    
    static class UserListResponse {
        private List<User> users;
        
        public UserListResponse(List<User> users) {
            this.users = users;
        }
        
        public List<User> getUsers() { return users; }
        public void setUsers(List<User> users) { this.users = users; }
    }
    
    static class UserStatusResponse {
        private Long id;
        private String username;
        private String role;
        private Boolean isActive;
        
        public UserStatusResponse(Long id, String username, String role, Boolean isActive) {
            this.id = id;
            this.username = username;
            this.role = role;
            this.isActive = isActive;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    }

    // Profile update DTO and endpoint
    static class ProfileResponse {
        private String username;
        private String role;
        private String email;
        private String telephone;
        private String birthday; // ISO date
        private String studentId;
        private String photoUrl;
        private Boolean isActive;

        public ProfileResponse(User user) {
            this.username = user.getUsername();
            this.role = user.getRole();
            this.email = user.getEmail();
            this.telephone = user.getTelephone();
            this.birthday = user.getBirthday() == null ? null : user.getBirthday().toString();
            this.studentId = user.getStudentId();
            this.photoUrl = user.getPhotoUrl();
            this.isActive = user.getIsActive();
        }

        public String getUsername() { return username; }
        public String getRole() { return role; }
        public String getEmail() { return email; }
        public String getTelephone() { return telephone; }
        public String getBirthday() { return birthday; }
        public String getStudentId() { return studentId; }
        public String getPhotoUrl() { return photoUrl; }
        public Boolean getIsActive() { return isActive; }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("X-Username") String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return ResponseEntity.ok(new ProfileResponse(userOpt.get()));
    }

    static class ProfileUpdateRequest {
        private String email;
        private String telephone;
        private String birthday; // ISO date string
        private String studentId;
        private String photoUrl;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
        public String getBirthday() { return birthday; }
        public void setBirthday(String birthday) { this.birthday = birthday; }
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, @RequestHeader("X-Username") String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            User user = userOpt.get();
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (request.getTelephone() != null && !request.getTelephone().trim().isEmpty()) {
                user.setTelephone(request.getTelephone().trim());
            } else if (request.getTelephone() != null) {
                user.setTelephone(null);
            }
            if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
                user.setBirthday(java.time.LocalDate.parse(request.getBirthday()));
            }
            if (request.getStudentId() != null) {
                user.setStudentId(request.getStudentId());
            }
            if (request.getPhotoUrl() != null) {
                user.setPhotoUrl(request.getPhotoUrl());
            }
            userService.save(user);
            return ResponseEntity.ok("Profile updated");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update profile: " + e.getMessage());
        }
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file, @RequestHeader("X-Username") String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No file uploaded");
            }
            java.nio.file.Path dir = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(dir);
            String original = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
            String safeName = username + "-" + System.currentTimeMillis() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
            java.nio.file.Path target = dir.resolve(safeName);
            file.transferTo(target.toFile());
            String publicPath = "/uploads/profile-photos/" + safeName;
            User user = userOpt.get();
            user.setPhotoUrl(publicPath);
            userService.save(user);
            return ResponseEntity.ok(publicPath);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload photo: " + e.getMessage());
        }
    }
}