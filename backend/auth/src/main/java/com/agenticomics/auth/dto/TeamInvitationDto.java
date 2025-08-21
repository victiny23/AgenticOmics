package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.agenticomics.auth.entity.TeamInvitation;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamInvitationDto {
    
    private Long id;
    private String invitedUsername;
    private String invitedUserEmail;
    private String teamName;
    private String teamId;
    private String labName;
    private String labId;
    private String invitedByUsername;
    private String invitedRole;
    private String invitationMessage;
    private TeamInvitation.InvitationStatus status;
    private LocalDateTime respondedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    
    public static TeamInvitationDto fromEntity(TeamInvitation invitation) {
        TeamInvitationDto dto = new TeamInvitationDto();
        dto.setId(invitation.getId());
        dto.setInvitedUsername(invitation.getInvitedUser().getUsername());
        dto.setInvitedUserEmail(invitation.getInvitedUser().getEmail());
        dto.setTeamName(invitation.getTeam().getTeamName());
        dto.setTeamId(invitation.getTeam().getTeamId());
        dto.setLabName(invitation.getTeam().getLab().getLabName());
        dto.setLabId(invitation.getTeam().getLab().getLabId());
        dto.setInvitedByUsername(invitation.getInvitedBy().getUsername());
        dto.setInvitedRole(invitation.getInvitedRole());
        dto.setInvitationMessage(invitation.getInvitationMessage());
        dto.setStatus(invitation.getStatus());
        dto.setRespondedAt(invitation.getRespondedAt());
        dto.setExpiresAt(invitation.getExpiresAt());
        dto.setCreatedAt(invitation.getCreatedAt());
        return dto;
    }
}
