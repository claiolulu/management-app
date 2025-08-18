package com.figma.webapp.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.figma.webapp.dto.UserLoginDto;
import com.figma.webapp.dto.UserRegistrationDto;
import com.figma.webapp.dto.UserResponseDto;
import com.figma.webapp.entity.User;
import com.figma.webapp.repository.UserRepository;
import com.figma.webapp.security.JwtUtil;
import com.figma.webapp.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.path:uploads/profiles}")
    private String uploadPath;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        try {
            UserResponseDto user = userService.registerUser(registrationDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("userId", user.getId());
            response.put("user", user);
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@Valid @RequestBody UserLoginDto loginDto) {
        try {
            System.out.println("Login attempt for username: " + loginDto.getUsername());
            Optional<User> userOptional = userService.findByUsernameOrEmail(loginDto.getUsername(), loginDto.getUsername());
            
            if (userOptional.isEmpty()) {
                System.out.println("User not found: " + loginDto.getUsername());
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Invalid credentials");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
            
            User user = userOptional.get();
            System.out.println("User found: " + user.getUsername() + ", checking password...");
            
            if (!userService.validatePassword(loginDto.getPassword(), user.getPasswordHash())) {
                System.out.println("Password validation failed for user: " + user.getUsername());
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Invalid credentials");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
            
            System.out.println("Login successful for user: " + user.getUsername());
            
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().getDisplayName(),
                "isManager", user.isManager()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Internal server error during login");
            response.put("timestamp", LocalDateTime.now());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String emailOrUsername = request.get("emailOrUsername");
            
            if (emailOrUsername == null || emailOrUsername.trim().isEmpty()) {
                response.put("error", "Email or username is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            boolean userExists = userService.checkUserExists(emailOrUsername);
            
            if (userExists) {
                userService.requestPasswordReset(emailOrUsername);
            }
            
            // Always return the same message for security (don't reveal if user exists)
            response.put("success", true);
            response.put("message", "If an account with that email/username exists, password reset instructions have been sent to your email.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Always return the same message for security
            response.put("success", true);
            response.put("message", "If an account with that email/username exists, password reset instructions have been sent to your email.");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || token.trim().isEmpty()) {
                response.put("error", "Reset token is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            if (newPassword == null || newPassword.length() < 6) {
                response.put("error", "Password must be at least 6 characters long");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            boolean resetSuccessful = userService.resetPasswordWithToken(token, newPassword);
            
            if (resetSuccessful) {
                response.put("success", true);
                response.put("message", "Password has been reset successfully. You can now sign in with your new password.");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Invalid or expired reset token");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            response.put("error", "An error occurred while resetting your password");
            response.put("timestamp", LocalDateTime.now());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<Map<String, Object>> validateResetToken(@PathVariable String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isValid = userService.isValidResetToken(token);
            response.put("valid", isValid);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("valid", false);
            response.put("error", "Error validating token");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Figma Web App API is running");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "removeProfilePicture", required = false) String removeProfilePicture,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            // Debug logging
            System.out.println("Received avatar file: " + (avatar != null ? avatar.getOriginalFilename() : "null"));
            System.out.println("Username: " + username);
            System.out.println("Email: " + email);
            System.out.println("Remove profile picture: " + removeProfilePicture);
            
            // Get current user from JWT token
            String bearerToken = request.getHeader("Authorization");
            String token = null;
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                token = bearerToken.substring(7);
            }
            
            if (token == null) {
                response.put("error", "Authorization token required");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
            
            String currentUsername = jwtUtil.extractUsername(token);
            User user = userService.findByUsername(currentUsername);
            
            if (user == null) {
                response.put("error", "User not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            
            // Update user fields
            user.setUsername(username);
            user.setEmail(email);
            
            // Handle profile picture (using avatar field)
            if ("true".equals(removeProfilePicture)) {
                user.setAvatar(null);
            } else if (avatar != null && !avatar.isEmpty()) {
                try {
                    // Create uploads directory if it doesn't exist
                    Path uploadsDir = Paths.get(uploadPath);
                    if (!Files.exists(uploadsDir)) {
                        Files.createDirectories(uploadsDir);
                    }
                    
                    // Generate unique filename
                    String originalFilename = avatar.getOriginalFilename();
                    String fileExtension = "";
                    if (originalFilename != null && originalFilename.contains(".")) {
                        fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    }
                    String filename = UUID.randomUUID().toString() + fileExtension;
                    
                    // Save file
                    Path filePath = uploadsDir.resolve(filename);
                    Files.copy(avatar.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    
                    // Store path in database (relative to upload base)
                    // Store just the filename in database for frontend URL construction
                user.setAvatar(filename);
                } catch (IOException e) {
                    response.put("error", "Failed to save profile picture: " + e.getMessage());
                    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            
            // Save updated user through repository
            User updatedUser = userRepository.save(user);
            
            // Create response
            UserResponseDto userResponse = new UserResponseDto();
            userResponse.setId(updatedUser.getId());
            userResponse.setUsername(updatedUser.getUsername());
            userResponse.setEmail(updatedUser.getEmail());
            userResponse.setRole(updatedUser.getRole().name());
            userResponse.setAvatar(updatedUser.getAvatar());
            userResponse.setProjects(updatedUser.getProjects());
            userResponse.setTasks(updatedUser.getTasks());
            userResponse.setCompleted(updatedUser.getCompleted());
            
            // Add profilePicture field for frontend compatibility
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", updatedUser.getId());
            userMap.put("username", updatedUser.getUsername());
            userMap.put("email", updatedUser.getEmail());
            userMap.put("role", updatedUser.getRole().name());
            userMap.put("avatar", updatedUser.getAvatar());
            userMap.put("profilePicture", updatedUser.getAvatar()); // Same as avatar for compatibility
            userMap.put("projects", updatedUser.getProjects());
            userMap.put("tasks", updatedUser.getTasks());
            userMap.put("completed", updatedUser.getCompleted());
            userMap.put("isManager", updatedUser.getRole().name().equals("MANAGER"));
            
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", userMap);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Failed to update profile: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}