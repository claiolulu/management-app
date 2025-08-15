package com.figma.webapp.dto;

public class RoleUpdateDto {
    
    private String role;
    
    public RoleUpdateDto() {}
    
    public RoleUpdateDto(String role) {
        this.role = role;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
}
