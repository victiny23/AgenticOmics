package com.agenticomics.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000}")
    private String corsAllowedOrigins;

    @Value("${server.address:localhost}")
    private String serverAddress;

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        
        // Split the comma-separated list of allowed origins from environment variable
        if (corsAllowedOrigins != null && !corsAllowedOrigins.isEmpty()) {
            List<String> allowedOrigins = Arrays.asList(corsAllowedOrigins.split(","));
            for (String origin : allowedOrigins) {
                corsConfig.addAllowedOrigin(origin.trim());
            }
        }
        
        // Also allow localhost and common local addresses
        corsConfig.addAllowedOrigin("http://localhost:3000");
        corsConfig.addAllowedOrigin("http://localhost:12000");
        corsConfig.addAllowedOrigin("http://127.0.0.1:3000");
        corsConfig.addAllowedOrigin("http://127.0.0.1:12000");
        
        // If server address is not localhost, add it as allowed origin
        if (!"localhost".equals(serverAddress) && !"127.0.0.1".equals(serverAddress)) {
            corsConfig.addAllowedOrigin("http://" + serverAddress + ":3000");
            corsConfig.addAllowedOrigin("http://" + serverAddress + ":12000");
        }
        
        // For development, also allow common private network ranges
        String networkMode = System.getenv("NETWORK_MODE");
        if ("enabled".equals(networkMode) || "true".equals(System.getenv("EXTERNAL_MODE"))) {
            // Allow private network ranges for development
            corsConfig.addAllowedOriginPattern("http://192.168.*:*");
            corsConfig.addAllowedOriginPattern("http://10.*:*");
            corsConfig.addAllowedOriginPattern("https://*.prod-runtime.all-hands.dev");
            corsConfig.addAllowedOriginPattern("http://0.0.0.0:*");
        }
        
        corsConfig.addAllowedHeader("*");
        corsConfig.addAllowedMethod("GET");
        corsConfig.addAllowedMethod("POST");
        corsConfig.addAllowedMethod("PUT");
        corsConfig.addAllowedMethod("DELETE");
        corsConfig.addAllowedMethod("OPTIONS");
        corsConfig.addAllowedMethod("PATCH");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}