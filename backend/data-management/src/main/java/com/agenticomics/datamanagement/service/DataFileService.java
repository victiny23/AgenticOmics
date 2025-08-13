package com.agenticomics.datamanagement.service;

import com.agenticomics.datamanagement.dto.DataFileResponse;
import com.agenticomics.datamanagement.dto.DataFileUpdateRequest;
import com.agenticomics.datamanagement.entity.DataFile;
import com.agenticomics.datamanagement.repository.DataFileRepository;
import com.agenticomics.datamanagement.config.FileStorageConfig;
import com.agenticomics.datamanagement.exception.DataFileException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataFileService {
    
    private final DataFileRepository dataFileRepository;
    private final FileStorageConfig fileStorageConfig;
    
    /**
     * Upload a new data file
     */
    public DataFileResponse uploadFile(MultipartFile file, String uploadedBy, String description, 
                                     String tags, Boolean isPublic, String metadata) {
        try {
            // Validate file
            validateFile(file);
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = generateUniqueFilename(originalFilename);
            
            // Create storage directory if it doesn't exist
            Path storageDir = Paths.get(fileStorageConfig.getLocalPath());
            if (!Files.exists(storageDir)) {
                Files.createDirectories(storageDir);
            }
            
            // Save file to storage
            Path filePath = storageDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);
            
            // Calculate checksum
            String checksum = calculateChecksum(filePath);
            
            // Create DataFile entity
            DataFile dataFile = DataFile.builder()
                    .filename(uniqueFilename)
                    .originalFilename(originalFilename)
                    .filePath(filePath.toString())
                    .fileSize(file.getSize())
                    .fileType(determineFileType(fileExtension))
                    .fileExtension(fileExtension)
                    .contentType(file.getContentType())
                    .uploadedBy(uploadedBy)
                    .uploadedAt(LocalDateTime.now())
                    .description(description)
                    .tags(tags)
                    .isPublic(isPublic != null ? isPublic : false)
                    .status(DataFile.FileStatus.UPLOADED)
                    .validationStatus(DataFile.ValidationStatus.PENDING)
                    .metadata(metadata)
                    .checksum(checksum)
                    .build();
            
            // Save to database
            DataFile savedFile = dataFileRepository.save(dataFile);
            
            log.info("File uploaded successfully: {} by user: {}", originalFilename, uploadedBy);
            
            return DataFileResponse.fromEntity(savedFile);
            
        } catch (IOException e) {
            log.error("Error uploading file: {}", file.getOriginalFilename(), e);
            throw new DataFileException("Failed to upload file: " + e.getMessage());
        }
    }
    
    /**
     * Get all files for a user
     */
    public List<DataFileResponse> getFilesByUser(String username) {
        List<DataFile> files = dataFileRepository.findByUploadedByOrderByUploadedAtDesc(username);
        return files.stream()
                .map(DataFileResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all public files
     */
    public List<DataFileResponse> getPublicFiles() {
        List<DataFile> files = dataFileRepository.findByIsPublicTrueOrderByUploadedAtDesc();
        return files.stream()
                .map(DataFileResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get file by ID
     */
    public DataFileResponse getFileById(Long id) {
        Optional<DataFile> file = dataFileRepository.findById(id);
        if (file.isPresent()) {
            return DataFileResponse.fromEntity(file.get());
        }
        throw new DataFileException("File not found with ID: " + id);
    }
    
    /**
     * Update file metadata
     */
    public DataFileResponse updateFile(Long id, DataFileUpdateRequest updateRequest, String username) {
        Optional<DataFile> fileOpt = dataFileRepository.findById(id);
        if (fileOpt.isEmpty()) {
            throw new DataFileException("File not found with ID: " + id);
        }
        
        DataFile file = fileOpt.get();
        
        // Check if user owns the file or if it's public
        if (!file.getUploadedBy().equals(username) && !file.getIsPublic()) {
            throw new DataFileException("Access denied: You don't have permission to update this file");
        }
        
        // Update fields
        if (updateRequest.getDescription() != null) {
            file.setDescription(updateRequest.getDescription());
        }
        if (updateRequest.getTags() != null) {
            file.setTags(updateRequest.getTags());
        }
        if (updateRequest.getIsPublic() != null) {
            file.setIsPublic(updateRequest.getIsPublic());
        }
        if (updateRequest.getMetadata() != null) {
            file.setMetadata(updateRequest.getMetadata());
        }
        
        DataFile updatedFile = dataFileRepository.save(file);
        log.info("File updated: {} by user: {}", file.getOriginalFilename(), username);
        
        return DataFileResponse.fromEntity(updatedFile);
    }
    
    /**
     * Delete file
     */
    public void deleteFile(Long id, String username) {
        Optional<DataFile> fileOpt = dataFileRepository.findById(id);
        if (fileOpt.isEmpty()) {
            throw new DataFileException("File not found with ID: " + id);
        }
        
        DataFile file = fileOpt.get();
        
        // Check if user owns the file
        if (!file.getUploadedBy().equals(username)) {
            throw new DataFileException("Access denied: You don't have permission to delete this file");
        }
        
        try {
            // Delete physical file
            Path filePath = Paths.get(file.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            
            // Delete from database
            dataFileRepository.delete(file);
            
            log.info("File deleted: {} by user: {}", file.getOriginalFilename(), username);
            
        } catch (IOException e) {
            log.error("Error deleting file: {}", file.getOriginalFilename(), e);
            throw new DataFileException("Failed to delete file: " + e.getMessage());
        }
    }
    
    /**
     * Get file statistics for a user
     */
    public FileStatistics getFileStatistics(String username) {
        long totalFiles = dataFileRepository.countByUploadedBy(username);
        // Calculate total size manually for now
        List<DataFile> userFiles = dataFileRepository.findByUploadedByOrderByUploadedAtDesc(username);
        long totalSize = userFiles.stream()
                .mapToLong(DataFile::getFileSize)
                .sum();
        long processedFiles = dataFileRepository.countByStatus(DataFile.FileStatus.PROCESSED);
        long errorFiles = dataFileRepository.countByStatus(DataFile.FileStatus.ERROR);
        
        return FileStatistics.builder()
                .totalFiles(totalFiles)
                .totalSize(totalSize)
                .processedFiles(processedFiles)
                .errorFiles(errorFiles)
                .build();
    }
    
    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new DataFileException("File is empty");
        }
        
                            if (file.getSize() > fileStorageConfig.getMaxFileSize()) {
                        throw new DataFileException("File size exceeds maximum allowed size of " + 
                                (fileStorageConfig.getMaxFileSize() / (1024 * 1024)) + "MB");
                    }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new DataFileException("Invalid filename");
        }
        
                            String fileExtension = getFileExtension(originalFilename);
                    List<String> allowedExtensions = fileStorageConfig.getAllowedExtensionsList();
                    if (!allowedExtensions.contains(fileExtension.toLowerCase())) {
                        throw new DataFileException("File type not allowed. Allowed types: " + allowedExtensions);
                    }
    }
    
    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex);
        }
        return "";
    }
    
    /**
     * Generate unique filename
     */
    private String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String baseName = originalFilename.substring(0, originalFilename.length() - extension.length());
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        return baseName + "_" + timestamp + "_" + uuid + extension;
    }
    
    /**
     * Determine file type based on extension
     */
    private String determineFileType(String extension) {
        String ext = extension.toLowerCase();
        
        if (ext.matches("\\.(csv|tsv|txt)")) {
            return "TABULAR";
        } else if (ext.matches("\\.(fastq|fasta|fa|fq)")) {
            return "SEQUENCE";
        } else if (ext.matches("\\.(bam|sam)")) {
            return "ALIGNMENT";
        } else if (ext.matches("\\.(vcf)")) {
            return "VARIANT";
        } else if (ext.matches("\\.(bed|gtf|gff)")) {
            return "ANNOTATION";
        } else if (ext.matches("\\.(xlsx|xls)")) {
            return "SPREADSHEET";
        } else if (ext.matches("\\.(json|xml)")) {
            return "STRUCTURED";
        } else if (ext.matches("\\.(zip|tar\\.gz|tar)")) {
            return "ARCHIVE";
        } else {
            return "UNKNOWN";
        }
    }
    
    /**
     * Calculate MD5 checksum of file
     */
    private String calculateChecksum(Path filePath) throws IOException {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(Files.readAllBytes(filePath));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException e) {
            log.warn("MD5 algorithm not available, skipping checksum calculation");
            return null;
        }
    }
    
    /**
     * File statistics DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class FileStatistics {
        private long totalFiles;
        private long totalSize;
        private long processedFiles;
        private long errorFiles;
    }
} 