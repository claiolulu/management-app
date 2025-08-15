package com.figma.webapp.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.figma.webapp.dto.ActivityDto;
import com.figma.webapp.entity.Activity;
import com.figma.webapp.entity.User;
import com.figma.webapp.repository.ActivityRepository;
import com.figma.webapp.repository.UserRepository;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ActivityDto> getAllActivities() {
        return activityRepository.findAllOrderByDateAscCreatedAtDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ActivityDto> getActivitiesByAssignedUser(String assignedUser) {
        return activityRepository.findByAssignedUserNameOrderByDateAscCreatedAtDesc(assignedUser).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ActivityDto> getActivitiesByDate(LocalDate date) {
        return activityRepository.findByDateOrderByCreatedAtDesc(date).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ActivityDto> getActivitiesByStatus(Activity.ActivityStatus status) {
        return activityRepository.findByStatusOrderByDateAscCreatedAtDesc(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Page<ActivityDto> getInProgressActivitiesPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityRepository.findByStatusOrderByDateAscCreatedAtDesc(Activity.ActivityStatus.IN_PROGRESS, pageable)
                .map(this::convertToDto);
    }

    public Page<ActivityDto> getInProgressActivitiesForUserPaged(String assignedUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityRepository.findByAssignedUserNameAndStatusOrderByDateAscCreatedAtDesc(assignedUser, Activity.ActivityStatus.IN_PROGRESS, pageable)
                .map(this::convertToDto);
    }

    public Page<ActivityDto> getActivitiesForUserPaged(String assignedUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityRepository.findByAssignedUserNameOrderByDateAscCreatedAtDesc(assignedUser, pageable)
                .map(this::convertToDto);
    }

    public Page<ActivityDto> getActivitiesForUserByDatePaged(String assignedUser, LocalDate date, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityRepository.findByAssignedUserNameAndDateOrderByCreatedAtDesc(assignedUser, date, pageable)
                .map(this::convertToDto);
    }

    public Page<ActivityDto> getHistoryActivitiesForUserPaged(String assignedUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        LocalDate today = LocalDate.now();
        return activityRepository.findByAssignedUserNameAndDateBeforeOrderByDateDescCreatedAtDesc(assignedUser, today, pageable)
                .map(this::convertToDto);
    }

    public ActivityDto createActivity(ActivityDto activityDto) {
        Activity activity = convertToEntity(activityDto);
        Activity savedActivity = activityRepository.save(activity);
        return convertToDto(savedActivity);
    }

    public Optional<ActivityDto> updateActivity(Long id, ActivityDto activityDto) {
        return activityRepository.findById(id)
                .map(existingActivity -> {
                    // Find user by username
                    User assignedUser = userRepository.findByUsername(activityDto.getAssignedUser())
                            .orElseThrow(() -> new RuntimeException("User not found: " + activityDto.getAssignedUser()));
                    
                    existingActivity.setAssignedUser(assignedUser);
                    existingActivity.setDate(activityDto.getDate());
                    existingActivity.setDescription(activityDto.getDescription());
                    existingActivity.setStatus(activityDto.getStatus());
                    existingActivity.setPriority(activityDto.getPriority());
                    return convertToDto(activityRepository.save(existingActivity));
                });
    }

    public boolean deleteActivity(Long id) {
        if (activityRepository.existsById(id)) {
            activityRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public long countActivitiesByStatus(Activity.ActivityStatus status) {
        return activityRepository.countByStatus(status);
    }

    public List<Activity> findActivitiesByDateRange(LocalDate startDate, LocalDate endDate) {
        return activityRepository.findByDateBetweenOrderByDateAsc(startDate, endDate);
    }

    public List<Activity> findActivitiesByUserAndDateRange(String assignedUser, LocalDate startDate, LocalDate endDate) {
        return activityRepository.findByAssignedUserNameAndDateBetweenOrderByDateAsc(assignedUser, startDate, endDate);
    }

    public Activity findById(Long id) {
        return activityRepository.findById(id).orElse(null);
    }

    public List<ActivityDto> findActivitiesByUserAndDate(String username, LocalDate date) {
        return activityRepository.findByAssignedUserNameAndDateOrderByCreatedAtDesc(username, date).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Activity save(Activity activity) {
        return activityRepository.save(activity);
    }

    private ActivityDto convertToDto(Activity activity) {
        ActivityDto dto = new ActivityDto();
        dto.setId(activity.getId());
        dto.setAssignedUser(activity.getAssignedUserName()); // Use helper method
        dto.setDate(activity.getDate());
        dto.setDescription(activity.getDescription());
        dto.setStatus(activity.getStatus());
        dto.setPriority(activity.getPriority());
        // Add assigner information
        dto.setAssignedBy(activity.getAssignedByName()); // Use helper method
        return dto;
    }

    private Activity convertToEntity(ActivityDto dto) {
        Activity activity = new Activity();
        
        // Find user by username
        User assignedUser = userRepository.findByUsername(dto.getAssignedUser())
                .orElseThrow(() -> new RuntimeException("User not found: " + dto.getAssignedUser()));
        
        activity.setAssignedUser(assignedUser);
        activity.setDate(dto.getDate());
        activity.setDescription(dto.getDescription());
        activity.setStatus(dto.getStatus() != null ? dto.getStatus() : Activity.ActivityStatus.PENDING);
        activity.setPriority(dto.getPriority() != null ? dto.getPriority() : Activity.ActivityPriority.MEDIUM);
        
        // Set assigned by if provided
        if (dto.getAssignedBy() != null) {
            User assignedByUser = userRepository.findByUsername(dto.getAssignedBy()).orElse(null);
            activity.setAssignedBy(assignedByUser);
        }
        
        return activity;
    }

    public Page<ActivityDto> getOthersIncomingTasks(String currentUsername, String fromDate, int page, int size) {
        try {
            LocalDate date = LocalDate.parse(fromDate);
            Pageable pageable = PageRequest.of(page, size);
            
            // Get tasks assigned to other users (not current user) with due date today or in future
            Page<Activity> activities = activityRepository.findOthersIncomingTasks(currentUsername, date, pageable);
            
            return activities.map(this::convertToDto);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching others' incoming tasks: " + e.getMessage());
        }
    }
}