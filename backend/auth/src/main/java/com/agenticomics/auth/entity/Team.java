package com.agenticomics.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "team_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "team_id", unique = true, nullable = false)
    private String teamId; // e.g., "TEAM001", "OMICS_TEAM_01"
    
    @Column(name = "team_name", nullable = false)
    private String teamName;
    
    @Column(name = "team_description", columnDefinition = "TEXT")
    private String teamDescription;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_id")
    private Lab lab;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_leader_id")
    private User teamLeader;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "file_count")
    private Long fileCount = 0L;
    
    @Column(name = "total_file_size")
    private Long totalFileSize = 0L;
    
    @Column(name = "last_file_upload")
    private LocalDateTime lastFileUpload;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<UserTeamMembership> teamMemberships;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 