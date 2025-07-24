# AgenticOmics Backend Services

## Quick Start

### ❌ Don't do this (from backend directory):
```bash
# This will fail because parent POM has no main class
mvn spring-boot:run
```

### ✅ Do this instead:

#### Option 1: Use the convenience script (Recommended)
```bash
# From project root directory
./run-services.sh auth          # Run authentication service
./run-services.sh gateway       # Run API gateway
./run-services.sh all           # Run all services
./run-services.sh --help        # Show all options
```

#### Option 2: Run individual services manually
```bash
# Authentication Service (port 8081)
cd backend/auth
mvn spring-boot:run

# API Gateway (port 8080)
cd backend/api-gateway
mvn spring-boot:run

# Data Management Service (port 8082)
cd backend/data-management
mvn spring-boot:run

# Pipeline Engine Service (port 8083)
cd backend/pipeline-engine
mvn spring-boot:run

# Notification Service (port 8084)
cd backend/notification
mvn spring-boot:run
```

## Build All Services First

Before running any service, build all modules:
```bash
cd backend
mvn clean install -DskipTests
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 8080 | http://localhost:8080 |
| Authentication | 8081 | http://localhost:8081 |
| Data Management | 8082 | http://localhost:8082 |
| Pipeline Engine | 8083 | http://localhost:8083 |
| Notification | 8084 | http://localhost:8084 |

## Architecture

```
backend/
├── pom.xml                    # Parent POM (NOT executable)
├── core/                      # Shared utilities
├── auth/                      # Authentication service ✅ Executable
├── data-management/           # Data management service ✅ Executable
├── pipeline-engine/           # Pipeline engine service ✅ Executable
├── api-gateway/               # API Gateway service ✅ Executable
└── notification/              # Notification service ✅ Executable
```

## Troubleshooting

### Error: "Unable to find a suitable main class"
This happens when you try to run `mvn spring-boot:run` from the parent `backend` directory. The parent POM is just a container - run individual services instead.

### Port Already in Use
If you get port conflicts, check what's running:
```bash
lsof -i :8080  # Check what's using port 8080
pkill -f "spring-boot:run"  # Kill all Spring Boot processes
```

### Build Failures
Clean and rebuild:
```bash
cd backend
mvn clean install -DskipTests
```