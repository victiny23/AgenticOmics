package com.agenticomics.auth.service;

import com.agenticomics.auth.dto.LabMembershipRequestDto;
import com.agenticomics.auth.dto.TeamMembershipRequestDto;
import com.agenticomics.auth.entity.*;
import com.agenticomics.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class MembershipRequestService {
    
    @Autowired
    private LabMembershipRequestRepository labMembershipRequestRepository;
    
    @Autowired
    private TeamMembershipRequestRepository teamMembershipRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LabRepository labRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private LabService labService;
    
    @Autowired
    private TeamService teamService;
    
    // Lab Membership Request Methods
    
    @Transactional
    public LabMembershipRequestDto createLabMembershipRequest(String username, Long labId, String requestedRole, String requestMessage) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        // Check if lab exists
        Optional<Lab> labOpt = labRepository.findById(labId);
        if (labOpt.isEmpty()) {
            throw new RuntimeException("Lab not found with ID: " + labId);
        }
        
        User user = userOpt.get();
        Lab lab = labOpt.get();
        
        // Check if user is already a member of this lab
        if (labService.isUserMemberOfLab(user.getId(), labId)) {
            throw new RuntimeException("User is already a member of this lab");
        }
        
        // Check if there's already a pending request
        Optional<LabMembershipRequest> existingRequest = labMembershipRequestRepository
            .findByUsernameAndLabIdAndStatus(username, labId, "PENDING");
        if (existingRequest.isPresent()) {
            throw new RuntimeException("You already have a pending request for this lab");
        }
        
        // Create the request
        LabMembershipRequest request = new LabMembershipRequest();
        request.setUser(user);
        request.setLab(lab);
        request.setRequestedRole(requestedRole);
        request.setRequestMessage(requestMessage);
        request.setStatus("PENDING");
        
        LabMembershipRequest savedRequest = labMembershipRequestRepository.save(request);
        return LabMembershipRequestDto.fromEntity(savedRequest);
    }
    
    @Transactional
    public LabMembershipRequestDto reviewLabMembershipRequest(Long requestId, String reviewerUsername, 
                                                             String status, String reviewMessage) {
        Optional<LabMembershipRequest> requestOpt = labMembershipRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Membership request not found");
        }
        
        Optional<User> reviewerOpt = userRepository.findByUsername(reviewerUsername);
        if (reviewerOpt.isEmpty()) {
            throw new RuntimeException("Reviewer not found");
        }
        
        LabMembershipRequest request = requestOpt.get();
        User reviewer = reviewerOpt.get();
        
        // Check if reviewer is Lab PI of the lab
        if (!labService.isUserLabPI(reviewer.getId(), request.getLab().getId())) {
            throw new RuntimeException("Only Lab PI can review membership requests");
        }
        
        // Update the request
        request.setStatus(status);
        request.setReviewedBy(reviewer);
        request.setReviewMessage(reviewMessage);
        request.setReviewedAt(LocalDateTime.now());
        
        // If approved, add user to lab
        if ("APPROVED".equals(status)) {
            labService.addUserToLab(request.getUser().getId(), request.getLab().getId(), 
                                  request.getRequestedRole(), null, null, false);
        }
        
        LabMembershipRequest savedRequest = labMembershipRequestRepository.save(request);
        return LabMembershipRequestDto.fromEntity(savedRequest);
    }
    
    public List<LabMembershipRequestDto> getLabMembershipRequestsByUser(String username) {
        List<LabMembershipRequest> requests = labMembershipRequestRepository.findByUsername(username);
        return requests.stream()
                .map(LabMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<LabMembershipRequestDto> getLabMembershipRequestsByLab(Long labId) {
        List<LabMembershipRequest> requests = labMembershipRequestRepository.findByLabId(labId);
        return requests.stream()
                .map(LabMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<LabMembershipRequestDto> getPendingLabMembershipRequestsByLab(Long labId) {
        List<LabMembershipRequest> requests = labMembershipRequestRepository
            .findByLabIdAndStatus(labId, "PENDING");
        return requests.stream()
                .map(LabMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    // Team Membership Request Methods
    
    @Transactional
    public TeamMembershipRequestDto createTeamMembershipRequest(String username, Long teamId, String requestedRole, String requestMessage) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        // Check if team exists
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty()) {
            throw new RuntimeException("Team not found with ID: " + teamId);
        }
        
        User user = userOpt.get();
        Team team = teamOpt.get();
        
        // Check if user is already a member of this team
        if (teamService.isUserMemberOfTeam(user.getId(), teamId)) {
            throw new RuntimeException("User is already a member of this team");
        }
        
        // Check if there's already a pending request
        Optional<TeamMembershipRequest> existingRequest = teamMembershipRequestRepository
            .findByUsernameAndTeamIdAndStatus(username, teamId, "PENDING");
        if (existingRequest.isPresent()) {
            throw new RuntimeException("You already have a pending request for this team");
        }
        
        // Create the request
        TeamMembershipRequest request = new TeamMembershipRequest();
        request.setUser(user);
        request.setTeam(team);
        request.setRequestedRole(requestedRole);
        request.setRequestMessage(requestMessage);
        request.setStatus("PENDING");
        
        TeamMembershipRequest savedRequest = teamMembershipRequestRepository.save(request);
        return TeamMembershipRequestDto.fromEntity(savedRequest);
    }
    
    @Transactional
    public TeamMembershipRequestDto reviewTeamMembershipRequest(Long requestId, String reviewerUsername, 
                                                               String status, String reviewMessage) {
        Optional<TeamMembershipRequest> requestOpt = teamMembershipRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Membership request not found");
        }
        
        Optional<User> reviewerOpt = userRepository.findByUsername(reviewerUsername);
        if (reviewerOpt.isEmpty()) {
            throw new RuntimeException("Reviewer not found");
        }
        
        TeamMembershipRequest request = requestOpt.get();
        User reviewer = reviewerOpt.get();
        
        // Check if reviewer is Team Leader of the team
        if (!teamService.isUserTeamLeader(reviewer.getId(), request.getTeam().getId())) {
            throw new RuntimeException("Only Team Leader can review membership requests");
        }
        
        // Update the request
        request.setStatus(status);
        request.setReviewedBy(reviewer);
        request.setReviewMessage(reviewMessage);
        request.setReviewedAt(LocalDateTime.now());
        
        // If approved, add user to team
        if ("APPROVED".equals(status)) {
            teamService.addUserToTeam(request.getUser().getId(), request.getTeam().getId(), 
                                    request.getRequestedRole(), null, null, false);
        }
        
        TeamMembershipRequest savedRequest = teamMembershipRequestRepository.save(request);
        return TeamMembershipRequestDto.fromEntity(savedRequest);
    }
    
    public List<TeamMembershipRequestDto> getTeamMembershipRequestsByUser(String username) {
        try {
            System.out.println("🔍 Service: Loading team membership requests for user: " + username);
            
            // First, let's try a simple query to see if the repository works at all
            System.out.println("🔍 Service: Testing repository connection...");
            long count = teamMembershipRequestRepository.count();
            System.out.println("🔍 Service: Total team membership requests in database: " + count);
            
            // Try to find the user first
            System.out.println("🔍 Service: Looking for user: " + username);
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                System.out.println("🔍 Service: User not found: " + username);
                return new ArrayList<>();
            }
            System.out.println("🔍 Service: User found: " + username);
            
            // Try a simpler query first
            System.out.println("🔍 Service: Trying simple query...");
            List<TeamMembershipRequest> allRequests = teamMembershipRequestRepository.findAll();
            System.out.println("🔍 Service: Found " + allRequests.size() + " total requests");
            
            // Filter manually
            List<TeamMembershipRequest> userRequests = allRequests.stream()
                .filter(r -> r.getUser().getUsername().equals(username))
                .collect(Collectors.toList());
            System.out.println("🔍 Service: Found " + userRequests.size() + " requests for user " + username);
            
            List<TeamMembershipRequestDto> dtos = userRequests.stream()
                    .map(TeamMembershipRequestDto::fromEntity)
                    .collect(Collectors.toList());
            System.out.println("🔍 Service: Converted to " + dtos.size() + " DTOs");
            return dtos;
        } catch (Exception e) {
            System.out.println("🔍 Service: Exception in getTeamMembershipRequestsByUser: " + e.getMessage());
            System.out.println("🔍 Service: Exception type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            throw e;
        }
    }
    
    public List<TeamMembershipRequestDto> getTeamMembershipRequestsByTeam(Long teamId) {
        List<TeamMembershipRequest> requests = teamMembershipRequestRepository.findByTeamId(teamId);
        return requests.stream()
                .map(TeamMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TeamMembershipRequestDto> getPendingTeamMembershipRequestsByTeam(Long teamId) {
        List<TeamMembershipRequest> requests = teamMembershipRequestRepository
            .findByTeamIdAndStatus(teamId, "PENDING");
        return requests.stream()
                .map(TeamMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void withdrawTeamMembershipRequest(Long requestId, String username) {
        System.out.println("🔍 Service: Attempting to withdraw team membership request ID: " + requestId + " for user: " + username);
        
        Optional<TeamMembershipRequest> requestOpt = teamMembershipRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            System.out.println("🔍 Service: Request not found for ID: " + requestId);
            throw new RuntimeException("Membership request not found");
        }
        
        TeamMembershipRequest request = requestOpt.get();
        System.out.println("🔍 Service: Found request - User: " + request.getUser().getUsername() + ", Status: " + request.getStatus() + ", Team: " + request.getTeam().getTeamName());
        
        // Check if the user is the one who made the request
        if (!request.getUser().getUsername().equals(username)) {
            System.out.println("🔍 Service: User mismatch - Request user: " + request.getUser().getUsername() + ", Current user: " + username);
            throw new RuntimeException("You can only withdraw your own applications");
        }
        
        // Check if the request is still pending
        if (!"PENDING".equals(request.getStatus())) {
            System.out.println("🔍 Service: Cannot withdraw - Status is: " + request.getStatus());
            throw new RuntimeException("Cannot withdraw a reviewed application");
        }
        
        // Update the status to WITHDRAWN
        System.out.println("🔍 Service: Setting status to WITHDRAWN");
        request.setStatus("WITHDRAWN");
        
        System.out.println("🔍 Service: Saving request...");
        teamMembershipRequestRepository.save(request);
        System.out.println("🔍 Service: Request withdrawn successfully");
    }

    @Transactional
    public void withdrawLabMembershipRequest(Long requestId, String username) {
        Optional<LabMembershipRequest> requestOpt = labMembershipRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Membership request not found");
        }
        
        LabMembershipRequest request = requestOpt.get();
        
        // Check if the user is the one who made the request
        if (!request.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only withdraw your own applications");
        }
        
        // Check if the request is still pending
        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Cannot withdraw a reviewed application");
        }
        
        // Update the status to WITHDRAWN
        request.setStatus("WITHDRAWN");
        labMembershipRequestRepository.save(request);
    }
}
