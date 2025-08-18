# Complete Web Application Requirements for AI Rebuild

## Application Overview

**Type**: Full-stack task management web application  
**Architecture**: Spring Boot backend + React frontend with JWT authentication  
**Database**: MySQL with JPA/Hibernate ORM  
**Primary Features**: User authentication, task assignment, calendar view, role-based access control, file uploads, email notifications

---

## 1. Backend Requirements (Spring Boot 3.2.1)

### 1.1 Database Schema

```sql
-- User Entity
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    projects INT DEFAULT 0,
    tasks INT DEFAULT 0,
    completed INT DEFAULT 0,
    role ENUM('MANAGER', 'STAFF_GENERAL') NOT NULL DEFAULT 'STAFF_GENERAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activity Entity (Tasks)
CREATE TABLE activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assigned_user_id BIGINT NOT NULL,
    assigned_by_user_id BIGINT,
    assigned_user_name VARCHAR(50),
    title VARCHAR(255),
    date DATE NOT NULL,
    time VARCHAR(10),
    description TEXT NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SCHEDULED') NOT NULL DEFAULT 'PENDING',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id)
);

-- Interaction Entity (System logs/interactions)
CREATE TABLE interactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 1.2 Core Backend Components

#### 1.2.1 Entity Classes
- **User.java** - User entity with role-based permissions, profile picture support
- **Activity.java** - Task entity with status, priority, assignment tracking
- **Interaction.java** - System interaction logging
- **PasswordResetToken.java** - Password reset token management

#### 1.2.2 Repository Interfaces
- **UserRepository.java** - User CRUD operations with role filtering
- **ActivityRepository.java** - Complex task queries with pagination, date filtering, user filtering
- **InteractionRepository.java** - System logging repository
- **PasswordResetTokenRepository.java** - Token management

#### 1.2.3 Service Layer
- **UserService.java** - User management, authentication, profile operations
- **ActivityService.java** - Task CRUD, pagination, filtering, status management
- **EmailService.java** - Password reset email sending via SMTP
- **JwtUtil.java** - JWT token generation and validation

#### 1.2.4 REST API Controllers

**AuthController.java** - Authentication endpoints:
- `POST /auth/login` - User login with JWT token response
- `POST /auth/register` - User registration with validation
- `POST /auth/forgot-password` - Password reset email trigger
- `POST /auth/reset-password` - Password reset with token validation
- `PUT /auth/profile` - Profile update with avatar upload

**TaskApiController.java** - Task management endpoints:
- `GET /tasks/user-tasks` - Paginated user tasks
- `GET /tasks/other-tasks` - Manager view of team tasks
- `GET /tasks/by-date-detailed` - Date-specific task filtering
- `GET /tasks/calendar` - Calendar view data
- `POST /tasks` - Task creation
- `PUT /tasks/{id}` - Task updates
- `DELETE /tasks/{id}` - Task deletion

**UserController.java** - User management endpoints:
- `GET /users/staff` - Staff user listing for managers
- `PUT /users/role` - Role management for managers

### 1.3 Security Configuration
- JWT-based authentication with 24-hour token expiry
- CORS configuration for multiple frontend origins (localhost:3000, 5173)
- BCrypt password encryption
- Role-based access control (Manager vs Staff permissions)
- File upload security with size limits (10MB)

### 1.4 Application Configuration (application.yml)

```yaml
server:
  port: 5001
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/figma_app?createDatabaseIfNotExist=true
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        
  mail:
    host: smtp.gmail.com
    port: 587
    username: liuprope@gmail.com
    password: svlhrmvrgbirwegl
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

cors:
  allowed-origins: 
    - http://localhost:3000
    - http://localhost:5173
  allowed-methods: [GET, POST, PUT, DELETE, OPTIONS]
  allowed-headers: "*"
  allow-credentials: true

file:
  upload:
    dir: uploads/profiles/
