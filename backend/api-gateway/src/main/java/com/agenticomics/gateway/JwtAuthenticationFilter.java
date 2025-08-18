package com.agenticomics.gateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Skip authentication for public endpoints
        if (path.startsWith("/api/auth/register") || 
            path.startsWith("/api/auth/login") || 
            path.startsWith("/api/auth/forgot-password") ||
            path.startsWith("/api/auth/reset-password") ||
            path.startsWith("/api/auth/public/") ||
            path.startsWith("/api/auth/check-file-deletion-permission") ||
            path.startsWith("/api/auth/check-lab-file-access") ||
            path.startsWith("/api/auth/check-team-file-access") ||
            path.startsWith("/api/auth/labs/my-lab-members") ||
            path.startsWith("/api/auth/labs/") ||
            path.startsWith("/api/auth/teams/") ||
            path.startsWith("/api/auth/admin/users/all-with-organizations") ||
            path.startsWith("/api/auth/admin/users/") ||
            path.startsWith("/api/auth/admin/system/") ||
            path.startsWith("/uploads/") ||
            path.startsWith("/api/data/health")) {
            return chain.filter(exchange);
        }
        
        // Special handling for photo endpoint - allow without authentication for now
        // The backend will handle authentication based on the filename
        if (path.startsWith("/api/auth/profile/photo/")) {
            // Allow the request to pass through - backend will handle authentication
            return chain.filter(exchange);
        }
        
        // Special handling for sensitive profile endpoint - allow with X-Username header
        if (path.startsWith("/api/auth/profile/sensitive")) {
            List<String> usernameHeaders = request.getHeaders().get("X-Username");
            if (usernameHeaders != null && !usernameHeaders.isEmpty()) {
                // Allow the request to pass through with X-Username header
                return chain.filter(exchange);
            }
        }

        // Get Authorization header
        List<String> authHeaders = request.getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (authHeaders == null || authHeaders.isEmpty()) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String authHeader = authHeaders.get(0);
        if (!authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        // Validate JWT token
        if (!jwtUtil.validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Extract user information and add to headers
        String username = jwtUtil.extractUsername(token);
        String userId = jwtUtil.extractUserId(token);

        // Create new request with user information in headers
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Id", userId)
                .header("X-Username", username)
                .header("X-Authenticated", "true")
                .build();

        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }

    @Override
    public int getOrder() {
        return -100; // High priority filter
    }
} 