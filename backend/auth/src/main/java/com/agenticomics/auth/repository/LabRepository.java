package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.Lab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabRepository extends JpaRepository<Lab, Long> {
    
    Optional<Lab> findByLabId(String labId);
    
    Optional<Lab> findByLabName(String labName);
    
    boolean existsByLabId(String labId);
    
    boolean existsByLabName(String labName);
    
    List<Lab> findByIsActiveTrue();
    
    @Query("SELECT l FROM Lab l WHERE l.labName LIKE %:searchTerm% OR l.labId LIKE %:searchTerm%")
    List<Lab> searchLabs(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT l FROM Lab l WHERE l.isActive = true AND (l.labName LIKE %:searchTerm% OR l.labId LIKE %:searchTerm%)")
    List<Lab> searchActiveLabs(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT l.labId FROM Lab l WHERE l.labId LIKE 'LAB%' ORDER BY CAST(SUBSTRING(l.labId, 4) AS INTEGER) DESC")
    List<String> findLabIdsOrderedByNumber();
} 