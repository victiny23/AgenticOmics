package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.LabInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabInvitationRepository extends JpaRepository<LabInvitation, Long> {
    
    @Query("SELECT i FROM LabInvitation i WHERE i.invitedUser.username = :username")
    List<LabInvitation> findByInvitedUsername(@Param("username") String username);
    
    @Query("SELECT i FROM LabInvitation i WHERE i.lab.id = :labId")
    List<LabInvitation> findByLabId(@Param("labId") Long labId);
    
    @Query("SELECT i FROM LabInvitation i WHERE i.invitedUser.username = :username AND i.status = :status")
    List<LabInvitation> findByInvitedUsernameAndStatus(@Param("username") String username, @Param("status") LabInvitation.InvitationStatus status);
    
    @Query("SELECT i FROM LabInvitation i WHERE i.lab.id = :labId AND i.status = :status")
    List<LabInvitation> findByLabIdAndStatus(@Param("labId") Long labId, @Param("status") LabInvitation.InvitationStatus status);
    
    @Query("SELECT i FROM LabInvitation i WHERE i.invitedUser.username = :username AND i.lab.id = :labId AND i.status = :status")
    Optional<LabInvitation> findByInvitedUsernameAndLabIdAndStatus(@Param("username") String username, @Param("labId") Long labId, @Param("status") LabInvitation.InvitationStatus status);
    
    @Query("SELECT i FROM LabInvitation i WHERE i.invitedUser.username = :username AND i.lab.id = :labId")
    List<LabInvitation> findByInvitedUsernameAndLabId(@Param("username") String username, @Param("labId") Long labId);
    
    @Query("SELECT i FROM LabInvitation i WHERE i.expiresAt < :now AND i.status = 'PENDING'")
    List<LabInvitation> findExpiredPendingInvitations(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(i) FROM LabInvitation i WHERE i.invitedUser.username = :username AND i.status = 'PENDING'")
    long countPendingInvitationsByUsername(@Param("username") String username);
}
