package com.figma.webapp.controller;

import com.figma.webapp.entity.Activity;
import com.figma.webapp.service.ActivityService;
import com.figma.webapp.service.EventService;
import com.figma.webapp.service.InteractionService;
import com.figma.webapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AnalyticsController {

    @Autowired
    private InteractionService interactionService;

    @Autowired
    private EventService eventService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityService activityService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        long totalInteractions = interactionService.getTotalInteractions();
        long clickInteractions = interactionService.getInteractionCountByType("click");
        long hoverInteractions = interactionService.getInteractionCountByType("hover");
        
        long totalEvents = eventService.getAllEvents().size();
        long totalUsers = userService.getAllUsers().size();
        long totalActivities = activityService.getAllActivities().size();
        
        long pendingActivities = activityService.countActivitiesByStatus(Activity.ActivityStatus.PENDING);
        long completedActivities = activityService.countActivitiesByStatus(Activity.ActivityStatus.COMPLETED);
        long inProgressActivities = activityService.countActivitiesByStatus(Activity.ActivityStatus.IN_PROGRESS);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalInteractions", totalInteractions);
        analytics.put("clickInteractions", clickInteractions);
        analytics.put("hoverInteractions", hoverInteractions);
        analytics.put("totalEvents", totalEvents);
        analytics.put("totalUsers", totalUsers);
        analytics.put("totalActivities", totalActivities);
        analytics.put("pendingActivities", pendingActivities);
        analytics.put("completedActivities", completedActivities);
        analytics.put("inProgressActivities", inProgressActivities);
        analytics.put("lastActivity", LocalDateTime.now());

        return ResponseEntity.ok(analytics);
    }
}