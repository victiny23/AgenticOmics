package com.agenticomics.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activation_requests")
public class ActivationRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false)
    private String username;
    
    @Column(name = "email")
    private String email; // Optional
    
    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;
    
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "processed_by")
    private String processedBy;
    
    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;
    
    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
    
    public ActivationRequest() {}
    
    public ActivationRequest(String username, String email, String requestMessage) {
        this.username = username;
        this.email = email;
        this.requestMessage = requestMessage;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRequestMessage() { return requestMessage; }
    public void setRequestMessage(String requestMessage) { this.requestMessage = requestMessage; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
}
