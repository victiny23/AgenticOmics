package com.agenticomics.auth.service;

import com.agenticomics.auth.entity.ActivationRequest;
import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.repository.ActivationRequestRepository;
import com.agenticomics.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ActivationRequestService {
    
    @Autowired
    private ActivationRequestRepository activationRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * Create a new activation request
     */
    @Transactional
    public ActivationRequest createActivationRequest(String username, String requestMessage) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        
        User user = userOpt.get();
        
        // Check if user is actually deactivated
        if (user.getIsActive()) {
            throw new RuntimeException("User is already active: " + username);
        }
        
        // Check if there's already a pending request
        if (activationRequestRepository.existsByUsernameAndStatus(username, ActivationRequest.RequestStatus.PENDING)) {
            throw new RuntimeException("A pending activation request already exists for this user");
        }
        
        // Get user's email from the database
        String userEmail = user.getEmail();
        if (userEmail == null || userEmail.isEmpty()) {
            throw new RuntimeException("User email not found. Cannot create activation request.");
        }
        
        // Create new activation request
        ActivationRequest request = new ActivationRequest(username, userEmail, requestMessage);
        return activationRequestRepository.save(request);
    }
    
    /**
     * Get all pending activation requests
     */
    public List<ActivationRequest> getPendingRequests() {
        return activationRequestRepository.findPendingRequests();
    }
    
    /**
     * Get activation requests for a specific user
     */
    public List<ActivationRequest> getUserRequests(String username) {
        return activationRequestRepository.findByUsernameOrderByRequestedAtDesc(username);
    }
    
    /**
     * Approve an activation request (Super Admin or PI/Team Leader only)
     */
    @Transactional
    public boolean approveActivationRequest(Long requestId, String approvedBy) {
        Optional<ActivationRequest> requestOpt = activationRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Activation request not found");
        }
        
        ActivationRequest request = requestOpt.get();
        
        // Check if request is still pending
        if (request.getStatus() != ActivationRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Activation request is not pending");
        }
        
        // Check if approver has permission (Super Admin or PI/Team Leader of the user's lab/team)
        if (!userService.isSuperAdmin(approvedBy)) {
            // For non-Super Admins, check if they are PI/Team Leader of the user's lab/team
            if (!userService.canActivateUser(request.getUsername(), approvedBy)) {
                throw new RuntimeException("You don't have permission to approve this activation request");
            }
        }
        
        // Update request status
        request.setStatus(ActivationRequest.RequestStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(approvedBy);
        request.setResponseMessage("Account activated by " + approvedBy);
        activationRequestRepository.save(request);
        
        // Activate the user
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(true);
            userRepository.save(user);
        }
        
        return true;
    }
    
    /**
     * Reject an activation request
     */
    @Transactional
    public boolean rejectActivationRequest(Long requestId, String rejectedBy, String reason) {
        Optional<ActivationRequest> requestOpt = activationRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Activation request not found");
        }
        
        ActivationRequest request = requestOpt.get();
        
        // Check if request is still pending
        if (request.getStatus() != ActivationRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Activation request is not pending");
        }
        
        // Check if rejector has permission (Super Admin or PI/Team Leader of the user's lab/team)
        if (!userService.isSuperAdmin(rejectedBy)) {
            // For non-Super Admins, check if they are PI/Team Leader of the user's lab/team
            if (!userService.canActivateUser(request.getUsername(), rejectedBy)) {
                throw new RuntimeException("You don't have permission to reject this activation request");
            }
        }
        
        // Update request status
        request.setStatus(ActivationRequest.RequestStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(rejectedBy);
        request.setResponseMessage("Request rejected by " + rejectedBy + ". Reason: " + reason);
        activationRequestRepository.save(request);
        
        return true;
    }
    
    /**
     * Get activation request by ID
     */
    public Optional<ActivationRequest> getRequestById(Long requestId) {
        return activationRequestRepository.findById(requestId);
    }
}
