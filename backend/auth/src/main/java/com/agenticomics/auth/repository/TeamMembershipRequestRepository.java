package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.TeamMembershipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMembershipRequestRepository extends JpaRepository<TeamMembershipRequest, Long> {
    
    @Query("SELECT r FROM TeamMembershipRequest r WHERE r.user.username = :username")
    List<TeamMembershipRequest> findByUsername(@Param("username") String username);
    
    @Query("SELECT r FROM TeamMembershipRequest r WHERE r.team.id = :teamId")
    List<TeamMembershipRequest> findByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT r FROM TeamMembershipRequest r WHERE r.team.id = :teamId AND r.status = :status")
    List<TeamMembershipRequest> findByTeamIdAndStatus(@Param("teamId") Long teamId, @Param("status") TeamMembershipRequest.RequestStatus status);
    
    @Query("SELECT r FROM TeamMembershipRequest r WHERE r.user.username = :username AND r.team.id = :teamId AND r.status = :status")
    Optional<TeamMembershipRequest> findByUsernameAndTeamIdAndStatus(@Param("username") String username, @Param("teamId") Long teamId, @Param("status") TeamMembershipRequest.RequestStatus status);
    
    @Query("SELECT r FROM TeamMembershipRequest r WHERE r.user.username = :username AND r.team.id = :teamId")
    List<TeamMembershipRequest> findByUsernameAndTeamId(@Param("username") String username, @Param("teamId") Long teamId);
    
    @Query("SELECT r FROM TeamMembershipRequest r WHERE r.status = :status")
    List<TeamMembershipRequest> findByStatus(@Param("status") TeamMembershipRequest.RequestStatus status);
    
    @Query("SELECT COUNT(r) FROM TeamMembershipRequest r WHERE r.team.id = :teamId AND r.status = 'PENDING'")
    long countPendingRequestsByTeamId(@Param("teamId") Long teamId);
}
