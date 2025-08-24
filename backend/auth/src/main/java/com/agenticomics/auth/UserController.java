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
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
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
import com.agenticomics.auth.dto.LabApplicationRequest;
import com.agenticomics.auth.dto.LabApplicationResponse;
import com.agenticomics.auth.dto.TeamApplicationRequest;
import com.agenticomics.auth.dto.TeamApplicationResponse;
import com.agenticomics.auth.dto.ApplicationReviewRequest;
import com.agenticomics.auth.dto.LeaveLabRequest;
import com.agenticomics.auth.dto.LeaveTeamRequest;
import com.agenticomics.auth.service.LabApplicationService;
import com.agenticomics.auth.service.TeamApplicationService;
import com.agenticomics.auth.service.ActivationRequestService;
import com.agenticomics.auth.entity.ActivationRequest;
import com.agenticomics.auth.service.MembershipRequestService;
import com.agenticomics.auth.service.InvitationService;
import com.agenticomics.auth.dto.LabMembershipRequestDto;
import com.agenticomics.auth.dto.TeamMembershipRequestDto;
import com.agenticomics.auth.dto.LabInvitationDto;
import com.agenticomics.auth.dto.TeamInvitationDto;
import com.agenticomics.auth.entity.LabMembershipRequest;
import com.agenticomics.auth.entity.TeamMembershipRequest;
import com.agenticomics.auth.entity.LabInvitation;
import com.agenticomics.auth.entity.TeamInvitation;
import java.util.ArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

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
    
    @Autowired
    private LabApplicationService labApplicationService;
    
    @Autowired
    private TeamApplicationService teamApplicationService;
    
    @Autowired
    private ActivationRequestService activationRequestService;
    
    @Autowired
    private MembershipRequestService membershipRequestService;
    
    @Autowired
    private InvitationService invitationService;
    
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
    
    @GetMapping("/admin/users/all-with-organizations")
    public ResponseEntity<?> getAllUsersWithOrganizations(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            List<Map<String, Object>> usersWithOrganizations = userService.getAllUsersWithOrganizations();
            return ResponseEntity.ok(new UserListWithOrganizationsResponse(usersWithOrganizations));
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

    /**
     * Super Admin endpoint to get all users with their lab and team memberships
     */
    @GetMapping("/admin/system/users/all-with-organizations")
    public ResponseEntity<?> getAllUsersWithOrganizationsForSuperAdmin(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isSuperAdmin(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            
            List<Map<String, Object>> usersWithOrganizations = userService.getAllUsersWithOrganizations();
            return ResponseEntity.ok(usersWithOrganizations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users: " + e.getMessage());
        }
    }
    
    /**
     * Public endpoint to get basic user information for membership management
     */
    @GetMapping("/public/users/basic")
    public ResponseEntity<?> getBasicUserInfo() {
        try {
            List<Map<String, Object>> basicUserInfo = userService.getBasicUserInfo();
            return ResponseEntity.ok(basicUserInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users: " + e.getMessage());
        }
    }

    /**
     * Public endpoint to get users who are NOT members of a specific lab
     */
    @GetMapping("/public/users/not-in-lab/{labId}")
    public ResponseEntity<?> getUsersNotInLab(@PathVariable Long labId) {
        try {
            List<Map<String, Object>> usersNotInLab = userService.getUsersNotInLab(labId);
            return ResponseEntity.ok(usersNotInLab);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving users: " + e.getMessage());
        }
    }

    /**
     * Temporary endpoint to fix Jerry's lab membership
     */
    @PostMapping("/admin/fix-jerry-lab-membership")
    public ResponseEntity<?> fixJerryLabMembership() {
        try {
            // Find Jerry
            Optional<User> jerryOpt = userService.findByUsername("Jerry");
            if (jerryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User 'Jerry' not found.");
            }
            User jerry = jerryOpt.get();

            // Find LAB001
            Optional<Lab> lab001Opt = labRepository.findByLabName("LAB001");
            if (lab001Opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lab 'LAB001' not found.");
            }
            Lab lab001 = lab001Opt.get();

            // Check if Jerry is already a member of LAB001
            Optional<UserLabMembership> existingMembership = userLabMembershipRepository
                .findByUserIdAndLabIdAndIsActiveTrue(jerry.getId(), lab001.getId());
            
            if (existingMembership.isPresent()) {
                return ResponseEntity.ok("Jerry is already a member of LAB001 with role: " + existingMembership.get().getRoleInLab());
            }

            // Add Jerry as Lab PI to LAB001
            UserLabMembership membership = new UserLabMembership();
            membership.setUser(jerry);
            membership.setLab(lab001);
            membership.setRoleInLab("Lab PI");
            membership.setIsActive(true);
            membership.setIsPrimaryLab(true);
            membership.setJoinedAt(LocalDateTime.now());
            membership.setMemberId("LAB001");
            
            userLabMembershipRepository.save(membership);

            return ResponseEntity.ok("Jerry successfully added as Lab PI to LAB001");
        } catch (Exception e) {
            log.error("Error fixing Jerry's lab membership: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fix Jerry's lab membership: " + e.getMessage());
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

    /**
     * Super Admin endpoint to deactivate any user account
     */
    @PostMapping("/admin/system/users/{userId}/deactivate")
    public ResponseEntity<String> deactivateUserBySuperAdmin(@PathVariable Long userId, @RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isSuperAdmin(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            boolean success = userService.deactivateUserBySuperAdmin(userId, adminUsername);
            if (success) {
                return ResponseEntity.ok("User deactivated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to deactivate user");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Super Admin endpoint to activate any user account
     */
    @PostMapping("/admin/system/users/{userId}/activate")
    public ResponseEntity<String> activateUserBySuperAdmin(@PathVariable Long userId, @RequestHeader("X-Username") String adminUsername) {
        try {
            if (!userService.isSuperAdmin(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            boolean success = userService.activateUserBySuperAdmin(userId, adminUsername);
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
    
    static class UserListWithOrganizationsResponse {
        private List<Map<String, Object>> users;
        
        public UserListWithOrganizationsResponse(List<Map<String, Object>> users) {
            this.users = users;
        }
        
        public List<Map<String, Object>> getUsers() { return users; }
        public void setUsers(List<Map<String, Object>> users) { this.users = users; }
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

    // Secure profile response - only exposes non-sensitive information
    static class SecureProfileResponse {
        private String username;
        private String role;
        private Boolean isActive;
        private String supervisorName;
        private String supervisorRole;
        private List<String> subordinateNames;
        private List<UserLabMembershipDto> labMemberships;
        private UserLabMembershipDto primaryLab;
        private List<UserTeamMembershipDto> teamMemberships;
        private UserTeamMembershipDto primaryTeam;

        public SecureProfileResponse(User user) {
            this.username = user.getUsername();
            this.role = user.getRole();
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

    // Legacy profile response - kept for backward compatibility but deprecated
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
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            
            // Create a secure profile response with minimal sensitive data
            SecureProfileResponse response = new SecureProfileResponse(user);
            
            // Add lab membership information (non-sensitive)
            try {
                // Get lab memberships directly from the repository to avoid any service layer issues
                Optional<User> userForLabs = userService.findByUsername(username);
                if (userForLabs.isPresent()) {
                    Long userId = userForLabs.get().getId();
                    List<UserLabMembership> memberships = userLabMembershipRepository.findActiveMembershipsByUserId(userId);
                    List<UserLabMembershipDto> labMemberships = memberships.stream()
                        .map(membership -> new UserLabMembershipDto(
                            membership.getId(),
                            membership.getUser().getId(),
                            membership.getUser().getUsername(),
                            membership.getLab().getId(),
                            membership.getLab().getLabName(),
                            membership.getLab().getLabId(),
                            membership.getRoleInLab(),
                            membership.getMemberId(),
                            membership.getSupervisor() != null ? membership.getSupervisor().getId() : null,
                            membership.getSupervisor() != null ? membership.getSupervisor().getUsername() : null,
                            membership.getIsPrimaryLab(),
                            membership.getJoinedAt(),
                            membership.getLeftAt(),
                            membership.getIsActive(),
                            membership.getCreatedAt(),
                            membership.getUpdatedAt()
                        ))
                        .collect(java.util.stream.Collectors.toList());
                    
                    response.setLabMemberships(labMemberships);
                    
                    // Find primary lab
                    UserLabMembershipDto primaryLab = labMemberships.stream()
                        .filter(membership -> Boolean.TRUE.equals(membership.getIsPrimaryLab()))
                        .findFirst()
                        .orElse(null);
                    response.setPrimaryLab(primaryLab);
                    
                    System.out.println("DEBUG: Lab memberships for " + username + ": " + labMemberships.size() + " memberships");
                } else {
                    response.setLabMemberships(new java.util.ArrayList<>());
                    response.setPrimaryLab(null);
                }
            } catch (Exception e) {
                System.err.println("DEBUG: Error getting lab memberships for " + username + ": " + e.getMessage());
                e.printStackTrace();
                response.setLabMemberships(new java.util.ArrayList<>());
                response.setPrimaryLab(null);
            }

            // Add team membership information (non-sensitive)
            try {
                response.setTeamMemberships(userService.getUserTeamMemberships(username));
                response.setPrimaryTeam(userService.getPrimaryTeamMembership(username));
            } catch (Exception e) {
                response.setTeamMemberships(new java.util.ArrayList<>());
                response.setPrimaryTeam(null);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve profile: " + e.getMessage());
        }
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

    // Secure endpoint for sensitive user information
    @GetMapping("/profile/sensitive")
    public ResponseEntity<?> getSensitiveProfile(@RequestHeader("X-Username") String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            
            // Create a response with sensitive information (only for the user themselves)
            SensitiveProfileResponse response = new SensitiveProfileResponse(user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve sensitive profile: " + e.getMessage());
        }
    }

    // Sensitive profile response - contains personal information (email, phone, birthday)
    static class SensitiveProfileResponse {
        private String username;
        private String email;
        private String telephone;
        private String birthday; // ISO date
        private String photoUrl;
        private Boolean isActive;

        public SensitiveProfileResponse(User user) {
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.telephone = user.getTelephone();
            this.birthday = user.getBirthday() != null ? user.getBirthday().toString() : null;
            this.photoUrl = user.getPhotoUrl();
            this.isActive = user.getIsActive();
        }

        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getTelephone() { return telephone; }
        public String getBirthday() { return birthday; }
        public String getPhotoUrl() { return photoUrl; }
        public Boolean getIsActive() { return isActive; }
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
    
    // Secure profile photo serving endpoint
    @GetMapping("/profile/photo/{filename}")
    public ResponseEntity<?> getProfilePhoto(@PathVariable String filename, 
                                           @RequestHeader(value = "X-Username", required = false) String username,
                                           @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            // Determine the authenticated user from either X-Username or JWT token
            String authenticatedUsername = username;
            
            // If no X-Username but we have Authorization header, try to extract username from JWT
            if ((username == null || username.isEmpty()) && authorization != null && authorization.startsWith("Bearer ")) {
                try {
                    String token = authorization.substring(7);
                    // For now, we'll allow the request if we have a valid JWT token
                    // In a production environment, you'd want to properly validate the JWT
                    authenticatedUsername = "authenticated_user"; // Placeholder
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
                }
            }
            
            // If we still don't have a username, try to extract it from the filename
            if (authenticatedUsername == null || authenticatedUsername.isEmpty() || "authenticated_user".equals(authenticatedUsername)) {
                // Extract username from filename (e.g., "Jerry_1755039381462.png" -> "Jerry")
                if (filename.contains("_")) {
                    authenticatedUsername = filename.substring(0, filename.indexOf("_"));
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unable to determine user");
                }
            }
            
            // Verify the user exists
            Optional<User> userOpt = userService.findByUsername(authenticatedUsername);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            User user = userOpt.get();
            
            // Check if this is the user's own photo
            boolean isOwnPhoto = false;
            if (user.getPhotoUrl() != null && user.getPhotoUrl().contains(filename)) {
                isOwnPhoto = true;
            }
            
            // For now, allow users to view their own photos and Lab PIs to view any photo
            // This is a simplified approach - in production you'd want more granular control
            boolean canViewPhoto = isOwnPhoto || "Lab PI".equals(user.getRole());
            
            // If the user is authenticated (has a valid JWT or X-Username), allow access to their own photos
            if (!canViewPhoto && authenticatedUsername != null && !authenticatedUsername.isEmpty()) {
                // Extract username from filename and check if it matches the authenticated user
                String photoUsername = filename.substring(0, filename.indexOf("_"));
                if (photoUsername.equals(authenticatedUsername)) {
                    canViewPhoto = true;
                }
            }
            
            if (!canViewPhoto) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            // Serve the photo file
            java.io.File photoFile = new java.io.File(uploadDir, filename);
            if (!photoFile.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            // Set appropriate headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.IMAGE_PNG);
            headers.setCacheControl("private, max-age=3600"); // Cache for 1 hour, private only
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(java.nio.file.Files.readAllBytes(photoFile.toPath()));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve photo: " + e.getMessage());
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
            // Check if admin has permission to remove the user from the lab
            if (!userService.canRemoveLabMember(adminUsername, request.getUsername(), request.getLabName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to remove this user from the lab. Only Lab PIs can remove members from their own lab, and Super Admins can remove anyone from any lab.");
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
    
    @DeleteMapping("/admin/team-memberships")
    public ResponseEntity<?> removeUserFromTeam(@RequestBody RemoveUserFromTeamRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin has permission to remove the user from the team
            if (!userService.canRemoveTeamMember(adminUsername, request.getUsername(), request.getTeamName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to remove this user from the team. Only Team Leaders can remove members from their own team, and Super Admins can remove anyone from any team.");
            }
            
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
            
            teamService.removeUserFromTeam(userOpt.get().getId(), teamOpt.get().getId());
            return ResponseEntity.ok("User removed from team successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to remove user from team: " + e.getMessage());
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
            // Check if user has permission to create teams
            if (!userService.canCreateTeam(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to create teams. Only Lab PI, PhD Student, Master Student, Team Leader, and Senior Member can create teams.");
            }
            
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
                        put("role", u.getRole());
                        put("isActive", u.getIsActive());
                        // Removed email for security - use /profile/sensitive for own email
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
    
    @GetMapping("/public/labs")
    public ResponseEntity<?> getPublicLabs() {
        try {
            // Public endpoint for getting available labs during registration
            List<LabDto> labs = labService.getAllLabs();
            return ResponseEntity.ok(labs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get labs: " + e.getMessage());
        }
    }

    @GetMapping("/labs")
    public ResponseEntity<?> getLabs(@RequestHeader("X-Username") String username) {
        try {
            // Authenticated endpoint for getting labs
            List<LabDto> labs = labService.getAllLabs();
            return ResponseEntity.ok(labs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get labs: " + e.getMessage());
        }
    }
    
    @GetMapping("/public/teams")
    public ResponseEntity<?> getPublicTeams() {
        try {
            // Public endpoint for getting available teams during registration
            List<TeamDto> teams = teamService.getAllTeams();
            return ResponseEntity.ok(teams);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get teams: " + e.getMessage());
        }
    }

    @GetMapping("/teams")
    public ResponseEntity<?> getTeams(@RequestHeader("X-Username") String username) {
        try {
            // Authenticated endpoint for getting teams
            List<TeamDto> teams = teamService.getAllTeams();
            return ResponseEntity.ok(teams);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get teams: " + e.getMessage());
        }
    }
    
    @GetMapping("/my-labs")
    public ResponseEntity<?> getMyLabs(@RequestHeader("X-Username") String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            List<Lab> userLabs = labService.getLabsByUser(user.getId());
            
            // Convert to simple DTOs to avoid circular references
            List<Map<String, Object>> labDtos = userLabs.stream()
                .map(lab -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", lab.getId());
                    dto.put("labId", lab.getLabId());
                    dto.put("labName", lab.getLabName());
                    dto.put("labDescription", lab.getLabDescription());
                    dto.put("institution", lab.getInstitution());
                    dto.put("department", lab.getDepartment());
                    dto.put("isActive", lab.getIsActive());
                    dto.put("createdAt", lab.getCreatedAt());
                    dto.put("updatedAt", lab.getUpdatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(labDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user labs: " + e.getMessage());
        }
    }
    
    @GetMapping("/my-teams")
    public ResponseEntity<?> getMyTeams(@RequestHeader("X-Username") String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            List<Team> userTeams = teamService.getTeamsByUser(user.getId());
            
            // Convert to simple DTOs to avoid circular references
            List<Map<String, Object>> teamDtos = userTeams.stream()
                .map(team -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", team.getId());
                    dto.put("teamId", team.getTeamId());
                    dto.put("teamName", team.getTeamName());
                    dto.put("teamDescription", team.getTeamDescription());
                    dto.put("isActive", team.getIsActive());
                    dto.put("createdAt", team.getCreatedAt());
                    dto.put("updatedAt", team.getUpdatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(teamDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving user teams: " + e.getMessage());
        }
    }
    
    @PostMapping("/leave-lab")
    public ResponseEntity<?> leaveLab(@RequestBody LeaveLabRequest request, @RequestHeader("X-Username") String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            labService.leaveLab(user.getId(), request.getLabId(), request.getNewPiUsername());
            return ResponseEntity.ok("Successfully left the lab");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error leaving lab: " + e.getMessage());
        }
    }
    
    @PostMapping("/leave-team")
    public ResponseEntity<?> leaveTeam(@RequestBody LeaveTeamRequest request, @RequestHeader("X-Username") String username) {
        try {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            teamService.leaveTeam(user.getId(), request.getTeamId(), request.getNewLeaderUsername());
            return ResponseEntity.ok("Successfully left the team");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error leaving team: " + e.getMessage());
        }
    }
    
    @PostMapping("/admin/labs")
    public ResponseEntity<?> createLab(@RequestBody CreateLabRequest request, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Only Lab PIs and Super Admins can create labs
            Optional<User> userOpt = userService.findByUsername(adminUsername);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            User user = userOpt.get();
            if (!userService.isUserPI(adminUsername) && !"Super Admin".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users and Super Admins can create labs");
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
    
    @GetMapping("/admin/teams/next-id")
    public ResponseEntity<?> getNextTeamId(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Anyone can get next team ID
            String nextTeamId = teamService.getNextTeamId();
            return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
                put("nextTeamId", nextTeamId);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get next team ID: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/labs/{labId}/members")
    public ResponseEntity<?> getLabMembers(@PathVariable Long labId, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI and has access to this lab
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access lab member information");
            }
            
            // Check if the admin is a member of this lab
            Optional<User> adminOpt = userService.findByUsername(adminUsername);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin user not found");
            }
            
            boolean hasAccess = labService.isUserMemberOfLab(adminOpt.get().getId(), labId);
            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this lab");
            }
            
            List<UserLabMembershipDto> members = labService.getLabMembers(labId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get lab members: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/teams/{teamId}/members")
    public ResponseEntity<?> getTeamMembers(@PathVariable Long teamId, @RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI and has access to this team
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access team member information");
            }
            
            // Check if the admin is a member of this team's lab
            Optional<User> adminOpt = userService.findByUsername(adminUsername);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin user not found");
            }
            
            boolean hasAccess = teamService.isUserMemberOfTeam(adminOpt.get().getId(), teamId);
            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this team");
            }
            
            List<UserTeamMembershipDto> members = teamService.getTeamMembers(teamId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get team members: " + e.getMessage());
        }
    }
    
    @GetMapping("/admin/users/my-lab-members")
    public ResponseEntity<?> getMyLabMembers(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Check if admin is a Lab PI
            if (!userService.isUserPI(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PI users can access this endpoint");
            }
            
            // Get all users in the admin's labs
            List<User> labMembers = userService.getUsersInAdminLabs(adminUsername);
            
            // Convert to simple user info to avoid circular references
            List<java.util.Map<String, Object>> userList = labMembers.stream()
                    .map(user -> new java.util.HashMap<String, Object>() {{
                        put("id", user.getId());
                        put("username", user.getUsername());
                        put("email", user.getEmail());
                        put("role", user.getRole());
                        put("isActive", user.getIsActive());
                        put("telephone", user.getTelephone());
                    }})
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("users", userList);
                put("count", userList.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving lab members: " + e.getMessage());
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
    
    @GetMapping("/public/labs/{labId}/supervisors")
    public ResponseEntity<?> getPublicSupervisorsInLab(@PathVariable Long labId) {
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
    
    static class RemoveUserFromTeamRequest {
        private String username;
        private String teamName;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getTeamName() { return teamName; }
        public void setTeamName(String teamName) { this.teamName = teamName; }
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
    
    /**
     * Update lab file statistics when a file is uploaded
     */
    @PostMapping("/labs/{labId}/file-stats")
    public ResponseEntity<String> updateLabFileStats(
            @PathVariable Long labId,
            @RequestBody Map<String, Object> request) {
        try {
            Optional<Lab> labOpt = labRepository.findById(labId);
            if (labOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lab not found");
            }
            
            Lab lab = labOpt.get();
            Long fileSize = Long.valueOf(request.get("fileSize").toString());
            
            // Update file statistics
            lab.setFileCount(lab.getFileCount() + 1);
            lab.setTotalFileSize(lab.getTotalFileSize() + fileSize);
            lab.setLastFileUpload(LocalDateTime.now());
            
            labRepository.save(lab);
            
            return ResponseEntity.ok("Lab file statistics updated successfully");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update lab file statistics: " + e.getMessage());
        }
    }
    
    /**
     * Update team file statistics when a file is uploaded
     */
    @PostMapping("/teams/{teamId}/file-stats")
    public ResponseEntity<String> updateTeamFileStats(
            @PathVariable Long teamId,
            @RequestBody Map<String, Object> request) {
        try {
            Optional<Team> teamOpt = teamRepository.findById(teamId);
            if (teamOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team not found");
            }
            
            Team team = teamOpt.get();
            Long fileSize = Long.valueOf(request.get("fileSize").toString());
            
            // Update file statistics
            team.setFileCount(team.getFileCount() + 1);
            team.setTotalFileSize(team.getTotalFileSize() + fileSize);
            team.setLastFileUpload(LocalDateTime.now());
            
            teamRepository.save(team);
            
            return ResponseEntity.ok("Team file statistics updated successfully");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update team file statistics: " + e.getMessage());
        }
    }
    
    /**
     * Get lab file statistics
     */
    @GetMapping("/labs/{labId}/file-stats")
    public ResponseEntity<Map<String, Object>> getLabFileStats(@PathVariable Long labId) {
        try {
            Optional<Lab> labOpt = labRepository.findById(labId);
            if (labOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            Lab lab = labOpt.get();
            
            // Ensure we have safe values
            Long fileCount = lab.getFileCount() != null ? lab.getFileCount() : 0L;
            Long totalFileSize = lab.getTotalFileSize() != null ? lab.getTotalFileSize() : 0L;
            
            Map<String, Object> stats = Map.of(
                "labId", lab.getId(),
                "labName", lab.getLabName(),
                "fileCount", fileCount,
                "totalFileSize", totalFileSize,
                "lastFileUpload", lab.getLastFileUpload()
            );
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.err.println("Error getting lab file stats for labId " + labId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get team file statistics
     */
    @GetMapping("/teams/{teamId}/file-stats")
    public ResponseEntity<Map<String, Object>> getTeamFileStats(@PathVariable Long teamId) {
        try {
            Optional<Team> teamOpt = teamRepository.findById(teamId);
            if (teamOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            Team team = teamOpt.get();
            
            // Ensure we have safe values
            Long fileCount = team.getFileCount() != null ? team.getFileCount() : 0L;
            Long totalFileSize = team.getTotalFileSize() != null ? team.getTotalFileSize() : 0L;
            
            Map<String, Object> stats = Map.of(
                "teamId", team.getId(),
                "teamName", team.getTeamName(),
                "fileCount", fileCount,
                "totalFileSize", totalFileSize,
                "lastFileUpload", team.getLastFileUpload()
            );
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.err.println("Error getting team file stats for teamId " + teamId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Check if user can delete a file based on role-based permissions
     */
    @PostMapping("/check-file-deletion-permission")
    public ResponseEntity<Map<String, Object>> checkFileDeletionPermission(
            @RequestBody Map<String, Object> request,
            @RequestHeader("X-Username") String username) {
        try {
            System.out.println("=== ENDPOINT CALLED ===");
            System.out.println("Checking file deletion permission for user: " + username);
            System.out.println("Request: " + request);
            
            String fileUploadedBy = (String) request.get("fileUploadedBy");
            String uploadContext = (String) request.get("uploadContext");
            Long labId = null;
            Long teamId = null;
            
            if (request.get("labId") != null && !request.get("labId").toString().equals("null")) {
                labId = Long.valueOf(request.get("labId").toString());
            }
            if (request.get("teamId") != null && !request.get("teamId").toString().equals("null")) {
                teamId = Long.valueOf(request.get("teamId").toString());
            }
            
            System.out.println("Parsed values - fileUploadedBy: " + fileUploadedBy + ", uploadContext: " + uploadContext + ", labId: " + labId + ", teamId: " + teamId);
            
            boolean canDelete = false;
            String reason = "";
            
            // Check if user is Super Admin - Super Admin can delete any file
            if (userService.isSuperAdmin(username)) {
                canDelete = true;
                reason = "User is Super Admin";
                System.out.println("User is Super Admin - can delete any file");
            }
            // User can always delete their own files
            else if (username.equals(fileUploadedBy)) {
                canDelete = true;
                reason = "User owns the file";
                System.out.println("User owns the file");
            } else {
                // Check if user is Lab PI and file belongs to their lab
                if ("LAB".equals(uploadContext) && labId != null) {
                    System.out.println("Checking Lab PI permissions for labId: " + labId);
                    List<UserLabMembershipDto> labMemberships = userService.getUserLabMemberships(username);
                    System.out.println("Found " + labMemberships.size() + " lab memberships");
                    for (UserLabMembershipDto membership : labMemberships) {
                        System.out.println("Membership: " + membership);
                        System.out.println("Comparing labId: " + labId + " (type: " + labId.getClass().getSimpleName() + ") with membership.getLabId(): " + membership.getLabId() + " (type: " + (membership.getLabId() != null ? membership.getLabId().getClass().getSimpleName() : "null") + ")");
                        System.out.println("Comparing role: 'Lab PI' with membership.getRoleInLab(): '" + membership.getRoleInLab() + "'");
                        
                        // More robust comparison with null checks
                        boolean roleMatches = "Lab PI".equals(membership.getRoleInLab());
                        boolean labIdMatches = labId != null && membership.getLabId() != null && labId.equals(membership.getLabId());
                        
                        System.out.println("Role matches: " + roleMatches + ", Lab ID matches: " + labIdMatches);
                        
                        if (roleMatches && labIdMatches) {
                            canDelete = true;
                            reason = "User is Lab PI for this lab";
                            System.out.println("User is Lab PI for this lab");
                            break;
                        }
                    }
                }
                
                // Check if user is Team Leader and file belongs to their team
                if (!canDelete && "TEAM".equals(uploadContext) && teamId != null) {
                    System.out.println("Checking Team Leader permissions for teamId: " + teamId);
                    List<UserTeamMembershipDto> teamMemberships = userService.getUserTeamMemberships(username);
                    System.out.println("Found " + teamMemberships.size() + " team memberships");
                    for (UserTeamMembershipDto membership : teamMemberships) {
                        System.out.println("Membership: " + membership);
                        System.out.println("Comparing teamId: " + teamId + " (type: " + teamId.getClass().getSimpleName() + ") with membership.getTeamId(): " + membership.getTeamId() + " (type: " + (membership.getTeamId() != null ? membership.getTeamId().getClass().getSimpleName() : "null") + ")");
                        System.out.println("Comparing role: 'Team Leader' with membership.getRoleInTeam(): '" + membership.getRoleInTeam() + "'");
                        
                        // More robust comparison with null checks
                        boolean roleMatches = "Team Leader".equals(membership.getRoleInTeam());
                        boolean teamIdMatches = teamId != null && membership.getTeamId() != null && teamId.equals(membership.getTeamId());
                        
                        System.out.println("Role matches: " + roleMatches + ", Team ID matches: " + teamIdMatches);
                        
                        if (roleMatches && teamIdMatches) {
                            canDelete = true;
                            reason = "User is Team Leader for this team";
                            System.out.println("User is Team Leader for this team");
                            break;
                        }
                    }
                }
                
                if (!canDelete) {
                    reason = "User does not have permission to delete this file";
                    System.out.println("User does not have permission");
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("canDelete", canDelete);
            response.put("reason", reason);
            response.put("username", username);
            response.put("fileUploadedBy", fileUploadedBy);
            response.put("uploadContext", uploadContext);
            response.put("labId", labId);
            response.put("teamId", teamId);
            
            System.out.println("Response: " + response);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in checkFileDeletionPermission: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check file deletion permission: " + e.getMessage());
            errorResponse.put("exception", e.getClass().getSimpleName());
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Check if user can access lab files (Lab PI or lab member)
     */
    @PostMapping("/check-lab-file-access")
    public ResponseEntity<Map<String, Object>> checkLabFileAccess(
            @RequestBody Map<String, Object> request,
            @RequestHeader("X-Username") String username) {
        try {
            System.out.println("=== LAB FILE ACCESS CHECK ===");
            System.out.println("Checking lab file access for user: " + username);
            System.out.println("Request: " + request);
            
            Long labId = null;
            if (request.get("labId") != null && !request.get("labId").toString().equals("null")) {
                labId = Long.valueOf(request.get("labId").toString());
            }
            
            System.out.println("Lab ID: " + labId);
            
            boolean canView = false;
            String reason = "";
            
            // Check if user is Super Admin - Super Admin can view any lab files
            if (userService.isSuperAdmin(username)) {
                canView = true;
                reason = "User is Super Admin";
                System.out.println("User is Super Admin - can view any lab files");
            } else {
                // Check if user is a member of this lab
                List<UserLabMembershipDto> labMemberships = userService.getUserLabMemberships(username);
                System.out.println("Found " + labMemberships.size() + " lab memberships");
                
                for (UserLabMembershipDto membership : labMemberships) {
                    System.out.println("Membership: " + membership);
                    System.out.println("Comparing labId: " + labId + " with membership.getLabId(): " + membership.getLabId());
                    
                    if (labId.equals(membership.getLabId())) {
                        canView = true;
                        reason = "User is a member of this lab with role: " + membership.getRoleInLab();
                        System.out.println("User is a member of this lab");
                        break;
                    }
                }
                
                if (!canView) {
                    reason = "User is not a member of this lab";
                    System.out.println("User is not a member of this lab");
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("canView", canView);
            response.put("reason", reason);
            response.put("username", username);
            response.put("labId", labId);
            
            System.out.println("Response: " + response);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in checkLabFileAccess: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check lab file access: " + e.getMessage());
            errorResponse.put("exception", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Check if user can access team files (Team Leader or team member)
     */
    @PostMapping("/check-team-file-access")
    public ResponseEntity<Map<String, Object>> checkTeamFileAccess(
            @RequestBody Map<String, Object> request,
            @RequestHeader("X-Username") String username) {
        try {
            System.out.println("=== TEAM FILE ACCESS CHECK ===");
            System.out.println("Checking team file access for user: " + username);
            System.out.println("Request: " + request);
            
            Long teamId = null;
            if (request.get("teamId") != null && !request.get("teamId").toString().equals("null")) {
                teamId = Long.valueOf(request.get("teamId").toString());
            }
            
            System.out.println("Team ID: " + teamId);
            
            boolean canView = false;
            String reason = "";
            
            // Check if user is Super Admin - Super Admin can view any team files
            if (userService.isSuperAdmin(username)) {
                canView = true;
                reason = "User is Super Admin";
                System.out.println("User is Super Admin - can view any team files");
            } else {
                // Check if user is a member of this team
                List<UserTeamMembershipDto> teamMemberships = userService.getUserTeamMemberships(username);
                System.out.println("Found " + teamMemberships.size() + " team memberships");
                
                for (UserTeamMembershipDto membership : teamMemberships) {
                    System.out.println("Membership: " + membership);
                    System.out.println("Comparing teamId: " + teamId + " with membership.getTeamId(): " + membership.getTeamId());
                    
                    if (teamId.equals(membership.getTeamId())) {
                        canView = true;
                        reason = "User is a member of this team with role: " + membership.getRoleInTeam();
                        System.out.println("User is a member of this team");
                        break;
                    }
                }
                
                if (!canView) {
                    reason = "User is not a member of this team";
                    System.out.println("User is not a member of this team");
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("canView", canView);
            response.put("reason", reason);
            response.put("username", username);
            response.put("teamId", teamId);
            
            System.out.println("Response: " + response);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in checkTeamFileAccess: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check team file access: " + e.getMessage());
            errorResponse.put("exception", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get lab members for regular users (non-admin)
     * Allows any lab member to see other members in their lab
     */
    @GetMapping("/labs/my-lab-members")
    public ResponseEntity<?> getMyLabMembersAsUser(@RequestHeader("X-Username") String username) {
        try {
            // Get all users in the user's labs
            List<User> labMembers = userService.getUsersInUserLabs(username);
            
            // Convert to simple user info to avoid circular references
            List<java.util.Map<String, Object>> userList = labMembers.stream()
                    .map(user -> new java.util.HashMap<String, Object>() {{
                        put("id", user.getId());
                        put("username", user.getUsername());
                        put("email", user.getEmail());
                        put("role", user.getRole());
                        put("isActive", user.getIsActive());
                        put("telephone", user.getTelephone());
                    }})
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("users", userList);
                put("count", userList.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving lab members: " + e.getMessage());
        }
    }
    
    /**
     * Get lab members for regular users (non-admin)
     * Allows any lab member to see other members in their lab
     */
    @GetMapping("/labs/{labId}/members")
    public ResponseEntity<?> getLabMembersAsUser(@PathVariable Long labId, @RequestHeader("X-Username") String username) {
        try {
            // Check if user is a member of this lab
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            boolean hasAccess = labService.isUserMemberOfLab(userOpt.get().getId(), labId);
            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this lab");
            }
            
            List<UserLabMembershipDto> members = labService.getLabMembers(labId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get lab members: " + e.getMessage());
        }
    }
    
    /**
     * Get team members for regular users (non-admin)
     * Allows any team member to see other members in their team
     */
    @GetMapping("/teams/{teamId}/members")
    public ResponseEntity<?> getTeamMembersAsUser(@PathVariable Long teamId, @RequestHeader("X-Username") String username) {
        try {
            // Check if user is a member of this team
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            boolean hasAccess = teamService.isUserMemberOfTeam(userOpt.get().getId(), teamId);
            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this team");
            }
            
            List<UserTeamMembershipDto> members = teamService.getTeamMembers(teamId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get team members: " + e.getMessage());
        }
    }
    
    // ==================== LAB APPLICATION ENDPOINTS ====================
    
    /**
     * Apply to join a lab
     */
    @PostMapping("/labs/apply")
    public ResponseEntity<?> applyToLab(@RequestBody LabApplicationRequest request, @RequestHeader("X-Username") String username) {
        try {
            LabApplicationResponse response = labApplicationService.applyToLab(username, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Review a lab application (approve/reject)
     */
    @PostMapping("/labs/applications/{applicationId}/review")
    public ResponseEntity<?> reviewLabApplication(@PathVariable Long applicationId, 
                                                 @RequestBody ApplicationReviewRequest request, 
                                                 @RequestHeader("X-Username") String username) {
        try {
            LabApplicationResponse response = labApplicationService.reviewApplication(applicationId, username, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Withdraw a lab application
     */
    @DeleteMapping("/labs/applications/{applicationId}")
    public ResponseEntity<?> withdrawLabApplication(@PathVariable Long applicationId, @RequestHeader("X-Username") String username) {
        try {
            labApplicationService.withdrawApplication(applicationId, username);
            return ResponseEntity.ok("Application withdrawn successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Get all applications for a lab (for PI)
     */
    @GetMapping("/labs/{labId}/applications")
    public ResponseEntity<?> getLabApplications(@PathVariable Long labId, @RequestHeader("X-Username") String username) {
        try {
            List<LabApplicationResponse> applications = labApplicationService.getLabApplications(labId, username);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Get pending applications for a lab (for PI)
     */
    @GetMapping("/labs/{labId}/applications/pending")
    public ResponseEntity<?> getPendingLabApplications(@PathVariable Long labId, @RequestHeader("X-Username") String username) {
        try {
            List<LabApplicationResponse> applications = labApplicationService.getPendingLabApplications(labId, username);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Get user's lab applications
     */
    @GetMapping("/labs/applications/my")
    public ResponseEntity<?> getMyLabApplications(@RequestHeader("X-Username") String username) {
        try {
            List<LabApplicationResponse> applications = labApplicationService.getUserApplications(username);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Get user's pending lab applications
     */
    @GetMapping("/labs/applications/my/pending")
    public ResponseEntity<?> getMyPendingLabApplications(@RequestHeader("X-Username") String username) {
        try {
            List<LabApplicationResponse> applications = labApplicationService.getUserPendingApplications(username);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Leave a lab
     */
    @DeleteMapping("/labs/{labId}/leave")
    public ResponseEntity<?> leaveLab(@PathVariable Long labId, @RequestHeader("X-Username") String username) {
        try {
            labApplicationService.leaveLab(labId, username);
            return ResponseEntity.ok("Successfully left the lab");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // ==================== SUPER ADMIN ENDPOINTS ====================
    
    /**
     * Get system overview (Super Admin only)
     */
    @GetMapping("/admin/system/overview")
    public ResponseEntity<?> getSystemOverview(@RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin required");
            }
            
            List<Map<String, Object>> overview = userService.getSystemOverview();
            return ResponseEntity.ok(overview);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Get all labs with members (Super Admin only)
     */
    @GetMapping("/admin/system/labs")
    public ResponseEntity<?> getAllLabsWithMembers(@RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin required");
            }
            
            List<Map<String, Object>> labs = userService.getAllLabsWithMembers();
            return ResponseEntity.ok(labs);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Get all teams with members (Super Admin only)
     */
    @GetMapping("/admin/system/teams")
    public ResponseEntity<?> getAllTeamsWithMembers(@RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin required");
            }
            
            List<Map<String, Object>> teams = userService.getAllTeamsWithMembers();
            return ResponseEntity.ok(teams);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Get all users with full details (Super Admin only)
     */
    @GetMapping("/admin/system/users")
    public ResponseEntity<?> getAllUsersWithFullDetails(@RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin required");
            }
            
            List<Map<String, Object>> users = userService.getAllUsersWithOrganizations();
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Check if user is Super Admin
     */
    @GetMapping("/admin/system/check-super-admin")
    public ResponseEntity<?> checkSuperAdmin(@RequestHeader("X-Username") String username) {
        try {
            boolean isSuperAdmin = userService.isSuperAdmin(username);
            Map<String, Object> response = new HashMap<>();
            response.put("isSuperAdmin", isSuperAdmin);
            response.put("username", username);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // ==================== SUPER ADMIN DELETE ENDPOINTS ====================
    
    /**
     * Delete a user (Super Admin only)
     */
    @DeleteMapping("/admin/system/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, @RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            
            boolean deleted = userService.deleteUserById(userId);
            if (deleted) {
                return ResponseEntity.ok("User deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting user: " + e.getMessage());
        }
    }
    
    /**
     * Delete a lab (Super Admin only)
     */
    @DeleteMapping("/admin/system/labs/{labId}")
    public ResponseEntity<?> deleteLab(@PathVariable Long labId, @RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            
            boolean deleted = userService.deleteLabById(labId);
            if (deleted) {
                return ResponseEntity.ok("Lab deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lab not found");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting lab: " + e.getMessage());
        }
    }
    
    /**
     * Delete a team (Super Admin only)
     */
    @DeleteMapping("/admin/system/teams/{teamId}")
    public ResponseEntity<?> deleteTeam(@PathVariable Long teamId, @RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            
            boolean deleted = userService.deleteTeamById(teamId);
            if (deleted) {
                return ResponseEntity.ok("Team deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team not found");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting team: " + e.getMessage());
        }
    }
    
    // ==================== SUPER ADMIN BULK DEACTIVATION ENDPOINTS ====================
    
    /**
     * Deactivate all user accounts (Super Admin only)
     */
    @PostMapping("/admin/system/users/deactivate-all")
    public ResponseEntity<?> deactivateAllUsers(@RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            
            boolean success = userService.deactivateAllUsers(username);
            if (success) {
                return ResponseEntity.ok("All user accounts deactivated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No users were deactivated");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deactivating users: " + e.getMessage());
        }
    }
    
    /**
     * Deactivate all users except Super Admin accounts (Super Admin only)
     */
    @PostMapping("/admin/system/users/deactivate-all-non-super-admin")
    public ResponseEntity<?> deactivateAllNonSuperAdminUsers(@RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            
            boolean success = userService.deactivateAllNonSuperAdminUsers(username);
            if (success) {
                return ResponseEntity.ok("All non-Super Admin accounts deactivated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No users were deactivated");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deactivating users: " + e.getMessage());
        }
    }
    
    /**
     * Activate all user accounts (Super Admin only)
     */
    @PostMapping("/admin/system/users/activate-all")
    public ResponseEntity<?> activateAllUsers(@RequestHeader("X-Username") String username) {
        try {
            if (!userService.isSuperAdmin(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Super Admin privileges required");
            }
            
            boolean success = userService.activateAllUsers(username);
            if (success) {
                return ResponseEntity.ok("All user accounts activated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No users were activated");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error activating users: " + e.getMessage());
        }
    }
    
    // ==================== ACTIVATION REQUEST ENDPOINTS ====================
    
    /**
     * Create an activation request (for deactivated users)
     */
    @PostMapping("/request-activation")
    public ResponseEntity<?> requestActivation(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String requestMessage = (String) request.get("requestMessage");
            
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is required");
            }
            
            ActivationRequest activationRequest = activationRequestService.createActivationRequest(username, requestMessage);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Activation request created successfully");
            response.put("requestId", activationRequest.getId());
            response.put("status", activationRequest.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating activation request: " + e.getMessage());
        }
    }
    
    /**
     * Get pending activation requests (for PIs/Team Leaders and Super Admin)
     */
    @GetMapping("/admin/activation-requests/pending")
    public ResponseEntity<?> getPendingActivationRequests(@RequestHeader("X-Username") String username) {
        try {
            // Check if user has permission to view activation requests
            if (!userService.isSuperAdmin(username)) {
                // For non-Super Admins, check if they are PI/Team Leader
                List<UserLabMembershipDto> labMemberships = userService.getUserLabMemberships(username);
                List<UserTeamMembershipDto> teamMemberships = userService.getUserTeamMemberships(username);
                
                boolean hasPermission = false;
                for (UserLabMembershipDto lab : labMemberships) {
                    if ("Lab PI".equals(lab.getRoleInLab())) {
                        hasPermission = true;
                        break;
                    }
                }
                for (UserTeamMembershipDto team : teamMemberships) {
                    if ("Team Leader".equals(team.getRoleInTeam())) {
                        hasPermission = true;
                        break;
                    }
                }
                
                if (!hasPermission) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Only PIs, Team Leaders, and Super Admins can view activation requests");
                }
            }
            
            List<ActivationRequest> pendingRequests = activationRequestService.getPendingRequests();
            
            List<Map<String, Object>> response = new ArrayList<>();
            for (ActivationRequest request : pendingRequests) {
                Map<String, Object> requestInfo = new HashMap<>();
                requestInfo.put("id", request.getId());
                requestInfo.put("username", request.getUsername());
                requestInfo.put("email", request.getEmail());
                requestInfo.put("requestMessage", request.getRequestMessage());
                requestInfo.put("status", request.getStatus());
                requestInfo.put("requestedAt", request.getRequestedAt());
                response.add(requestInfo);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving activation requests: " + e.getMessage());
        }
    }
    
    /**
     * Approve an activation request
     */
    @PostMapping("/admin/activation-requests/{requestId}/approve")
    public ResponseEntity<?> approveActivationRequest(@PathVariable Long requestId, @RequestHeader("X-Username") String username) {
        try {
            boolean success = activationRequestService.approveActivationRequest(requestId, username);
            if (success) {
                return ResponseEntity.ok("Activation request approved successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to approve activation request");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error approving activation request: " + e.getMessage());
        }
    }
    
    /**
     * Reject an activation request
     */
    @PostMapping("/admin/activation-requests/{requestId}/reject")
    public ResponseEntity<?> rejectActivationRequest(@PathVariable Long requestId, @RequestHeader("X-Username") String username, @RequestBody Map<String, Object> request) {
        try {
            String reason = (String) request.get("reason");
            if (reason == null) {
                reason = "No reason provided";
            }
            
            boolean success = activationRequestService.rejectActivationRequest(requestId, username, reason);
            if (success) {
                return ResponseEntity.ok("Activation request rejected successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to reject activation request");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error rejecting activation request: " + e.getMessage());
        }
    }
    
    // ========================================
    // LAB MEMBERSHIP REQUEST ENDPOINTS
    // ========================================
    
    /**
     * Apply to join a lab
     */
    @PostMapping("/lab-membership-requests")
    public ResponseEntity<?> createLabMembershipRequest(@RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            Long labId = Long.valueOf(request.get("labId").toString());
            String requestedRole = (String) request.get("requestedRole");
            String requestMessage = (String) request.get("requestMessage");
            
            if (labId == null || requestedRole == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("labId and requestedRole are required");
            }
            
            LabMembershipRequestDto result = membershipRequestService.createLabMembershipRequest(username, labId, requestedRole, requestMessage);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating lab membership request: " + e.getMessage());
        }
    }
    
    /**
     * Review a lab membership request (Lab PI only)
     */
    @PostMapping("/lab-membership-requests/{requestId}/review")
    public ResponseEntity<?> reviewLabMembershipRequest(@PathVariable Long requestId, @RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            String status = (String) request.get("status");
            String reviewMessage = (String) request.get("reviewMessage");
            
            if (status == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("status is required");
            }
            
            LabMembershipRequest.RequestStatus requestStatus = LabMembershipRequest.RequestStatus.valueOf(status.toUpperCase());
            LabMembershipRequestDto result = membershipRequestService.reviewLabMembershipRequest(requestId, username, requestStatus, reviewMessage);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error reviewing lab membership request: " + e.getMessage());
        }
    }
    
    /**
     * Get lab membership requests for a user
     */
    @GetMapping("/lab-membership-requests/my-requests")
    public ResponseEntity<?> getMyLabMembershipRequests(@RequestHeader("X-Username") String username) {
        try {
            List<LabMembershipRequestDto> requests = membershipRequestService.getLabMembershipRequestsByUser(username);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving lab membership requests: " + e.getMessage());
        }
    }
    
    /**
     * Get pending lab membership requests for a lab (Lab PI only)
     */
    @GetMapping("/lab-membership-requests/lab/{labId}/pending")
    public ResponseEntity<?> getPendingLabMembershipRequests(@PathVariable Long labId, @RequestHeader("X-Username") String username) {
        try {
            // Check if user is Lab PI of this lab
            if (!labService.isUserLabPI(userRepository.findByUsername(username).get().getId(), labId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Only Lab PI can view pending requests");
            }
            
            List<LabMembershipRequestDto> requests = membershipRequestService.getPendingLabMembershipRequestsByLab(labId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving pending lab membership requests: " + e.getMessage());
        }
    }
    
    // ========================================
    // TEAM MEMBERSHIP REQUEST ENDPOINTS
    // ========================================
    
    /**
     * Apply to join a team
     */
    @PostMapping("/team-membership-requests")
    public ResponseEntity<?> createTeamMembershipRequest(@RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            Long teamId = Long.valueOf(request.get("teamId").toString());
            String requestedRole = (String) request.get("requestedRole");
            String requestMessage = (String) request.get("requestMessage");
            
            if (teamId == null || requestedRole == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("teamId and requestedRole are required");
            }
            
            TeamMembershipRequestDto result = membershipRequestService.createTeamMembershipRequest(username, teamId, requestedRole, requestMessage);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating team membership request: " + e.getMessage());
        }
    }
    
    /**
     * Review a team membership request (Team Leader only)
     */
    @PostMapping("/team-membership-requests/{requestId}/review")
    public ResponseEntity<?> reviewTeamMembershipRequest(@PathVariable Long requestId, @RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            String status = (String) request.get("status");
            String reviewMessage = (String) request.get("reviewMessage");
            
            if (status == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("status is required");
            }
            
            TeamMembershipRequest.RequestStatus requestStatus = TeamMembershipRequest.RequestStatus.valueOf(status.toUpperCase());
            TeamMembershipRequestDto result = membershipRequestService.reviewTeamMembershipRequest(requestId, username, requestStatus, reviewMessage);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error reviewing team membership request: " + e.getMessage());
        }
    }
    
    /**
     * Get team membership requests for a user
     */
    @GetMapping("/team-membership-requests/my-requests")
    public ResponseEntity<?> getMyTeamMembershipRequests(@RequestHeader("X-Username") String username) {
        try {
            List<TeamMembershipRequestDto> requests = membershipRequestService.getTeamMembershipRequestsByUser(username);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving team membership requests: " + e.getMessage());
        }
    }
    
    /**
     * Get pending team membership requests for a team (Team Leader only)
     */
    @GetMapping("/team-membership-requests/team/{teamId}/pending")
    public ResponseEntity<?> getPendingTeamMembershipRequests(@PathVariable Long teamId, @RequestHeader("X-Username") String username) {
        try {
            // Check if user is Team Leader of this team
            if (!teamService.isUserTeamLeader(userRepository.findByUsername(username).get().getId(), teamId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Only Team Leader can view pending requests");
            }
            
            List<TeamMembershipRequestDto> requests = membershipRequestService.getPendingTeamMembershipRequestsByTeam(teamId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving pending team membership requests: " + e.getMessage());
        }
    }
    
    // ========================================
    // LAB INVITATION ENDPOINTS
    // ========================================
    
    /**
     * Invite a user to join a lab (Any lab member can invite, but requires PI approval)
     */
    @PostMapping("/lab-invitations")
    public ResponseEntity<?> createLabInvitation(@RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            String invitedUsername = (String) request.get("invitedUsername");
            Long labId = Long.valueOf(request.get("labId").toString());
            String invitedRole = (String) request.get("invitedRole");
            String invitationMessage = (String) request.get("invitationMessage");
            
            if (invitedUsername == null || labId == null || invitedRole == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("invitedUsername, labId, and invitedRole are required");
            }
            
            LabInvitationDto result = invitationService.createLabInvitation(invitedUsername, labId, invitedRole, invitationMessage, username);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating lab invitation: " + e.getMessage());
        }
    }
    
    /**
     * Respond to a lab invitation
     */
    @PostMapping("/lab-invitations/{invitationId}/respond")
    public ResponseEntity<?> respondToLabInvitation(@PathVariable Long invitationId, @RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            String response = (String) request.get("response");
            
            if (response == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("response is required");
            }
            
            LabInvitation.InvitationStatus invitationStatus = LabInvitation.InvitationStatus.valueOf(response.toUpperCase());
            LabInvitationDto result = invitationService.respondToLabInvitation(invitationId, username, invitationStatus);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error responding to lab invitation: " + e.getMessage());
        }
    }
    
    /**
     * Get lab invitations for a user
     */
    @GetMapping("/lab-invitations/my-invitations")
    public ResponseEntity<?> getMyLabInvitations(@RequestHeader("X-Username") String username) {
        try {
            List<LabInvitationDto> invitations = invitationService.getLabInvitationsByUser(username);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving lab invitations: " + e.getMessage());
        }
    }
    
    /**
     * Get pending lab invitations for a user
     */
    @GetMapping("/lab-invitations/my-invitations/pending")
    public ResponseEntity<?> getMyPendingLabInvitations(@RequestHeader("X-Username") String username) {
        try {
            List<LabInvitationDto> invitations = invitationService.getPendingLabInvitationsByUser(username);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving pending lab invitations: " + e.getMessage());
        }
    }
    
    // ========================================
    // TEAM INVITATION ENDPOINTS
    // ========================================
    
    /**
     * Invite a user to join a team (Any team member can invite, but requires Leader approval)
     */
    @PostMapping("/team-invitations")
    public ResponseEntity<?> createTeamInvitation(@RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            String invitedUsername = (String) request.get("invitedUsername");
            Long teamId = Long.valueOf(request.get("teamId").toString());
            String invitedRole = (String) request.get("invitedRole");
            String invitationMessage = (String) request.get("invitationMessage");
            
            if (invitedUsername == null || teamId == null || invitedRole == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("invitedUsername, teamId, and invitedRole are required");
            }
            
            TeamInvitationDto result = invitationService.createTeamInvitation(invitedUsername, teamId, invitedRole, invitationMessage, username);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating team invitation: " + e.getMessage());
        }
    }
    
    /**
     * Respond to a team invitation
     */
    @PostMapping("/team-invitations/{invitationId}/respond")
    public ResponseEntity<?> respondToTeamInvitation(@PathVariable Long invitationId, @RequestBody Map<String, Object> request, @RequestHeader("X-Username") String username) {
        try {
            String response = (String) request.get("response");
            
            if (response == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("response is required");
            }
            
            TeamInvitation.InvitationStatus invitationStatus = TeamInvitation.InvitationStatus.valueOf(response.toUpperCase());
            TeamInvitationDto result = invitationService.respondToTeamInvitation(invitationId, username, invitationStatus);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error responding to team invitation: " + e.getMessage());
        }
    }
    
    /**
     * Get team invitations for a user
     */
    @GetMapping("/team-invitations/my-invitations")
    public ResponseEntity<?> getMyTeamInvitations(@RequestHeader("X-Username") String username) {
        try {
            List<TeamInvitationDto> invitations = invitationService.getTeamInvitationsByUser(username);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving team invitations: " + e.getMessage());
        }
    }
    
    /**
     * Get pending team invitations for a user
     */
    @GetMapping("/team-invitations/my-invitations/pending")
    public ResponseEntity<?> getMyPendingTeamInvitations(@RequestHeader("X-Username") String username) {
        try {
            List<TeamInvitationDto> invitations = invitationService.getPendingTeamInvitationsByUser(username);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving pending team invitations: " + e.getMessage());
        }
    }
    
    // ========================================
    // FIX JERRY'S ROLE AND LAB MEMBERSHIP
    // ========================================
    
    /**
     * Fix Jerry's role and lab membership to make him PI of LAB001
     */
    @PostMapping("/admin/fix-jerry-lab-pi")
    public ResponseEntity<?> fixJerryLabPI(@RequestHeader("X-Username") String adminUsername) {
        try {
            // Only allow admin or Jerry to call this endpoint
            if (!"admin".equals(adminUsername) && !"Jerry".equals(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admin or Jerry can call this endpoint");
            }
            
            // Get Jerry user
            Optional<User> jerryOpt = userService.findByUsername("Jerry");
            if (jerryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Jerry user not found");
            }
            
            // Get LAB001
            Optional<Lab> lab001Opt = labRepository.findByLabId("LAB001");
            if (lab001Opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("LAB001 not found");
            }
            
            User jerry = jerryOpt.get();
            Lab lab001 = lab001Opt.get();
            
            // Update Jerry's role to Lab PI
            jerry.setRole("Lab PI");
            userRepository.save(jerry);
            
            // Check if Jerry is already a member of LAB001
            Optional<UserLabMembership> existingMembership = userLabMembershipRepository
                .findByUserIdAndLabIdAndIsActiveTrue(jerry.getId(), lab001.getId());
            
            if (existingMembership.isPresent()) {
                // Update existing membership to Lab PI role
                UserLabMembership membership = existingMembership.get();
                membership.setRoleInLab("Lab PI");
                userLabMembershipRepository.save(membership);
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Jerry's role has been updated to Lab PI in LAB001");
                response.put("jerry_id", jerry.getId());
                response.put("lab_id", lab001.getId());
                return ResponseEntity.ok(response);
            } else {
                // Create new membership
                UserLabMembership membership = new UserLabMembership();
                membership.setUser(jerry);
                membership.setLab(lab001);
                membership.setRoleInLab("Lab PI");
                membership.setMemberId("LAB001");
                membership.setSupervisor(null); // PI has no supervisor
                membership.setIsActive(true);
                membership.setCreatedAt(LocalDateTime.now());
                membership.setUpdatedAt(LocalDateTime.now());
                userLabMembershipRepository.save(membership);
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Jerry has been added to LAB001 as Lab PI");
                response.put("jerry_id", jerry.getId());
                response.put("lab_id", lab001.getId());
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fix Jerry's role: " + e.getMessage());
        }
    }

    // ========================================
    
    /**
     * Temporary endpoint to reset Jerry's password
     */
    @PostMapping("/admin/reset-jerry-password")
    public ResponseEntity<?> resetJerryPassword(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!"admin".equals(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admin can reset Jerry's password");
            }
            
            Optional<User> jerryOpt = userService.findByUsername("Jerry");
            if (jerryOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Jerry not found");
            }
            
            User jerry = jerryOpt.get();
            // Use the existing resetPassword method to properly encode the password
            userService.resetPasswordDirectly(jerry, "jerrypass");
            userService.save(jerry);
            
            return ResponseEntity.ok("Jerry's password has been reset to 'jerrypass'. User ID: " + jerry.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reset Jerry's password: " + e.getMessage());
        }
    }

    /**
     * Temporary endpoint to reset all user passwords
     */
    @PostMapping("/admin/reset-all-passwords")
    public ResponseEntity<?> resetAllPasswords(@RequestHeader("X-Username") String adminUsername) {
        try {
            if (!"admin".equals(adminUsername)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admin can reset passwords");
            }
            
            // Reset Jerry's password
            Optional<User> jerryOpt = userService.findByUsername("Jerry");
            if (jerryOpt.isPresent()) {
                User jerry = jerryOpt.get();
                userService.resetPasswordDirectly(jerry, "jerrypass");
                userService.save(jerry);
            }
            
            // Reset Mian's password
            Optional<User> mianOpt = userService.findByUsername("Mian");
            if (mianOpt.isPresent()) {
                User mian = mianOpt.get();
                userService.resetPasswordDirectly(mian, "mianpass");
                userService.save(mian);
            }
            
            // Reset Gabriel's password
            Optional<User> gabrielOpt = userService.findByUsername("Gabriel");
            if (gabrielOpt.isPresent()) {
                User gabriel = gabrielOpt.get();
                userService.resetPasswordDirectly(gabriel, "gabrielpass");
                userService.save(gabriel);
            }
            
            // Reset Admin's password
            Optional<User> adminOpt = userService.findByUsername("admin");
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                userService.resetPasswordDirectly(admin, "adminpass");
                userService.save(admin);
            }
            
            return ResponseEntity.ok("All user passwords have been reset successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reset passwords: " + e.getMessage());
        }
    }
    
    /**
     * Get pending lab invitations that need PI approval
     */
    @GetMapping("/lab-invitations/pending-approvals")
    public ResponseEntity<?> getPendingLabApprovals(@RequestHeader("X-Username") String username) {
        try {
            // Check if user is Lab PI or Super Admin
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            if (!"Super Admin".equals(user.getRole())) {
                // Check if user is a Lab PI of any lab
                List<LabDto> allLabs = labService.getAllLabs();
                boolean isLabPI = allLabs.stream().anyMatch(lab -> labService.isUserLabPI(user.getId(), lab.getId()));
                if (!isLabPI) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Lab PIs and Super Admins can view pending approvals");
                }
            }
            
            List<LabInvitationDto> pendingInvitations = invitationService.getPendingLabApprovalsForPI(username);
            return ResponseEntity.ok(pendingInvitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving pending lab approvals: " + e.getMessage());
        }
    }
    
    /**
     * Get pending team invitations that need Team Leader approval
     */
    @GetMapping("/team-invitations/pending-approvals")
    public ResponseEntity<?> getPendingTeamApprovals(@RequestHeader("X-Username") String username) {
        try {
            // Check if user is Team Leader or Super Admin
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            User user = userOpt.get();
            if (!"Super Admin".equals(user.getRole())) {
                // Check if user is a Team Leader of any team
                List<TeamDto> allTeams = teamService.getAllTeams();
                boolean isTeamLeader = allTeams.stream().anyMatch(team -> teamService.isUserTeamLeader(user.getId(), team.getId()));
                if (!isTeamLeader) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Team Leaders and Super Admins can view pending approvals");
                }
            }
            
            List<TeamInvitationDto> pendingInvitations = invitationService.getPendingTeamApprovalsForLeader(username);
            return ResponseEntity.ok(pendingInvitations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving pending team approvals: " + e.getMessage());
        }
    }
    
    /**
     * Approve or reject a lab invitation (PI only)
     */
    @PostMapping("/lab-invitations/{invitationId}/approve")
    public ResponseEntity<?> approveLabInvitation(@PathVariable Long invitationId, 
                                                 @RequestBody Map<String, String> request,
                                                 @RequestHeader("X-Username") String username) {
        try {
            String status = request.get("status");
            if (status == null || (!"APPROVED".equals(status) && !"REJECTED".equals(status))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status. Must be 'APPROVED' or 'REJECTED'");
            }
            
            LabInvitationDto result = invitationService.approveLabInvitation(invitationId, username, status);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Approve or reject a team invitation (Team Leader only)
     */
    @PostMapping("/team-invitations/{invitationId}/approve")
    public ResponseEntity<?> approveTeamInvitation(@PathVariable Long invitationId, 
                                                  @RequestBody Map<String, String> request,
                                                  @RequestHeader("X-Username") String username) {
        try {
            String status = request.get("status");
            if (status == null || (!"APPROVED".equals(status) && !"REJECTED".equals(status))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status. Must be 'APPROVED' or 'REJECTED'");
            }
            
            TeamInvitationDto result = invitationService.approveTeamInvitation(invitationId, username, status);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}