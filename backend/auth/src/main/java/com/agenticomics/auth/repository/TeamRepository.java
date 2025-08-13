package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    
    Optional<Team> findByTeamId(String teamId);
    
    Optional<Team> findByTeamName(String teamName);
    
    boolean existsByTeamId(String teamId);
    
    boolean existsByTeamName(String teamName);
    
    List<Team> findByIsActiveTrue();
    
    List<Team> findByLabId(Long labId);
    
    List<Team> findByTeamLeaderId(Long teamLeaderId);
    
    @Query("SELECT t FROM Team t WHERE t.lab.id = :labId AND t.isActive = true")
    List<Team> findActiveTeamsByLabId(@Param("labId") Long labId);
    
    @Query("SELECT t FROM Team t WHERE t.teamLeader.id = :teamLeaderId AND t.isActive = true")
    List<Team> findActiveTeamsByTeamLeaderId(@Param("teamLeaderId") Long teamLeaderId);
    
    @Query("SELECT t.teamId FROM Team t WHERE t.teamId LIKE 'TEAM%' ORDER BY CAST(SUBSTRING(t.teamId, 5) AS INTEGER) DESC")
    List<String> findTeamIdsOrderedByNumber();
} 