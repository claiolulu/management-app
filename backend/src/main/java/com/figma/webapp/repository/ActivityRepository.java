package com.figma.webapp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.figma.webapp.entity.Activity;
import com.figma.webapp.entity.Activity.ActivityStatus;
import com.figma.webapp.entity.User;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    // Methods using User entity relationships
    List<Activity> findByAssignedUserOrderByDateAscCreatedAtDesc(User assignedUser);

    Page<Activity> findByAssignedUserOrderByDateAscCreatedAtDesc(User assignedUser, Pageable pageable);

    Page<Activity> findByAssignedUserAndStatusOrderByDateAscCreatedAtDesc(User assignedUser, ActivityStatus status, Pageable pageable);

    List<Activity> findByAssignedUserAndDateBetweenOrderByDateAsc(User assignedUser, LocalDate startDate, LocalDate endDate);
    
    List<Activity> findByAssignedUserAndDateOrderByCreatedAtDesc(User assignedUser, LocalDate date);
    
    // Methods using username directly (faster queries without joins)
    List<Activity> findByAssignedUserNameOrderByDateAscCreatedAtDesc(String assignedUserName);

    Page<Activity> findByAssignedUserNameOrderByDateAscCreatedAtDesc(String assignedUserName, Pageable pageable);

    Page<Activity> findByAssignedUserNameAndStatusOrderByDateAscCreatedAtDesc(String assignedUserName, ActivityStatus status, Pageable pageable);

    List<Activity> findByAssignedUserNameAndDateBetweenOrderByDateAsc(String assignedUserName, LocalDate startDate, LocalDate endDate);
    
    List<Activity> findByAssignedUserNameAndDateOrderByCreatedAtDesc(String assignedUserName, LocalDate date);
    
    Page<Activity> findByAssignedUserNameAndDateOrderByCreatedAtDesc(String assignedUserName, LocalDate date, Pageable pageable);
    
    // History method - finds tasks with dates before today, ordered from newest to oldest
    Page<Activity> findByAssignedUserNameAndDateBeforeOrderByDateDescCreatedAtDesc(String assignedUserName, LocalDate date, Pageable pageable);
    
    // Methods using User ID (for when we have user ID instead of username)
    @Query("SELECT a FROM Activity a WHERE a.assignedUser.id = :userId ORDER BY a.date ASC, a.createdAt DESC")
    List<Activity> findByAssignedUserIdOrderByDateAscCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT a FROM Activity a WHERE a.assignedUser.id = :userId ORDER BY a.date ASC, a.createdAt DESC")
    Page<Activity> findByAssignedUserIdOrderByDateAscCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.assignedUser.id = :userId AND a.status = :status ORDER BY a.date ASC, a.createdAt DESC")
    Page<Activity> findByAssignedUserIdAndStatusOrderByDateAscCreatedAtDesc(@Param("userId") Long userId, @Param("status") ActivityStatus status, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.assignedUser.id = :userId AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date ASC")
    List<Activity> findByAssignedUserIdAndDateBetweenOrderByDateAsc(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Activity a WHERE a.assignedUser.id = :userId AND a.date = :date ORDER BY a.createdAt DESC")
    List<Activity> findByAssignedUserIdAndDateOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    // Existing methods that don't depend on user relationships
    List<Activity> findByDateOrderByCreatedAtDesc(LocalDate date);
    
    List<Activity> findByStatusOrderByDateAscCreatedAtDesc(ActivityStatus status);

    Page<Activity> findByStatusOrderByDateAscCreatedAtDesc(ActivityStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Activity a ORDER BY a.date ASC, a.createdAt DESC")
    List<Activity> findAllOrderByDateAscCreatedAtDesc();
    
    long countByStatus(ActivityStatus status);
    
    List<Activity> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
    
    // Query to find overdue tasks (date before today and not already completed)
    @Query("SELECT a FROM Activity a WHERE a.date < :today AND a.status != :completedStatus ORDER BY a.date ASC")
    List<Activity> findOverdueTasks(@Param("today") LocalDate today, @Param("completedStatus") ActivityStatus completedStatus);
    
    // Find tasks assigned to other users (not current user) with due date today or in future
    @Query("SELECT a FROM Activity a WHERE a.assignedUser.username != :currentUsername AND a.date >= :fromDate ORDER BY a.date ASC, a.createdAt DESC")
    Page<Activity> findOthersIncomingTasks(@Param("currentUsername") String currentUsername, @Param("fromDate") LocalDate fromDate, Pageable pageable);
}