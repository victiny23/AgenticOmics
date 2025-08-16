package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.agenticomics.auth.entity.LabApplication.ApplicationStatus;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabApplicationResponse {
    private Long id;
    private String applicantUsername;
    private String applicantName;
    private Long labId;
    private String labName;
    private String requestedRole;
    private String applicationMessage;
    private ApplicationStatus status;
    private String reviewedByUsername;
    private String reviewedByName;
    private String reviewMessage;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 