package com.agenticomics.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Profile photos are now served through secure endpoints only
    // No public static resource handlers for user data
} 