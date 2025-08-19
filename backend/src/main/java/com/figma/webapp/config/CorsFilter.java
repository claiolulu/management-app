package com.figma.webapp.config;

import java.io.IOException;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(1)
public class CorsFilter implements Filter {

    /**
     * Helper method to check if an origin is allowed.
     * Uses centralized constants from CorsConstants to eliminate redundancy.
     */
    private boolean isOriginAllowed(String origin) {
        if (origin == null) return false;
        
        // Check exact matches first using centralized constants
        if (CorsConstants.ALLOWED_ORIGINS.contains(origin)) {
            return true;
        }
        
        // Check AWS pattern as fallback
        return origin.matches(CorsConstants.AWS_PATTERN);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String origin = request.getHeader("Origin");
        String method = request.getMethod();
        
        // Log for debugging (can be removed once stable)
        System.out.println("🔍 CORS Filter - Origin: " + origin + ", Method: " + method);
        
        // Set CORS headers for allowed origins
        if (isOriginAllowed(origin)) {
            System.out.println("✅ CORS Filter - Origin allowed, setting headers");
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Origin, X-Requested-With");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Max-Age", "3600");
        } else {
            System.out.println("❌ CORS Filter - Origin NOT allowed: " + origin);
        }

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(method) && isOriginAllowed(origin)) {
            System.out.println("✅ CORS Filter - Handling OPTIONS preflight");
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
