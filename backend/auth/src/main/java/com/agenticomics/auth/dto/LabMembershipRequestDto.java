package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.agenticomics.auth.entity.LabMembershipRequest;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabMembershipRequestDto {
    
    private Long id;
    private String username;
    private String userEmail;
    private String labName;
    private String labId;
    private String requestedRole;
    private String requestMessage;
    private String status;
    private String reviewedByUsername;
    private String reviewMessage;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    
    public static LabMembershipRequestDto fromEntity(LabMembershipRequest request) {
        LabMembershipRequestDto dto = new LabMembershipRequestDto();
        dto.setId(request.getId());
        dto.setUsername(request.getUser().getUsername());
        dto.setUserEmail(request.getUser().getEmail());
        dto.setLabName(request.getLab().getLabName());
        dto.setLabId(request.getLab().getLabId());
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
