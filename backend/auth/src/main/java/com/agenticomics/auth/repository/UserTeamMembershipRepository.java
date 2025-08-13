package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.UserTeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTeamMembershipRepository extends JpaRepository<UserTeamMembership, Long> {
    
    List<UserTeamMembership> findByUserIdAndIsActiveTrue(Long userId);
    
    List<UserTeamMembership> findByTeamIdAndIsActiveTrue(Long teamId);
    
    Optional<UserTeamMembership> findByUserIdAndTeamIdAndIsActiveTrue(Long userId, Long teamId);
    
    Optional<UserTeamMembership> findByUserIdAndIsPrimaryTeamTrueAndIsActiveTrue(Long userId);
    
    List<UserTeamMembership> findBySupervisorIdAndIsActiveTrue(Long supervisorId);
    
    @Query("SELECT utm FROM UserTeamMembership utm WHERE utm.user.id = :userId AND utm.isActive = true")
    List<UserTeamMembership> findActiveMembershipsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT utm FROM UserTeamMembership utm WHERE utm.team.id = :teamId AND utm.isActive = true")
    List<UserTeamMembership> findActiveMembershipsByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT utm FROM UserTeamMembership utm WHERE utm.user.id = :userId AND utm.isPrimaryTeam = true AND utm.isActive = true")
    Optional<UserTeamMembership> findPrimaryTeamMembershipByUserId(@Param("userId") Long userId);
} 