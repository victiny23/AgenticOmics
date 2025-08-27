package com.agenticomics.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_membership_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabMembershipRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // User requesting to join
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_id", nullable = false)
    private Lab lab; // Lab they want to join
    
    @Column(name = "requested_role")
    private String requestedRole; // e.g., "PhD Student", "Master Student", "Postdoc"
    
    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage; // Optional message from the user
    
    @Column(name = "status", columnDefinition = "VARCHAR(20) CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'))")
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, WITHDRAWN
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy; // Lab PI who reviewed the request
    
    @Column(name = "review_message", columnDefinition = "TEXT")
    private String reviewMessage; // Response message from the reviewer
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
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
