package com.figma.webapp.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.figma.webapp.dto.ActivityDto;
import com.figma.webapp.dto.CalendarTaskDto;
import com.figma.webapp.dto.TaskAssignmentDto;
import com.figma.webapp.entity.Activity;
import com.figma.webapp.entity.User;
import com.figma.webapp.security.JwtUtil;
import com.figma.webapp.service.ActivityService;
import com.figma.webapp.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/tasks")
public class TaskApiController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of("message", "TaskController is working"));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> assignTask(@RequestBody TaskAssignmentDto taskDto, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            String managerUsername = jwtUtil.extractUsername(token);
            
            User manager = userService.findByUsername(managerUsername);
            User assignedUser = userService.findByUsername(taskDto.getAssignedUser());
            
            if (assignedUser == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            Activity activity = new Activity();
            activity.setTitle("Task"); // Default title since TaskAssignmentDto doesn't have title
            activity.setDescription(taskDto.getDescription());
            activity.setDate(taskDto.getDate());
            activity.setAssignedUser(assignedUser); // Use User object, not string
            activity.setAssignedBy(manager);
            activity.setStatus(Activity.ActivityStatus.valueOf(taskDto.getStatus()));
            activity.setPriority(Activity.ActivityPriority.valueOf(taskDto.getPriority()));
            
            Activity savedActivity = activityService.save(activity);
            
            return ResponseEntity.ok(Map.of(
                "message", "Task assigned successfully",
                "taskId", savedActivity.getId(),
                "assignedTo", assignedUser.getUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to assign task: " + e.getMessage()));
        }
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<CalendarTaskDto>> getCalendarTasks(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            
            // Get all tasks in the date range to show team activity
            List<Activity> activities = activityService.findActivitiesByDateRange(startDate, endDate);
            
            List<CalendarTaskDto> calendarTasks = activities.stream()
                .map(activity -> new CalendarTaskDto(
                    activity.getId(),
                    activity.getAssignedUserName(),
                    activity.getDescription(),
                    activity.getStatus().toString(),
                    activity.getPriority().toString(),
                    activity.getDate()
                ))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(calendarTasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @GetMapping("/in-progress")
    public ResponseEntity<Map<String, Object>> getInProgress(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);

            Page<ActivityDto> pageResult;
            if ("MANAGER".equalsIgnoreCase(role)) {
                pageResult = activityService.getInProgressActivitiesPaged(page, size);
            } else {
                pageResult = activityService.getInProgressActivitiesForUserPaged(username, page, size);
            }

            Map<String, Object> body = new HashMap<>();
            body.put("items", pageResult.getContent());
            body.put("page", pageResult.getNumber());
            body.put("size", pageResult.getSize());
            body.put("totalPages", pageResult.getTotalPages());
            body.put("totalElements", pageResult.getTotalElements());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<ActivityDto>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request
    ) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);

            if ("MANAGER".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(activityService.getActivitiesByDate(date));
            }
            return ResponseEntity.ok(activityService.findActivitiesByUserAndDate(username, date));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @GetMapping("/by-date-detailed")
    public ResponseEntity<Map<String, Object>> getByDateDetailed(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int userTasksPage,
            @RequestParam(defaultValue = "0") int otherTasksPage,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);

            // Get user's tasks for the date
            List<ActivityDto> userTasks = activityService.findActivitiesByUserAndDate(username, date);
            
            // Get other users' tasks for the date
            List<ActivityDto> allTasks = activityService.getActivitiesByDate(date);
            List<ActivityDto> otherTasks = allTasks.stream()
                .filter(task -> !task.getAssignedUser().equals(username))
                .collect(Collectors.toList());

            // Apply pagination
            int userTasksStart = userTasksPage * size;
            int userTasksEnd = Math.min(userTasksStart + size, userTasks.size());
            List<ActivityDto> paginatedUserTasks = userTasksStart < userTasks.size() ? 
                userTasks.subList(userTasksStart, userTasksEnd) : List.of();

            int otherTasksStart = otherTasksPage * size;
            int otherTasksEnd = Math.min(otherTasksStart + size, otherTasks.size());
            List<ActivityDto> paginatedOtherTasks = otherTasksStart < otherTasks.size() ? 
                otherTasks.subList(otherTasksStart, otherTasksEnd) : List.of();

            Map<String, Object> response = new HashMap<>();
            response.put("userTasks", Map.of(
                "items", paginatedUserTasks,
                "page", userTasksPage,
                "size", size,
                "totalElements", userTasks.size(),
                "totalPages", (int) Math.ceil((double) userTasks.size() / size),
                "hasMore", userTasksEnd < userTasks.size()
            ));
            response.put("otherTasks", Map.of(
                "items", paginatedOtherTasks,
                "page", otherTasksPage,
                "size", size,
                "totalElements", otherTasks.size(),
                "totalPages", (int) Math.ceil((double) otherTasks.size() / size),
                "hasMore", otherTasksEnd < otherTasks.size()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user-tasks")
    public ResponseEntity<Map<String, Object>> getUserTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);

            Page<ActivityDto> pageResult = activityService.getActivitiesForUserPaged(username, page, size);

            Map<String, Object> body = new HashMap<>();
            body.put("items", pageResult.getContent());
            body.put("page", pageResult.getNumber());
            body.put("size", pageResult.getSize());
            body.put("totalPages", pageResult.getTotalPages());
            body.put("totalElements", pageResult.getTotalElements());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user-tasks-by-date")
    public ResponseEntity<Map<String, Object>> getUserTasksByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);

            Page<ActivityDto> pageResult = activityService.getActivitiesForUserByDatePaged(username, date, page, size);

            Map<String, Object> body = new HashMap<>();
            body.put("items", pageResult.getContent());
            body.put("page", pageResult.getNumber());
            body.put("size", pageResult.getSize());
            body.put("totalPages", pageResult.getTotalPages());
            body.put("totalElements", pageResult.getTotalElements());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityDto> getTaskById(@PathVariable Long id, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);

            Activity activity = activityService.findById(id);
            if (activity == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if user has permission to view this task
            if (!"MANAGER".equalsIgnoreCase(role) && !activity.getAssignedUserName().equals(username)) {
                return ResponseEntity.status(403).build();
            }

            ActivityDto activityDto = new ActivityDto();
            activityDto.setId(activity.getId());
            activityDto.setAssignedUser(activity.getAssignedUserName());
            activityDto.setDate(activity.getDate());
            activityDto.setDescription(activity.getDescription());
            activityDto.setStatus(activity.getStatus());
            activityDto.setPriority(activity.getPriority());
            // Add assigner information
            if (activity.getAssignedBy() != null) {
                activityDto.setAssignedBy(activity.getAssignedBy().getUsername());
            }

            return ResponseEntity.ok(activityDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ActivityDto> updateTask(@PathVariable Long id, @RequestBody ActivityDto taskDto, HttpServletRequest request) {
        try {
            Activity existingActivity = activityService.findById(id);
            if (existingActivity == null) {
                return ResponseEntity.notFound().build();
            }

            // Update the activity
            // Find the user object for the assignment
            User assignedUser = userService.findByUsername(taskDto.getAssignedUser());
            if (assignedUser == null) {
                return ResponseEntity.badRequest().build();
            }
            
            existingActivity.setAssignedUser(assignedUser);
            existingActivity.setDate(taskDto.getDate());
            existingActivity.setDescription(taskDto.getDescription());
            existingActivity.setStatus(taskDto.getStatus());
            existingActivity.setPriority(taskDto.getPriority());

            Activity updatedActivity = activityService.save(existingActivity);

            ActivityDto responseDto = new ActivityDto();
            responseDto.setId(updatedActivity.getId());
            responseDto.setAssignedUser(updatedActivity.getAssignedUserName());
            responseDto.setDate(updatedActivity.getDate());
            responseDto.setDescription(updatedActivity.getDescription());
            responseDto.setStatus(updatedActivity.getStatus());
            responseDto.setPriority(updatedActivity.getPriority());
            // Add assigner information
            if (updatedActivity.getAssignedBy() != null) {
                responseDto.setAssignedBy(updatedActivity.getAssignedBy().getUsername());
            }

            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable Long id, HttpServletRequest request) {
        try {
            Activity activity = activityService.findById(id);
            if (activity == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete the task
            boolean deleted = activityService.deleteActivity(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                    "message", "Task deleted successfully",
                    "taskId", id
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete task"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete task: " + e.getMessage()));
        }
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getStaffUsers() {
        try {
            // Get all users (including managers) so managers can assign tasks to themselves
            List<User> allUsers = userService.findAllUsers();
            
            List<Map<String, Object>> staffList = allUsers.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("role", user.getRole().getDisplayName());
                    return userMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(staffList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getTaskHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);

            // Get past tasks (with due dates before today) for the current user
            Page<ActivityDto> pageResult = activityService.getHistoryActivitiesForUserPaged(username, page, size);

            Map<String, Object> body = new HashMap<>();
            body.put("items", pageResult.getContent());
            body.put("page", pageResult.getNumber());
            body.put("size", pageResult.getSize());
            body.put("totalPages", pageResult.getTotalPages());
            body.put("totalElements", pageResult.getTotalElements());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/others-incoming")
    public ResponseEntity<Map<String, Object>> getOthersIncomingTasks(
            @RequestParam String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        try {
            String token = extractTokenFromRequest(request);
            String username = jwtUtil.extractUsername(token);

            // Get tasks assigned to other users (not current user) with due date today or in future
            Page<ActivityDto> pageResult = activityService.getOthersIncomingTasks(username, date, page, size);

            Map<String, Object> body = new HashMap<>();
            body.put("items", pageResult.getContent());
            body.put("page", pageResult.getNumber());
            body.put("size", pageResult.getSize());
            body.put("totalPages", pageResult.getTotalPages());
            body.put("totalElements", pageResult.getTotalElements());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}