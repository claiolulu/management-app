package com.figma.webapp.controller;

import com.figma.webapp.dto.ActivityDto;
import com.figma.webapp.entity.Activity;
import com.figma.webapp.service.ActivityService;
import com.figma.webapp.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activities")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<ActivityDto>> getAllActivities() {
        List<ActivityDto> activities = activityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createActivity(@Valid @RequestBody ActivityDto activityDto) {
        try {
            ActivityDto createdActivity = activityService.createActivity(activityDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Activity created successfully");
            response.put("activityId", createdActivity.getId());
            response.put("activity", createdActivity);
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Internal server error creating activity");
            response.put("message", e.getMessage());
            response.put("timestamp", LocalDateTime.now());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateActivity(@PathVariable Long id, @Valid @RequestBody ActivityDto activityDto) {
        try {
            return activityService.updateActivity(id, activityDto)
                    .map(updatedActivity -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("message", "Activity updated successfully");
                        response.put("activity", updatedActivity);
                        return ResponseEntity.ok(response);
                    })
                    .orElseGet(() -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("error", "Activity not found");
                        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
                    });
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Internal server error updating activity");
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteActivity(@PathVariable Long id) {
        try {
            boolean deleted = activityService.deleteActivity(id);
            Map<String, Object> response = new HashMap<>();
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Activity deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Activity not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Internal server error deleting activity");
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ActivityDto>> getActivitiesByStatus(@PathVariable String status) {
        try {
            Activity.ActivityStatus activityStatus = Activity.ActivityStatus.valueOf(status.toUpperCase().replace("-", "_"));
            List<ActivityDto> activities = activityService.getActivitiesByStatus(activityStatus);
            return ResponseEntity.ok(activities);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}