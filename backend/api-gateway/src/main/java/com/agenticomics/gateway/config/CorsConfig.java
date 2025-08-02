package com.agenticomics.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${server.address:localhost}")
    private String serverAddress;

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        
        // Allow localhost and common local addresses
        corsConfig.addAllowedOrigin("http://localhost:3000");
        corsConfig.addAllowedOrigin("http://127.0.0.1:3000");
        
        // If server address is not localhost, add it as allowed origin
        if (!"localhost".equals(serverAddress) && !"127.0.0.1".equals(serverAddress)) {
            corsConfig.addAllowedOrigin("http://" + serverAddress + ":3000");
        }
        
        // For development, also allow common private network ranges
        String networkMode = System.getenv("NETWORK_MODE");
        if ("enabled".equals(networkMode)) {
            // Allow private network ranges for development
            corsConfig.addAllowedOriginPattern("http://192.168.*:3000");
            corsConfig.addAllowedOriginPattern("http://10.*:3000");
            corsConfig.addAllowedOriginPattern("http://172.16.*:3000");
            corsConfig.addAllowedOriginPattern("http://172.17.*:3000");
            corsConfig.addAllowedOriginPattern("http://172.18.*:3000");
            corsConfig.addAllowedOriginPattern("http://172.19.*:3000");
            corsConfig.addAllowedOriginPattern("http://172.2*:3000");
            corsConfig.addAllowedOriginPattern("http://172.3*:3000");
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