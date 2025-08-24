package com.agenticomics.auth.service;

import com.agenticomics.auth.dto.UserLabMembershipDto;
import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.entity.UserLabMembership;
import com.agenticomics.auth.entity.UserTeamMembership;
import com.agenticomics.auth.repository.LabRepository;
import com.agenticomics.auth.repository.UserRepository;
import com.agenticomics.auth.entity.Lab;
import com.agenticomics.auth.dto.UserTeamMembershipDto;
import com.agenticomics.auth.entity.Team;
import com.agenticomics.auth.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

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
    
    @Autowired
    private com.agenticomics.auth.repository.UserTeamMembershipRepository userTeamMembershipRepository;
    
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
    
    @Transactional
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
    
    public void resetPasswordDirectly(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
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
    
    /**
     * Get all users in the labs where the given user is a member
     * This is for regular users (not just Lab PIs)
     */
    public List<User> getUsersInUserLabs(String username) {
        Optional<User> userOpt = userRepository.findActiveUserByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Get all labs where the user is a member
        List<UserLabMembership> userLabMemberships = userLabMembershipRepository
                .findByUserIdAndIsActiveTrue(user.getId());
        
        if (userLabMemberships.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get all lab IDs where user is a member
        List<Long> userLabIds = userLabMemberships.stream()
                .map(membership -> membership.getLab().getId())
                .collect(Collectors.toList());
        
        // Get all users who are members of these labs
        List<UserLabMembership> allMemberships = userLabMembershipRepository
                .findByLabIdInAndIsActiveTrue(userLabIds);
        
        // Extract unique users
        Set<Long> userIds = allMemberships.stream()
                .map(membership -> membership.getUser().getId())
                .collect(Collectors.toSet());
        
        // Return users without their relationships to avoid circular references
        List<User> users = userRepository.findAllById(userIds);
        users.forEach(u -> {
            u.setLabMemberships(null);
            u.setTeamMemberships(null);
            u.setSubordinates(null);
            u.setSupervisor(null);
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

    /**
     * Super Admin method to deactivate any user account
     */
    @Transactional
    public boolean deactivateUserBySuperAdmin(Long userId, String adminUsername) {
        if (!isSuperAdmin(adminUsername)) {
            throw new RuntimeException("Only Super Admin users can deactivate any user account");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        if ("Super Admin".equals(user.getRole()) && user.getUsername().equals(adminUsername)) {
            throw new RuntimeException("Super Admin cannot deactivate their own account");
        }
        
        user.setIsActive(false);
        userRepository.save(user);
        return true;
    }

    /**
     * Super Admin method to activate any user account
     */
    @Transactional
    public boolean activateUserBySuperAdmin(Long userId, String adminUsername) {
        if (!isSuperAdmin(adminUsername)) {
            throw new RuntimeException("Only Super Admin users can activate any user account");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
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
    

    
    public boolean canRemoveLabMember(String adminUsername, String targetUsername, String labName) {
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty()) {
            return false;
        }
        
        User admin = adminOpt.get();
        
        // Super Admin can remove anyone from any lab
        if ("Super Admin".equals(admin.getRole())) {
            return true;
        }
        
        // Lab PI can only remove members from their own lab
        if ("Lab PI".equals(admin.getRole())) {
            // Check if the admin is a PI of the specified lab
            return labService.isUserLabPI(admin.getId(), labService.getLabByName(labName).getId());
        }
        
        return false;
    }
    
    public boolean canRemoveTeamMember(String adminUsername, String targetUsername, String teamName) {
        Optional<User> adminOpt = userRepository.findActiveUserByUsername(adminUsername);
        if (adminOpt.isEmpty()) {
            return false;
        }
        
        User admin = adminOpt.get();
        
        // Super Admin can remove anyone from any team
        if ("Super Admin".equals(admin.getRole())) {
            return true;
        }
        
        // Team Leader can only remove members from their own team
        if ("Team Leader".equals(admin.getRole()) || "Lab PI".equals(admin.getRole())) {
            // Check if the admin is a leader of the specified team
            return teamService.isUserTeamLeader(admin.getId(), teamService.getTeamByName(teamName).getId());
        }
        
        return false;
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
    
    public List<Map<String, Object>> getAllUsersWithOrganizations() {
        List<User> allUsers = userRepository.findAll();
        List<Map<String, Object>> usersWithOrganizations = new ArrayList<>();
        
        for (User user : allUsers) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("telephone", user.getTelephone());
            userInfo.put("role", user.getRole());
            userInfo.put("isActive", user.getIsActive());
            userInfo.put("createdAt", user.getCreatedAt());
            userInfo.put("lastLogin", user.getLastLogin());
            
            // Get lab memberships
            List<UserLabMembership> labMemberships = userLabMembershipRepository.findByUserIdAndIsActiveTrue(user.getId());
            List<Map<String, Object>> labInfo = new ArrayList<>();
            for (UserLabMembership membership : labMemberships) {
                Map<String, Object> lab = new HashMap<>();
                lab.put("labId", membership.getLab().getId());
                lab.put("labName", membership.getLab().getLabName());
                lab.put("labCode", membership.getLab().getLabId());
                lab.put("roleInLab", membership.getRoleInLab());
                lab.put("isPrimaryLab", membership.getIsPrimaryLab());
                labInfo.add(lab);
            }
            userInfo.put("labMemberships", labInfo);
            
            // Get team memberships
            List<UserTeamMembership> teamMemberships = userTeamMembershipRepository.findByUserIdAndIsActiveTrue(user.getId());
            List<Map<String, Object>> teamInfo = new ArrayList<>();
            for (UserTeamMembership membership : teamMemberships) {
                Map<String, Object> team = new HashMap<>();
                team.put("teamId", membership.getTeam().getId());
                team.put("teamName", membership.getTeam().getTeamName());
                team.put("teamIdCode", membership.getTeam().getTeamId());
                team.put("roleInTeam", membership.getRoleInTeam());
                team.put("isPrimaryTeam", membership.getIsPrimaryTeam());
                teamInfo.add(team);
            }
            userInfo.put("teamMemberships", teamInfo);
            
            usersWithOrganizations.add(userInfo);
        }
        
        return usersWithOrganizations;
    }
    
    // Super Admin Methods
    public boolean isSuperAdmin(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.isPresent() && "Super Admin".equals(user.get().getRole());
    }
    
    /**
     * Check if a user can activate another user (Super Admin or PI/Team Leader)
     */
    public boolean canActivateUser(String targetUsername, String requesterUsername) {
        // Super Admin can activate any user
        if (isSuperAdmin(requesterUsername)) {
            return true;
        }
        
        // Get the target user's lab/team memberships
        List<UserLabMembershipDto> targetLabMemberships = getUserLabMemberships(targetUsername);
        List<UserTeamMembershipDto> targetTeamMemberships = getUserTeamMemberships(targetUsername);
        
        // Get the requester's lab/team memberships
        List<UserLabMembershipDto> requesterLabMemberships = getUserLabMemberships(requesterUsername);
        List<UserTeamMembershipDto> requesterTeamMemberships = getUserTeamMemberships(requesterUsername);
        
        // Check if requester is Lab PI of any lab where target user is a member
        for (UserLabMembershipDto targetLab : targetLabMemberships) {
            for (UserLabMembershipDto requesterLab : requesterLabMemberships) {
                if (targetLab.getLabId().equals(requesterLab.getLabId()) && 
                    "Lab PI".equals(requesterLab.getRoleInLab())) {
                    return true;
                }
            }
        }
        
        // Check if requester is Team Leader of any team where target user is a member
        for (UserTeamMembershipDto targetTeam : targetTeamMemberships) {
            for (UserTeamMembershipDto requesterTeam : requesterTeamMemberships) {
                if (targetTeam.getTeamId().equals(requesterTeam.getTeamId()) && 
                    "Team Leader".equals(requesterTeam.getRoleInTeam())) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Deactivate all user accounts (Super Admin only)
     */
    @Transactional
    public boolean deactivateAllUsers(String adminUsername) {
        // Check if the admin is a Super Admin
        if (!isSuperAdmin(adminUsername)) {
            throw new RuntimeException("Only Super Admin users can deactivate all accounts");
        }
        
        // Get all active users except the admin
        List<User> activeUsers = userRepository.findAllActiveUsers();
        int deactivatedCount = 0;
        
        for (User user : activeUsers) {
            // Don't deactivate the admin themselves
            if (!user.getUsername().equals(adminUsername)) {
                user.setIsActive(false);
                userRepository.save(user);
                deactivatedCount++;
            }
        }
        
        return deactivatedCount > 0;
    }
    
    /**
     * Deactivate all users except Super Admin accounts (Super Admin only)
     */
    @Transactional
    public boolean deactivateAllNonSuperAdminUsers(String adminUsername) {
        // Check if the admin is a Super Admin
        if (!isSuperAdmin(adminUsername)) {
            throw new RuntimeException("Only Super Admin users can deactivate all accounts");
        }
        
        // Get all active users
        List<User> activeUsers = userRepository.findAllActiveUsers();
        int deactivatedCount = 0;
        
        for (User user : activeUsers) {
            // Don't deactivate Super Admin accounts
            if (!"Super Admin".equals(user.getRole())) {
                user.setIsActive(false);
                userRepository.save(user);
                deactivatedCount++;
            }
        }
        
        return deactivatedCount > 0;
    }
    
    /**
     * Activate all user accounts (Super Admin only)
     */
    @Transactional
    public boolean activateAllUsers(String adminUsername) {
        // Check if the admin is a Super Admin
        if (!isSuperAdmin(adminUsername)) {
            throw new RuntimeException("Only Super Admin users can activate all accounts");
        }
        
        // Get all inactive users
        List<User> inactiveUsers = userRepository.findAllDeactivatedUsers();
        int activatedCount = 0;
        
        for (User user : inactiveUsers) {
            user.setIsActive(true);
            userRepository.save(user);
            activatedCount++;
        }
        
        return activatedCount > 0;
    }
    
    public List<Map<String, Object>> getSystemOverview() {
        List<Map<String, Object>> overview = new ArrayList<>();
        
        // Get all users count
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countActiveUsers();
        
        // Get all labs count
        long totalLabs = labRepository.count();
        
        // Get all teams count
        long totalTeams = teamRepository.count();
        
        // Get users by role
        Map<String, Object> userStats = new HashMap<>();
        userStats.put("totalUsers", totalUsers);
        userStats.put("activeUsers", activeUsers);
        userStats.put("inactiveUsers", totalUsers - activeUsers);
        
        // Get role distribution
        List<User> allUsers = userRepository.findAll();
        Map<String, Long> roleDistribution = allUsers.stream()
            .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
        userStats.put("roleDistribution", roleDistribution);
        
        overview.add(userStats);
        
        // Get lab statistics
        Map<String, Object> labStats = new HashMap<>();
        labStats.put("totalLabs", totalLabs);
        List<Lab> allLabs = labRepository.findAll();
        List<Map<String, Object>> labDetails = new ArrayList<>();
        for (Lab lab : allLabs) {
            Map<String, Object> labInfo = new HashMap<>();
            labInfo.put("id", lab.getId());
            labInfo.put("labId", lab.getLabId());
            labInfo.put("labName", lab.getLabName());
            labInfo.put("institution", lab.getInstitution());
            labInfo.put("department", lab.getDepartment());
            
            // Count members in this lab
            List<UserLabMembership> labMemberships = userLabMembershipRepository.findByLabIdAndIsActiveTrue(lab.getId());
            long memberCount = labMemberships.size();
            labInfo.put("memberCount", memberCount);
            
            labDetails.add(labInfo);
        }
        labStats.put("labDetails", labDetails);
        overview.add(labStats);
        
        // Get team statistics
        Map<String, Object> teamStats = new HashMap<>();
        teamStats.put("totalTeams", totalTeams);
        List<Team> allTeams = teamRepository.findAll();
        List<Map<String, Object>> teamDetails = new ArrayList<>();
        for (Team team : allTeams) {
            Map<String, Object> teamInfo = new HashMap<>();
            teamInfo.put("id", team.getId());
            teamInfo.put("teamId", team.getTeamId());
            teamInfo.put("teamName", team.getTeamName());
            teamInfo.put("description", team.getTeamDescription());
            
            // Count members in this team
            List<UserTeamMembership> teamMemberships = userTeamMembershipRepository.findByTeamIdAndIsActiveTrue(team.getId());
            long memberCount = teamMemberships.size();
            teamInfo.put("memberCount", memberCount);
            
            teamDetails.add(teamInfo);
        }
        teamStats.put("teamDetails", teamDetails);
        overview.add(teamStats);
        
        return overview;
    }
    
    public List<Map<String, Object>> getAllLabsWithMembers() {
        List<Lab> allLabs = labRepository.findAll();
        List<Map<String, Object>> labsWithMembers = new ArrayList<>();
        
        for (Lab lab : allLabs) {
            Map<String, Object> labInfo = new HashMap<>();
            labInfo.put("id", lab.getId());
            labInfo.put("labId", lab.getLabId());
            labInfo.put("labName", lab.getLabName());
            labInfo.put("institution", lab.getInstitution());
            labInfo.put("department", lab.getDepartment());
            labInfo.put("description", lab.getLabDescription());
            labInfo.put("createdAt", lab.getCreatedAt());
            
            // Get all members in this lab
            List<UserLabMembership> memberships = userLabMembershipRepository.findByLabIdAndIsActiveTrue(lab.getId());
            List<Map<String, Object>> members = new ArrayList<>();
            for (UserLabMembership membership : memberships) {
                Map<String, Object> member = new HashMap<>();
                member.put("userId", membership.getUser().getId());
                member.put("username", membership.getUser().getUsername());
                member.put("email", membership.getUser().getEmail());
                member.put("role", membership.getUser().getRole());
                member.put("roleInLab", membership.getRoleInLab());
                member.put("memberId", membership.getMemberId());
                member.put("isPrimaryLab", membership.getIsPrimaryLab());
                member.put("joinedAt", membership.getJoinedAt());
                members.add(member);
            }
            labInfo.put("members", members);
            labInfo.put("memberCount", members.size());
            
            labsWithMembers.add(labInfo);
        }
        
        return labsWithMembers;
    }
    
    public List<Map<String, Object>> getAllTeamsWithMembers() {
        List<Team> allTeams = teamRepository.findAll();
        List<Map<String, Object>> teamsWithMembers = new ArrayList<>();
        
        for (Team team : allTeams) {
            Map<String, Object> teamInfo = new HashMap<>();
            teamInfo.put("id", team.getId());
            teamInfo.put("teamId", team.getTeamId());
            teamInfo.put("teamName", team.getTeamName());
            teamInfo.put("description", team.getTeamDescription());
            teamInfo.put("createdAt", team.getCreatedAt());
            
            // Get all members in this team
            List<UserTeamMembership> memberships = userTeamMembershipRepository.findByTeamIdAndIsActiveTrue(team.getId());
            List<Map<String, Object>> members = new ArrayList<>();
            for (UserTeamMembership membership : memberships) {
                Map<String, Object> member = new HashMap<>();
                member.put("userId", membership.getUser().getId());
                member.put("username", membership.getUser().getUsername());
                member.put("email", membership.getUser().getEmail());
                member.put("role", membership.getUser().getRole());
                member.put("roleInTeam", membership.getRoleInTeam());
                member.put("memberId", membership.getMemberId());
                member.put("isPrimaryTeam", membership.getIsPrimaryTeam());
                member.put("joinedAt", membership.getJoinedAt());
                members.add(member);
            }
            teamInfo.put("members", members);
            teamInfo.put("memberCount", members.size());
            
            teamsWithMembers.add(teamInfo);
        }
        
        return teamsWithMembers;
    }
    
    // ==================== SUPER ADMIN DELETE METHODS ====================
    
    /**
     * Delete a user by ID (Super Admin only)
     */
    @Transactional
    public boolean deleteUserById(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Prevent deletion of Super Admin users
                if ("Super Admin".equals(user.getRole())) {
                    throw new RuntimeException("Cannot delete Super Admin users");
                }
                
                // Delete related memberships first
                userLabMembershipRepository.deleteByUserId(userId);
                userTeamMembershipRepository.deleteByUserId(userId);
                
                // Delete the user
                userRepository.deleteById(userId);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting user: " + e.getMessage());
        }
    }
    
    /**
     * Delete a lab by ID (Super Admin only)
     */
    @Transactional
    public boolean deleteLabById(Long labId) {
        try {
            Optional<Lab> labOpt = labRepository.findById(labId);
            if (labOpt.isPresent()) {
                Lab lab = labOpt.get();
                
                // Delete all team memberships in this lab's teams
                List<Team> teams = teamRepository.findByLabId(labId);
                for (Team team : teams) {
                    userTeamMembershipRepository.deleteByTeamId(team.getId());
                }
                
                // Delete all teams in this lab
                teamRepository.deleteByLabId(labId);
                
                // Delete all lab memberships
                userLabMembershipRepository.deleteByLabId(labId);
                
                // Delete the lab
                labRepository.deleteById(labId);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting lab: " + e.getMessage());
        }
    }
    
    /**
     * Delete a team by ID (Super Admin only)
     */
    @Transactional
    public boolean deleteTeamById(Long teamId) {
        try {
            Optional<Team> teamOpt = teamRepository.findById(teamId);
            if (teamOpt.isPresent()) {
                Team team = teamOpt.get();
                
                // Delete all team memberships
                userTeamMembershipRepository.deleteByTeamId(teamId);
                
                // Delete the team
                teamRepository.deleteById(teamId);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting team: " + e.getMessage());
        }
    }
    
    /**
     * Get basic user information for membership management
     */
    public List<Map<String, Object>> getBasicUserInfo() {
        List<User> users = userRepository.findAllActiveUsers();
        List<Map<String, Object>> basicUserInfo = new ArrayList<>();
        
        for (User user : users) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("role", user.getRole());
            basicUserInfo.add(userInfo);
        }
        
        return basicUserInfo;
    }

    /**
     * Get users who are NOT members of a specific lab
     */
    public List<Map<String, Object>> getUsersNotInLab(Long labId) {
        List<User> allUsers = userRepository.findAllActiveUsers();
        List<UserLabMembership> labMemberships = userLabMembershipRepository.findByLabIdAndIsActiveTrue(labId);
        
        // Get IDs of users who are members of this lab
        Set<Long> labMemberIds = labMemberships.stream()
            .map(membership -> membership.getUser().getId())
            .collect(Collectors.toSet());
        
        // Filter out users who are already members of this lab
        List<User> usersNotInLab = allUsers.stream()
            .filter(user -> !labMemberIds.contains(user.getId()))
            .collect(Collectors.toList());
        
        List<Map<String, Object>> basicUserInfo = new ArrayList<>();
        for (User user : usersNotInLab) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("role", user.getRole());
            basicUserInfo.add(userInfo);
        }
        
        return basicUserInfo;
    }
} 