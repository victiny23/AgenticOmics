package com.agenticomics.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    // CORS is handled by the API Gateway
    // No CORS configuration needed here to avoid duplication
    
    // Profile photos are now served through secure endpoints only
    // No public static resource handlers for user data
} 