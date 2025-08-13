package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDto {
    private Long id;
    private String teamId;
    private String teamName;
    private String teamDescription;
    private Long labId;
    private String labName;
    private Long teamLeaderId;
    private String teamLeaderName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 