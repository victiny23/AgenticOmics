package com.agenticomics.auth;

import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.entity.UserLabMembership;
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
import com.agenticomics.auth.dto.UserLabMembershipDto;
import com.agenticomics.auth.dto.UserTeamMembershipDto;
import com.agenticomics.auth.service.LabService;
import com.agenticomics.auth.service.TeamService;
import com.agenticomics.auth.entity.Lab;
import com.agenticomics.auth.entity.Team;
import com.agenticomics.auth.repository.LabRepository;
import com.agenticomics.auth.repository.TeamRepository;
import com.agenticomics.auth.repository.UserLabMembershipRepository;
import com.agenticomics.auth.repository.UserTeamMembershipRepository;
import com.agenticomics.auth.repository.UserRepository;
import com.agenticomics.auth.dto.LabDto;
import com.agenticomics.auth.dto.TeamDto;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Autowired
    private LabService labService;
    
    @Autowired
    private TeamService teamService;
    
    @Autowired
    private LabRepository labRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private UserLabMembershipRepository userLabMembershipRepository;
    
    @Autowired
    private UserTeamMembershipRepository userTeamMembershipRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.upload-dir:./data/uploads/profile-photos}")
    private String uploadDir;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getUsername() == null || request.getPassword() == null || request.getEmail() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing fields");
            }
            
            // If lab information is provided, register with lab membership
            if (request.getLabName() != null && !request.getLabName().trim().isEmpty()) {
                User user = userService.registerUserWithLab(
                    request.getUsername(), 
                    request.getPassword(), 
                    request.getEmail(), 
                    request.getTelephone(), 
                    request.getRole(),
                    request.getLabName(),
                    request.getRoleInLab(),
                    request.getMemberId(),
                    request.getSupervisorUsername(),
                    request.getIsPrimaryLab()
                );
                return ResponseEntity.ok("Registration successful for user: " + user.getUsername() + " with lab membership");
            } else {
                // Register without lab membership
                User user = userService.registerUser(request.getUsername(), request.getPassword(), request.getEmail(), request.getTelephone(), request.getRole());
                return ResponseEntity.ok("Registration successful for user: " + user.getUsername());
            }
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
            // Check if admin is a Lab PI
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access user status");
            }
            
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return ResponseEntity.ok(new UserStatusResponse(user.getId(), user.getUsername(), user.getRole(), user.getIsActive()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user status: " + e.getMessage());
        }
    }
    
    // Supervisor relationship endpoints
    @GetMapping("/admin/supervisors")
    public ResponseEntity<?> getAvailableSupervisors(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access supervisor information");
            }
            
            List<User> supervisors = userService.getActivePIsWithoutSupervisor();
            return ResponseEntity.ok(new UserListResponse(supervisors));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving supervisors: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/subordinates/{supervisorUsername}")
    public ResponseEntity<?> getSubordinatesBySupervisor(@PathVariable String supervisorUsername, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access subordinate information");
            }
            
            List<User> subordinates = userService.getActiveSubordinatesBySupervisorUsername(supervisorUsername);
            return ResponseEntity.ok(new UserListResponse(subordinates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving subordinates: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/without-supervisor")
    public ResponseEntity<?> getUsersWithoutSupervisor(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this information");
            }
            
            List<User> users = userService.getActiveUsersWithoutSupervisor();
            return ResponseEntity.ok(new UserListResponse(users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users without supervisor: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/users/{userId}/assign-supervisor/{supervisorId}")
    public ResponseEntity<String> assignSupervisor(@PathVariable Long userId, @PathVariable Long supervisorId, @RequestHeader("X-Username") String adminUsername) {
        try {
            boolean success = userService.assignSupervisor(userId, supervisorId, adminUsername);
            if (success) {
                return ResponseEntity.ok("Supervisor assigned successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to assign supervisor");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error assigning supervisor: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/users/{userId}/remove-supervisor")
    public ResponseEntity<String> removeSupervisor(@PathVariable Long userId, @RequestHeader("X-Username") String adminUsername) {
        try {
            boolean success = userService.removeSupervisor(userId, adminUsername);
            if (success) {
                return ResponseEntity.ok("Supervisor removed successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to remove supervisor");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error removing supervisor: " + e.getMessage());
        }
    }
    
    @GetMapping("/profile/supervisor")
    public ResponseEntity<?> getMySupervisor(@RequestHeader("X-Username") String username) {
        try {
            Optional<User> supervisorOpt = userService.getSupervisorByUsername(username);
            if (supervisorOpt.isPresent()) {
                User supervisor = supervisorOpt.get();
                return ResponseEntity.ok(new UserStatusResponse(supervisor.getId(), supervisor.getUsername(), supervisor.getRole(), supervisor.getIsActive()));
            } else {
                return ResponseEntity.ok(null); // No supervisor
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving supervisor: " + e.getMessage());
        }
    }
    
    @GetMapping("/profile/subordinates")
    public ResponseEntity<?> getMySubordinates(@RequestHeader("X-Username") String username) {
        try {
            // Only Lab PIs can see their subordinates
            if (!userService.isUserPI(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access subordinate information");
            }
            
            List<User> subordinates = userService.getActiveSubordinatesBySupervisorUsername(username);
            return ResponseEntity.ok(new UserListResponse(subordinates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving subordinates: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/{userId}/supervisor")
    public ResponseEntity<?> getUserSupervisor(@PathVariable Long userId, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access supervisor information");
            }
            
            Optional<User> supervisorOpt = userService.getSupervisorByUserId(userId);
            if (supervisorOpt.isPresent()) {
                User supervisor = supervisorOpt.get();
                return ResponseEntity.ok(new UserStatusResponse(supervisor.getId(), supervisor.getUsername(), supervisor.getRole(), supervisor.getIsActive()));
            } else {
                return ResponseEntity.ok(null); // No supervisor
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user supervisor: " + e.getMessage());
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
        private String labName;
        private String roleInLab;
        private String memberId;
        private String supervisorUsername;
        private Boolean isPrimaryLab;

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
        public String getLabName() { return labName; }
        public void setLabName(String labName) { this.labName = labName; }
        public String getRoleInLab() { return roleInLab; }
        public void setRoleInLab(String roleInLab) { this.roleInLab = roleInLab; }
        public String getMemberId() { return memberId; }
        public void setMemberId(String memberId) { this.memberId = memberId; }
        public String getSupervisorUsername() { return supervisorUsername; }
        public void setSupervisorUsername(String supervisorUsername) { this.supervisorUsername = supervisorUsername; }
        public Boolean getIsPrimaryLab() { return isPrimaryLab; }
        public void setIsPrimaryLab(Boolean isPrimaryLab) { this.isPrimaryLab = isPrimaryLab; }
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
        private String photoUrl;
        private Boolean isActive;
        private String supervisorName;
        private String supervisorRole;
        private List<String> subordinateNames;
        private List<UserLabMembershipDto> labMemberships;
        private UserLabMembershipDto primaryLab;
        private List<UserTeamMembershipDto> teamMemberships;
        private UserTeamMembershipDto primaryTeam;

        public ProfileResponse(User user) {
            this.username = user.getUsername();
            this.role = user.getRole();
            this.email = user.getEmail();
            this.telephone = user.getTelephone();
            this.birthday = user.getBirthday() != null ? user.getBirthday().toString() : null;
            this.photoUrl = user.getPhotoUrl();
            this.isActive = user.getIsActive();
            
            // Legacy supervisor/subordinate info (keeping for backward compatibility)
            if (user.getSupervisor() != null) {
                this.supervisorName = user.getSupervisor().getUsername();
                this.supervisorRole = user.getSupervisor().getRole();
            }
            
            if (user.getSubordinates() != null && !user.getSubordinates().isEmpty()) {
                this.subordinateNames = user.getSubordinates().stream()
                        .map(User::getUsername)
                        .collect(java.util.stream.Collectors.toList());
            }
            
            // Initialize lab memberships as empty - will be populated by controller
            this.labMemberships = new java.util.ArrayList<>();
            this.primaryLab = null;

            // Initialize team memberships as empty - will be populated by controller
            this.teamMemberships = new java.util.ArrayList<>();
            this.primaryTeam = null;
        }

        public String getUsername() { return username; }
        public String getRole() { return role; }
        public String getEmail() { return email; }
        public String getTelephone() { return telephone; }
        public String getBirthday() { return birthday; }
        public String getPhotoUrl() { return photoUrl; }
        public Boolean getIsActive() { return isActive; }
        public String getSupervisorName() { return supervisorName; }
        public String getSupervisorRole() { return supervisorRole; }
        public List<String> getSubordinateNames() { return subordinateNames; }
        public List<UserLabMembershipDto> getLabMemberships() { return labMemberships; }
        public UserLabMembershipDto getPrimaryLab() { return primaryLab; }
        public List<UserTeamMembershipDto> getTeamMemberships() { return teamMemberships; }
        public UserTeamMembershipDto getPrimaryTeam() { return primaryTeam; }
        
        // Setters for lab membership data
        public void setLabMemberships(List<UserLabMembershipDto> labMemberships) { this.labMemberships = labMemberships; }
        public void setPrimaryLab(UserLabMembershipDto primaryLab) { this.primaryLab = primaryLab; }
        public void setTeamMemberships(List<UserTeamMembershipDto> teamMemberships) { this.teamMemberships = teamMemberships; }
        public void setPrimaryTeam(UserTeamMembershipDto primaryTeam) { this.primaryTeam = primaryTeam; }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("X-Username") String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        User user = userOpt.get();
        ProfileResponse response = new ProfileResponse(user);
        
        // Add lab membership information
        try {
            response.setLabMemberships(userService.getUserLabMemberships(username));
            response.setPrimaryLab(userService.getPrimaryLabMembership(username));
        } catch (Exception e) {
            // If lab service is not available, keep empty lists
            response.setLabMemberships(new java.util.ArrayList<>());
            response.setPrimaryLab(null);
        }

        // Add team membership information
        try {
            response.setTeamMemberships(userService.getUserTeamMemberships(username));
            response.setPrimaryTeam(userService.getPrimaryTeamMembership(username));
        } catch (Exception e) {
            // If team service is not available, keep empty lists
            response.setTeamMemberships(new java.util.ArrayList<>());
            response.setPrimaryTeam(null);
        }
        
        return ResponseEntity.ok(response);
    }

    static class ProfileUpdateRequest {
        private String email;
        private String telephone;
        private String birthday; // ISO date string
        private String photoUrl;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
        public String getBirthday() { return birthday; }
        public void setBirthday(String birthday) { this.birthday = birthday; }
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
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Create upload directory if it doesn't exist
            java.io.File uploadDirectory = new java.io.File(uploadDir);
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = username + "_" + System.currentTimeMillis() + fileExtension;
            java.io.File dest = new java.io.File(uploadDirectory, filename);

            // Save file
            file.transferTo(dest);

            // Update user's photo URL
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPhotoUrl("/uploads/profile-photos/" + filename);
                userService.save(user);
                return ResponseEntity.ok("\"/uploads/profile-photos/" + filename + "\"");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload photo: " + e.getMessage());
        }
    }
    
    // Lab management endpoints
    @GetMapping("/profile/lab-memberships")
    public ResponseEntity<?> getMyLabMemberships(@RequestHeader("X-Username") String username) {
        try {
            List<UserLabMembershipDto> memberships = userService.getUserLabMemberships(username);
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get lab memberships: " + e.getMessage());
        }
    }
    
    @GetMapping("/profile/primary-lab")
    public ResponseEntity<?> getMyPrimaryLab(@RequestHeader("X-Username") String username) {
        try {
            UserLabMembershipDto primaryLab = userService.getPrimaryLabMembership(username);
            return ResponseEntity.ok(primaryLab);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get primary lab: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/lab-memberships")
    public ResponseEntity<?> addUserToLab(@RequestBody AddUserToLabRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            UserLabMembershipDto membership = userService.addUserToLab(
                request.getUsername(),
                request.getLabName(),
                request.getRoleInLab(),
                request.getMemberId(),
                request.getSupervisorUsername(),
                request.getIsPrimaryLab()
            );
            return ResponseEntity.ok(membership);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add user to lab: " + e.getMessage());
        }
    }
    
    @PutMapping("/admin/lab-memberships/{membershipId}")
    public ResponseEntity<?> updateLabMembership(@PathVariable Long membershipId, @RequestBody UpdateLabMembershipRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            UserLabMembershipDto membership = userService.updateLabMembership(
                membershipId,
                request.getRoleInLab(),
                request.getMemberId(),
                request.getSupervisorUsername(),
                request.getIsPrimaryLab()
            );
            return ResponseEntity.ok(membership);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update lab membership: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/admin/lab-memberships")
    public ResponseEntity<?> removeUserFromLab(@RequestBody RemoveUserFromLabRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can remove users from labs");
            }
            
            Optional<User> userOpt = userService.findByUsername(request.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            Optional<Lab> labOpt = labService.getAllLabs().stream()
                    .filter(lab -> lab.getLabName().equals(request.getLabName()))
                    .findFirst()
                    .map(labDto -> labRepository.findById(labDto.getId()).orElse(null));
            
            if (labOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lab not found");
            }
            
            labService.removeUserFromLab(userOpt.get().getId(), labOpt.get().getId());
            return ResponseEntity.ok("User removed from lab successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to remove user from lab: " + e.getMessage());
        }
    }
    
    // Team Management Endpoints
    @GetMapping("/profile/team-memberships")
    public ResponseEntity<?> getMyTeamMemberships(@RequestHeader("X-Username") String username) {
        try {
            List<UserTeamMembershipDto> memberships = userService.getUserTeamMemberships(username);
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get team memberships: " + e.getMessage());
        }
    }
    
    @GetMapping("/profile/primary-team")
    public ResponseEntity<?> getMyPrimaryTeam(@RequestHeader("X-Username") String username) {
        try {
            UserTeamMembershipDto primaryTeam = userService.getPrimaryTeamMembership(username);
            return ResponseEntity.ok(primaryTeam);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get primary team: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/teams")
    public ResponseEntity<?> createTeam(@RequestBody CreateTeamRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Anyone can create a team
            Team team = teamService.createTeam(
                request.getTeamId(),
                request.getTeamName(),
                request.getTeamDescription(),
                request.getLabId(),
                request.getTeamLeaderId()
            );
            return ResponseEntity.ok("Team created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create team: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/teams/auto-id")
    public ResponseEntity<?> createTeamWithAutoId(@RequestBody CreateTeamAutoIdRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Anyone can create teams
            // Get the creator's user ID
            Optional<User> creatorOpt = userService.findByUsername(adminUsername);
            if (creatorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Creator user not found");
            }
            
            Team team = teamService.createTeamWithAutoId(
                request.getTeamName(),
                request.getTeamDescription(),
                request.getLabId(),
                creatorOpt.get().getId()
            );
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("message", "Team created successfully and you have been added as Team Leader");
                put("teamId", team.getTeamId());
                put("teamName", team.getTeamName());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create team: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/ensure-pi-jerry-lab001")
    public ResponseEntity<?> ensurePiJerryLab001Membership(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Only allow pi_jerry to call this endpoint
            if (!"pi_jerry".equals(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only pi_jerry can call this endpoint");
            }
            
            // Get pi_jerry user
            Optional<User> piJerryOpt = userService.findByUsername("pi_jerry");
            if (piJerryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("pi_jerry user not found");
            }
            
            // Get LAB001 lab
            Optional<Lab> lab001Opt = labRepository.findByLabId("LAB001");
            if (lab001Opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("LAB001 not found");
            }
            
            // Check if membership already exists
            Optional<UserLabMembership> existingMembership = userLabMembershipRepository
                .findByUserIdAndLabIdAndIsActiveTrue(piJerryOpt.get().getId(), lab001Opt.get().getId());
            
            if (existingMembership.isPresent()) {
                return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                    put("message", "pi_jerry is already a member of LAB001");
                    put("membershipId", existingMembership.get().getId());
                    put("role", existingMembership.get().getRoleInLab());
                    put("memberId", existingMembership.get().getMemberId());
                    put("isPrimaryLab", existingMembership.get().getIsPrimaryLab());
                }});
            }
            
            // Create membership
            UserLabMembership membership = labService.addUserToLab(
                piJerryOpt.get().getId(),
                lab001Opt.get().getId(),
                "Lab PI",
                "LAB001",
                null, // no supervisor
                true  // primary lab
            );
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("message", "pi_jerry has been added to LAB001 as Lab PI");
                put("membershipId", membership.getId());
                put("role", membership.getRoleInLab());
                put("memberId", membership.getMemberId());
                put("isPrimaryLab", membership.getIsPrimaryLab());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add pi_jerry to LAB001: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/debug/users")
    public ResponseEntity<?> debugUsers() {
        try {
            long userCount = userRepository.count();
            List<User> allUsers = userRepository.findAll();
            List<String> usernames = allUsers.stream()
                .map(User::getUsername)
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("userCount", userCount);
                put("usernames", usernames);
                put("users", allUsers.stream()
                    .map(u -> new java.util.HashMap<String, Object>() {{
                        put("id", u.getId());
                        put("username", u.getUsername());
                        put("email", u.getEmail());
                        put("role", u.getRole());
                        put("isActive", u.getIsActive());
                    }})
                    .collect(java.util.stream.Collectors.toList()));
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get users: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/force-create-sample-data")
    public ResponseEntity<?> forceCreateSampleData() {
        try {
            // Force creation of sample data regardless of existing users
            // This will clear existing data and recreate sample data
            userRepository.deleteAll();
            labRepository.deleteAll();
            teamRepository.deleteAll();
            userLabMembershipRepository.deleteAll();
            userTeamMembershipRepository.deleteAll();
            
            // Now create sample data
            // This is a simplified version - in production, you'd want to call the actual service
            User piJerry = new User();
            piJerry.setUsername("pi_jerry");
            piJerry.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa"); // pi123
            piJerry.setEmail("jerry.pi@agenticomics.com");
            piJerry.setTelephone("+1234567891");
            piJerry.setRole("Lab PI");
            piJerry.setIsActive(true);
            piJerry.setCreatedAt(java.time.LocalDateTime.now());
            piJerry.setUpdatedAt(java.time.LocalDateTime.now());
            userRepository.save(piJerry);
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("message", "Sample data created successfully");
                put("createdUser", "pi_jerry");
                put("password", "pi123");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create sample data: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/team-memberships")
    public ResponseEntity<?> addUserToTeam(@RequestBody AddUserToTeamRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Anyone can add users to teams
            Optional<User> userOpt = userService.findByUsername(request.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            Optional<Team> teamOpt = teamService.getAllTeams().stream()
                    .filter(team -> team.getTeamName().equals(request.getTeamName()))
                    .findFirst()
                    .map(teamDto -> teamRepository.findById(teamDto.getId()).orElse(null));
            
            if (teamOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team not found");
            }
            
            Long supervisorId = null;
            if (request.getSupervisorUsername() != null && !request.getSupervisorUsername().trim().isEmpty()) {
                Optional<User> supervisor = userService.findByUsername(request.getSupervisorUsername().trim());
                if (supervisor.isPresent()) {
                    supervisorId = supervisor.get().getId();
                }
            }
            
            teamService.addUserToTeam(
                userOpt.get().getId(),
                teamOpt.get().getId(),
                request.getRoleInTeam(),
                request.getMemberId(),
                supervisorId,
                request.getIsPrimaryTeam()
            );
            return ResponseEntity.ok("User added to team successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add user to team: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/labs")
    public ResponseEntity<?> getAllLabs(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Only Lab PIs can view all labs
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can view all labs");
            }
            List<LabDto> labs = labService.getAllLabs();
            return ResponseEntity.ok(labs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get labs: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/labs")
    public ResponseEntity<?> createLab(@RequestBody CreateLabRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Only Lab PIs can create labs
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can create labs");
            }
            Lab lab = labService.createLab(
                request.getLabId(),
                request.getLabName(),
                request.getLabDescription(),
                request.getInstitution(),
                request.getDepartment()
            );
            return ResponseEntity.ok("Lab created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create lab: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/labs/next-id")
    public ResponseEntity<?> getNextLabId(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Only Lab PIs can get next lab ID
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can get next lab ID");
            }
            String nextLabId = labService.getNextLabId();
            return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
                put("nextLabId", nextLabId);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get next lab ID: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/labs/auto-id")
    public ResponseEntity<?> createLabWithAutoId(@RequestBody CreateLabAutoIdRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Only Lab PIs can create labs
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can create labs");
            }
            
            // Get the creator's user ID
            Optional<User> creatorOpt = userService.findByUsername(adminUsername);
            if (creatorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Creator user not found");
            }
            
            Lab lab = labService.createLabWithAutoId(
                request.getLabName(),
                request.getLabDescription(),
                request.getInstitution(),
                request.getDepartment(),
                creatorOpt.get().getId()
            );
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("message", "Lab created successfully and you have been added as Lab PI");
                put("labId", lab.getLabId());
                put("labName", lab.getLabName());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create lab: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/teams")
    public ResponseEntity<?> getAllTeams(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Anyone can view all teams
            List<TeamDto> teams = teamService.getAllTeams();
            return ResponseEntity.ok(teams);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get teams: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/labs/{labId}/supervisors")
    public ResponseEntity<?> getAvailableSupervisorsInLab(@PathVariable Long labId, @RequestHeader("X-Username") String adminUsername) {
        try {
            List<User> supervisors = labService.getAvailableSupervisorsInLab(labId);
            return ResponseEntity.ok(supervisors.stream()
                    .map(user -> new java.util.HashMap<String, Object>() {{
                        put("id", user.getId());
                        put("username", user.getUsername());
                        put("role", user.getRole());
                    }})
                    .collect(java.util.stream.Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get supervisors: " + e.getMessage());
        }
    }
    
    // Request/Response classes for lab management
    static class AddUserToLabRequest {
        private String username;
        private String labName;
        private String roleInLab;
        private String memberId;
        private String supervisorUsername;
        private Boolean isPrimaryLab;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getLabName() { return labName; }
        public void setLabName(String labName) { this.labName = labName; }
        public String getRoleInLab() { return roleInLab; }
        public void setRoleInLab(String roleInLab) { this.roleInLab = roleInLab; }
        public String getMemberId() { return memberId; }
        public void setMemberId(String memberId) { this.memberId = memberId; }
        public String getSupervisorUsername() { return supervisorUsername; }
        public void setSupervisorUsername(String supervisorUsername) { this.supervisorUsername = supervisorUsername; }
        public Boolean getIsPrimaryLab() { return isPrimaryLab; }
        public void setIsPrimaryLab(Boolean isPrimaryLab) { this.isPrimaryLab = isPrimaryLab; }
    }
    
    static class UpdateLabMembershipRequest {
        private String roleInLab;
        private String memberId;
        private String supervisorUsername;
        private Boolean isPrimaryLab;
        
        // Getters and setters
        public String getRoleInLab() { return roleInLab; }
        public void setRoleInLab(String roleInLab) { this.roleInLab = roleInLab; }
        public String getMemberId() { return memberId; }
        public void setMemberId(String memberId) { this.memberId = memberId; }
        public String getSupervisorUsername() { return supervisorUsername; }
        public void setSupervisorUsername(String supervisorUsername) { this.supervisorUsername = supervisorUsername; }
        public Boolean getIsPrimaryLab() { return isPrimaryLab; }
        public void setIsPrimaryLab(Boolean isPrimaryLab) { this.isPrimaryLab = isPrimaryLab; }
    }
    
    static class RemoveUserFromLabRequest {
        private String username;
        private String labName;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getLabName() { return labName; }
        public void setLabName(String labName) { this.labName = labName; }
    }

    // Request/Response classes for team management
    static class CreateTeamRequest {
        private String teamId;
        private String teamName;
        private String teamDescription;
        private Long labId;
        private Long teamLeaderId;

        public String getTeamId() { return teamId; }
        public void setTeamId(String teamId) { this.teamId = teamId; }
        public String getTeamName() { return teamName; }
        public void setTeamName(String teamName) { this.teamName = teamName; }
        public String getTeamDescription() { return teamDescription; }
        public void setTeamDescription(String teamDescription) { this.teamDescription = teamDescription; }
        public Long getLabId() { return labId; }
        public void setLabId(Long labId) { this.labId = labId; }
        public Long getTeamLeaderId() { return teamLeaderId; }
        public void setTeamLeaderId(Long teamLeaderId) { this.teamLeaderId = teamLeaderId; }
    }

    static class AddUserToTeamRequest {
        private String username;
        private String teamName;
        private String roleInTeam;
        private String memberId;
        private String supervisorUsername;
        private Boolean isPrimaryTeam;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getTeamName() { return teamName; }
        public void setTeamName(String teamName) { this.teamName = teamName; }
        public String getRoleInTeam() { return roleInTeam; }
        public void setRoleInTeam(String roleInTeam) { this.roleInTeam = roleInTeam; }
        public String getMemberId() { return memberId; }
        public void setMemberId(String memberId) { this.memberId = memberId; }
        public String getSupervisorUsername() { return supervisorUsername; }
        public void setSupervisorUsername(String supervisorUsername) { this.supervisorUsername = supervisorUsername; }
        public Boolean getIsPrimaryTeam() { return isPrimaryTeam; }
        public void setIsPrimaryTeam(Boolean isPrimaryTeam) { this.isPrimaryTeam = isPrimaryTeam; }
    }

    static class CreateLabRequest {
        private String labId;
        private String labName;
        private String labDescription;
        private String institution;
        private String department;

        public String getLabId() { return labId; }
        public void setLabId(String labId) { this.labId = labId; }
        public String getLabName() { return labName; }
        public void setLabName(String labName) { this.labName = labName; }
        public String getLabDescription() { return labDescription; }
        public void setLabDescription(String labDescription) { this.labDescription = labDescription; }
        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
    }
    
    static class CreateLabAutoIdRequest {
        private String labName;
        private String labDescription;
        private String institution;
        private String department;

        public String getLabName() { return labName; }
        public void setLabName(String labName) { this.labName = labName; }
        public String getLabDescription() { return labDescription; }
        public void setLabDescription(String labDescription) { this.labDescription = labDescription; }
        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
    }
    
    static class CreateTeamAutoIdRequest {
        private String teamName;
        private String teamDescription;
        private Long labId;

        public String getTeamName() { return teamName; }
        public void setTeamName(String teamName) { this.teamName = teamName; }
        public String getTeamDescription() { return teamDescription; }
        public void setTeamDescription(String teamDescription) { this.teamDescription = teamDescription; }
        public Long getLabId() { return labId; }
        public void setLabId(Long labId) { this.labId = labId; }
    }
}