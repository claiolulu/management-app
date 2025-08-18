# Configuration Guide

This document describes all configurable values in the Figma Web App and how to set them for different environments.

## Quick Start

1. **Backend Configuration:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Frontend Configuration:**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

## Environment Variables Reference

### Backend Configuration

#### Server Settings
| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `5001` | Port for the backend server |
| `SERVER_CONTEXT_PATH` | `/api` | API context path |
| `APP_NAME` | `figma-web-app-backend` | Application name |

#### Database Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `3306` | Database port |
| `DB_NAME` | `figma_app` | Database name |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | **Required** | Database password |
| `DB_USE_SSL` | `false` | Enable SSL for database connection |
| `DB_TIMEZONE` | `UTC` | Database timezone |

#### Authentication & Security
| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | **Required** | JWT signing secret (min 64 chars) |
| `JWT_EXPIRATION_MS` | `86400000` | JWT expiration time in milliseconds |
| `ADMIN_USERNAME` | `admin` | Admin username |
| `ADMIN_PASSWORD` | **Required** | Admin password |

#### Email Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | | Email username |
| `MAIL_PASSWORD` | | Email password |
| `MAIL_SMTP_AUTH` | `true` | Enable SMTP authentication |
| `MAIL_SMTP_STARTTLS` | `true` | Enable STARTTLS |
| `EMAIL_RESET_TOKEN_EXPIRY` | `30` | Password reset token expiry (minutes) |

#### File Upload
| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_PATH` | `uploads/profiles` | File upload directory |
| `FILE_UPLOAD_DIR` | `uploads/profiles/` | Alternative upload directory |
| `MULTIPART_MAX_FILE_SIZE` | `10MB` | Maximum file size |
| `MULTIPART_MAX_REQUEST_SIZE` | `10MB` | Maximum request size |

#### CORS Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGIN_LOCALHOST_3000` | `http://localhost:3000` | Development frontend |
| `CORS_ORIGIN_LOCALHOST_5173` | `http://localhost:5173` | Vite dev server |
| `CORS_ORIGIN_PROD` | Production URL | Production frontend |
| `CORS_ALLOW_CREDENTIALS` | `true` | Allow credentials in CORS |

#### Logging
| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL_APP` | `DEBUG` | Application log level |
| `LOG_LEVEL_SECURITY` | `DEBUG` | Security log level |
| `LOG_LEVEL_WEB` | `DEBUG` | Web log level |
| `LOG_FILE` | `logs/figma-app.log` | Log file location |

### Frontend Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5001/api` | Backend API URL |

## Environment-Specific Setup

### Development Environment

**Backend (.env.dev):**
```env
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_PASSWORD=your_dev_password
LOG_LEVEL_APP=DEBUG
SPRING_PROFILES_ACTIVE=dev
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5001/api
```

### Production Environment

**Backend (.env.prod):**
```env
FRONTEND_URL=https://your-production-domain.com
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_USE_SSL=true
LOG_LEVEL_APP=INFO
SPRING_PROFILES_ACTIVE=prod
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.your-production-domain.com/api
```

## Deployment Scripts

### Backend Startup
```bash
# Development
./start.sh dev

# Production
./start.sh prod

# Test
./start.sh test
```

### Environment Validation

The startup script validates required variables:
- `DB_PASSWORD`
- `JWT_SECRET`
- `ADMIN_PASSWORD`

## Security Considerations

1. **Never commit .env files** - They contain sensitive information
2. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, symbols
3. **JWT Secret** - Minimum 64 characters, cryptographically random
4. **Database SSL** - Always enable in production (`DB_USE_SSL=true`)
5. **CORS Origins** - Restrict to known domains only

## Docker Configuration

When using Docker, pass environment variables using:
```bash
docker run -e DB_PASSWORD=secret -e JWT_SECRET=verylongsecret ...
```

Or use an environment file:
```bash
docker run --env-file .env.prod ...
```

## Troubleshooting

### Common Issues

1. **Application won't start**: Check required environment variables
2. **Database connection failed**: Verify DB_* variables
3. **CORS errors**: Check CORS_ORIGIN_* variables match frontend URL
4. **Email not working**: Verify MAIL_* configuration

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL_APP=DEBUG
LOG_LEVEL_SECURITY=DEBUG
LOG_LEVEL_WEB=DEBUG
```

### Health Check

Monitor application health:
- Development: `http://localhost:5001/api/actuator/health`
- Production: `https://api.yourdomain.com/api/actuator/health`
