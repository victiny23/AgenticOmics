package com.agenticomics.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamInvitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_user_id", nullable = false)
    private User invitedUser; // User being invited
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team; // Team they're being invited to
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy; // Team Leader who sent the invitation
    
    @Column(name = "invited_role")
    private String invitedRole; // e.g., "Team Member", "Senior Member", "Junior Member"
    
    @Column(name = "invitation_message", columnDefinition = "TEXT")
    private String invitationMessage; // Message from the Team Leader
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.PENDING_APPROVAL; // Default to needing approval
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // Invitation expiration date
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum InvitationStatus {
        PENDING_APPROVAL, // Waiting for Team Leader approval (when sent by regular member)
        PENDING,          // Waiting for invitee response (after Leader approval or direct from Leader)
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
