#!/bin/bash

# Script to load environment variables from .env file and run the Spring Boot application

# Check if .env file exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    
    # Export variables from .env file
    export $(grep -v '^#' .env | xargs)
    
    echo "Environment variables loaded:"
    echo "DB_PASSWORD: ${DB_PASSWORD:+Set}"
    echo "JWT_SECRET: ${JWT_SECRET:+Set}"
    echo "ADMIN_PASSWORD: ${ADMIN_PASSWORD:+Set}"
else
    echo "Warning: .env file not found. Using system environment variables."
fi

# Run the Spring Boot application
echo "Starting Spring Boot application..."
./mvnw spring-boot:run
