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
            .findByUsernameAndLabIdAndStatus(username, labId, LabMembershipRequest.RequestStatus.PENDING);
        if (existingRequest.isPresent()) {
            throw new RuntimeException("You already have a pending request for this lab");
        }
        
        // Create the request
        LabMembershipRequest request = new LabMembershipRequest();
        request.setUser(user);
        request.setLab(lab);
        request.setRequestedRole(requestedRole);
        request.setRequestMessage(requestMessage);
        request.setStatus(LabMembershipRequest.RequestStatus.PENDING);
        
        LabMembershipRequest savedRequest = labMembershipRequestRepository.save(request);
        return LabMembershipRequestDto.fromEntity(savedRequest);
    }
    
    @Transactional
    public LabMembershipRequestDto reviewLabMembershipRequest(Long requestId, String reviewerUsername, 
                                                             LabMembershipRequest.RequestStatus status, String reviewMessage) {
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
        if (status == LabMembershipRequest.RequestStatus.APPROVED) {
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
            .findByLabIdAndStatus(labId, LabMembershipRequest.RequestStatus.PENDING);
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
            .findByUsernameAndTeamIdAndStatus(username, teamId, TeamMembershipRequest.RequestStatus.PENDING);
        if (existingRequest.isPresent()) {
            throw new RuntimeException("You already have a pending request for this team");
        }
        
        // Create the request
        TeamMembershipRequest request = new TeamMembershipRequest();
        request.setUser(user);
        request.setTeam(team);
        request.setRequestedRole(requestedRole);
        request.setRequestMessage(requestMessage);
        request.setStatus(TeamMembershipRequest.RequestStatus.PENDING);
        
        TeamMembershipRequest savedRequest = teamMembershipRequestRepository.save(request);
        return TeamMembershipRequestDto.fromEntity(savedRequest);
    }
    
    @Transactional
    public TeamMembershipRequestDto reviewTeamMembershipRequest(Long requestId, String reviewerUsername, 
                                                               TeamMembershipRequest.RequestStatus status, String reviewMessage) {
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
        if (status == TeamMembershipRequest.RequestStatus.APPROVED) {
            teamService.addUserToTeam(request.getUser().getId(), request.getTeam().getId(), 
                                    request.getRequestedRole(), null, null, false);
        }
        
        TeamMembershipRequest savedRequest = teamMembershipRequestRepository.save(request);
        return TeamMembershipRequestDto.fromEntity(savedRequest);
    }
    
    public List<TeamMembershipRequestDto> getTeamMembershipRequestsByUser(String username) {
        List<TeamMembershipRequest> requests = teamMembershipRequestRepository.findByUsername(username);
        return requests.stream()
                .map(TeamMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TeamMembershipRequestDto> getTeamMembershipRequestsByTeam(Long teamId) {
        List<TeamMembershipRequest> requests = teamMembershipRequestRepository.findByTeamId(teamId);
        return requests.stream()
                .map(TeamMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TeamMembershipRequestDto> getPendingTeamMembershipRequestsByTeam(Long teamId) {
        List<TeamMembershipRequest> requests = teamMembershipRequestRepository
            .findByTeamIdAndStatus(teamId, TeamMembershipRequest.RequestStatus.PENDING);
        return requests.stream()
                .map(TeamMembershipRequestDto::fromEntity)
                .collect(Collectors.toList());
    }
}
