package com.figma.webapp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.figma.webapp.dto.UserRegistrationDto;
import com.figma.webapp.dto.UserResponseDto;
import com.figma.webapp.entity.PasswordResetToken;
import com.figma.webapp.entity.User;
import com.figma.webapp.exception.UserAlreadyExistsException;
import com.figma.webapp.repository.PasswordResetTokenRepository;
import com.figma.webapp.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Value("${app.email.reset-token-expiry-minutes:30}")
    private int resetTokenExpiryMinutes;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .build();
    }

    public UserResponseDto registerUser(UserRegistrationDto registrationDto) {
        // Check if user already exists
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setAvatar("👤");

        User savedUser = userRepository.save(user);
        return convertToResponseDto(savedUser);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public Optional<User> findByUsernameOrEmail(String username, String email) {
        return userRepository.findByUsernameOrEmail(username, email);
    }

    public List<User> findAllStaffUsers() {
        return userRepository.findByRoleNot(User.UserRole.MANAGER);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public Optional<UserResponseDto> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToResponseDto);
    }

    public UserResponseDto updateUserRole(Long userId, String roleString) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        try {
            User.UserRole newRole = User.UserRole.valueOf(roleString);
            user.setRole(newRole);
            User savedUser = userRepository.save(user);
            return convertToResponseDto(savedUser);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + roleString);
        }
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public boolean checkUserExists(String emailOrUsername) {
        try {
            // Check if user exists by username or email
            Optional<User> userByUsername = userRepository.findByUsername(emailOrUsername);
            if (userByUsername.isPresent()) {
                return true;
            }
            
            Optional<User> userByEmail = userRepository.findByEmail(emailOrUsername);
            return userByEmail.isPresent();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean resetPassword(String emailOrUsername, String newPassword) {
        try {
            User user = null;
            
            // Find user by username first
            Optional<User> userByUsername = userRepository.findByUsername(emailOrUsername);
            if (userByUsername.isPresent()) {
                user = userByUsername.get();
            } else {
                // Try to find by email
                Optional<User> userByEmail = userRepository.findByEmail(emailOrUsername);
                if (userByEmail.isPresent()) {
                    user = userByEmail.get();
                }
            }
            
            if (user != null) {
                // Encode the new password and update
                String encodedPassword = passwordEncoder.encode(newPassword);
                user.setPasswordHash(encodedPassword);
                userRepository.save(user);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void requestPasswordReset(String emailOrUsername) {
        User user = userRepository.findByUsernameOrEmail(emailOrUsername, emailOrUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Invalidate any existing tokens for this user
        passwordResetTokenRepository.markAllUserTokensAsUsed(user);

        // Generate new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(resetTokenExpiryMinutes);

        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        passwordResetTokenRepository.save(resetToken);

        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);
    }

    @Transactional
    public boolean resetPasswordWithToken(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByTokenAndUsedFalse(token);
        
        if (tokenOpt.isEmpty()) {
            return false; // Token not found or already used
        }

        PasswordResetToken resetToken = tokenOpt.get();
        
        if (resetToken.isExpired()) {
            return false; // Token expired
        }

        // Update password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return true;
    }

    public boolean isValidResetToken(String token) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByTokenAndUsedFalse(token);
        return tokenOpt.isPresent() && !tokenOpt.get().isExpired();
    }

    private UserResponseDto convertToResponseDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatar(),
                user.getProjects(),
                user.getTasks(),
                user.getCompleted(),
                user.getRole().getDisplayName()
        );
    }
}