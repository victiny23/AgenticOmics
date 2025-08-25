package com.agenticomics.auth.service;

import com.agenticomics.auth.entity.LabInvitation;
import com.agenticomics.auth.entity.TeamInvitation;
import com.agenticomics.auth.repository.LabInvitationRepository;
import com.agenticomics.auth.repository.TeamInvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvitationExpirationService {
    
    @Autowired
    private LabInvitationRepository labInvitationRepository;
    
    @Autowired
    private TeamInvitationRepository teamInvitationRepository;
    
    /**
     * Scheduled task that runs every hour to check for and expire invitations
     * that have passed their expiration date
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 milliseconds)
    @Transactional
    public void expireInvitations() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find and expire lab invitations
        List<LabInvitation> expiredLabInvitations = labInvitationRepository.findExpiredPendingInvitations(now);
        for (LabInvitation invitation : expiredLabInvitations) {
            invitation.setStatus(LabInvitation.InvitationStatus.EXPIRED);
            labInvitationRepository.save(invitation);
            System.out.println("🔔 Expired lab invitation ID: " + invitation.getId() + 
                             " for user: " + invitation.getInvitedUser().getUsername() + 
                             " to lab: " + invitation.getLab().getLabName());
        }
        
        // Find and expire team invitations
        List<TeamInvitation> expiredTeamInvitations = teamInvitationRepository.findExpiredPendingInvitations(now);
        for (TeamInvitation invitation : expiredTeamInvitations) {
            invitation.setStatus(TeamInvitation.InvitationStatus.EXPIRED);
            teamInvitationRepository.save(invitation);
            System.out.println("🔔 Expired team invitation ID: " + invitation.getId() + 
                             " for user: " + invitation.getInvitedUser().getUsername() + 
                             " to team: " + invitation.getTeam().getTeamName());
        }
        
        if (!expiredLabInvitations.isEmpty() || !expiredTeamInvitations.isEmpty()) {
            System.out.println("🔔 Expiration service completed: " + 
                             expiredLabInvitations.size() + " lab invitations and " + 
                             expiredTeamInvitations.size() + " team invitations expired");
        }
    }
    
    /**
     * Manual method to expire invitations (can be called from API if needed)
     */
    @Transactional
    public void manuallyExpireInvitations() {
        expireInvitations();
    }
}
