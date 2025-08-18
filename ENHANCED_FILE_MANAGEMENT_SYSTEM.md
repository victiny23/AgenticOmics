# Enhanced File Management System for AgenticOmics

## Overview

The AgenticOmics platform now includes a comprehensive file management system that allows Lab PIs and Team Leaders to view and manage all files uploaded within their respective lab and team contexts. This system provides role-based access control and file management capabilities.

## Key Features

### 🔐 Role-Based File Access
- **Lab PIs** can view and delete all files uploaded within their lab
- **Team Leaders** can view and delete all files uploaded within their team
- **Lab Members** can view all files in their lab
- **Team Members** can view all files in their team
- **File Owners** can always manage their own files

### 📁 File Context Management
- Files are associated with specific lab or team contexts
- Upload context is tracked (`LAB` or `TEAM`)
- File statistics are maintained per lab/team
- File metadata includes lab/team information

### 🗑️ File Deletion Permissions
- **File Owners**: Can always delete their own files
- **Lab PIs**: Can delete any file uploaded within their lab
- **Team Leaders**: Can delete any file uploaded within their team
- **System Admins**: Can delete any file (future enhancement)

## Database Schema

### DataFile Entity
```java
@Entity
@Table(name = "data_files")
public class DataFile {
    // Basic file information
    private Long id;
    private String filename;
    private String originalFilename;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private String fileExtension;
    private String contentType;
    
    // Upload information
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private String description;
    private String tags;
    private Boolean isPublic;
    
    // File status
    private FileStatus status;
    private ValidationStatus validationStatus;
    private String validationMessage;
    
    // Lab/Team context
    private Long labId;
    private String labName;
    private Long teamId;
    private String teamName;
    private String uploadContext; // "LAB" or "TEAM"
    
    // Additional metadata
    private String metadata;
    private String checksum;
}
```

### Lab Entity (Enhanced)
```java
@Entity
@Table(name = "lab_info")
public class Lab {
    // Basic lab information
    private Long id;
    private String labId;
    private String labName;
    private String labDescription;
    private String institution;
    private String department;
    private Boolean isActive;
    
    // File statistics
    private Long fileCount;
    private Long totalFileSize;
    private LocalDateTime lastFileUpload;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Relationships
    private List<UserLabMembership> labMemberships;
    private List<Team> teams;
}
```

### Team Entity (Enhanced)
```java
@Entity
@Table(name = "team_info")
public class Team {
    // Basic team information
    private Long id;
    private String teamId;
    private String teamName;
    private String teamDescription;
    private Lab lab;
    private User teamLeader;
    private Boolean isActive;
    
    // File statistics
    private Long fileCount;
    private Long totalFileSize;
    private LocalDateTime lastFileUpload;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Relationships
    private List<UserTeamMembership> teamMemberships;
}
```

## API Endpoints

### File Management Endpoints

#### Get Files by Lab Context
```http
GET /api/data/files/lab/{labId}
Headers: 
  Authorization: Bearer <jwt_token>
  X-Username: <username>
```
**Permissions**: User must be a member of the lab
**Response**: List of all files uploaded within the lab context

#### Get Files by Team Context
```http
GET /api/data/files/team/{teamId}
Headers: 
  Authorization: Bearer <jwt_token>
  X-Username: <username>
```
**Permissions**: User must be a member of the team
**Response**: List of all files uploaded within the team context

#### Delete File
```http
DELETE /api/data/files/{fileId}
Headers: 
  Authorization: Bearer <jwt_token>
  X-Username: <username>
```
**Permissions**: 
- File owner can always delete
- Lab PI can delete files in their lab
- Team Leader can delete files in their team

### Permission Checking Endpoints

#### Check File Deletion Permission
```http
POST /api/auth/check-file-deletion-permission
Headers: 
  X-Username: <username>
Body:
{
  "fileUploadedBy": "username",
  "uploadContext": "LAB",
  "labId": 1,
  "teamId": null
}
```

#### Check Lab File Access
```http
POST /api/auth/check-lab-file-access
Headers: 
  X-Username: <username>
Body:
{
  "labId": 1
}
```

