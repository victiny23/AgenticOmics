package com.agenticomics.datamanagement.service;

import com.agenticomics.datamanagement.dto.DataFileResponse;
import com.agenticomics.datamanagement.dto.DataFileUpdateRequest;
import com.agenticomics.datamanagement.dto.LabTeamFileStatistics;
import com.agenticomics.datamanagement.dto.LabTeamContextStats;
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
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataFileService {
    
    private final DataFileRepository dataFileRepository;
    private final FileStorageConfig fileStorageConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * Upload a new data file
     */
    public DataFileResponse uploadFile(MultipartFile file, String uploadedBy, String description, 
                                     String tags, Boolean isPublic, String metadata,
                                     String uploadContext, Long labId, String labName,
                                     Long teamId, String teamName) {
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
                    .uploadContext(uploadContext)
                    .labId(labId)
                    .labName(labName)
                    .teamId(teamId)
                    .teamName(teamName)
                    .build();
            
            // Save to database
            DataFile savedFile = dataFileRepository.save(dataFile);
            
            // Update lab/team file statistics
            if (uploadContext != null && uploadContext.equals("LAB") && labId != null) {
                updateLabTeamFileStatistics("LAB", labId, file.getSize());
            } else if (uploadContext != null && uploadContext.equals("TEAM") && teamId != null) {
                updateLabTeamFileStatistics("TEAM", teamId, file.getSize());
            }
            
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
     * Delete file with role-based permissions
     */
    public void deleteFile(Long id, String username) {
        Optional<DataFile> fileOpt = dataFileRepository.findById(id);
        if (fileOpt.isEmpty()) {
            throw new DataFileException("File not found with ID: " + id);
        }
        
        DataFile file = fileOpt.get();
        
        // Check if user has permission to delete this file
        if (!canDeleteFile(file, username)) {
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
     * Check if user can delete a specific file based on role-based permissions
     */
    private boolean canDeleteFile(DataFile file, String username) {
        try {
            // User can always delete their own files
            if (file.getUploadedBy().equals(username)) {
                log.info("User {} can delete file {} because they own it", username, file.getOriginalFilename());
                return true;
            }
            
            // Call auth service to check role-based permissions
            String authServiceUrl = "http://localhost:12001/api/auth/check-file-deletion-permission";
            
            RestTemplate restTemplate = new RestTemplate();
            
            // Prepare request body
            Map<String, Object> requestBody = Map.of(
                "fileUploadedBy", file.getUploadedBy(),
                "uploadContext", file.getUploadContext(),
                "labId", file.getLabId(),
                "teamId", file.getTeamId()
            );
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Username", username);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Make the request
            ResponseEntity<Map> response = restTemplate.postForEntity(authServiceUrl, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean canDelete = (Boolean) response.getBody().get("canDelete");
                String reason = (String) response.getBody().get("reason");
                
                log.info("Permission check result for user {} on file {}: canDelete={}, reason={}", 
                    username, file.getOriginalFilename(), canDelete, reason);
                
                return canDelete != null && canDelete;
            } else {
                log.warn("Failed to get permission from auth service for user {} on file {}", 
                    username, file.getOriginalFilename());
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error checking file deletion permission for user {} on file {}: {}", 
                username, file.getOriginalFilename(), e.getMessage());
            
            // Fallback: user can only delete their own files
            return file.getUploadedBy().equals(username);
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
     * Get files by lab context - with permission checking for Lab PIs
     */
    public List<DataFileResponse> getFilesByLab(Long labId, String username) {
        // First check if user has permission to view lab files
        if (!canViewLabFiles(labId, username)) {
            throw new DataFileException("Access denied: You don't have permission to view files in this lab");
        }
        
        List<DataFile> files = dataFileRepository.findByLabIdOrderByUploadedAtDesc(labId);
        return files.stream()
                .map(DataFileResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get files by team context - with permission checking for Team Leaders
     */
    public List<DataFileResponse> getFilesByTeam(Long teamId, String username) {
        // First check if user has permission to view team files
        if (!canViewTeamFiles(teamId, username)) {
            throw new DataFileException("Access denied: You don't have permission to view files in this team");
        }
        
        List<DataFile> files = dataFileRepository.findByTeamIdOrderByUploadedAtDesc(teamId);
        return files.stream()
                .map(DataFileResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get files uploaded by subordinates (for supervisors)
     */
    public List<DataFileResponse> getSubordinateFiles(String supervisorUsername) {
        // This would need to be implemented based on your user hierarchy
        // For now, we'll return files from labs where the user is a PI
        List<DataFile> files = dataFileRepository.findByLabNameContainingAndUploadedByNotOrderByUploadedAtDesc(
            supervisorUsername, supervisorUsername);
        return files.stream()
                .map(DataFileResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get file statistics by lab/team context
     */
    public LabTeamFileStatistics getLabTeamFileStatistics(String username) {
        List<DataFile> userFiles = dataFileRepository.findByUploadedByOrderByUploadedAtDesc(username);
        
        Map<String, LabTeamContextStats> contextStats = new HashMap<>();
        
        for (DataFile file : userFiles) {
            String contextKey = file.getUploadContext() + "_" + 
                (file.getUploadContext().equals("LAB") ? file.getLabId() : file.getTeamId());
            
            if (!contextStats.containsKey(contextKey)) {
                LabTeamContextStats stats = new LabTeamContextStats();
                stats.setContextType(file.getUploadContext());
                stats.setContextId(file.getUploadContext().equals("LAB") ? file.getLabId() : file.getTeamId());
                stats.setContextName(file.getUploadContext().equals("LAB") ? file.getLabName() : file.getTeamName());
                stats.setFileCount(0L);
                stats.setTotalSize(0L);
                stats.setFiles(new ArrayList<>());
                contextStats.put(contextKey, stats);
            }
            
            LabTeamContextStats stats = contextStats.get(contextKey);
            stats.setFileCount(stats.getFileCount() + 1);
            stats.setTotalSize(stats.getTotalSize() + file.getFileSize());
            stats.getFiles().add(DataFileResponse.fromEntity(file));
        }
        
                    return LabTeamFileStatistics.builder()
                    .totalContexts((long) contextStats.size())
                    .totalFiles((long) userFiles.size())
                    .totalSize(userFiles.stream().mapToLong(DataFile::getFileSize).sum())
                    .contextStats(new ArrayList<>(contextStats.values()))
                    .build();
    }
    
    /**
     * Update lab/team file statistics when a file is uploaded
     */
    private void updateLabTeamFileStatistics(String uploadContext, Long contextId, Long fileSize) {
        try {
            String authServiceUrl = "http://localhost:8081/api/auth";
            String endpoint = uploadContext.equals("LAB") ? 
                authServiceUrl + "/labs/" + contextId + "/file-stats" :
                authServiceUrl + "/teams/" + contextId + "/file-stats";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("fileSize", fileSize);
            requestBody.put("uploadTime", LocalDateTime.now());
            
            restTemplate.postForObject(endpoint, requestBody, String.class);
            
            log.info("Updated {} file statistics for ID: {}", uploadContext, contextId);
            
        } catch (Exception e) {
            log.error("Failed to update {} file statistics for ID: {}, error: {}", 
                uploadContext, contextId, e.getMessage());
        }
    }
    
    /**
     * Check if user can view lab files (Lab PI or lab member)
     */
    private boolean canViewLabFiles(Long labId, String username) {
        try {
            String authServiceUrl = "http://localhost:12001/api/auth/check-lab-file-access";
            
            Map<String, Object> requestBody = Map.of("labId", labId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Username", username);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(authServiceUrl, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean canView = (Boolean) response.getBody().get("canView");
                return canView != null && canView;
            }
            
            return false;
        } catch (Exception e) {
            log.error("Error checking lab file access for user {} on lab {}: {}", 
                username, labId, e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if user can view team files (Team Leader or team member)
     */
    private boolean canViewTeamFiles(Long teamId, String username) {
        try {
            String authServiceUrl = "http://localhost:12001/api/auth/check-team-file-access";
            
            Map<String, Object> requestBody = Map.of("teamId", teamId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Username", username);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(authServiceUrl, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean canView = (Boolean) response.getBody().get("canView");
                return canView != null && canView;
            }
            
            return false;
        } catch (Exception e) {
            log.error("Error checking team file access for user {} on team {}: {}", 
                username, teamId, e.getMessage());
            return false;
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