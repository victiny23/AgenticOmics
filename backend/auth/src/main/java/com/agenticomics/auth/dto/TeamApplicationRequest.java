package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamApplicationRequest {
    private Long teamId;
    private String requestedRole;
    private String applicationMessage;
} 