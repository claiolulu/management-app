package com.figma.webapp.config;

import java.util.List;

import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final Environment env;

    public WebConfig(Environment env) {
        this.env = env;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Read from application-*.yml: cors.allowed-origins (List<String>) and cors.allow-credentials (boolean)
        List<String> allowedOrigins = Binder.get(env)
                .bind("cors.allowed-origins", Bindable.listOf(String.class))
                .orElse(List.of("*"));
        boolean allowCredentials = env.getProperty("cors.allow-credentials", Boolean.class, Boolean.TRUE);

        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(allowCredentials)
                .maxAge(3600L);
    }
}
