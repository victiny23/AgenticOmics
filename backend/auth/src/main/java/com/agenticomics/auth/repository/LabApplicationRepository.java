package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.LabApplication;
import com.agenticomics.auth.entity.LabApplication.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabApplicationRepository extends JpaRepository<LabApplication, Long> {
    
    // Find applications by applicant
    List<LabApplication> findByApplicantUsernameOrderByCreatedAtDesc(String applicantUsername);
    
    // Find applications by lab
    List<LabApplication> findByLabIdOrderByCreatedAtDesc(Long labId);
    
    // Find applications by status
    List<LabApplication> findByStatusOrderByCreatedAtDesc(ApplicationStatus status);
    
    // Find pending applications for a lab
    List<LabApplication> findByLabIdAndStatusOrderByCreatedAtDesc(Long labId, ApplicationStatus status);
    
    // Find applications by applicant and lab
    Optional<LabApplication> findByApplicantUsernameAndLabIdAndStatus(String applicantUsername, Long labId, ApplicationStatus status);
    
    // Find pending applications by applicant
    List<LabApplication> findByApplicantUsernameAndStatusOrderByCreatedAtDesc(String applicantUsername, ApplicationStatus status);
    
    // Check if user has a pending application for a lab
    boolean existsByApplicantUsernameAndLabIdAndStatus(String applicantUsername, Long labId, ApplicationStatus status);
    
    // Count pending applications for a lab
    long countByLabIdAndStatus(Long labId, ApplicationStatus status);
} 