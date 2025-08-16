package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.TeamApplication;
import com.agenticomics.auth.entity.TeamApplication.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamApplicationRepository extends JpaRepository<TeamApplication, Long> {
    
    // Find applications by applicant
    List<TeamApplication> findByApplicantUsernameOrderByCreatedAtDesc(String applicantUsername);
    
    // Find applications by team
    List<TeamApplication> findByTeamIdOrderByCreatedAtDesc(Long teamId);
    
    // Find applications by status
    List<TeamApplication> findByStatusOrderByCreatedAtDesc(ApplicationStatus status);
    
    // Find pending applications for a team
    List<TeamApplication> findByTeamIdAndStatusOrderByCreatedAtDesc(Long teamId, ApplicationStatus status);
    
    // Find applications by applicant and team
    Optional<TeamApplication> findByApplicantUsernameAndTeamIdAndStatus(String applicantUsername, Long teamId, ApplicationStatus status);
    
    // Find pending applications by applicant
    List<TeamApplication> findByApplicantUsernameAndStatusOrderByCreatedAtDesc(String applicantUsername, ApplicationStatus status);
    
    // Check if user has a pending application for a team
    boolean existsByApplicantUsernameAndTeamIdAndStatus(String applicantUsername, Long teamId, ApplicationStatus status);
    
    // Count pending applications for a team
    long countByTeamIdAndStatus(Long teamId, ApplicationStatus status);
} 