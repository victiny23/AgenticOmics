package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewRequest {
    private String action; // "APPROVE" or "REJECT"
    private String reviewMessage;
} 