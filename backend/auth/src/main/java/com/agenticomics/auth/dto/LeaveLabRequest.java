package com.agenticomics.auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveLabRequest {
    private Long labId;
    private String newPiUsername; // Required if the leaving user is a PI
}
