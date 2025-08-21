package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.LabMembershipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabMembershipRequestRepository extends JpaRepository<LabMembershipRequest, Long> {
    
    @Query("SELECT r FROM LabMembershipRequest r WHERE r.user.username = :username")
    List<LabMembershipRequest> findByUsername(@Param("username") String username);
    
    @Query("SELECT r FROM LabMembershipRequest r WHERE r.lab.id = :labId")
    List<LabMembershipRequest> findByLabId(@Param("labId") Long labId);
    
    @Query("SELECT r FROM LabMembershipRequest r WHERE r.lab.id = :labId AND r.status = :status")
    List<LabMembershipRequest> findByLabIdAndStatus(@Param("labId") Long labId, @Param("status") LabMembershipRequest.RequestStatus status);
    
    @Query("SELECT r FROM LabMembershipRequest r WHERE r.user.username = :username AND r.lab.id = :labId AND r.status = :status")
    Optional<LabMembershipRequest> findByUsernameAndLabIdAndStatus(@Param("username") String username, @Param("labId") Long labId, @Param("status") LabMembershipRequest.RequestStatus status);
    
    @Query("SELECT r FROM LabMembershipRequest r WHERE r.user.username = :username AND r.lab.id = :labId")
    List<LabMembershipRequest> findByUsernameAndLabId(@Param("username") String username, @Param("labId") Long labId);
    
    @Query("SELECT r FROM LabMembershipRequest r WHERE r.status = :status")
    List<LabMembershipRequest> findByStatus(@Param("status") LabMembershipRequest.RequestStatus status);
    
    @Query("SELECT COUNT(r) FROM LabMembershipRequest r WHERE r.lab.id = :labId AND r.status = 'PENDING'")
    long countPendingRequestsByLabId(@Param("labId") Long labId);
}
