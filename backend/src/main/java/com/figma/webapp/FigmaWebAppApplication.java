package com.figma.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class FigmaWebAppApplication {

    public static void main(String[] args) {
        // Load .env file if it exists
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMissing()
                    .load();
            
            // Set environment variables from .env file
            dotenv.entries().forEach(entry -> {
                // Only set if not already set as environment variable
                if (System.getenv(entry.getKey()) == null) {
                    // Set as system property for Spring Boot to pick up
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
            
            System.out.println("Loaded .env file successfully");
            System.out.println("DB_PASSWORD loaded: " + (dotenv.get("DB_PASSWORD") != null ? "Yes" : "No"));
            System.out.println("JWT_SECRET loaded: " + (dotenv.get("JWT_SECRET") != null ? "Yes" : "No"));
            System.out.println("ADMIN_PASSWORD loaded: " + (dotenv.get("ADMIN_PASSWORD") != null ? "Yes" : "No"));
            
        } catch (Exception e) {
            System.out.println("No .env file found or error loading it: " + e.getMessage());
        }
        
        SpringApplication.run(FigmaWebAppApplication.class, args);
    }
}