package com.agenticomics.auth.service;

import com.agenticomics.auth.dto.LabApplicationRequest;
import com.agenticomics.auth.dto.LabApplicationResponse;
import com.agenticomics.auth.dto.ApplicationReviewRequest;
import com.agenticomics.auth.entity.*;
import com.agenticomics.auth.repository.LabApplicationRepository;
import com.agenticomics.auth.repository.LabRepository;
import com.agenticomics.auth.repository.UserRepository;
import com.agenticomics.auth.repository.UserLabMembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LabApplicationService {
    
    @Autowired
    private LabApplicationRepository labApplicationRepository;
    
    @Autowired
    private LabRepository labRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserLabMembershipRepository userLabMembershipRepository;
    
    /**
     * Apply to join a lab
     */
    @Transactional
    public LabApplicationResponse applyToLab(String applicantUsername, LabApplicationRequest request) {
        // Validate applicant exists
        User applicant = userRepository.findByUsername(applicantUsername)
            .orElseThrow(() -> new RuntimeException("Applicant not found"));
        
        // Validate lab exists
        Lab lab = labRepository.findById(request.getLabId())
            .orElseThrow(() -> new RuntimeException("Lab not found"));
        
        // Check if user is already a member of this lab
        Optional<UserLabMembership> existingMembership = userLabMembershipRepository.findByUserIdAndLabIdAndIsActiveTrue(
            applicant.getId(), request.getLabId());
        if (existingMembership.isPresent()) {
            throw new RuntimeException("You are already a member of this lab");
        }
        
        // Check if user already has a pending application for this lab
        if (labApplicationRepository.existsByApplicantUsernameAndLabIdAndStatus(
                applicantUsername, request.getLabId(), LabApplication.ApplicationStatus.PENDING)) {
            throw new RuntimeException("You already have a pending application for this lab");
        }
        
        // Create application
        LabApplication application = new LabApplication();
        application.setApplicant(applicant);
        application.setLab(lab);
        application.setRequestedRole(request.getRequestedRole());
        application.setApplicationMessage(request.getApplicationMessage());
        application.setStatus(LabApplication.ApplicationStatus.PENDING);
        
        LabApplication savedApplication = labApplicationRepository.save(application);
        return convertToResponse(savedApplication);
    }
    
    /**
     * Review a lab application (approve/reject)
     */
    @Transactional
    public LabApplicationResponse reviewApplication(Long applicationId, String reviewerUsername, ApplicationReviewRequest request) {
        // Validate reviewer exists
        User reviewer = userRepository.findByUsername(reviewerUsername)
            .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        
        // Get application
        LabApplication application = labApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        // Check if reviewer is the PI of the lab
        if (!isLabPI(reviewerUsername, application.getLab().getId())) {
            throw new RuntimeException("Only the Lab PI can review applications");
        }
        
        // Check if application is still pending
        if (application.getStatus() != LabApplication.ApplicationStatus.PENDING) {
            throw new RuntimeException("Application has already been reviewed");
        }
        
        // Update application status
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            application.setStatus(LabApplication.ApplicationStatus.APPROVED);
            
            // Add user to lab membership
            addUserToLab(application.getApplicant(), application.getLab(), application.getRequestedRole());
            
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            application.setStatus(LabApplication.ApplicationStatus.REJECTED);
        } else {
            throw new RuntimeException("Invalid action. Must be 'APPROVE' or 'REJECT'");
        }
        
        application.setReviewedBy(reviewer);
        application.setReviewMessage(request.getReviewMessage());
        application.setReviewedAt(LocalDateTime.now());
        
        LabApplication savedApplication = labApplicationRepository.save(application);
        return convertToResponse(savedApplication);
    }
    
    /**
     * Withdraw an application
     */
    @Transactional
    public void withdrawApplication(Long applicationId, String applicantUsername) {
        LabApplication application = labApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        // Check if user owns the application
        if (!application.getApplicant().getUsername().equals(applicantUsername)) {
            throw new RuntimeException("You can only withdraw your own applications");
        }
        
        // Check if application is still pending
        if (application.getStatus() != LabApplication.ApplicationStatus.PENDING) {
            throw new RuntimeException("Cannot withdraw a reviewed application");
        }
        
        application.setStatus(LabApplication.ApplicationStatus.WITHDRAWN);
        labApplicationRepository.save(application);
    }
    
    /**
     * Get applications for a lab (for PI)
     */
    public List<LabApplicationResponse> getLabApplications(Long labId, String reviewerUsername) {
        // Check if user is the PI of the lab
        if (!isLabPI(reviewerUsername, labId)) {
            throw new RuntimeException("Only the Lab PI can view applications");
        }
        
        List<LabApplication> applications = labApplicationRepository.findByLabIdOrderByCreatedAtDesc(labId);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get pending applications for a lab (for PI)
     */
    public List<LabApplicationResponse> getPendingLabApplications(Long labId, String reviewerUsername) {
        // Check if user is the PI of the lab
        if (!isLabPI(reviewerUsername, labId)) {
            throw new RuntimeException("Only the Lab PI can view applications");
        }
        
        List<LabApplication> applications = labApplicationRepository.findByLabIdAndStatusOrderByCreatedAtDesc(
            labId, LabApplication.ApplicationStatus.PENDING);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get user's applications
     */
    public List<LabApplicationResponse> getUserApplications(String username) {
        List<LabApplication> applications = labApplicationRepository.findByApplicantUsernameOrderByCreatedAtDesc(username);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get user's pending applications
     */
    public List<LabApplicationResponse> getUserPendingApplications(String username) {
        List<LabApplication> applications = labApplicationRepository.findByApplicantUsernameAndStatusOrderByCreatedAtDesc(
            username, LabApplication.ApplicationStatus.PENDING);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Leave a lab
     */
    @Transactional
    public void leaveLab(Long labId, String username) {
        // Find the user's membership
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Optional<UserLabMembership> membership = userLabMembershipRepository
            .findByUserIdAndLabIdAndIsActiveTrue(user.getId(), labId);
        
        if (membership.isEmpty()) {
            throw new RuntimeException("You are not a member of this lab");
        }
        
        UserLabMembership userMembership = membership.get();
        
        // Check if user is the PI (PI cannot leave their own lab)
        if ("Lab PI".equals(userMembership.getRoleInLab())) {
            throw new RuntimeException("Lab PI cannot leave their own lab");
        }
        
        // Mark membership as inactive and set left date
        userMembership.setIsActive(false);
        userMembership.setLeftAt(LocalDateTime.now());
        userLabMembershipRepository.save(userMembership);
    }
    
    /**
     * Check if user is PI of a lab
     */
    private boolean isLabPI(String username, Long labId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Optional<UserLabMembership> membership = userLabMembershipRepository
            .findByUserIdAndLabIdAndIsActiveTrue(user.getId(), labId);
        return membership.isPresent() && "Lab PI".equals(membership.get().getRoleInLab());
    }
    
    /**
     * Add user to lab membership
     */
    private void addUserToLab(User user, Lab lab, String role) {
        UserLabMembership membership = new UserLabMembership();
        membership.setUser(user);
        membership.setLab(lab);
        membership.setRoleInLab(role);
        membership.setMemberId(lab.getLabId());
        membership.setIsPrimaryLab(false); // New members are not primary by default
        membership.setIsActive(true);
        membership.setJoinedAt(LocalDateTime.now());
        
        userLabMembershipRepository.save(membership);
    }
    
    /**
     * Convert entity to response DTO
     */
    private LabApplicationResponse convertToResponse(LabApplication application) {
        LabApplicationResponse response = new LabApplicationResponse();
        response.setId(application.getId());
        response.setApplicantUsername(application.getApplicant().getUsername());
        response.setApplicantName(application.getApplicant().getUsername());
        response.setLabId(application.getLab().getId());
        response.setLabName(application.getLab().getLabName());
        response.setRequestedRole(application.getRequestedRole());
        response.setApplicationMessage(application.getApplicationMessage());
        response.setStatus(application.getStatus());
        
        if (application.getReviewedBy() != null) {
            response.setReviewedByUsername(application.getReviewedBy().getUsername());
            response.setReviewedByName(application.getReviewedBy().getUsername());
        }
        
        response.setReviewMessage(application.getReviewMessage());
        response.setReviewedAt(application.getReviewedAt());
        response.setCreatedAt(application.getCreatedAt());
        response.setUpdatedAt(application.getUpdatedAt());
        
        return response;
    }
} 