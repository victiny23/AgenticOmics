package com.agenticomics.datamanagement.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.file-storage")
@Data
public class FileStorageConfig {
    
    private String localPath;
    private Long maxFileSize;
    private String allowedExtensions;
    
    public List<String> getAllowedExtensionsList() {
        if (allowedExtensions == null || allowedExtensions.trim().isEmpty()) {
            return List.of();
        }
        return List.of(allowedExtensions.split(","));
    }
} 