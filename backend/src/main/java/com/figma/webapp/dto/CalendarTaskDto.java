package com.figma.webapp.dto;

import java.time.LocalDate;

public class CalendarTaskDto {
    
    private Long id;
    private String assignedUser;
    private String description;
    private String status;
    private String priority;
    private LocalDate date;

    // Constructors
    public CalendarTaskDto() {}

    public CalendarTaskDto(Long id, String assignedUser, String description, String status, String priority, LocalDate date) {
        this.id = id;
        this.assignedUser = assignedUser;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.date = date;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}