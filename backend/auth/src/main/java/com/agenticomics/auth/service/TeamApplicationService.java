package com.agenticomics.auth.service;

import com.agenticomics.auth.dto.TeamApplicationRequest;
import com.agenticomics.auth.dto.TeamApplicationResponse;
import com.agenticomics.auth.dto.ApplicationReviewRequest;
import com.agenticomics.auth.entity.*;
import com.agenticomics.auth.repository.TeamApplicationRepository;
import com.agenticomics.auth.repository.TeamRepository;
import com.agenticomics.auth.repository.UserRepository;
import com.agenticomics.auth.repository.UserTeamMembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeamApplicationService {
    
    @Autowired
    private TeamApplicationRepository teamApplicationRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserTeamMembershipRepository userTeamMembershipRepository;
    
    /**
     * Apply to join a team
     */
    @Transactional
    public TeamApplicationResponse applyToTeam(String applicantUsername, TeamApplicationRequest request) {
        // Validate applicant exists
        User applicant = userRepository.findByUsername(applicantUsername)
            .orElseThrow(() -> new RuntimeException("Applicant not found"));
        
        // Validate team exists
        Team team = teamRepository.findById(request.getTeamId())
            .orElseThrow(() -> new RuntimeException("Team not found"));
        
        // Check if user is already a member of this team
        Optional<UserTeamMembership> existingMembership = userTeamMembershipRepository.findByUserIdAndTeamIdAndIsActiveTrue(
            applicant.getId(), request.getTeamId());
        if (existingMembership.isPresent()) {
            throw new RuntimeException("You are already a member of this team");
        }
        
        // Check if user already has a pending application for this team
        if (teamApplicationRepository.existsByApplicantUsernameAndTeamIdAndStatus(
                applicantUsername, request.getTeamId(), TeamApplication.ApplicationStatus.PENDING)) {
            throw new RuntimeException("You already have a pending application for this team");
        }
        
        // Create application
        TeamApplication application = new TeamApplication();
        application.setApplicant(applicant);
        application.setTeam(team);
        application.setRequestedRole(request.getRequestedRole());
        application.setApplicationMessage(request.getApplicationMessage());
        application.setStatus(TeamApplication.ApplicationStatus.PENDING);
        
        TeamApplication savedApplication = teamApplicationRepository.save(application);
        return convertToResponse(savedApplication);
    }
    
    /**
     * Review a team application (approve/reject)
     */
    @Transactional
    public TeamApplicationResponse reviewApplication(Long applicationId, String reviewerUsername, ApplicationReviewRequest request) {
        // Validate reviewer exists
        User reviewer = userRepository.findByUsername(reviewerUsername)
            .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        
        // Get application
        TeamApplication application = teamApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        // Check if reviewer is the Team Leader of the team
        if (!isTeamLeader(reviewerUsername, application.getTeam().getId())) {
            throw new RuntimeException("Only the Team Leader can review applications");
        }
        
        // Check if application is still pending
        if (application.getStatus() != TeamApplication.ApplicationStatus.PENDING) {
            throw new RuntimeException("Application has already been reviewed");
        }
        
        // Update application status
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            application.setStatus(TeamApplication.ApplicationStatus.APPROVED);
            
            // Add user to team membership
            addUserToTeam(application.getApplicant(), application.getTeam(), application.getRequestedRole());
            
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            application.setStatus(TeamApplication.ApplicationStatus.REJECTED);
        } else {
            throw new RuntimeException("Invalid action. Must be 'APPROVE' or 'REJECT'");
        }
        
        application.setReviewedBy(reviewer);
        application.setReviewMessage(request.getReviewMessage());
        application.setReviewedAt(LocalDateTime.now());
        
        TeamApplication savedApplication = teamApplicationRepository.save(application);
        return convertToResponse(savedApplication);
    }
    
    /**
     * Withdraw an application
     */
    @Transactional
    public void withdrawApplication(Long applicationId, String applicantUsername) {
        TeamApplication application = teamApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        
        // Check if user owns the application
        if (!application.getApplicant().getUsername().equals(applicantUsername)) {
            throw new RuntimeException("You can only withdraw your own applications");
        }
        
        // Check if application is still pending
        if (application.getStatus() != TeamApplication.ApplicationStatus.PENDING) {
            throw new RuntimeException("Cannot withdraw a reviewed application");
        }
        
        application.setStatus(TeamApplication.ApplicationStatus.WITHDRAWN);
        teamApplicationRepository.save(application);
    }
    
    /**
     * Get applications for a team (for Team Leader)
     */
    public List<TeamApplicationResponse> getTeamApplications(Long teamId, String reviewerUsername) {
        // Check if user is the Team Leader of the team
        if (!isTeamLeader(reviewerUsername, teamId)) {
            throw new RuntimeException("Only the Team Leader can view applications");
        }
        
        List<TeamApplication> applications = teamApplicationRepository.findByTeamIdOrderByCreatedAtDesc(teamId);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get pending applications for a team (for Team Leader)
     */
    public List<TeamApplicationResponse> getPendingTeamApplications(Long teamId, String reviewerUsername) {
        // Check if user is the Team Leader of the team
        if (!isTeamLeader(reviewerUsername, teamId)) {
            throw new RuntimeException("Only the Team Leader can view applications");
        }
        
        List<TeamApplication> applications = teamApplicationRepository.findByTeamIdAndStatusOrderByCreatedAtDesc(
            teamId, TeamApplication.ApplicationStatus.PENDING);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get user's applications
     */
    public List<TeamApplicationResponse> getUserApplications(String username) {
        List<TeamApplication> applications = teamApplicationRepository.findByApplicantUsernameOrderByCreatedAtDesc(username);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get user's pending applications
     */
    public List<TeamApplicationResponse> getUserPendingApplications(String username) {
        List<TeamApplication> applications = teamApplicationRepository.findByApplicantUsernameAndStatusOrderByCreatedAtDesc(
            username, TeamApplication.ApplicationStatus.PENDING);
        return applications.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Leave a team
     */
    @Transactional
    public void leaveTeam(Long teamId, String username) {
        // Find the user's membership
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Optional<UserTeamMembership> membership = userTeamMembershipRepository
            .findByUserIdAndTeamIdAndIsActiveTrue(user.getId(), teamId);
        
        if (membership.isEmpty()) {
            throw new RuntimeException("You are not a member of this team");
        }
        
        UserTeamMembership userMembership = membership.get();
        
        // Check if user is the Team Leader (Team Leader cannot leave their own team)
        if ("Team Leader".equals(userMembership.getRoleInTeam())) {
            throw new RuntimeException("Team Leader cannot leave their own team");
        }
        
        // Mark membership as inactive and set left date
        userMembership.setIsActive(false);
        userMembership.setLeftAt(LocalDateTime.now());
        userTeamMembershipRepository.save(userMembership);
    }
    
    /**
     * Check if user is Team Leader of a team
     */
    private boolean isTeamLeader(String username, Long teamId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Optional<UserTeamMembership> membership = userTeamMembershipRepository
            .findByUserIdAndTeamIdAndIsActiveTrue(user.getId(), teamId);
        return membership.isPresent() && "Team Leader".equals(membership.get().getRoleInTeam());
    }
    
    /**
     * Add user to team membership
     */
    private void addUserToTeam(User user, Team team, String role) {
        UserTeamMembership membership = new UserTeamMembership();
        membership.setUser(user);
        membership.setTeam(team);
        membership.setRoleInTeam(role);
        membership.setMemberId(team.getTeamId());
        membership.setIsPrimaryTeam(false); // New members are not primary by default
        membership.setIsActive(true);
        membership.setJoinedAt(LocalDateTime.now());
        
        userTeamMembershipRepository.save(membership);
    }
    
    /**
     * Convert entity to response DTO
     */
    private TeamApplicationResponse convertToResponse(TeamApplication application) {
        TeamApplicationResponse response = new TeamApplicationResponse();
        response.setId(application.getId());
        response.setApplicantUsername(application.getApplicant().getUsername());
        response.setApplicantName(application.getApplicant().getUsername());
        response.setTeamId(application.getTeam().getId());
        response.setTeamName(application.getTeam().getTeamName());
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