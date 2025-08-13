package com.agenticomics.auth.repository;

import com.agenticomics.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByTelephone(String telephone);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByTelephone(String telephone);
    
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.isActive = true")
    Optional<User> findActiveUserByUsername(@Param("username") String username);
    
    @Query("SELECT u FROM User u WHERE u.telephone = :telephone AND u.isActive = true")
    Optional<User> findActiveUserByTelephone(@Param("telephone") String telephone);
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findActiveUserByEmail(@Param("email") String email);
    
    @Query("SELECT u FROM User u WHERE u.resetToken = :resetToken AND u.isActive = true")
    Optional<User> findActiveUserByResetToken(@Param("resetToken") String resetToken);
    
    // Lookups without active flag (used for password reset to support deactivated users)
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findUserByEmail(@Param("email") String email);
    
    @Query("SELECT u FROM User u WHERE u.resetToken = :resetToken")
    Optional<User> findUserByResetToken(@Param("resetToken") String resetToken);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();
    
    @Query("SELECT u FROM User u WHERE u.isActive = true")
    List<User> findAllActiveUsers();
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true")
    List<User> findActiveUsersByRole(@Param("role") String role);
    
    @Query("SELECT u FROM User u WHERE u.role != 'Lab PI' AND u.isActive = true")
    List<User> findActiveNonPIUsers();
    
    @Query("SELECT u FROM User u WHERE u.role != 'Lab PI'")
    List<User> findAllNonPIUsers();
    
    @Query("SELECT u FROM User u WHERE u.isActive = false")
    List<User> findAllDeactivatedUsers();
    
    @Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findUserByUsername(@Param("username") String username);
    
    @Query("SELECT u FROM User u WHERE u.telephone = :telephone")
    Optional<User> findUserByTelephone(@Param("telephone") String telephone);
    
    void deleteByUsername(String username);
    
    // Supervisor relationship methods
    @Query("SELECT u FROM User u WHERE u.supervisor.id = :supervisorId AND u.isActive = true")
    List<User> findActiveSubordinatesBySupervisorId(@Param("supervisorId") Long supervisorId);
    
    @Query("SELECT u FROM User u WHERE u.supervisor.username = :supervisorUsername AND u.isActive = true")
    List<User> findActiveSubordinatesBySupervisorUsername(@Param("supervisorUsername") String supervisorUsername);
    
    @Query("SELECT u FROM User u WHERE u.supervisor IS NULL AND u.role = 'Lab PI' AND u.isActive = true")
    List<User> findActivePIsWithoutSupervisor();
    
    @Query("SELECT u FROM User u WHERE u.supervisor IS NOT NULL AND u.isActive = true")
    List<User> findActiveUsersWithSupervisor();
    
    @Query("SELECT u FROM User u WHERE u.supervisor IS NULL AND u.isActive = true")
    List<User> findActiveUsersWithoutSupervisor();
    
    @Query("SELECT u FROM User u WHERE u.supervisor.id = :supervisorId")
    List<User> findAllSubordinatesBySupervisorId(@Param("supervisorId") Long supervisorId);
    
    @Query("SELECT u FROM User u WHERE u.supervisor.username = :supervisorUsername")
    List<User> findAllSubordinatesBySupervisorUsername(@Param("supervisorUsername") String supervisorUsername);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.supervisor.id = :supervisorId AND u.isActive = true")
    long countActiveSubordinatesBySupervisorId(@Param("supervisorId") Long supervisorId);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.supervisor.username = :supervisorUsername AND u.isActive = true")
    long countActiveSubordinatesBySupervisorUsername(@Param("supervisorUsername") String supervisorUsername);
} 