# AgenticOmics Backend Setup Guide

## Overview
The AgenticOmics backend is now successfully set up as a microservices architecture using Spring Boot and Spring Cloud. All services can be built and run independently.

## Architecture

### Microservices Structure
```
backend/
├── pom.xml                    # Parent POM with dependency management
├── core/                      # Shared utilities and common components
├── auth/                      # Authentication and authorization service
├── data-management/           # Data upload and management service
├── pipeline-engine/           # Pipeline execution and workflow management
├── api-gateway/               # API Gateway for routing and load balancing
└── notification/              # Notification and messaging service
```

### Service Ports
- **API Gateway**: 8080 (main entry point)
- **Authentication Service**: 8081
- **Data Management Service**: 8082
- **Pipeline Engine**: 8083
- **Notification Service**: 8084

## Current Status ✅

### Completed
- [x] Maven multi-module project structure
- [x] All 6 microservice modules with proper POMs
- [x] Spring Boot application classes for each service
- [x] Basic Spring Security configuration
- [x] H2 in-memory database for development
- [x] Spring Cloud Gateway routing configuration
- [x] Successful compilation and installation of all modules
- [x] Authentication service tested and running

### Technologies Integrated
- **Spring Boot 3.1.5** - Main framework
- **Spring Cloud 2022.0.4** - Microservices infrastructure
- **Spring Security 6.1.5** - Authentication and authorization
- **Spring Data JPA** - Database access
- **H2 Database** - Development database
- **Spring Cloud Gateway** - API routing
- **JWT** - Token-based authentication
- **PostgreSQL** - Production database support
- **Docker & Kubernetes** - Container orchestration support
- **AWS S3** - File storage integration
- **RabbitMQ** - Message queuing

## Running the Services

### Prerequisites
- Java 17+
- Maven 3.8+

### Build All Services
```bash
cd backend
mvn clean install -DskipTests
```

### Run Individual Services

#### Authentication Service
```bash
cd backend/auth
mvn spring-boot:run
```
Service will be available at: http://localhost:8081

#### API Gateway
```bash
cd backend/api-gateway
mvn spring-boot:run
```
Service will be available at: http://localhost:8080

#### Other Services
```bash
# Data Management
cd backend/data-management && mvn spring-boot:run

# Pipeline Engine
cd backend/pipeline-engine && mvn spring-boot:run

# Notification Service
cd backend/notification && mvn spring-boot:run
```

## Development Database

### H2 Console Access
When running the auth service, you can access the H2 database console at:
- URL: http://localhost:8081/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: `password`

## API Gateway Routes

The API Gateway is configured to route requests to appropriate services:
- `/api/auth/**` → Authentication Service (port 8081)
- `/api/data/**` → Data Management Service (port 8082)
- `/api/pipeline/**` → Pipeline Engine (port 8083)
- `/api/notifications/**` → Notification Service (port 8084)

## Next Steps

### Immediate Development Tasks
1. **Add REST Controllers** to each service
2. **Implement JWT Authentication** flow
3. **Create Database Entities** and repositories
4. **Add API Documentation** with Swagger/OpenAPI
5. **Implement Service-to-Service Communication**

### Authentication Service
```java
// Example controller to add
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        // Implement login logic
    }
    
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        // Implement registration logic
    }
}
```

### Data Management Service
```java
// Example controller to add
@RestController
@RequestMapping("/api/data")
public class DataController {
    
    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadData(@RequestParam("file") MultipartFile file) {
        // Implement file upload logic
    }
    
    @GetMapping("/datasets")
    public ResponseEntity<List<Dataset>> getDatasets() {
        // Implement dataset listing
    }
}
```

### Pipeline Engine Service
```java
// Example controller to add
@RestController
@RequestMapping("/api/pipeline")
public class PipelineController {
    
    @PostMapping("/execute")
    public ResponseEntity<PipelineExecution> executePipeline(@RequestBody PipelineRequest request) {
        // Implement pipeline execution
    }
    
    @GetMapping("/status/{id}")
    public ResponseEntity<PipelineStatus> getPipelineStatus(@PathVariable String id) {
        // Implement status checking
    }
}
```

### Configuration Improvements
1. **External Configuration** - Move to application-{profile}.yml files
2. **Service Discovery** - Enable Eureka when needed
3. **Load Balancing** - Configure client-side load balancing
4. **Circuit Breakers** - Add resilience patterns
5. **Monitoring** - Add Actuator endpoints and metrics

### Production Readiness
1. **Replace H2** with PostgreSQL
2. **Add Docker Compose** for local development
3. **Kubernetes Manifests** for deployment
4. **CI/CD Pipeline** setup
5. **Security Hardening** and HTTPS
6. **Logging and Monitoring** integration

## Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### Service Health Checks
```bash
# Check if services are running
curl http://localhost:8081/actuator/health  # Auth service
curl http://localhost:8080/actuator/health  # API Gateway
```

## Troubleshooting

### Common Issues
1. **Port Conflicts** - Ensure ports 8080-8084 are available
2. **Maven Dependencies** - Run `mvn clean install` if dependencies are missing
3. **Java Version** - Ensure Java 17+ is being used
4. **Memory Issues** - Increase JVM heap size if needed: `-Xmx2g`

### Logs Location
- Application logs: Console output
- Spring Boot logs: `target/` directory in each module
- H2 Database: In-memory (lost on restart)

## Architecture Decisions

### Why Microservices?
- **Scalability**: Each service can be scaled independently
- **Technology Diversity**: Different services can use different technologies
- **Team Independence**: Teams can work on services independently
- **Fault Isolation**: Failure in one service doesn't bring down the entire system

### Why Spring Cloud?
- **Service Discovery**: Automatic service registration and discovery
- **Load Balancing**: Client-side load balancing
- **Circuit Breakers**: Fault tolerance patterns
- **Configuration Management**: Centralized configuration
- **API Gateway**: Single entry point for all requests

This backend infrastructure provides a solid foundation for building the AgenticOmics platform with proper separation of concerns, scalability, and maintainability.