-- Sample data for Figma Web App

-- Insert sample users (password is 'password123' encoded with BCrypt)
INSERT IGNORE INTO users (id, username, email, password_hash, avatar, projects, tasks, completed, role, created_at, updated_at) VALUES
(1, 'john', 'john@example.com', '$2a$10$eCikaFfg2oyQETqH92nIJeC1AF/DvqfRft68QlsZWg/ftjw83OQHa', '👨‍💻', 5, 12, 8, 'STAFF_DEVELOPER', NOW(), NOW()),
(2, 'jane', 'jane@example.com', '$2a$10$eCikaFfg2oyQETqH92nIJeC1AF/DvqfRft68QlsZWg/ftjw83OQHa', '👩‍🎨', 3, 8, 6, 'STAFF_DESIGNER', NOW(), NOW()),
(3, 'mike', 'mike@example.com', '$2a$10$eCikaFfg2oyQETqH92nIJeC1AF/DvqfRft68QlsZWg/ftjw83OQHa', '🧑‍💼', 7, 15, 10, 'MANAGER', NOW(), NOW());

-- Insert sample activities (using user IDs and usernames for hybrid search approach)
INSERT IGNORE INTO activities (id, assigned_user_id, assigned_by_user_id, assigned_user_name, title, date, description, status, priority, created_at, updated_at) VALUES
(1, 1, 3, 'john', 'Complete user interface mockups for dashboard', '2025-08-13', 'Create comprehensive UI mockups for the main dashboard interface', 'IN_PROGRESS', 'HIGH', NOW(), NOW()),
(2, 2, 3, 'jane', 'Review and update color palette', '2025-08-13', 'Review current color scheme and update to match brand guidelines', 'PENDING', 'MEDIUM', NOW(), NOW()),
(3, 1, 3, 'john', 'Implement responsive design for mobile', '2025-08-14', 'Ensure the application works properly on mobile devices', 'COMPLETED', 'HIGH', NOW(), NOW()),
(4, 1, 3, 'john', 'Create wireframes for new feature', '2025-08-15', 'Design wireframes for the upcoming feature release', 'PENDING', 'LOW', NOW(), NOW()),
(5, 2, 3, 'jane', 'User testing session preparation', '2025-08-15', 'Prepare materials and scenarios for user testing sessions', 'IN_PROGRESS', 'MEDIUM', NOW(), NOW()),
(6, 2, 3, 'jane', 'Design system documentation', '2025-08-16', 'Create comprehensive documentation for the design system', 'PENDING', 'HIGH', NOW(), NOW()),
(7, 1, 3, 'john', 'API integration testing', '2025-08-16', 'Test all API endpoints and ensure proper error handling', 'IN_PROGRESS', 'MEDIUM', NOW(), NOW()),
(8, 2, 3, 'jane', 'Accessibility audit', '2025-08-17', 'Conduct accessibility audit for the entire application', 'SCHEDULED', 'HIGH', NOW(), NOW()),
-- Add tasks for mike (manager) so he can see his own tasks
(9, 3, 1, 'mike', 'Team performance review', '2025-08-14', 'Conduct quarterly performance reviews for team members', 'IN_PROGRESS', 'HIGH', NOW(), NOW()),
(10, 3, 2, 'mike', 'Project planning meeting', '2025-08-14', 'Plan upcoming project milestones and deliverables', 'PENDING', 'MEDIUM', NOW(), NOW()),
(11, 3, 1, 'mike', 'Budget approval review', '2025-08-15', 'Review and approve budget requests from team leads', 'SCHEDULED', 'HIGH', NOW(), NOW()),
(12, 3, 2, 'mike', 'Client presentation prep', '2025-08-16', 'Prepare presentation materials for client meeting', 'PENDING', 'MEDIUM', NOW(), NOW());

-- Insert sample events
INSERT IGNORE INTO events (id, date, title, time, description, created_at, updated_at) VALUES
(1, '2024-01-20', 'Design Review Meeting', '10:00 AM', 'Weekly design review and feedback session', NOW(), NOW()),
(2, '2024-01-22', 'Client Presentation', '2:00 PM', 'Present final designs to client stakeholders', NOW(), NOW()),
(3, '2024-01-25', 'Team Standup', '9:00 AM', 'Daily team synchronization meeting', NOW(), NOW()),
(4, '2024-01-28', 'User Testing Session', '3:00 PM', 'Conduct usability testing with target users', NOW(), NOW());

-- Insert sample interactions
INSERT IGNORE INTO interactions (id, type, element, position, timestamp) VALUES
(1, 'click', 'dashboard-button', '{"x": 150, "y": 200}', NOW()),
(2, 'hover', 'menu-item', '{"x": 75, "y": 50}', NOW()),
(3, 'click', 'save-button', '{"x": 300, "y": 400}', NOW()),
(4, 'scroll', 'main-content', '{"x": 0, "y": 500}', NOW()),
(5, 'click', 'profile-avatar', '{"x": 800, "y": 60}', NOW());