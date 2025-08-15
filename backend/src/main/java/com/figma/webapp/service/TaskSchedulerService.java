package com.figma.webapp.service;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.figma.webapp.entity.Activity;
import com.figma.webapp.entity.Activity.ActivityStatus;
import com.figma.webapp.repository.ActivityRepository;

@Service
public class TaskSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(TaskSchedulerService.class);

    @Autowired
    private ActivityRepository activityRepository;

    /**
     * Scheduled task that runs every day at midnight and marks all overdue tasks as COMPLETE.
     * 
     * This method is intended to ensure that any tasks whose due dates have passed and are not yet marked as completed
     * are automatically updated to COMPLETED status. This helps maintain data consistency and prevents overdue tasks
     * from lingering in an incomplete state indefinitely, which may be important for reporting, notifications, or
     * business process automation.
     * 
     * Cron expression: "0 0 0 * * *" means:
     * - 0 seconds
     * - 0 minutes  
     * - 0 hours (midnight)
     * - every day of month
     * - every month
     * - every day of week
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markOverdueTasksAsComplete() {
        LocalDate today = LocalDate.now();
        
        try {
            // Find all tasks with due date before today that are not already COMPLETED
            List<Activity> overdueTasks = activityRepository.findOverdueTasks(today, ActivityStatus.COMPLETED);
            
            if (!overdueTasks.isEmpty()) {
                logger.info("Found {} overdue tasks to mark as complete", overdueTasks.size());
                
                // Update each overdue task to COMPLETED status
                for (Activity task : overdueTasks) {
                    task.setStatus(ActivityStatus.COMPLETED);
                    activityRepository.save(task);
                    logger.debug("Marked task {} as complete (was due on {})", task.getId(), task.getDate());
                }
                
                logger.info("Successfully marked {} overdue tasks as complete", overdueTasks.size());
            } else {
                logger.info("No overdue tasks found to mark as complete");
            }
            
        } catch (Exception e) {
            logger.error("Error occurred while marking overdue tasks as complete", e);
        }
    }
    
    /**
     * Manual method to trigger the overdue task cleanup (useful for testing)
     */
    public void manualMarkOverdueTasksAsComplete() {
        logger.info("Manually triggering overdue task cleanup");
        markOverdueTasksAsComplete();
    }
}
