package com.agenticomics.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lab_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lab {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "lab_id", unique = true, nullable = false)
    private String labId; // e.g., "LAB001", "OMICS001"
    
    @Column(name = "lab_name", nullable = false)
    private String labName;
    
    @Column(name = "lab_description", columnDefinition = "TEXT")
    private String labDescription;
    
    @Column(name = "institution")
    private String institution;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "lab", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<UserLabMembership> labMemberships;
    
    @OneToMany(mappedBy = "lab", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Team> teams;
    
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