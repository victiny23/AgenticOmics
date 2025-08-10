package com.agenticomics.datamanagement.dto;

import com.agenticomics.datamanagement.entity.DataFile;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataFileResponse {
    
    private Long id;
    private String filename;
    private String originalFilename;
    private Long fileSize;
    private String fileType;
    private String fileExtension;
    private String contentType;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private String description;
    private String tags;
    private Boolean isPublic;
    private DataFile.FileStatus status;
    private DataFile.ValidationStatus validationStatus;
    private String validationMessage;
    private String metadata;
    private String checksum;
    private String downloadUrl;
    
    public static DataFileResponse fromEntity(DataFile dataFile) {
        return DataFileResponse.builder()
                .id(dataFile.getId())
                .filename(dataFile.getFilename())
                .originalFilename(dataFile.getOriginalFilename())
                .fileSize(dataFile.getFileSize())
                .fileType(dataFile.getFileType())
                .fileExtension(dataFile.getFileExtension())
                .contentType(dataFile.getContentType())
                .uploadedBy(dataFile.getUploadedBy())
                .uploadedAt(dataFile.getUploadedAt())
                .description(dataFile.getDescription())
                .tags(dataFile.getTags())
                .isPublic(dataFile.getIsPublic())
                .status(dataFile.getStatus())
                .validationStatus(dataFile.getValidationStatus())
                .validationMessage(dataFile.getValidationMessage())
                .metadata(dataFile.getMetadata())
                .checksum(dataFile.getChecksum())
                .build();
    }
} 