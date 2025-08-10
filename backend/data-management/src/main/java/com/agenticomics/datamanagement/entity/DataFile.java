package com.agenticomics.datamanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "data_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "filename", nullable = false)
    private String filename;
    
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @Column(name = "file_type")
    private String fileType;
    
    @Column(name = "file_extension")
    private String fileExtension;
    
    @Column(name = "content_type")
    private String contentType;
    
    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;
    
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "tags")
    private String tags;
    
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private FileStatus status = FileStatus.UPLOADED;
    
    @Column(name = "validation_status")
    @Enumerated(EnumType.STRING)
    private ValidationStatus validationStatus = ValidationStatus.PENDING;
    
    @Column(name = "validation_message")
    private String validationMessage;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    @Column(name = "checksum")
    private String checksum;
    
    public enum FileStatus {
        UPLOADED,
        PROCESSING,
        PROCESSED,
        ERROR,
        DELETED
    }
    
    public enum ValidationStatus {
        PENDING,
        VALIDATED,
        INVALID,
        ERROR
    }
} 