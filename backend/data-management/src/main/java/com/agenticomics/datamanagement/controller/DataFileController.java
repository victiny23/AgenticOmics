package com.agenticomics.datamanagement.controller;

import com.agenticomics.datamanagement.dto.DataFileResponse;
import com.agenticomics.datamanagement.dto.DataFileUpdateRequest;
import com.agenticomics.datamanagement.service.DataFileService;
import com.agenticomics.datamanagement.exception.DataFileException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
@Slf4j
public class DataFileController {
    
    private final DataFileService dataFileService;
    
    /**
     * Upload a new data file
     */
    @PostMapping("/upload")
    public ResponseEntity<DataFileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "isPublic", required = false, defaultValue = "false") Boolean isPublic,
            @RequestParam(value = "metadata", required = false) String metadata,
            @RequestHeader("X-Username") String username) {
        
        try {
            log.info("File upload request received from user: {}, filename: {}", username, file.getOriginalFilename());
            
            DataFileResponse response = dataFileService.uploadFile(file, username, description, tags, isPublic, metadata);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (DataFileException e) {
            log.error("File upload failed for user: {}, error: {}", username, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get all files for the current user
     */
    @GetMapping("/files")
    public ResponseEntity<List<DataFileResponse>> getUserFiles(@RequestHeader("X-Username") String username) {
        try {
            log.info("Getting files for user: {}", username);
            
            List<DataFileResponse> files = dataFileService.getFilesByUser(username);
            
            return ResponseEntity.ok(files);
            
        } catch (Exception e) {
            log.error("Error getting files for user: {}, error: {}", username, e.getMessage());
            throw new DataFileException("Failed to retrieve files: " + e.getMessage());
        }
    }
    
    /**
     * Get all public files
     */
    @GetMapping("/files/public")
    public ResponseEntity<List<DataFileResponse>> getPublicFiles() {
        try {
            log.info("Getting public files");
            
            List<DataFileResponse> files = dataFileService.getPublicFiles();
            
            return ResponseEntity.ok(files);
            
        } catch (Exception e) {
            log.error("Error getting public files: {}", e.getMessage());
            throw new DataFileException("Failed to retrieve public files: " + e.getMessage());
        }
    }
    
    /**
     * Get a specific file by ID
     */
    @GetMapping("/files/{id}")
    public ResponseEntity<DataFileResponse> getFileById(@PathVariable Long id) {
        try {
            log.info("Getting file with ID: {}", id);
            
            DataFileResponse file = dataFileService.getFileById(id);
            
            return ResponseEntity.ok(file);
            
        } catch (DataFileException e) {
            log.error("Error getting file with ID: {}, error: {}", id, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Update file metadata
     */
    @PutMapping("/files/{id}")
    public ResponseEntity<DataFileResponse> updateFile(
            @PathVariable Long id,
            @RequestBody DataFileUpdateRequest updateRequest,
            @RequestHeader("X-Username") String username) {
        
        try {
            log.info("Updating file with ID: {} by user: {}", id, username);
            
            DataFileResponse response = dataFileService.updateFile(id, updateRequest, username);
            
            return ResponseEntity.ok(response);
            
        } catch (DataFileException e) {
            log.error("Error updating file with ID: {} by user: {}, error: {}", id, username, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Delete a file
     */
    @DeleteMapping("/files/{id}")
    public ResponseEntity<Map<String, String>> deleteFile(
            @PathVariable Long id,
            @RequestHeader("X-Username") String username) {
        
        try {
            log.info("Deleting file with ID: {} by user: {}", id, username);
            
            dataFileService.deleteFile(id, username);
            
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            
        } catch (DataFileException e) {
            log.error("Error deleting file with ID: {} by user: {}, error: {}", id, username, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get file statistics for the current user
     */
    @GetMapping("/statistics")
    public ResponseEntity<DataFileService.FileStatistics> getFileStatistics(@RequestHeader("X-Username") String username) {
        try {
            log.info("Getting file statistics for user: {}", username);
            
            DataFileService.FileStatistics statistics = dataFileService.getFileStatistics(username);
            
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            log.error("Error getting file statistics for user: {}, error: {}", username, e.getMessage());
            throw new DataFileException("Failed to retrieve file statistics: " + e.getMessage());
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "data-management"));
    }
} 