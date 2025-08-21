package com.agenticomics.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabInvitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_user_id", nullable = false)
    private User invitedUser; // User being invited
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_id", nullable = false)
    private Lab lab; // Lab they're being invited to
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy; // Lab PI who sent the invitation
    
    @Column(name = "invited_role")
    private String invitedRole; // e.g., "PhD Student", "Master Student", "Postdoc"
    
    @Column(name = "invitation_message", columnDefinition = "TEXT")
    private String invitationMessage; // Message from the Lab PI
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.PENDING; // PENDING, ACCEPTED, DECLINED, EXPIRED
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // Invitation expiration date
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        EXPIRED
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusDays(7); // Default 7 days expiration
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
