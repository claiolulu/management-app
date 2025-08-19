package com.figma.webapp.config;

import java.util.Arrays;
import java.util.List;

/**
 * Centralized CORS configuration constants to eliminate redundancy
 * across multiple CORS configuration points.
 */
public final class CorsConstants {
    
    /**
     * List of allowed origins for CORS requests.
     * Centralized to avoid duplication between CorsFilter and SecurityConfig.
     */
    public static final List<String> ALLOWED_ORIGINS = Arrays.asList(
        "https://gcgcm-fe.s3.eu-north-1.amazonaws.com",
        "https://gcgcm-fe.s3-website.eu-north-1.amazonaws.com", 
        "http://localhost:3000",
        "http://localhost:5173"
    );
    
    /**
     * AWS pattern for broader AWS service compatibility.
     * Used as fallback pattern for AWS-hosted services.
     */
    public static final String AWS_PATTERN = "https://*.amazonaws.com";
    
    /**
     * List of allowed HTTP methods for CORS requests.
     */
    public static final List<String> ALLOWED_METHODS = Arrays.asList(
        "GET", "POST", "PUT", "DELETE", "OPTIONS"
    );
    
    /**
     * List of allowed headers for CORS requests.
     */
    public static final List<String> ALLOWED_HEADERS = Arrays.asList("*");
    
    /**
     * Maximum age for preflight cache in seconds (1 hour).
     */
    public static final long MAX_AGE = 3600L;
    
    private CorsConstants() {
        // Utility class - prevent instantiation
    }
}
