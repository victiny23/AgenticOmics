package com.agenticomics.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    @JsonIgnore // Never serialize password
    private String password;
    
    @Column(unique = true, nullable = false)
    @JsonIgnore // Only expose email through secure endpoints
    private String email;
    
    @Column(name = "telephone", unique = true)
    @JsonIgnore // Only expose telephone through secure endpoints
    private String telephone;
    
    @Column(name = "role")
    private String role; // Global role (can be overridden by lab-specific roles)

    @Column(name = "birthday")
    @JsonIgnore // Only expose birthday through secure endpoints
    private LocalDate birthday;

    @Column(name = "photo_url")
    private String photoUrl;
    
    @Column(name = "reset_token")
    @JsonIgnore // Never expose reset tokens
    private String resetToken;
    
    @Column(name = "reset_token_expiry")
    @JsonIgnore // Never expose reset token expiry
    private LocalDateTime resetTokenExpiry;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // Lab memberships (many-to-many relationship)
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<UserLabMembership> labMemberships;
    
    // Team memberships (many-to-many relationship)
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<UserTeamMembership> teamMemberships;
    
    // Legacy supervisor-subordinate relationships (keeping for backward compatibility)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private User supervisor;
    
    @OneToMany(mappedBy = "supervisor", fetch = FetchType.LAZY)
    private List<User> subordinates;
    
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