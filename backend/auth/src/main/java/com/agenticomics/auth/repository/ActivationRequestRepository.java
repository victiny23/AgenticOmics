package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.ActivationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivationRequestRepository extends JpaRepository<ActivationRequest, Long> {
    
    List<ActivationRequest> findByUsernameOrderByRequestedAtDesc(String username);
    
    List<ActivationRequest> findByStatusOrderByRequestedAtDesc(ActivationRequest.RequestStatus status);
    
    @Query("SELECT ar FROM ActivationRequest ar WHERE ar.status = 'PENDING' ORDER BY ar.requestedAt DESC")
    List<ActivationRequest> findPendingRequests();
    
    @Query("SELECT ar FROM ActivationRequest ar WHERE ar.username = :username AND ar.status = 'PENDING'")
    List<ActivationRequest> findPendingRequestsByUsername(@Param("username") String username);
    
    boolean existsByUsernameAndStatus(String username, ActivationRequest.RequestStatus status);
}
