package com.figma.webapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class TaskAssignmentDto {
    
    @NotBlank(message = "Assigned user is required")
    private String assignedUser;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Status is required")
    private String status;
    
    @NotBlank(message = "Priority is required")
    private String priority;

    // Constructors
    public TaskAssignmentDto() {}

    public TaskAssignmentDto(String assignedUser, LocalDate date, String description, String status, String priority) {
        this.assignedUser = assignedUser;
        this.date = date;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    // Getters and Setters
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}