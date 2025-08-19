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

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String origin = request.getHeader("Origin");
        String method = request.getMethod();
        
        // Log for debugging
        System.out.println("🔍 CORS Filter - Origin: " + origin + ", Method: " + method);
        
        // Always set CORS headers for allowed origins
        if (origin != null && (
                origin.equals("https://gcgcm-fe.s3.eu-north-1.amazonaws.com") ||
                origin.equals("https://gcgcm-fe.s3-website.eu-north-1.amazonaws.com") ||
                origin.equals("http://localhost:3000") ||
                origin.equals("http://localhost:5173") ||
                origin.matches("https://.*\\.amazonaws\\.com")
        )) {
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
        if ("OPTIONS".equalsIgnoreCase(method)) {
            if (origin != null && (
                    origin.equals("https://gcgcm-fe.s3.eu-north-1.amazonaws.com") ||
                    origin.equals("https://gcgcm-fe.s3-website.eu-north-1.amazonaws.com") ||
                    origin.equals("http://localhost:3000") ||
                    origin.equals("http://localhost:5173") ||
                    origin.matches("https://.*\\.amazonaws\\.com")
            )) {
                System.out.println("✅ CORS Filter - Handling OPTIONS preflight");
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
                return;
            }
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
