package com.figma.webapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Mail configuration to provide JavaMailSender bean.
 * Mail properties are configured in application.yml under spring.mail.*
 */
@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        // Return a basic implementation
        // Spring Boot will automatically configure it using application.yml properties
        return new JavaMailSenderImpl();
    }
}