```

---

## 2. Frontend Requirements (React + Vite)

### 2.1 Project Structure

```
frontend/
├── src/
│   ├── main.jsx - React app entry point
│   ├── App.jsx - Main app component with routing
│   ├── components/
│   │   ├── LoginPage.jsx - Authentication interface
│   │   ├── Homepage.jsx - Main dashboard with calendar
│   │   ├── AssignTaskPage.jsx - Task creation form
│   │   ├── AssignTask.jsx - Quick task assignment component
│   │   ├── DateTasksPage.jsx - Date-specific task view
│   │   ├── TaskDetail.jsx - Individual task details
│   │   ├── HistoryPage.jsx - Task history view
│   │   ├── ProfileSettings.jsx - User profile management
│   │   ├── RoleManagement.jsx - Manager role assignment
│   │   ├── ResetPasswordPage.jsx - Password reset completion
│   │   └── ConfirmDialog.jsx - Confirmation dialogs
│   ├── config/
│   │   └── api.js - API configuration and base URLs
│   └── styles/
│       ├── [Component].css - Individual component styles
│       ├── App.css - Global app styles
│       └── index.css - Base CSS reset and variables
├── index.html - HTML entry point
├── package.json - Dependencies and scripts
└── vite.config.js - Vite configuration
```

### 2.2 Core Components Specifications

#### 2.2.1 LoginPage.jsx
- User authentication form with validation
- Registration modal with username/email/password fields
- Forgot password modal with email input
- JWT token storage in localStorage
- Form validation with error handling
- Loading states for all operations

#### 2.2.2 Homepage.jsx
- Main dashboard with calendar widget
- Paginated task lists (user tasks + team tasks for managers)
- Calendar month view with task indicators (red dots for user tasks, green for others)
- Task filtering by date with clickable calendar days
- Profile menu with settings access
- Role-based UI (manager features hidden for staff)
- Task deletion with confirmation dialogs

#### 2.2.3 AssignTaskPage.jsx
- Task creation form with user selection dropdown
- Date picker for due dates
- Priority selection (Low/Medium/High)
- Status selection (Pending/In Progress/Completed/Scheduled)
- Rich text description input
- Form validation with error handling
- User search/filtering for large teams

#### 2.2.4 DateTasksPage.jsx
- Date-specific task view with navigation
- Separate sections for user tasks and team tasks
- Pagination for large task lists
- Task cards with priority/status badges
- Click-through to detailed task view
- Empty state handling

#### 2.2.5 ProfileSettings.jsx
- Profile picture upload with preview
- Username/email editing (with validation)
- Password change functionality
- Account statistics display (projects/tasks/completed)
- Avatar management with file upload

#### 2.2.6 ResetPasswordPage.jsx
- Password reset token validation from URL
- New password form with confirmation
- Token expiry handling
- Redirect to login after successful reset

### 2.3 Styling Requirements
- Modern, clean interface with consistent color scheme
- Responsive design for mobile/desktop
- Card-based layout for tasks and sections
- Hover effects and smooth transitions
- Loading spinners and skeleton screens
- Color-coded priority badges (High=Red, Medium=Orange, Low=Green)
- Status badges with distinct colors
- Calendar widget with day highlighting
- Form validation styling (error states, success states)

### 2.4 State Management
- React hooks (useState, useEffect) for local state
- JWT token persistence in localStorage
- User context/state management across components
- Form state management with validation
- Pagination state for large lists
- Calendar state for date navigation

---

## 3. Authentication & Security Requirements

### 3.1 JWT Authentication Flow
1. User login → Server validates → JWT token returned
2. Token stored in localStorage
3. All API requests include `Authorization: Bearer <token>` header
4. Token validation on each request
5. Automatic logout on token expiry
6. Refresh token mechanism (optional but recommended)

### 3.2 Password Security
- BCrypt hashing with salt rounds
- Password complexity requirements (minimum 6 characters)
- Password reset tokens with 30-minute expiry
- Email-based password reset flow

### 3.3 Role-Based Access Control

**Managers can:**
- View all team tasks
- Assign tasks to any user
- Manage user roles
- Access role management interface

**Staff can:**
- View only assigned tasks
- Update task status
- Manage personal profile

---

## 4. API Endpoint Specifications

### 4.1 Authentication Endpoints

```
POST /api/auth/login
Body: { username: string, password: string }
Response: { token: string, user: UserObject }

