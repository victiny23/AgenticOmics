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
public class LabTeamFileStatistics {
    private Long totalContexts;
    private Long totalFiles;
    private Long totalSize;
    private List<LabTeamContextStats> contextStats;
} 