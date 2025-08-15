# Figma Web App

A modern web application built with React frontend and Spring Boot backend, providing a comprehensive platform for design collaboration and project management.

## Project Structure

```
figma-web-app/
├── frontend/          # React frontend application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── README.md     # Frontend documentation
├── backend/          # Spring Boot backend application
│   ├── src/          # Java source code
│   ├── pom.xml       # Maven dependencies
│   └── README.md     # Backend documentation
└── README.md         # This file
```

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Create React App** - Build tooling and development server

### Backend
- **Spring Boot 3.2.1** - Enterprise Java framework
- **Spring Security** - Authentication and authorization with JWT
- **Spring Data JPA** - Database ORM with Hibernate
- **MySQL 8.0** - Relational database
- **Maven** - Build tool and dependency management

## Quick Start

### Prerequisites
- **Node.js 16+** and **npm** (for frontend)
- **Java 17+** and **Maven 3.6+** (for backend)
- **MySQL 8.0+** (for database)

### 1. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE figma_app;
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Build and run the Spring Boot application
./mvnw spring-boot:run

# Or build JAR and run
./mvnw clean package
java -jar target/figma-web-app-backend-1.0.0.jar
```

The backend will start on **http://localhost:5001/api**

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on **http://localhost:3000**

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