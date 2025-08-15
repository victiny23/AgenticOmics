package com.agenticomics.auth.controller;

import com.agenticomics.auth.entity.Lab;
import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.entity.UserLabMembership;
import com.agenticomics.auth.repository.LabRepository;
import com.agenticomics.auth.repository.UserLabMembershipRepository;
import com.agenticomics.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/admin")
public class DatabaseFixController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LabRepository labRepository;

    @Autowired
    private UserLabMembershipRepository userLabMembershipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/fix-database-issues")
    public ResponseEntity<?> fixDatabaseIssues(@RequestHeader("X-Username") String adminUsername) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Step 1: Add Mian user if not exists
            User mian = createMianUser();
            
            // Step 2: Get Jerry and LAB001
            Optional<User> jerryOpt = userRepository.findByUsername("Jerry");
            Optional<Lab> lab001Opt = labRepository.findByLabId("LAB001");
            
            if (jerryOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Jerry not found");
            }
            if (lab001Opt.isEmpty()) {
                return ResponseEntity.badRequest().body("LAB001 not found");
            }
            
            User jerry = jerryOpt.get();
            Lab lab001 = lab001Opt.get();
            
            // Step 3: Add Mian to LAB001 with Jerry as supervisor
            UserLabMembership mianMembership = createMianLabMembership(mian, lab001, jerry);
            
            // Step 4: Set Jerry as Mian's supervisor in legacy field
            mian.setSupervisor(jerry);
            userRepository.save(mian);
            
            response.put("success", true);
            response.put("message", "Database issues fixed successfully");
            response.put("mian_user_id", mian.getId());
            response.put("mian_lab_membership_id", mianMembership.getId());
            response.put("jerry_supervisor_id", jerry.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to fix database issues: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private User createMianUser() {
        Optional<User> existingMian = userRepository.findByUsername("Mian");
        if (existingMian.isPresent()) {
            return existingMian.get();
        }

        User mian = new User();
        mian.setUsername("Mian");
        mian.setPassword(passwordEncoder.encode("mian123"));
        mian.setEmail("mian@agenticomics.com");
        mian.setRole("PhD Student");
        mian.setIsActive(true);
        mian.setCreatedAt(LocalDateTime.now());
        mian.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(mian);
    }

    private UserLabMembership createMianLabMembership(User mian, Lab lab, User supervisor) {
        // Check if membership already exists
        Optional<UserLabMembership> existingMembership = userLabMembershipRepository
            .findByUserIdAndLabIdAndIsActiveTrue(mian.getId(), lab.getId());
        
        if (existingMembership.isPresent()) {
            return existingMembership.get();
        }

        UserLabMembership membership = new UserLabMembership();
        membership.setUser(mian);
        membership.setLab(lab);
        membership.setRoleInLab("PhD Student");
        membership.setMemberId("LAB001");
        membership.setSupervisor(supervisor);
        membership.setIsPrimaryLab(true);
        membership.setIsActive(true);
        membership.setJoinedAt(LocalDateTime.now());
        membership.setCreatedAt(LocalDateTime.now());
        membership.setUpdatedAt(LocalDateTime.now());
        
        return userLabMembershipRepository.save(membership);
    }

    @GetMapping("/verify-fixes")
    public ResponseEntity<?> verifyFixes(@RequestHeader("X-Username") String adminUsername) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verify Mian exists
            Optional<User> mianOpt = userRepository.findByUsername("Mian");
            Optional<User> jerryOpt = userRepository.findByUsername("Jerry");
            Optional<Lab> lab001Opt = labRepository.findByLabId("LAB001");
            
            if (mianOpt.isEmpty()) {
                response.put("mian_exists", false);
                return ResponseEntity.ok(response);
            }
            
            User mian = mianOpt.get();
            User jerry = jerryOpt.get();
            Lab lab001 = lab001Opt.get();
            
            // Verify Mian's lab membership
            Optional<UserLabMembership> membershipOpt = userLabMembershipRepository
                .findByUserIdAndLabIdAndIsActiveTrue(mian.getId(), lab001.getId());
            
            response.put("mian_exists", true);
            response.put("mian_id", mian.getId());
            response.put("jerry_id", jerry.getId());
            response.put("lab001_id", lab001.getId());
            response.put("mian_supervisor_id", mian.getSupervisor() != null ? mian.getSupervisor().getId() : null);
            response.put("mian_has_lab_membership", membershipOpt.isPresent());
            
            if (membershipOpt.isPresent()) {
                UserLabMembership membership = membershipOpt.get();
                response.put("membership_supervisor_id", membership.getSupervisor() != null ? membership.getSupervisor().getId() : null);
                response.put("membership_role", membership.getRoleInLab());
                response.put("membership_is_primary", membership.getIsPrimaryLab());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Failed to verify fixes: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 