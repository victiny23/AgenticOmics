package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLabMembershipDto {
    private Long id;
    private Long userId;
    private String username;
    private Long labId;
    private String labName;
    private String labCode;
    private String roleInLab;
    private String memberId;
    private Long supervisorId;
    private String supervisorUsername;
    private Boolean isPrimaryLab;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 