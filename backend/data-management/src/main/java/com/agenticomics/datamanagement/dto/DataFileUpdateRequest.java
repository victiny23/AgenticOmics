package com.agenticomics.datamanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataFileUpdateRequest {
    
    private String description;
    private String tags;
    private Boolean isPublic;
    private String metadata;
} 