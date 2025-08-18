# Figma Web App

A modern, environment-aware web application built with React frontend and Spring Boot backend, providing a comprehensive platform for design collaboration and project management with proper environment-based configuration management.

## 🌟 Key Features

- **Environment-Based Configuration**: Separate profiles for development and production
- **Comprehensive Security**: JWT authentication with environment-specific settings
- **Auto-Deployment**: GitHub Actions CI/CD with environment variable injection
- **Modern Stack**: React 18 + Spring Boot 3 with production-ready configuration
- **Scalable Infrastructure**: AWS deployment with S3, EC2, and RDS

## 📁 Project Structure

```
figma-web-app/
├── frontend/                 # React frontend application (Vite)
│   ├── src/                 # React source code
│   ├── .env.example         # Environment variables template
│   ├── .env.development     # Development environment settings
│   ├── setup-dev.sh         # Development setup script
│   └── package.json         # Frontend dependencies
├── backend/                 # Spring Boot backend application
│   ├── src/main/resources/  # Configuration files
│   │   ├── application.yml  # Base configuration with env vars
│   │   ├── application-dev.yml   # Development profile
│   │   └── application-prod.yml  # Production profile
│   ├── .env.example         # Backend environment template
│   ├── .env.development     # Development environment defaults
│   ├── setup-dev.sh         # Development setup script
│   └── pom.xml             # Maven dependencies
├── .github/workflows/       # CI/CD configuration
│   └── deploy.yml          # Environment-based deployment pipeline
├── ENVIRONMENT_CONFIGURATION.md  # Comprehensive config guide
└── README.md               # This file
```

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Next-generation frontend build tool
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Environment Variables** - Vite env system with VITE_ prefix

### Backend
- **Spring Boot 3.2.1** - Enterprise Java framework with native compilation
- **Spring Security** - JWT-based authentication with environment profiles
- **Spring Data JPA** - Database abstraction with Hibernate
- **Spring Data JPA** - Database ORM with Hibernate
- **MySQL 8.0** - Relational database
- **Maven** - Build tool and dependency management

## 🚀 Quick Start

### Prerequisites
- **Java 17+** (for backend)
- **Node.js 18+** (for frontend) 
- **MySQL 8.0+** (for database)
- **Git** (for version control)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/claiolulu/management-app.git
cd figma-web-app
```

#### 2. Backend Setup (Automated)
```bash
cd backend
./setup-dev.sh  # Automated setup script
```

**Manual Backend Setup:**
```bash
cd backend

# Create environment file
cp .env.development .env
# Edit .env with your MySQL password and other settings

# Install dependencies and build
chmod +x mvnw
./mvnw clean compile

# Create development database
mysql -u root -p -e "CREATE DATABASE figma_app_dev;"

# Run with development profile
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

#### 3. Frontend Setup (Automated)
```bash
cd frontend
./setup-dev.sh  # Automated setup script
```

**Manual Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional - has good defaults)
cp .env.example .env.local

# Start development server
npm run dev
```

### 🌐 Access Your Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **API Health Check**: http://localhost:5001/api/actuator/health
- **API Documentation**: http://localhost:5001/api/swagger-ui.html (if enabled)

## 🌍 Environment Configuration

This application uses a sophisticated environment-based configuration system:

### Development Environment
- **Profile**: `dev`
- **Database**: Local MySQL (`figma_app_dev`)
- **Logging**: Verbose (DEBUG level)
- **Security**: Relaxed settings for development
- **CORS**: All localhost origins allowed

### Production Environment  
- **Profile**: `prod`
- **Database**: AWS RDS MySQL with SSL
- **Logging**: Minimal (INFO/WARN levels)
- **Security**: Production-hardened settings
- **CORS**: Restricted to specific domains

### Key Configuration Files
- **Backend**: `application.yml`, `application-dev.yml`, `application-prod.yml`
- **Frontend**: `.env.development`, `.env.production`
- **Templates**: `.env.example` files with all available variables

📖 **For complete configuration details, see [ENVIRONMENT_CONFIGURATION.md](ENVIRONMENT_CONFIGURATION.md)**

## 🚀 Production Deployment

### Automated Deployment (GitHub Actions)
1. **Push to main branch** - Triggers automatic deployment
2. **GitHub Secrets** - Stores sensitive configuration
3. **Environment Injection** - Variables injected during build
4. **Multi-Stage Deploy** - Frontend (S3) + Backend (EC2) + Database (RDS)

### Required GitHub Secrets
```bash
# AWS Infrastructure
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
EC2_HOST, EC2_USER, EC2_SSH_KEY, S3_BUCKET_NAME

