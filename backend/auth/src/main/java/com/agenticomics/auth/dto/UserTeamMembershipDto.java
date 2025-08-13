package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserTeamMembershipDto {
    private Long id;
    private Long userId;
    private String username;
    private Long teamId;
    private String teamName;
    private String teamIdCode;
    private String roleInTeam;
    private String memberId;
    private Long supervisorId;
    private String supervisorName;
    private Boolean isPrimaryTeam;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 