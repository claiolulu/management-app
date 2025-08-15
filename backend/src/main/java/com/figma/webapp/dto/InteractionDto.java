package com.figma.webapp.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class InteractionDto {

    private Long id;

    @NotBlank(message = "Type is required")
    private String type;

    private String element;

    private String position;

    private LocalDateTime timestamp;

    // Constructors
    public InteractionDto() {}

    public InteractionDto(String type, String element, String position) {
        this.type = type;
        this.element = element;
        this.position = position;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getElement() {
        return element;
    }

    public void setElement(String element) {
        this.element = element;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}