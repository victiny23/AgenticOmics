package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.agenticomics.auth.entity.TeamMembershipRequest;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMembershipRequestDto {
    
    private Long id;
    private String username;
    private String userEmail;
    private String teamName;
    private String teamId;
    private String labName;
    private String labId;
    private String requestedRole;
    private String requestMessage;
    private TeamMembershipRequest.RequestStatus status;
    private String reviewedByUsername;
    private String reviewMessage;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    
    public static TeamMembershipRequestDto fromEntity(TeamMembershipRequest request) {
        TeamMembershipRequestDto dto = new TeamMembershipRequestDto();
        dto.setId(request.getId());
        dto.setUsername(request.getUser().getUsername());
        dto.setUserEmail(request.getUser().getEmail());
        dto.setTeamName(request.getTeam().getTeamName());
        dto.setTeamId(request.getTeam().getTeamId());
        dto.setLabName(request.getTeam().getLab().getLabName());
        dto.setLabId(request.getTeam().getLab().getLabId());
        dto.setRequestedRole(request.getRequestedRole());
        dto.setRequestMessage(request.getRequestMessage());
        dto.setStatus(request.getStatus());
        if (request.getReviewedBy() != null) {
            dto.setReviewedByUsername(request.getReviewedBy().getUsername());
        }
        dto.setReviewMessage(request.getReviewMessage());
        dto.setReviewedAt(request.getReviewedAt());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
}