POST /api/auth/register  
Body: { username: string, email: string, password: string }
Response: { message: string, user: UserObject }

POST /api/auth/forgot-password
Body: { email: string }
Response: { message: string }

POST /api/auth/reset-password
Body: { token: string, newPassword: string }
Response: { message: string }

PUT /api/auth/profile
Body: FormData with user fields and optional avatar file
Response: { user: UserObject }
```

### 4.2 Task Management Endpoints

```
GET /api/tasks/user-tasks?page=0&size=10
Response: { items: TaskArray, page: number, totalPages: number, hasMore: boolean }

GET /api/tasks/other-tasks?page=0&size=10 (Manager only)
Response: { items: TaskArray, page: number, totalPages: number, hasMore: boolean }

GET /api/tasks/by-date-detailed?date=2024-01-15&userTasksPage=0&otherTasksPage=0
Response: { userTasks: PagedTasks, otherTasks: PagedTasks }

GET /api/tasks/calendar?startDate=2024-01-01&endDate=2024-01-31
Response: [ { id, assignedUser, description, status, priority, date } ]

POST /api/tasks
Body: { assignedUser: string, date: string, description: string, priority: string, status: string }
Response: { id: number, ...taskData }

PUT /api/tasks/{id}
Body: { assignedUser: string, date: string, description: string, priority: string, status: string }
Response: { id: number, ...taskData }

DELETE /api/tasks/{id}
Response: { message: string }
```

### 4.3 User Management Endpoints

```
GET /api/users/staff (Manager only)
Response: [ { username: string, role: string, email: string } ]

PUT /api/users/role (Manager only)
Body: { username: string, role: string }
Response: { message: string }
```

---

## 5. File Upload Requirements
- Profile picture upload support
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF
- Server-side file validation
- Unique filename generation (UUID-based)
- File storage in `/uploads/profiles/` directory
- Image serving via static file endpoint

---

## 6. Email Integration Requirements
- SMTP configuration for Gmail
- Password reset email templates
- HTML email formatting
- Email validation before sending
- Error handling for email delivery failures
- Email template customization

---

## 7. Development Environment Setup
- **Backend**: Maven project with Spring Boot 3.2.1
- **Frontend**: Vite React application
- **Database**: MySQL 8.0+ with automatic schema creation
- **Development servers**: Backend on port 5001, Frontend on port 5173
- **CORS configuration**: For cross-origin development
- **Environment variables**: For sensitive data (DB_PASSWORD, JWT_SECRET)

---

## 8. Production Deployment Requirements
- AWS EC2 deployment scripts included
- Nginx reverse proxy configuration
- SSL certificate automation
- RDS MySQL database setup
- S3 + CloudFront for static assets
- Environment-specific configuration files
- Production logging configuration
- Health check endpoints
- Automated deployment scripts

---

## 9. Dependencies and Technologies

### Backend Dependencies (Maven)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.5"
  }
}
```

---

## 10. Additional Features to Implement
- Task notifications/reminders
- Task history and audit trails
- Advanced filtering and search
- Task comments and collaboration
- Dashboard analytics
- Mobile-responsive design improvements
- Bulk task operations
- Export functionality (CSV, PDF)
- Calendar integration (iCal export)
- Real-time updates via WebSocket

---

## 11. Testing Requirements
- Unit tests for service layer methods
- Integration tests for REST endpoints
- Frontend component testing with React Testing Library
- End-to-end testing with Cypress
- Database integration testing
- Security testing for authentication flows

---

## 12. Performance Requirements
- Page load times under 2 seconds
- API response times under 500ms
- Database query optimization
- Pagination for large datasets
- Lazy loading for images and components
- Caching strategies for frequently accessed data

---

*Document created on August 18, 2025*  
*Repository: management-app*  
*Version: 1.0*
