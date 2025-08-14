package com.agenticomics.datamanagement.repository;

import com.agenticomics.datamanagement.entity.DataFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DataFileRepository extends JpaRepository<DataFile, Long> {
    
    // Find files by uploader
    List<DataFile> findByUploadedByOrderByUploadedAtDesc(String uploadedBy);
    
    // Find files by status
    List<DataFile> findByStatusOrderByUploadedAtDesc(DataFile.FileStatus status);
    
    // Find files by validation status
    List<DataFile> findByValidationStatusOrderByUploadedAtDesc(DataFile.ValidationStatus validationStatus);
    
    // Find files by file type
    List<DataFile> findByFileTypeOrderByUploadedAtDesc(String fileType);
    
    // Find files by file extension
    List<DataFile> findByFileExtensionOrderByUploadedAtDesc(String fileExtension);
    
    // Find public files
    List<DataFile> findByIsPublicTrueOrderByUploadedAtDesc();
    
    // Find files by uploader and status
    List<DataFile> findByUploadedByAndStatusOrderByUploadedAtDesc(String uploadedBy, DataFile.FileStatus status);
    
    // Find files by filename
    Optional<DataFile> findByFilename(String filename);
    
    // Find files by original filename
    List<DataFile> findByOriginalFilenameContainingIgnoreCaseOrderByUploadedAtDesc(String originalFilename);
    
    // Find files by description containing text
    List<DataFile> findByDescriptionContainingIgnoreCaseOrderByUploadedAtDesc(String description);
    
    // Find files by tags containing text
    List<DataFile> findByTagsContainingIgnoreCaseOrderByUploadedAtDesc(String tags);
    
    // Find files uploaded after a certain date
    List<DataFile> findByUploadedAtAfterOrderByUploadedAtDesc(java.time.LocalDateTime date);
    
    // Find files uploaded before a certain date
    List<DataFile> findByUploadedAtBeforeOrderByUploadedAtDesc(java.time.LocalDateTime date);
    
    // Find files within a size range
    List<DataFile> findByFileSizeBetweenOrderByFileSizeDesc(Long minSize, Long maxSize);
    
    // Count files by uploader
    long countByUploadedBy(String uploadedBy);
    
    // Count files by status
    long countByStatus(DataFile.FileStatus status);
    
    // Count files by validation status
    long countByValidationStatus(DataFile.ValidationStatus validationStatus);
    
    // Get total file size by uploader
    @Query("SELECT COALESCE(SUM(df.fileSize), 0) FROM DataFile df WHERE df.uploadedBy = :uploadedBy")
    Long getTotalFileSizeByUploader(@Param("uploadedBy") String uploadedBy);
    
    // Get total file size by uploader and status
    @Query("SELECT COALESCE(SUM(df.fileSize), 0) FROM DataFile df WHERE df.uploadedBy = :uploadedBy AND df.status = :status")
    Long getTotalFileSizeByUploaderAndStatus(@Param("uploadedBy") String uploadedBy, @Param("status") DataFile.FileStatus status);
    
    // Find files by multiple criteria
    @Query("SELECT df FROM DataFile df WHERE " +
           "(:uploadedBy IS NULL OR df.uploadedBy = :uploadedBy) AND " +
           "(:status IS NULL OR df.status = :status) AND " +
           "(:validationStatus IS NULL OR df.validationStatus = :validationStatus) AND " +
           "(:fileType IS NULL OR df.fileType = :fileType) AND " +
           "(:isPublic IS NULL OR df.isPublic = :isPublic) " +
           "ORDER BY df.uploadedAt DESC")
    List<DataFile> findByMultipleCriteria(
            @Param("uploadedBy") String uploadedBy,
            @Param("status") DataFile.FileStatus status,
            @Param("validationStatus") DataFile.ValidationStatus validationStatus,
            @Param("fileType") String fileType,
            @Param("isPublic") Boolean isPublic
    );
    
    // Lab/Team context queries
    List<DataFile> findByLabIdAndUploadedByOrderByUploadedAtDesc(Long labId, String uploadedBy);
    
    List<DataFile> findByTeamIdAndUploadedByOrderByUploadedAtDesc(Long teamId, String uploadedBy);
    
    List<DataFile> findByLabNameContainingAndUploadedByNotOrderByUploadedAtDesc(String labName, String uploadedBy);
    
    List<DataFile> findByUploadContextOrderByUploadedAtDesc(String uploadContext);
    
    List<DataFile> findByLabIdOrderByUploadedAtDesc(Long labId);
    
    List<DataFile> findByTeamIdOrderByUploadedAtDesc(Long teamId);
} 