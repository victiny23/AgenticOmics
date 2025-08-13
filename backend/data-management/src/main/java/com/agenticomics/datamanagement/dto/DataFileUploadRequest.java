package com.agenticomics.datamanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataFileUploadRequest {
    
    private String description;
    private String tags;
    private Boolean isPublic = false;
    private String metadata;
} 