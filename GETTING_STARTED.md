# Getting Started with AgenticOmics

This guide will help you set up and start developing the AgenticOmics platform.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** (v20.10+)
- **Java 17+** (OpenJDK or Oracle JDK)
- **Maven 3.8+**
- **Node.js 18+** and **npm 9+**
- **Python 3.9+** and **pip**
- **Git**

## 🚀 Quick Setup

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your specific configurations
# At minimum, set your OpenAI API key for AI features
```

### 2. Initial Setup

```bash
# Run the setup command to install all dependencies
make setup

# This will:
# - Install Java dependencies (Maven)
# - Install Node.js dependencies (npm)
# - Install Python dependencies (pip)
# - Start infrastructure services (databases, message queue)
```

### 3. Start Development Environment

```bash
# Start all services
make dev

# Or start services individually:
make dev-backend    # Java services only
make dev-frontend   # React applications only
make dev-python     # Python AI services only
```

## 🏗️ Development Workflow

### Backend Development (Java)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Build and test**
   ```bash
   mvn clean install
   mvn test
   ```

3. **Start individual services** (in separate terminals)
   ```bash
   # Core service
   cd core && mvn spring-boot:run

   # Auth service
   cd auth && mvn spring-boot:run

   # Data management service
   cd data-management && mvn spring-boot:run
   ```

### Frontend Development (React)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   # Start both web app and admin panel
   npm run dev

   # Or start individually
   npm run dev:web-app      # Main user interface
   npm run dev:admin-panel  # Admin interface
   ```

### Python Services Development

1. **Navigate to python-services directory**
   ```bash
   cd python-services
   ```

2. **Create virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start individual agents**
   ```bash
   # Chat agent
   cd agents/chat-agent && python main.py

   # Pipeline agent
   cd agents/pipeline-agent && python main.py
   ```

## 🔧 Service URLs

Once all services are running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3000 | Main user interface |
| Admin Panel | http://localhost:3001 | Administrative interface |
| API Gateway | http://localhost:8080 | Backend API endpoint |
| Auth Service | http://localhost:8081 | Authentication service |
| Data Management | http://localhost:8082 | Data upload/management |
| Pipeline Engine | http://localhost:8083 | Pipeline orchestration |
| Chat Agent | http://localhost:8000 | AI chat service |
| Pipeline Agent | http://localhost:8001 | Pipeline AI service |
| Grafana | http://localhost:3002 | Monitoring dashboard |
| RabbitMQ Management | http://localhost:15672 | Message queue management |

## 🧪 Testing

### Run All Tests
```bash
make test
```

### Run Specific Test Suites
```bash
make test-backend   # Java unit tests
make test-frontend  # React component tests
make test-python    # Python service tests
```

### Manual Testing
```bash
# Backend API testing
curl http://localhost:8080/api/health

# Frontend testing
# Open browser to http://localhost:3000

# Python service testing
curl http://localhost:8000/health
```

## 📊 Monitoring

Start monitoring services:
```bash
make monitor
```

Access monitoring dashboards:
- **Grafana**: http://localhost:3002 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🗄️ Database Management

### Access Databases
```bash
# PostgreSQL
docker-compose exec postgres psql -U agenticomics -d agenticomics

# MongoDB
docker-compose exec mongodb mongo -u agenticomics -p agenticomics_password agenticomics

# Redis
docker-compose exec redis redis-cli
```

### Run Migrations
```bash
make db-migrate
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using a port
   lsof -i :8080
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Docker issues**
   ```bash
   # Clean up Docker resources
   make clean
   
   # Rebuild containers
   make build
   ```

3. **Database connection issues**
   ```bash
   # Restart database services
   docker-compose restart postgres mongodb redis
   ```

4. **Permission issues**
   ```bash
   # Fix data directory permissions
   sudo chown -R $USER:$USER data/
   ```

### Logs

View service logs:
```bash
# All services
make logs

# Specific service
docker-compose logs -f web-app
docker-compose logs -f api-gateway
```

## 🔄 Development Tips

### Hot Reload
- **Frontend**: Automatic hot reload enabled
- **Backend**: Use your IDE's hot reload or Spring Boot DevTools
- **Python**: Use `--reload` flag with uvicorn for FastAPI services

### Code Quality
```bash
# Run linters
cd frontend && npm run lint
cd python-services && flake8 .

# Format code
cd frontend && npm run format
cd python-services && black .
```

### Database Seeding
```bash
# Add sample data for development
make db-seed
```

## 📚 Next Steps

1. **Read the documentation**
   - [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Understand the codebase
   - [docs/architecture/](docs/architecture/) - System architecture
   - [docs/api/](docs/api/) - API documentation

2. **Start with a simple feature**
   - Implement a basic data upload endpoint
   - Create a simple chat interface
   - Build a basic pipeline template

3. **Join the development workflow**
   - Create feature branches
   - Write tests for new features
   - Submit pull requests

## 🆘 Getting Help

- **Documentation**: Check the `docs/` directory
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

Happy coding! 🚀