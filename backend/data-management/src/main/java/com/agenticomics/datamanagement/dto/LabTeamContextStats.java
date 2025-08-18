package com.agenticomics.datamanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTeamContextStats {
    private String contextType; // "LAB" or "TEAM"
    private Long contextId;
    private String contextName;
    private Long fileCount;
    private Long totalSize;
    private List<DataFileResponse> files;
} 