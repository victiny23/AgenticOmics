package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.UserLabMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLabMembershipRepository extends JpaRepository<UserLabMembership, Long> {
    
    List<UserLabMembership> findByUserIdAndIsActiveTrue(Long userId);
    
    List<UserLabMembership> findByLabIdAndIsActiveTrue(Long labId);
    
    Optional<UserLabMembership> findByUserIdAndLabIdAndIsActiveTrue(Long userId, Long labId);
    
    Optional<UserLabMembership> findByUserIdAndIsPrimaryLabTrueAndIsActiveTrue(Long userId);
    
    List<UserLabMembership> findBySupervisorIdAndIsActiveTrue(Long supervisorId);
    
    @Query("SELECT ulm FROM UserLabMembership ulm WHERE ulm.user.id = :userId AND ulm.isActive = true")
    List<UserLabMembership> findActiveMembershipsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT ulm FROM UserLabMembership ulm WHERE ulm.lab.id = :labId AND ulm.isActive = true")
    List<UserLabMembership> findActiveMembershipsByLabId(@Param("labId") Long labId);
    
    @Query("SELECT ulm FROM UserLabMembership ulm WHERE ulm.user.id = :userId AND ulm.isPrimaryLab = true AND ulm.isActive = true")
    Optional<UserLabMembership> findPrimaryLabMembershipByUserId(@Param("userId") Long userId);
} 