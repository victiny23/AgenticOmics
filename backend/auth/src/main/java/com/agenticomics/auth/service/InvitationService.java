package com.agenticomics.auth.service;

import com.agenticomics.auth.dto.LabInvitationDto;
import com.agenticomics.auth.dto.TeamInvitationDto;
import com.agenticomics.auth.entity.*;
import com.agenticomics.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InvitationService {
    
    @Autowired
    private LabInvitationRepository labInvitationRepository;
    
    @Autowired
    private TeamInvitationRepository teamInvitationRepository;
    
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
    
    // Lab Invitation Methods
    
    @Transactional
    public LabInvitationDto createLabInvitation(String invitedUsername, Long labId, String invitedRole, 
                                               String invitationMessage, String invitedByUsername) {
        System.out.println("🔍 createLabInvitation Debug - invitedUsername: " + invitedUsername + 
                          ", labId: " + labId + ", invitedRole: " + invitedRole + 
                          ", invitedByUsername: " + invitedByUsername);
        
        // Check if invited user exists
        System.out.println("🔍 Looking up user with username: '" + invitedUsername + "'");
        Optional<User> invitedUserOpt = userRepository.findByUsername(invitedUsername);
        System.out.println("🔍 User lookup result for '" + invitedUsername + "': " + 
                          (invitedUserOpt.isPresent() ? "FOUND" : "NOT FOUND"));
        
        if (invitedUserOpt.isEmpty()) {
            // Try to find all users to see what's in the database
            List<User> allUsers = userRepository.findAll();
            System.out.println("🔍 All users in database:");
            for (User user : allUsers) {
                System.out.println("  - Username: '" + user.getUsername() + "', ID: " + user.getId());
            }
            throw new RuntimeException("Invited user not found: " + invitedUsername);
        }
        
        // Check if lab exists
        Optional<Lab> labOpt = labRepository.findById(labId);
        if (labOpt.isEmpty()) {
            throw new RuntimeException("Lab not found with ID: " + labId);
        }
        
        System.out.println("🔍 Lab found: " + labOpt.get().getLabName() + " (ID: " + labId + ")");
        
        // Check if inviter exists
        Optional<User> inviterOpt = userRepository.findByUsername(invitedByUsername);
        if (inviterOpt.isEmpty()) {
            throw new RuntimeException("Inviter not found: " + invitedByUsername);
        }
        
        User invitedUser = invitedUserOpt.get();
        Lab lab = labOpt.get();
        User inviter = inviterOpt.get();
        
        // Check if inviter is a member of the specific lab they're inviting to, or Super Admin
        if (!labService.isUserMemberOfLab(inviter.getId(), labId) && !"Super Admin".equals(inviter.getRole())) {
            throw new RuntimeException("You can only invite people to labs you are a member of");
        }
        
        // Check if user is already a member of this lab
        if (labService.isUserMemberOfLab(invitedUser.getId(), labId)) {
            throw new RuntimeException("User is already a member of this lab");
        }
        
        // Check if there's already a pending invitation (either pending approval or pending response)
        Optional<LabInvitation> existingPendingInvitation = labInvitationRepository
            .findByInvitedUsernameAndLabIdAndStatus(invitedUsername, labId, LabInvitation.InvitationStatus.PENDING);
        Optional<LabInvitation> existingPendingApprovalInvitation = labInvitationRepository
            .findByInvitedUsernameAndLabIdAndStatus(invitedUsername, labId, LabInvitation.InvitationStatus.PENDING_APPROVAL);
        
        if (existingPendingInvitation.isPresent() || existingPendingApprovalInvitation.isPresent()) {
            throw new RuntimeException("User already has a pending invitation for this lab");
        }
        
        // Check for ANY existing invitation to this lab (for debugging)
        List<LabInvitation> allExistingInvitations = labInvitationRepository.findByInvitedUsernameAndLabId(invitedUsername, labId);
        if (!allExistingInvitations.isEmpty()) {
            System.out.println("🔍 Found existing invitations for " + invitedUsername + " to lab " + labId + ":");
            for (LabInvitation existing : allExistingInvitations) {
                System.out.println("  - ID: " + existing.getId() + ", Status: " + existing.getStatus() + 
                                 ", Created: " + existing.getCreatedAt());
            }
            // Delete existing invitations to avoid constraint violation
            System.out.println("🔍 Deleting existing invitations to avoid constraint violation");
            labInvitationRepository.deleteAll(allExistingInvitations);
        }
        
        // Create the invitation
        LabInvitation invitation = new LabInvitation();
        invitation.setInvitedUser(invitedUser);
        invitation.setLab(lab);
        invitation.setInvitedBy(inviter);
        invitation.setInvitedRole(invitedRole);
        invitation.setInvitationMessage(invitationMessage);
        
        // Set initial status based on inviter's role
        boolean isSuperAdmin = "Super Admin".equals(inviter.getRole());
        boolean isLabPI = labService.isUserLabPI(inviter.getId(), labId);
        
        System.out.println("🔍 Invitation Debug - Inviter: " + inviter.getUsername() + 
                          ", Role: " + inviter.getRole() + 
                          ", Is Super Admin: " + isSuperAdmin + 
                          ", Is Lab PI: " + isLabPI + 
                          ", Lab ID: " + labId);
        
        if (isSuperAdmin || isLabPI) {
            // PI or Super Admin can send direct invitations
            invitation.setStatus(LabInvitation.InvitationStatus.PENDING);
            System.out.println("🔍 Setting invitation status to PENDING");
        } else {
            // Regular members need PI approval first
            invitation.setStatus(LabInvitation.InvitationStatus.PENDING_APPROVAL);
            System.out.println("🔍 Setting invitation status to PENDING_APPROVAL");
        }
        
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7 days expiration
        
        System.out.println("🔍 About to save invitation - invitedUser: " + 
                          (invitation.getInvitedUser() != null ? invitation.getInvitedUser().getUsername() : "NULL") +
                          ", lab: " + (invitation.getLab() != null ? invitation.getLab().getLabName() : "NULL") +
                          ", invitedBy: " + (invitation.getInvitedBy() != null ? invitation.getInvitedBy().getUsername() : "NULL"));
        
        LabInvitation savedInvitation = labInvitationRepository.save(invitation);
        return LabInvitationDto.fromEntity(savedInvitation);
    }
    
    @Transactional
    public LabInvitationDto respondToLabInvitation(Long invitationId, String username, 
                                                  LabInvitation.InvitationStatus response) {
        Optional<LabInvitation> invitationOpt = labInvitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new RuntimeException("Invitation not found");
        }
        
        LabInvitation invitation = invitationOpt.get();
        
        // Check if the user is the one who was invited
        if (!invitation.getInvitedUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only respond to invitations sent to you");
        }
        
        // Check if invitation is still pending
        if (invitation.getStatus() != LabInvitation.InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation has already been responded to");
        }
        
        // Check if invitation has expired
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(LabInvitation.InvitationStatus.EXPIRED);
            labInvitationRepository.save(invitation);
            throw new RuntimeException("Invitation has expired");
        }
        
        // Update the invitation
        invitation.setStatus(response);
        invitation.setRespondedAt(LocalDateTime.now());
        
        // If accepted, add user to lab
        if (response == LabInvitation.InvitationStatus.ACCEPTED) {
            labService.addUserToLab(invitation.getInvitedUser().getId(), invitation.getLab().getId(), 
                                  invitation.getInvitedRole(), null, null, false);
        }
        
        LabInvitation savedInvitation = labInvitationRepository.save(invitation);
        return LabInvitationDto.fromEntity(savedInvitation);
    }
    
    public List<LabInvitationDto> getLabInvitationsByUser(String username) {
        List<LabInvitation> invitations = labInvitationRepository.findByInvitedUsername(username);
        return invitations.stream()
                .map(LabInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<LabInvitationDto> getLabInvitationsByLab(Long labId) {
        List<LabInvitation> invitations = labInvitationRepository.findByLabId(labId);
        return invitations.stream()
                .map(LabInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<LabInvitationDto> getPendingLabInvitationsByUser(String username) {
        List<LabInvitation> invitations = labInvitationRepository
            .findByInvitedUsernameAndStatus(username, LabInvitation.InvitationStatus.PENDING);
        return invitations.stream()
                .map(LabInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    // Team Invitation Methods
    
    @Transactional
    public TeamInvitationDto createTeamInvitation(String invitedUsername, Long teamId, String invitedRole, 
                                                 String invitationMessage, String invitedByUsername) {
        // Check if invited user exists
        Optional<User> invitedUserOpt = userRepository.findByUsername(invitedUsername);
        if (invitedUserOpt.isEmpty()) {
            throw new RuntimeException("Invited user not found: " + invitedUsername);
        }
        
        // Check if team exists
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty()) {
            throw new RuntimeException("Team not found with ID: " + teamId);
        }
        
        // Check if inviter exists
        Optional<User> inviterOpt = userRepository.findByUsername(invitedByUsername);
        if (inviterOpt.isEmpty()) {
            throw new RuntimeException("Inviter not found: " + invitedByUsername);
        }
        
        User invitedUser = invitedUserOpt.get();
        Team team = teamOpt.get();
        User inviter = inviterOpt.get();
        
        // Check if inviter is a member of the specific team they're inviting to, or Super Admin
        if (!teamService.isUserMemberOfTeam(inviter.getId(), teamId) && !"Super Admin".equals(inviter.getRole())) {
            throw new RuntimeException("You can only invite people to teams you are a member of");
        }
        
        // Check if user is already a member of this team
        if (teamService.isUserMemberOfTeam(invitedUser.getId(), teamId)) {
            throw new RuntimeException("User is already a member of this team");
        }
        
        // Check if there's already a pending invitation (either pending approval or pending response)
        Optional<TeamInvitation> existingPendingInvitation = teamInvitationRepository
            .findByInvitedUsernameAndTeamIdAndStatus(invitedUsername, teamId, TeamInvitation.InvitationStatus.PENDING);
        Optional<TeamInvitation> existingPendingApprovalInvitation = teamInvitationRepository
            .findByInvitedUsernameAndTeamIdAndStatus(invitedUsername, teamId, TeamInvitation.InvitationStatus.PENDING_APPROVAL);
        
        if (existingPendingInvitation.isPresent() || existingPendingApprovalInvitation.isPresent()) {
            throw new RuntimeException("User already has a pending invitation for this team");
        }
        
        // Create the invitation
        TeamInvitation invitation = new TeamInvitation();
        invitation.setInvitedUser(invitedUser);
        invitation.setTeam(team);
        invitation.setInvitedBy(inviter);
        invitation.setInvitedRole(invitedRole);
        invitation.setInvitationMessage(invitationMessage);
        
        // Set initial status based on inviter's role
        if ("Super Admin".equals(inviter.getRole()) || teamService.isUserTeamLeader(inviter.getId(), teamId)) {
            // Team Leader or Super Admin can send direct invitations
            invitation.setStatus(TeamInvitation.InvitationStatus.PENDING);
        } else {
            // Regular members need Team Leader approval first
            invitation.setStatus(TeamInvitation.InvitationStatus.PENDING_APPROVAL);
        }
        
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7 days expiration
        
        TeamInvitation savedInvitation = teamInvitationRepository.save(invitation);
        return TeamInvitationDto.fromEntity(savedInvitation);
    }
    
    @Transactional
    public TeamInvitationDto respondToTeamInvitation(Long invitationId, String username, 
                                                    TeamInvitation.InvitationStatus response) {
        Optional<TeamInvitation> invitationOpt = teamInvitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new RuntimeException("Invitation not found");
        }
        
        TeamInvitation invitation = invitationOpt.get();
        
        // Check if the user is the one who was invited
        if (!invitation.getInvitedUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only respond to invitations sent to you");
        }
        
        // Check if invitation is still pending
        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation has already been responded to");
        }
        
        // Check if invitation has expired
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(TeamInvitation.InvitationStatus.EXPIRED);
            teamInvitationRepository.save(invitation);
            throw new RuntimeException("Invitation has expired");
        }
        
        // Update the invitation
        invitation.setStatus(response);
        invitation.setRespondedAt(LocalDateTime.now());
        
        // If accepted, add user to team
        if (response == TeamInvitation.InvitationStatus.ACCEPTED) {
            teamService.addUserToTeam(invitation.getInvitedUser().getId(), invitation.getTeam().getId(), 
                                    invitation.getInvitedRole(), null, null, false);
        }
        
        TeamInvitation savedInvitation = teamInvitationRepository.save(invitation);
        return TeamInvitationDto.fromEntity(savedInvitation);
    }
    
    public List<TeamInvitationDto> getTeamInvitationsByUser(String username) {
        List<TeamInvitation> invitations = teamInvitationRepository.findByInvitedUsername(username);
        return invitations.stream()
                .map(TeamInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TeamInvitationDto> getTeamInvitationsByTeam(Long teamId) {
        List<TeamInvitation> invitations = teamInvitationRepository.findByTeamId(teamId);
        return invitations.stream()
                .map(TeamInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TeamInvitationDto> getPendingTeamInvitationsByUser(String username) {
        List<TeamInvitation> invitations = teamInvitationRepository
            .findByInvitedUsernameAndStatus(username, TeamInvitation.InvitationStatus.PENDING);
        return invitations.stream()
                .map(TeamInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    // Utility methods for cleaning up expired invitations
    @Transactional
    public void cleanupExpiredInvitations() {
        LocalDateTime now = LocalDateTime.now();
        
        // Clean up expired lab invitations
        List<LabInvitation> expiredLabInvitations = labInvitationRepository.findExpiredPendingInvitations(now);
        for (LabInvitation invitation : expiredLabInvitations) {
            invitation.setStatus(LabInvitation.InvitationStatus.EXPIRED);
            labInvitationRepository.save(invitation);
        }
        
        // Clean up expired team invitations
        List<TeamInvitation> expiredTeamInvitations = teamInvitationRepository.findExpiredPendingInvitations(now);
        for (TeamInvitation invitation : expiredTeamInvitations) {
            invitation.setStatus(TeamInvitation.InvitationStatus.EXPIRED);
            teamInvitationRepository.save(invitation);
        }
    }
    
    /**
     * Get pending lab invitations that need PI approval
     */
    public List<LabInvitationDto> getPendingLabApprovalsForPI(String piUsername) {
        Optional<User> piOpt = userRepository.findByUsername(piUsername);
        if (piOpt.isEmpty()) {
            throw new RuntimeException("PI not found: " + piUsername);
        }
        
        User pi = piOpt.get();
        List<LabInvitation> pendingInvitations = new ArrayList<>();
        
        if ("Super Admin".equals(pi.getRole())) {
            // Super Admin can see all pending lab invitations (both PENDING and PENDING_APPROVAL)
            List<LabInvitation> allInvitations = labInvitationRepository.findAll();
            pendingInvitations = allInvitations.stream()
                .filter(inv -> inv.getStatus() == LabInvitation.InvitationStatus.PENDING || 
                              inv.getStatus() == LabInvitation.InvitationStatus.PENDING_APPROVAL)
                .collect(Collectors.toList());
        } else {
            // Lab PI can only see pending invitations for labs they lead (both PENDING and PENDING_APPROVAL)
            // For now, we'll get all pending invitations and filter by lab membership
            List<LabInvitation> allInvitations = labInvitationRepository.findAll();
            pendingInvitations = allInvitations.stream()
                .filter(inv -> inv.getStatus() == LabInvitation.InvitationStatus.PENDING || 
                              inv.getStatus() == LabInvitation.InvitationStatus.PENDING_APPROVAL)
                .filter(inv -> labService.isUserLabPI(pi.getId(), inv.getLab().getId()))
                .collect(Collectors.toList());
        }
        
        return pendingInvitations.stream()
                .map(LabInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get pending team invitations that need Team Leader approval
     */
    public List<TeamInvitationDto> getPendingTeamApprovalsForLeader(String leaderUsername) {
        Optional<User> leaderOpt = userRepository.findByUsername(leaderUsername);
        if (leaderOpt.isEmpty()) {
            throw new RuntimeException("Team Leader not found: " + leaderUsername);
        }
        
        User leader = leaderOpt.get();
        List<TeamInvitation> pendingInvitations = new ArrayList<>();
        
        if ("Super Admin".equals(leader.getRole())) {
            // Super Admin can see all pending team invitations (both PENDING and PENDING_APPROVAL)
            List<TeamInvitation> allInvitations = teamInvitationRepository.findAll();
            pendingInvitations = allInvitations.stream()
                .filter(inv -> inv.getStatus() == TeamInvitation.InvitationStatus.PENDING || 
                              inv.getStatus() == TeamInvitation.InvitationStatus.PENDING_APPROVAL)
                .collect(Collectors.toList());
        } else {
            // Team Leader can only see pending invitations for teams they lead (both PENDING and PENDING_APPROVAL)
            // For now, we'll get all pending invitations and filter by team membership
            List<TeamInvitation> allInvitations = teamInvitationRepository.findAll();
            pendingInvitations = allInvitations.stream()
                .filter(inv -> inv.getStatus() == TeamInvitation.InvitationStatus.PENDING || 
                              inv.getStatus() == TeamInvitation.InvitationStatus.PENDING_APPROVAL)
                .filter(inv -> teamService.isUserTeamLeader(leader.getId(), inv.getTeam().getId()))
                .collect(Collectors.toList());
        }
        
        return pendingInvitations.stream()
                .map(TeamInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Approve or reject a lab invitation (PI only)
     */
    @Transactional
    public LabInvitationDto approveLabInvitation(Long invitationId, String piUsername, String status) {
        Optional<LabInvitation> invitationOpt = labInvitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new RuntimeException("Invitation not found");
        }
        
        LabInvitation invitation = invitationOpt.get();
        
        // Check if the user is the PI of the lab or Super Admin
        Optional<User> piOpt = userRepository.findByUsername(piUsername);
        if (piOpt.isEmpty()) {
            throw new RuntimeException("PI not found: " + piUsername);
        }
        
        User pi = piOpt.get();
        if (!"Super Admin".equals(pi.getRole()) && !labService.isUserLabPI(pi.getId(), invitation.getLab().getId())) {
            throw new RuntimeException("Only Lab PI or Super Admin can approve invitations");
        }
        
        // Check if invitation is pending approval or pending response
        if (invitation.getStatus() != LabInvitation.InvitationStatus.PENDING && 
            invitation.getStatus() != LabInvitation.InvitationStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Invitation has already been processed");
        }
        
        // Update the invitation status
        if ("APPROVED".equals(status)) {
            if (invitation.getStatus() == LabInvitation.InvitationStatus.PENDING_APPROVAL) {
                // Change from PENDING_APPROVAL to PENDING (invitee can now respond)
                invitation.setStatus(LabInvitation.InvitationStatus.PENDING);
            } else {
                // Direct approval (if PI approves a PENDING invitation)
                invitation.setStatus(LabInvitation.InvitationStatus.ACCEPTED);
                // Add user to lab
                labService.addUserToLab(invitation.getInvitedUser().getId(), invitation.getLab().getId(), 
                                      invitation.getInvitedRole(), null, null, false);
            }
        } else if ("REJECTED".equals(status)) {
            invitation.setStatus(LabInvitation.InvitationStatus.DECLINED);
        } else {
            throw new RuntimeException("Invalid status. Must be 'APPROVED' or 'REJECTED'");
        }
        
        invitation.setRespondedAt(LocalDateTime.now());
        LabInvitation savedInvitation = labInvitationRepository.save(invitation);
        return LabInvitationDto.fromEntity(savedInvitation);
    }
    
    /**
     * Approve or reject a team invitation (Team Leader only)
     */
    @Transactional
    public TeamInvitationDto approveTeamInvitation(Long invitationId, String leaderUsername, String status) {
        Optional<TeamInvitation> invitationOpt = teamInvitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new RuntimeException("Invitation not found");
        }
        
        TeamInvitation invitation = invitationOpt.get();
        
        // Check if the user is the Team Leader of the team or Super Admin
        Optional<User> leaderOpt = userRepository.findByUsername(leaderUsername);
        if (leaderOpt.isEmpty()) {
            throw new RuntimeException("Team Leader not found: " + leaderUsername);
        }
        
        User leader = leaderOpt.get();
        if (!"Super Admin".equals(leader.getRole()) && !teamService.isUserTeamLeader(leader.getId(), invitation.getTeam().getId())) {
            throw new RuntimeException("Only Team Leader or Super Admin can approve invitations");
        }
        
        // Check if invitation is pending approval or pending response
        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING && 
            invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Invitation has already been processed");
        }
        
        // Update the invitation status
        if ("APPROVED".equals(status)) {
            if (invitation.getStatus() == TeamInvitation.InvitationStatus.PENDING_APPROVAL) {
                // Change from PENDING_APPROVAL to PENDING (invitee can now respond)
                invitation.setStatus(TeamInvitation.InvitationStatus.PENDING);
            } else {
                // Direct approval (if Leader approves a PENDING invitation)
                invitation.setStatus(TeamInvitation.InvitationStatus.ACCEPTED);
                // Add user to team
                teamService.addUserToTeam(invitation.getInvitedUser().getId(), invitation.getTeam().getId(), 
                                        invitation.getInvitedRole(), null, null, false);
            }
        } else if ("REJECTED".equals(status)) {
            invitation.setStatus(TeamInvitation.InvitationStatus.DECLINED);
        } else {
            throw new RuntimeException("Invalid status. Must be 'APPROVED' or 'REJECTED'");
        }
        
        invitation.setRespondedAt(LocalDateTime.now());
        TeamInvitation savedInvitation = teamInvitationRepository.save(invitation);
        return TeamInvitationDto.fromEntity(savedInvitation);
    }
}
