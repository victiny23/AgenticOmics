package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.agenticomics.auth.entity.LabInvitation;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabInvitationDto {
    
    private Long id;
    private String invitedUsername;
    private String invitedUserEmail;
    private String labName;
    private String labId;
    private String invitedByUsername;
    private String invitedRole;
    private String invitationMessage;
    private LabInvitation.InvitationStatus status;
    private LocalDateTime respondedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    
    public static LabInvitationDto fromEntity(LabInvitation invitation) {
        LabInvitationDto dto = new LabInvitationDto();
        dto.setId(invitation.getId());
        dto.setInvitedUsername(invitation.getInvitedUser().getUsername());
        dto.setInvitedUserEmail(invitation.getInvitedUser().getEmail());
        dto.setLabName(invitation.getLab().getLabName());
        dto.setLabId(invitation.getLab().getLabId());
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
