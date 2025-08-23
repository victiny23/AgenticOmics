package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTeamRequest {
    private Long teamId;
    private String newLeaderUsername; // Required if the leaving user is a Team Leader
}
