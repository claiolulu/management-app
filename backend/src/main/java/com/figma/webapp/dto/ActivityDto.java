package com.figma.webapp.dto;

import com.figma.webapp.entity.Activity.ActivityPriority;
import com.figma.webapp.entity.Activity.ActivityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ActivityDto {

    private Long id;

    @NotBlank(message = "Assigned user is required")
    private String assignedUser;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Description is required")
    private String description;

    private ActivityStatus status = ActivityStatus.PENDING;

    private ActivityPriority priority = ActivityPriority.MEDIUM;

    private String assignedBy;

    // Constructors
    public ActivityDto() {}

    public ActivityDto(String assignedUser, LocalDate date, String description) {
        this.assignedUser = assignedUser;
        this.date = date;
        this.description = description;
    }

    public ActivityDto(String assignedUser, LocalDate date, String description, ActivityStatus status, ActivityPriority priority) {
        this.assignedUser = assignedUser;
        this.date = date;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssignedUser() {
        return assignedUser;
    }

    public void setAssignedUser(String assignedUser) {
        this.assignedUser = assignedUser;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ActivityStatus getStatus() {
        return status;
    }

    public void setStatus(ActivityStatus status) {
        this.status = status;
    }

    public ActivityPriority getPriority() {
        return priority;
    }

    public void setPriority(ActivityPriority priority) {
        this.priority = priority;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }
}