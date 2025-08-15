# Figma Web App - Spring Boot Backend

This is the Spring Boot backend for the Figma Web App, migrated from Node.js/Express to provide better scalability, type safety, and enterprise-grade features.

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** (Database ORM)
- **MySQL 8.0** (Database)
- **Maven** (Build Tool)
- **JWT** (JSON Web Tokens for authentication)

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Java 17** or higher
2. **Maven 3.6+**
3. **MySQL 8.0+**

## Database Setup

1. Install and start MySQL server
2. Create a database named `figma_app`:
   ```sql
   CREATE DATABASE figma_app;
   ```
3. Update database credentials in `src/main/resources/application.yml` if needed:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/figma_app?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
       username: root
       password: dak123456  # Update with your MySQL password
   ```

## Build and Run Instructions

### Option 1: Using Maven Wrapper (Recommended)

1. **Clone and navigate to the project directory:**
   ```bash
   cd /Users/claio/Desktop/Code/figma-web-app/spring-backend
   ```

2. **Build the project:**
   ```bash
   ./mvnw clean compile
   ```

3. **Run tests:**
   ```bash
   ./mvnw test
   ```

4. **Package the application:**
   ```bash
   ./mvnw clean package
   ```

5. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```

### Option 2: Using System Maven

1. **Build the project:**
   ```bash
   mvn clean compile
   ```

2. **Run tests:**
   ```bash
   mvn test
   ```

3. **Package the application:**
   ```bash
   mvn clean package
   ```

4. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

### Option 3: Running the JAR file

1. **Build the JAR:**
   ```bash
   ./mvnw clean package
   ```

2. **Run the JAR:**
   ```bash
   java -jar target/figma-web-app-1.0.0.jar
   ```

## Application Configuration

The application runs on **port 5001** with context path `/api`. You can access:

- **Health Check:** http://localhost:5001/api/health
- **API Base URL:** http://localhost:5001/api

### Key Configuration Properties

```yaml
server:
  port: 5001
  servlet:
    context-path: /api

jwt:
  secret: mySecretKey123456789012345678901234567890
  expiration: 86400000 # 24 hours

cors:
  allowed-origins: 
    - http://localhost:3000
    - http://localhost:3001
```

## API Endpoints

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
- `GET /api/activities/status/{status}` - Get activities by status

### Events
- `GET /api/events` - Get all events
- `GET /api/events?date=YYYY-MM-DD` - Get events by date
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Interactions
- `GET /api/interactions` - Get recent interactions
- `POST /api/interactions` - Create new interaction
- `GET /api/interactions/type/{type}` - Get interactions by type

### Analytics
- `GET /api/analytics` - Get application analytics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Sample API Usage

### Register a new user:
```bash
curl -X POST http://localhost:5001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Create an activity (requires authentication):
```bash
curl -X POST http://localhost:5001/api/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "assignedUser": "testuser",
    "date": "2024-01-20",
    "description": "Complete project documentation",
    "status": "PENDING",
    "priority": "HIGH"
  }'
```

## Development

### Project Structure
```
src/
├── main/
│   ├── java/com/figma/webapp/
│   │   ├── FigmaWebAppApplication.java     # Main application class
│   │   ├── config/                         # Configuration classes
│   │   ├── controller/                     # REST controllers
│   │   ├── dto/                           # Data Transfer Objects
│   │   ├── entity/                        # JPA entities
│   │   ├── exception/                     # Exception handling
│   │   ├── repository/                    # Data repositories
│   │   ├── security/                      # Security configuration
│   │   └── service/                       # Business logic services
│   └── resources/
│       ├── application.yml                # Application configuration
│       └── data.sql                       # Sample data
└── test/                                  # Test classes
```

### Key Features Implemented

1. **JWT Authentication** - Secure token-based authentication
2. **CORS Configuration** - Cross-origin resource sharing for frontend integration
3. **Input Validation** - Request validation using Bean Validation
4. **Exception Handling** - Global exception handling with proper HTTP status codes
5. **Database Integration** - MySQL integration with JPA/Hibernate
6. **Sample Data** - Pre-populated sample data for testing
7. **Logging** - Comprehensive logging configuration
8. **Health Checks** - Application health monitoring endpoints

## Migration from Node.js

This Spring Boot backend maintains API compatibility with the original Node.js/Express backend while providing:

- **Better Type Safety** with Java's strong typing
- **Enterprise Features** with Spring ecosystem
- **Improved Security** with Spring Security
- **Better Performance** with JVM optimizations
- **Easier Testing** with Spring Test framework
- **Production Ready** with Spring Boot Actuator

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Ensure MySQL is running
   - Check database credentials in `application.yml`
   - Verify database exists

2. **Port Already in Use:**
   - Change port in `application.yml`
   - Kill process using the port: `lsof -ti:5001 | xargs kill -9`

3. **JWT Token Issues:**
   - Ensure JWT secret is properly configured
   - Check token expiration time
   - Verify Authorization header format

### Logs

Application logs are written to:
- Console output
- `logs/figma-app.log` file

Set logging level in `application.yml` for debugging:
```yaml
logging:
  level:
    com.figma.webapp: DEBUG
```

## Production Deployment

For production deployment:

1. **Update application.yml** with production database credentials
2. **Change JWT secret** to a secure random string
3. **Enable HTTPS** in production
4. **Configure proper CORS** origins
5. **Set up monitoring** with Spring Boot Actuator
6. **Use environment variables** for sensitive configuration

## Support

For issues or questions, please check the application logs and ensure all prerequisites are properly installed and configured.