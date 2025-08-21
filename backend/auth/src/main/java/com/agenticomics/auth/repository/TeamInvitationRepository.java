package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {
    
    @Query("SELECT i FROM TeamInvitation i WHERE i.invitedUser.username = :username")
    List<TeamInvitation> findByInvitedUsername(@Param("username") String username);
    
    @Query("SELECT i FROM TeamInvitation i WHERE i.team.id = :teamId")
    List<TeamInvitation> findByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT i FROM TeamInvitation i WHERE i.invitedUser.username = :username AND i.status = :status")
    List<TeamInvitation> findByInvitedUsernameAndStatus(@Param("username") String username, @Param("status") TeamInvitation.InvitationStatus status);
    
    @Query("SELECT i FROM TeamInvitation i WHERE i.team.id = :teamId AND i.status = :status")
    List<TeamInvitation> findByTeamIdAndStatus(@Param("teamId") Long teamId, @Param("status") TeamInvitation.InvitationStatus status);
    
    @Query("SELECT i FROM TeamInvitation i WHERE i.invitedUser.username = :username AND i.team.id = :teamId AND i.status = :status")
    Optional<TeamInvitation> findByInvitedUsernameAndTeamIdAndStatus(@Param("username") String username, @Param("teamId") Long teamId, @Param("status") TeamInvitation.InvitationStatus status);
    
    @Query("SELECT i FROM TeamInvitation i WHERE i.expiresAt < :now AND i.status = 'PENDING'")
    List<TeamInvitation> findExpiredPendingInvitations(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(i) FROM TeamInvitation i WHERE i.invitedUser.username = :username AND i.status = 'PENDING'")
    long countPendingInvitationsByUsername(@Param("username") String username);
}