#### Check Team File Access
```http
POST /api/auth/check-team-file-access
Headers: 
  X-Username: <username>
Body:
{
  "teamId": 1
}
```

## Frontend Integration

### Data Management Panel
The frontend includes a comprehensive data management panel that:

1. **Context Selection**: Users can switch between different lab and team contexts
2. **File Display**: Shows all files in the selected context with metadata
3. **Permission Indicators**: Visual indicators show what actions users can perform
4. **File Operations**: Upload, download, edit metadata, and delete files
5. **Statistics**: Display file statistics for the current context

### Key Components
- `DataManagementPanel.tsx`: Main file management interface
- `LabTeamContextSelector.tsx`: Context switching component
- `DataFileList.tsx`: File listing and operations
- `DataUploadComponent.tsx`: File upload functionality

## Security Features

### Authentication & Authorization
- JWT-based authentication for all file operations
- Role-based access control (RBAC)
- Context-based permissions
- File ownership validation

### File Security
- Unique filename generation to prevent conflicts
- Checksum validation for file integrity
- Secure file storage with proper permissions
- File type validation and restrictions

### Access Control
- Lab members can only access files in their labs
- Team members can only access files in their teams
- PIs and Leaders have elevated permissions
- File owners maintain full control over their files

## Usage Examples

### For Lab PIs
1. **View All Lab Files**: Access the data management panel and select their lab context
2. **Monitor File Activity**: View file statistics and recent uploads
3. **Manage Lab Files**: Delete inappropriate or outdated files
4. **Track File Usage**: Monitor file sizes and upload patterns

### For Team Leaders
1. **View Team Files**: Access files uploaded within their team context
2. **Manage Team Resources**: Delete files when team members leave
3. **Coordinate File Sharing**: Ensure proper file organization within the team

### For Lab/Team Members
1. **Upload Files**: Upload files in the context of their lab or team
2. **View Shared Files**: Access files uploaded by other team members
3. **Manage Own Files**: Edit metadata and delete their own files

## File Statistics

The system maintains comprehensive statistics for each lab and team:

### Lab Statistics
- Total number of files
- Total file size
- Last file upload timestamp
- File count by type
- Upload activity over time

### Team Statistics
- Total number of files
- Total file size
- Last file upload timestamp
- Team-specific file organization

## Future Enhancements

### Planned Features
1. **File Versioning**: Track file versions and changes
2. **Advanced Search**: Search files by metadata, content, and context
3. **File Sharing**: Direct file sharing between users
4. **Audit Trail**: Complete audit log of file operations
5. **File Categories**: Organize files by categories and tags
6. **Bulk Operations**: Bulk upload, download, and delete operations
7. **File Preview**: Preview files without downloading
8. **Integration**: Integration with external storage systems

### Security Enhancements
1. **File Encryption**: Encrypt sensitive files at rest
2. **Access Logging**: Detailed access logs for compliance
3. **Data Retention**: Automated data retention policies
4. **Backup & Recovery**: Automated backup and recovery procedures

## Configuration

### File Storage Configuration
```yaml
# application.yml
file:
  storage:
    local-path: ./uploads
    max-file-size: 100MB
    allowed-extensions: [txt, pdf, doc, docx, xls, xlsx, csv, fasta, fastq, bam, vcf]
    checksum-algorithm: SHA-256
```

### Security Configuration
```yaml
# Security settings
security:
  file-access:
    require-authentication: true
    enable-role-checking: true
    enable-context-checking: true
    log-access-attempts: true
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Verify user is a member of the lab/team
   - Check user role permissions
   - Ensure proper authentication

2. **File Upload Failures**
   - Check file size limits
   - Verify file type restrictions
   - Ensure sufficient storage space

3. **Context Access Issues**
   - Verify lab/team membership
   - Check user role assignments
   - Ensure proper context selection

### Debug Information
The system includes comprehensive logging for debugging:
- File operation logs
- Permission check logs
- Access attempt logs
- Error tracking and reporting

## Conclusion

The enhanced file management system provides a robust, secure, and user-friendly way for Lab PIs and Team Leaders to manage files within their respective contexts. The system ensures proper access control while maintaining flexibility for different organizational structures. 