# Database  
RDS_ENDPOINT, RDS_USERNAME, RDS_PASSWORD, RDS_DATABASE

# Security
JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

# Email (Optional)
MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD
```

### Manual Deployment
```bash
# Trigger manual deployment
# Go to: GitHub Actions → Deploy to AWS → Run workflow
```

## 🏗 Infrastructure

### AWS Architecture
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Internet  │───▶│  CloudFront  │───▶│     S3      │
│   Users     │    │   (Optional) │    │  (Frontend) │
└─────────────┘    └──────────────┘    └─────────────┘
                            │
                            ▼
                   ┌──────────────┐    ┌─────────────┐
                   │     EC2      │───▶│     RDS     │
                   │ (Backend +   │    │   MySQL     │
                   │   Nginx)     │    │ (Database)  │
                   └──────────────┘    └─────────────┘
```

### Technology Stack
- **Frontend**: React + Vite → S3 Static Hosting + EC2/Nginx
- **Backend**: Spring Boot → EC2 with systemd service
- **Database**: MySQL → RDS with automated backups
- **Reverse Proxy**: Nginx with SSL termination
- **CI/CD**: GitHub Actions with environment-based deployment

## 📊 Monitoring & Health Checks

### Application Health
```bash
# Backend health
curl https://your-domain.com/api/actuator/health

# Frontend availability  
curl https://your-domain.com/

# Database connectivity
curl https://your-domain.com/api/actuator/health/db
```

### Log Monitoring
```bash
# Development logs
tail -f backend/logs/figma-app-dev.log

# Production logs (on EC2)
tail -f /var/log/figma-app/application.log
```

## API Endpoints

The backend provides the following REST API endpoints:

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/health` - Health check

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create new activity
- `PUT /api/activities/{id}` - Update activity
- `DELETE /api/activities/{id}` - Delete activity

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Interactions
- `GET /api/interactions` - Get recent interactions
- `POST /api/interactions` - Create new interaction

### Analytics
- `GET /api/analytics` - Get application analytics

## Development

### Frontend Development
```bash
cd frontend
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
```

### Backend Development
```bash
cd backend
./mvnw spring-boot:run    # Start development server
./mvnw test              # Run tests
./mvnw clean package     # Build for production
```

## Configuration

### Frontend Configuration
- API proxy is configured in `frontend/package.json` to point to `http://localhost:5001/api`
- Environment-specific configurations can be added using `.env` files

### Backend Configuration
- Database and application settings are in `backend/src/main/resources/application.yml`
- JWT secret and expiration can be configured
- CORS settings allow frontend integration

## Features

- **User Authentication** - JWT-based secure authentication
- **Activity Management** - Create, update, and track project activities
- **Event Scheduling** - Manage project events and deadlines
- **User Interaction Tracking** - Monitor user engagement
- **Analytics Dashboard** - View project and user statistics
- **Responsive Design** - Mobile-friendly interface
- **Real-time Updates** - Dynamic content updates

## Production Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the 'build' directory to your web server
```

### Backend Deployment
```bash
cd backend
./mvnw clean package
# Deploy the JAR file from 'target' directory
java -jar target/figma-web-app-backend-1.0.0.jar
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the individual README files in frontend and backend directories for more details.

## Support

For support and questions:
- Check the individual README files in `frontend/` and `backend/` directories
- Review the API documentation
- Check application logs for troubleshooting

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: Single Page Application (SPA) built with React
- **Backend**: RESTful API built with Spring Boot
- **Database**: MySQL for persistent data storage
- **Authentication**: JWT tokens for stateless authentication
- **Communication**: HTTP/REST API between frontend and backend

This architecture provides scalability, maintainability, and separation of concerns between the presentation layer (React) and business logic layer (Spring Boot).