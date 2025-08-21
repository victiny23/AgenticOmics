package com.agenticomics.datamanagement.controller;

import com.agenticomics.datamanagement.dto.DataFileResponse;
import com.agenticomics.datamanagement.dto.DataFileUpdateRequest;
import com.agenticomics.datamanagement.dto.LabTeamFileStatistics;
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
            @RequestParam(value = "uploadContext", required = false) String uploadContext,
            @RequestParam(value = "labId", required = false) Long labId,
            @RequestParam(value = "labName", required = false) String labName,
            @RequestParam(value = "teamId", required = false) Long teamId,
            @RequestParam(value = "teamName", required = false) String teamName,
            @RequestHeader("X-Username") String username) {
        
        try {
            log.info("File upload request received from user: {}, filename: {}", username, file.getOriginalFilename());
            
            DataFileResponse response = dataFileService.uploadFile(
                file, username, description, tags, isPublic, metadata,
                uploadContext, labId, labName, teamId, teamName
            );
            
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
     * Get files by lab context
     */
    @GetMapping("/files/lab/{labId}")
    public ResponseEntity<List<DataFileResponse>> getFilesByLab(
            @PathVariable Long labId,
            @RequestHeader("X-Username") String username) {
        try {
            log.info("Getting files for lab ID: {} by user: {}", labId, username);
            
            List<DataFileResponse> files = dataFileService.getFilesByLab(labId, username);
            
            return ResponseEntity.ok(files);
            
        } catch (Exception e) {
            log.error("Error getting files for lab ID: {} by user: {}, error: {}", labId, username, e.getMessage());
            throw new DataFileException("Failed to retrieve lab files: " + e.getMessage());
        }
    }
    
    /**
     * Get files by team context
     */
    @GetMapping("/files/team/{teamId}")
    public ResponseEntity<List<DataFileResponse>> getFilesByTeam(
            @PathVariable Long teamId,
            @RequestHeader("X-Username") String username) {
        try {
            log.info("Getting files for team ID: {} by user: {}", teamId, username);
            
            List<DataFileResponse> files = dataFileService.getFilesByTeam(teamId, username);
            
            return ResponseEntity.ok(files);
            
        } catch (Exception e) {
            log.error("Error getting files for team ID: {} by user: {}, error: {}", teamId, username, e.getMessage());
            throw new DataFileException("Failed to retrieve team files: " + e.getMessage());
        }
    }
    
    /**
     * Get files uploaded by subordinates (for supervisors)
     */
    @GetMapping("/files/subordinates")
    public ResponseEntity<List<DataFileResponse>> getSubordinateFiles(@RequestHeader("X-Username") String username) {
        try {
            log.info("Getting subordinate files for supervisor: {}", username);
            
            List<DataFileResponse> files = dataFileService.getSubordinateFiles(username);
            
            return ResponseEntity.ok(files);
            
        } catch (Exception e) {
            log.error("Error getting subordinate files for supervisor: {}, error: {}", username, e.getMessage());
            throw new DataFileException("Failed to retrieve subordinate files: " + e.getMessage());
        }
    }
    
    /**
     * Get file statistics by lab/team context
     */
    @GetMapping("/files/lab-team-statistics")
    public ResponseEntity<LabTeamFileStatistics> getLabTeamFileStatistics(@RequestHeader("X-Username") String username) {
        try {
            log.info("Getting lab/team file statistics for user: {}", username);
            
            LabTeamFileStatistics statistics = dataFileService.getLabTeamFileStatistics(username);
            
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            log.error("Error getting lab/team file statistics for user: {}, error: {}", username, e.getMessage());
            throw new DataFileException("Failed to retrieve lab/team file statistics: " + e.getMessage());
        }
    }
    
    /**
     * Download a file
     */
    @GetMapping("/files/{id}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(
            @PathVariable Long id,
            @RequestHeader("X-Username") String username) {
        try {
            log.info("Download request for file ID: {} by user: {}", id, username);
            
            org.springframework.core.io.Resource resource = dataFileService.downloadFile(id, username);
            String originalFilename = dataFileService.getOriginalFilename(id);
            String contentType = getContentTypeFromFilename(originalFilename);
            
            // Use a simple filename without Unicode encoding to avoid Tomcat issues
            String safeFilename = originalFilename.replaceAll("[^\\x00-\\x7F]", "_");
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + safeFilename + "\"")
                    .body(resource);
            
        } catch (DataFileException e) {
            log.error("Error downloading file with ID: {} by user: {}, error: {}", id, username, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Get content type based on file extension
     */
    private String getContentTypeFromFilename(String filename) {
        if (filename == null) {
            return "application/octet-stream";
        }
        
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        
        switch (extension) {
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "xls":
                return "application/vnd.ms-excel";
            case "docx":
            case "doc":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "pptx":
            case "ppt":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "pdf":
                return "application/pdf";
            case "txt":
                return "text/plain";
            case "csv":
                return "text/csv";
            case "json":
                return "application/json";
            case "xml":
                return "application/xml";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "zip":
                return "application/zip";
            case "rar":
                return "application/x-rar-compressed";
            case "7z":
                return "application/x-7z-compressed";
            case "tar":
                return "application/x-tar";
            case "gz":
                return "application/gzip";
            default:
                return "application/octet-stream";
        }
    }
    

    
    /**
     * View a file inline (for browser viewing)
     */
    @GetMapping("/files/{id}/view")
    public ResponseEntity<org.springframework.core.io.Resource> viewFile(
            @PathVariable Long id,
            @RequestHeader("X-Username") String username) {
        try {
            log.info("View request for file ID: {} by user: {}", id, username);
            
            org.springframework.core.io.Resource resource = dataFileService.viewFile(id, username);
            String originalFilename = dataFileService.getOriginalFilename(id);
            String contentType = getContentTypeFromFilename(originalFilename);
            
            // Use a simple filename without Unicode encoding to avoid Tomcat issues
            String safeFilename = originalFilename.replaceAll("[^\\x00-\\x7F]", "_");
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                           "inline; filename=\"" + safeFilename + "\"")
                    .body(resource);
            
        } catch (DataFileException e) {
            log.error("Error viewing file with ID: {} by user: {}, error: {}", id, username, e.getMessage());
            throw e;
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