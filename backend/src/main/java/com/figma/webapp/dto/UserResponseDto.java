package com.figma.webapp.dto;

public class UserResponseDto {

    private Long id;
    private String username;
    private String email;
    private String avatar;
    private Integer projects;
    private Integer tasks;
    private Integer completed;
    private String role;

    // Constructors
    public UserResponseDto() {}

    public UserResponseDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public UserResponseDto(Long id, String username, String email, String avatar, Integer projects, Integer tasks, Integer completed, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.avatar = avatar;
        this.projects = projects;
        this.tasks = tasks;
        this.completed = completed;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Integer getProjects() {
        return projects;
    }

    public void setProjects(Integer projects) {
        this.projects = projects;
    }

    public Integer getTasks() {
        return tasks;
    }

    public void setTasks(Integer tasks) {
        this.tasks = tasks;
    }

    public Integer getCompleted() {
        return completed;
    }

    public void setCompleted(Integer completed) {
        this.completed = completed;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}