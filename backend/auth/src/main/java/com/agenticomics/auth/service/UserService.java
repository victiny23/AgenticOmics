package com.agenticomics.auth.service;

import com.agenticomics.auth.dto.UserLabMembershipDto;
import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.entity.UserLabMembership;
import com.agenticomics.auth.repository.LabRepository;
import com.agenticomics.auth.repository.UserRepository;
import com.agenticomics.auth.entity.Lab;
import com.agenticomics.auth.dto.UserTeamMembershipDto;
import com.agenticomics.auth.entity.Team;
import com.agenticomics.auth.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private LabService labService;
    
    @Autowired
    private LabRepository labRepository;
    
    @Autowired
    private TeamService teamService;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private com.agenticomics.auth.repository.UserLabMembershipRepository userLabMembershipRepository;
    
    public User registerUser(String username, String password, String email, String telephone, String role) {
        // Check if user already exists
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        // Handle telephone field - only set if not null and not empty
        String cleanTelephone = null;
        if (telephone != null && !telephone.trim().isEmpty()) {
            cleanTelephone = telephone.trim();
            if (userRepository.existsByTelephone(cleanTelephone)) {
                throw new RuntimeException("Telephone number already exists");
            }
        }
        
        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setTelephone(cleanTelephone); // Set to null if empty, otherwise set the cleaned value
        user.setRole(role);
        user.setIsActive(true);
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public User registerUserWithLab(String username, String password, String email, String telephone, String role,
                                   String labName, String roleInLab, String memberId, String supervisorUsername, Boolean isPrimaryLab) {
        // First create the user
        User user = registerUser(username, password, email, telephone, role);
        
        // Then add them to the lab
        if (labName != null && !labName.trim().isEmpty()) {
            // Find or create the lab
            Lab lab = labRepository.findByLabName(labName.trim())
                    .orElseGet(() -> {
                        // Create a new lab if it doesn't exist
                        String labId = "LAB" + System.currentTimeMillis();
                        return labService.createLab(labId, labName.trim(), "Auto-created lab", null, null);
                    });
            
            // Find supervisor if provided
            Long supervisorId = null;
            if (supervisorUsername != null && !supervisorUsername.trim().isEmpty()) {
                Optional<User> supervisor = userRepository.findByUsername(supervisorUsername.trim());
                if (supervisor.isPresent()) {
                    supervisorId = supervisor.get().getId();
                }
            }
            
            // Add user to lab
            labService.addUserToLab(user.getId(), lab.getId(), roleInLab, memberId, supervisorId, isPrimaryLab);
        }
        
        return user;
    }
    
    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findUserByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Update last login time
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                return Optional.of(user);
            }
        }
        
        return Optional.empty();
    }
    
    public Optional<User> authenticateUserByTelephone(String telephone, String password) {
        if (telephone == null || telephone.trim().isEmpty()) {
            return Optional.empty(); // Cannot authenticate with null/empty telephone
        }
        Optional<User> userOpt = userRepository.findUserByTelephone(telephone.trim());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Update last login time
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                return Optional.of(user);
            }
        }
        
        return Optional.empty();
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findActiveUserByUsername(username);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public boolean deleteByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            userRepository.deleteByUsername(username);
            return true;
        }
        return false;
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean existsByTelephone(String telephone) {
        if (telephone == null || telephone.trim().isEmpty()) {
            return false; // Null or empty telephone doesn't exist
        }
        return userRepository.existsByTelephone(telephone.trim());
    }
    
    public String generatePasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findUserByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String resetToken = java.util.UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Token expires in 24 hours
            userRepository.save(user);
            return resetToken;
        }
        return null;
    }
    
    public boolean resetPassword(String resetToken, String newPassword) {
        Optional<User> userOpt = userRepository.findUserByResetToken(resetToken);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
    
    public long getActiveUserCount() {
        return userRepository.countActiveUsers();
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // Role management methods for PI administrators
    public List<User> getAllActiveUsers() {
        return userRepository.findAllActiveUsers();
    }
    
    public List<User> getActiveNonPIUsers() {
        return userRepository.findActiveNonPIUsers();
    }
    
    public List<User> getAllNonPIUsers() {
        return userRepository.findAllNonPIUsers();
    }
    
    public List<User> getUsersInAdminLabs(String adminUsername) {
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty()) {
            throw new RuntimeException("Admin user not found");
        }
        
        User admin = adminOpt.get();
        if (!"Lab PI".equals(admin.getRole())) {
            throw new RuntimeException("Only Lab PI users can access this endpoint");
        }
        
        // Get all labs where the admin is a member
        List<UserLabMembership> adminLabMemberships = userLabMembershipRepository
                .findByUserIdAndIsActiveTrue(admin.getId());
        
        if (adminLabMemberships.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get all lab IDs where admin is a member
        List<Long> adminLabIds = adminLabMemberships.stream()
                .map(membership -> membership.getLab().getId())
                .collect(Collectors.toList());
        
        // Get all users who are members of these labs
        List<UserLabMembership> allMemberships = userLabMembershipRepository
                .findByLabIdInAndIsActiveTrue(adminLabIds);
        
        // Extract unique users
        Set<Long> userIds = allMemberships.stream()
                .map(membership -> membership.getUser().getId())
                .collect(Collectors.toSet());
        
        // Return users without their relationships to avoid circular references
        List<User> users = userRepository.findAllById(userIds);
        users.forEach(user -> {
            user.setLabMemberships(null);
            user.setTeamMemberships(null);
            user.setSubordinates(null);
            user.setSupervisor(null);
        });
        
        return users;
    }
    
    public List<User> getAllDeactivatedUsers() {
        return userRepository.findAllDeactivatedUsers();
    }
    
    public List<User> getActiveUsersByRole(String role) {
        return userRepository.findActiveUsersByRole(role);
    }
    
    public boolean deactivateUser(Long userId, String adminUsername) {
        // Check if the admin is a Lab PI
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty() || !"Lab PI".equals(adminOpt.get().getRole())) {
            throw new RuntimeException("Only Lab PI users can deactivate accounts");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        if ("Lab PI".equals(user.getRole())) {
            throw new RuntimeException("Cannot deactivate Lab PI accounts");
        }
        
        // Check if the target user is in any of the admin's labs
        boolean canManageUser = false;
        List<UserLabMembership> adminLabMemberships = userLabMembershipRepository.findByUserIdAndIsActiveTrue(adminOpt.get().getId());
        
        for (UserLabMembership adminMembership : adminLabMemberships) {
            List<UserLabMembership> userMemberships = userLabMembershipRepository.findByUserIdAndIsActiveTrue(userId);
            for (UserLabMembership userMembership : userMemberships) {
                if (adminMembership.getLab().getId().equals(userMembership.getLab().getId())) {
                    canManageUser = true;
                    break;
                }
            }
            if (canManageUser) break;
        }
        
        if (!canManageUser) {
            throw new RuntimeException("You can only deactivate users who are members of your labs");
        }
        
        user.setIsActive(false);
        userRepository.save(user);
        return true;
    }
    
    public boolean activateUser(Long userId, String adminUsername) {
        // Check if the admin is a Lab PI
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty() || !"Lab PI".equals(adminOpt.get().getRole())) {
            throw new RuntimeException("Only Lab PI users can activate accounts");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Check if the target user is in any of the admin's labs
        boolean canManageUser = false;
        List<UserLabMembership> adminLabMemberships = userLabMembershipRepository.findByUserIdAndIsActiveTrue(adminOpt.get().getId());
        
        for (UserLabMembership adminMembership : adminLabMemberships) {
            List<UserLabMembership> userMemberships = userLabMembershipRepository.findByUserIdAndIsActiveTrue(userId);
            for (UserLabMembership userMembership : userMemberships) {
                if (adminMembership.getLab().getId().equals(userMembership.getLab().getId())) {
                    canManageUser = true;
                    break;
                }
            }
            if (canManageUser) break;
        }
        
        if (!canManageUser) {
            throw new RuntimeException("You can only activate users who are members of your labs");
        }
        
        user.setIsActive(true);
        userRepository.save(user);
        return true;
    }
    
    public boolean isUserActive(String username) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        return userOpt.isPresent();
    }
    
    public boolean isUserPI(String username) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        return userOpt.isPresent() && "Lab PI".equals(userOpt.get().getRole());
    }
    
    public boolean canCreateTeam(String username) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        String userRole = userOpt.get().getRole();
        // Lab PI, PhD Student, Master Student, Team Leader, Senior Member can create teams
        return "Lab PI".equals(userRole) || 
               "PhD Student".equals(userRole) || 
               "Master Student".equals(userRole) || 
               "Team Leader".equals(userRole) || 
               "Senior Member".equals(userRole);
    }
    
    // Supervisor relationship methods
    public List<User> getActiveSubordinatesBySupervisorId(Long supervisorId) {
        return userRepository.findActiveSubordinatesBySupervisorId(supervisorId);
    }
    
    public List<User> getActiveSubordinatesBySupervisorUsername(String supervisorUsername) {
        return userRepository.findActiveSubordinatesBySupervisorUsername(supervisorUsername);
    }
    
    public List<User> getActivePIsWithoutSupervisor() {
        return userRepository.findActivePIsWithoutSupervisor();
    }
    
    public List<User> getActiveUsersWithSupervisor() {
        return userRepository.findActiveUsersWithSupervisor();
    }
    
    public List<User> getActiveUsersWithoutSupervisor() {
        return userRepository.findActiveUsersWithoutSupervisor();
    }
    
    public List<User> getAllSubordinatesBySupervisorId(Long supervisorId) {
        return userRepository.findAllSubordinatesBySupervisorId(supervisorId);
    }
    
    public List<User> getAllSubordinatesBySupervisorUsername(String supervisorUsername) {
        return userRepository.findAllSubordinatesBySupervisorUsername(supervisorUsername);
    }
    
    public long getActiveSubordinateCountBySupervisorId(Long supervisorId) {
        return userRepository.countActiveSubordinatesBySupervisorId(supervisorId);
    }
    
    public long getActiveSubordinateCountBySupervisorUsername(String supervisorUsername) {
        return userRepository.countActiveSubordinatesBySupervisorUsername(supervisorUsername);
    }
    
    public boolean assignSupervisor(Long userId, Long supervisorId, String adminUsername) {
        // Check if the admin is a Lab PI
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty() || !"Lab PI".equals(adminOpt.get().getRole())) {
            throw new RuntimeException("Only Lab PI users can assign supervisors");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        Optional<User> supervisorOpt = userRepository.findById(supervisorId);
        if (supervisorOpt.isEmpty()) {
            throw new RuntimeException("Supervisor not found");
        }
        
        User user = userOpt.get();
        User supervisor = supervisorOpt.get();
        
        // Check if supervisor is a Lab PI
        if (!"Lab PI".equals(supervisor.getRole())) {
            throw new RuntimeException("Only Lab PI users can be supervisors");
        }
        
        // Prevent circular references
        if (userId.equals(supervisorId)) {
            throw new RuntimeException("User cannot be their own supervisor");
        }
        
        user.setSupervisor(supervisor);
        userRepository.save(user);
        return true;
    }
    
    public boolean removeSupervisor(Long userId, String adminUsername) {
        // Check if the admin is a Lab PI
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty() || !"Lab PI".equals(adminOpt.get().getRole())) {
            throw new RuntimeException("Only Lab PI users can remove supervisors");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setSupervisor(null);
        userRepository.save(user);
        return true;
    }
    
    public Optional<User> getSupervisorByUserId(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(User::getSupervisor);
    }
    
    public Optional<User> getSupervisorByUsername(String username) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        return userOpt.map(User::getSupervisor);
    }
    
    public boolean canSupervise(String supervisorUsername, String subordinateUsername) {
        Optional<User> supervisorOpt = userRepository.findActiveUserByUsername(supervisorUsername);
        Optional<User> subordinateOpt = userRepository.findActiveUserByUsername(subordinateUsername);
        
        if (supervisorOpt.isEmpty() || subordinateOpt.isEmpty()) {
            return false;
        }
        
        User supervisor = supervisorOpt.get();
        User subordinate = subordinateOpt.get();
        
        // Only Lab PIs can supervise
        if (!"Lab PI".equals(supervisor.getRole())) {
            return false;
        }
        
        // Check if the subordinate is already supervised by this supervisor
        return supervisor.getId().equals(subordinate.getSupervisor() != null ? subordinate.getSupervisor().getId() : null);
    }
    
    // Lab membership methods
    public List<UserLabMembershipDto> getUserLabMemberships(String username) {
        return labService.getUserLabMemberships(username);
    }
    
    public UserLabMembershipDto getPrimaryLabMembership(String username) {
        return labService.getPrimaryLabMembership(username);
    }
    
    public List<UserTeamMembershipDto> getUserTeamMemberships(String username) {
        return teamService.getUserTeamMemberships(username);
    }
    
    public UserTeamMembershipDto getPrimaryTeamMembership(String username) {
        return teamService.getPrimaryTeamMembership(username);
    }
    
    public UserLabMembershipDto addUserToLab(String username, String labName, String roleInLab, String memberId, String supervisorUsername, Boolean isPrimaryLab) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        Optional<Lab> labOpt = labRepository.findByLabName(labName);
        if (labOpt.isEmpty()) {
            throw new RuntimeException("Lab not found: " + labName);
        }
        
        Long supervisorId = null;
        if (supervisorUsername != null && !supervisorUsername.trim().isEmpty()) {
            Optional<User> supervisor = userRepository.findByUsername(supervisorUsername.trim());
            if (supervisor.isPresent()) {
                supervisorId = supervisor.get().getId();
            }
        }
        
        UserLabMembership membership = labService.addUserToLab(userOpt.get().getId(), labOpt.get().getId(), roleInLab, memberId, supervisorId, isPrimaryLab);
        return convertToDto(membership);
    }
    
    private UserLabMembershipDto convertToDto(UserLabMembership membership) {
        UserLabMembershipDto dto = new UserLabMembershipDto();
        dto.setId(membership.getId());
        dto.setUserId(membership.getUser().getId());
        dto.setUsername(membership.getUser().getUsername());
        dto.setLabId(membership.getLab().getId());
        dto.setLabName(membership.getLab().getLabName());
        dto.setLabCode(membership.getLab().getLabId());
        dto.setRoleInLab(membership.getRoleInLab());
        dto.setMemberId(membership.getMemberId());
        if (membership.getSupervisor() != null) {
            dto.setSupervisorId(membership.getSupervisor().getId());
            dto.setSupervisorUsername(membership.getSupervisor().getUsername());
        }
        dto.setIsPrimaryLab(membership.getIsPrimaryLab());
        dto.setJoinedAt(membership.getJoinedAt());
        dto.setLeftAt(membership.getLeftAt());
        dto.setIsActive(membership.getIsActive());
        dto.setCreatedAt(membership.getCreatedAt());
        dto.setUpdatedAt(membership.getUpdatedAt());
        return dto;
    }
    
    public void addUserToTeam(String username, String teamName, String roleInTeam, String memberId, String supervisorUsername, Boolean isPrimaryTeam) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        // Find team by name (you might want to add a method to find by name in TeamRepository)
        // For now, we'll need to implement this differently
        
        Long supervisorId = null;
        if (supervisorUsername != null && !supervisorUsername.trim().isEmpty()) {
            Optional<User> supervisor = userRepository.findByUsername(supervisorUsername.trim());
            if (supervisor.isPresent()) {
                supervisorId = supervisor.get().getId();
            }
        }
        
        // This needs to be implemented with proper team lookup
        // teamService.addUserToTeam(userOpt.get().getId(), teamId, roleInTeam, memberId, supervisorId, isPrimaryTeam);
    }
    
    public UserLabMembershipDto updateLabMembership(Long membershipId, String roleInLab, String memberId, String supervisorUsername, Boolean isPrimaryLab) {
        Long supervisorId = null;
        if (supervisorUsername != null && !supervisorUsername.trim().isEmpty()) {
            Optional<User> supervisor = userRepository.findByUsername(supervisorUsername.trim());
            if (supervisor.isPresent()) {
                supervisorId = supervisor.get().getId();
            }
        }
        
        UserLabMembership membership = labService.updateLabMembership(membershipId, roleInLab, memberId, supervisorId, isPrimaryLab);
        return convertToDto(membership);
    }
    
    public void removeUserFromLab(String username, String labName) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        Optional<Lab> labOpt = labRepository.findByLabName(labName);
        if (labOpt.isEmpty()) {
            throw new RuntimeException("Lab not found: " + labName);
        }
        
        labService.removeUserFromLab(userOpt.get().getId(), labOpt.get().getId());
    }
} 