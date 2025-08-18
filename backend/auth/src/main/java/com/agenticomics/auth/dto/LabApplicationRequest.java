package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabApplicationRequest {
    private Long labId;
    private String requestedRole;
    private String applicationMessage;
} 