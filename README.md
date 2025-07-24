# AgenticOmics Platform

<img width="360" height="360" alt="image" src="https://github.com/user-attachments/assets/303a2f6e-18a2-47e1-b0e5-281a86b6551a" />

AgenticOmics is an AI-powered platform designed to democratize omics data analysis for non-coder users, including graduate students, lab technicians, and professors. The platform enables users to upload, manage, and analyze experimental data through intuitive interfaces powered by Agentic AI.

## 🚀 Features

- **Intuitive Data Management**: Upload and organize omics data with automated metadata extraction
- **AI-Powered Chat Interface**: Interact with AI agents to get analysis recommendations and insights
- **Drag-and-Drop Pipeline Builder**: Create complex analysis workflows without coding
- **Pre-built Analysis Templates**: Ready-to-use pipelines for common omics analyses
- **Real-time Collaboration**: Share datasets and pipelines with team members
- **Comprehensive Visualization**: Interactive plots and reports for analysis results
- **Scalable Infrastructure**: Microservices architecture supporting high-throughput analysis

## 🏗️ Architecture

The platform follows a modern microservices architecture:

- **Backend**: Java-based services using Spring Boot
- **Frontend**: React-based web applications with TypeScript
- **AI/ML Services**: Python-based agents and models
- **Infrastructure**: Docker containers orchestrated with Kubernetes
- **Databases**: PostgreSQL (relational), MongoDB (documents), Redis (cache)
- **Message Queue**: RabbitMQ for asynchronous processing

## 📁 Project Structure

```
AgenticOmics/
├── backend/                    # Java microservices
│   ├── core/                  # Core business logic
│   ├── auth/                  # Authentication service
│   ├── data-management/       # Data upload and management
│   ├── pipeline-engine/       # Pipeline orchestration
│   ├── api-gateway/          # API gateway and routing
│   └── notification/         # Notification service
├── frontend/                  # Web applications
│   ├── web-app/              # Main user interface
│   ├── admin-panel/          # Administrative interface
│   └── shared/               # Shared components
├── python-services/          # AI/ML components
│   ├── agents/               # AI agents (chat, pipeline, data, analysis)
│   ├── models/               # ML models (LLM, analysis, prediction)
│   ├── pipelines/            # Data processing pipelines
│   ├── data-processors/      # Data processing utilities
│   └── ml-engine/            # ML infrastructure
├── infrastructure/           # Deployment and operations
│   ├── docker/               # Docker configurations
│   ├── kubernetes/           # K8s manifests and Helm charts
│   ├── terraform/            # Infrastructure as code
│   └── monitoring/           # Monitoring and observability
├── data/                     # Data storage structure
├── config/                   # Configuration management
├── scripts/                  # Automation scripts
├── docs/                     # Documentation
└── tests/                    # Testing suites
```

For detailed structure information, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

## 🛠️ Technology Stack

### Backend (Java)
- **Framework**: Spring Boot 3.1+
- **Security**: Spring Security with JWT
- **Data**: Spring Data JPA, Spring Data MongoDB
- **Messaging**: Spring AMQP (RabbitMQ)
- **API**: OpenAPI 3.0 (Swagger)

### Frontend (TypeScript/React)
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI or Ant Design
- **State Management**: Redux Toolkit or Zustand
- **Build Tool**: Vite or Create React App
- **Testing**: Jest, React Testing Library

### Python Services
- **API Framework**: FastAPI
- **AI/ML**: OpenAI, LangChain, Transformers
- **Data Science**: NumPy, Pandas, Scikit-learn
- **Bioinformatics**: BioPython, PySAM, Scanpy
- **Task Queue**: Celery with Redis/RabbitMQ

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **Databases**: PostgreSQL, MongoDB, Redis
- **Message Queue**: RabbitMQ
- **Monitoring**: Prometheus, Grafana, ELK Stack

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17+
- Node.js 18+
- Python 3.9+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/AgenticOmics.git
   cd AgenticOmics
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis mongodb rabbitmq
   ```

3. **Backend Development**
   ```bash
   cd backend
   mvn clean install
   # Start individual services or use your IDE
   ```

4. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Python Services Development**
   ```bash
   cd python-services
   pip install -r requirements.txt
   # Start individual services
   ```

### Using Docker Compose (Recommended for full stack)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access the applications:
- **Main Web App**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **API Gateway**: http://localhost:8080
- **Grafana Dashboard**: http://localhost:3002 (admin/admin)
- **RabbitMQ Management**: http://localhost:15672 (agenticomics/agenticomics_password)

## 📚 Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Detailed folder structure explanation
- [API Documentation](docs/api/) - REST API documentation
- [User Guide](docs/user-guide/) - End-user documentation
- [Developer Guide](docs/developer-guide/) - Development setup and guidelines
- [Architecture](docs/architecture/) - System architecture documentation

## 🧪 Testing

```bash
# Backend tests
cd backend && mvn test

# Frontend tests
cd frontend && npm test

# Python service tests
cd python-services && pytest

# Integration tests
cd tests/integration && ./run-tests.sh

# End-to-end tests
cd tests/e2e && npm test
```

## 🚀 Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Using Kubernetes
kubectl apply -f infrastructure/kubernetes/manifests/

# Using Helm
helm install agenticomics infrastructure/kubernetes/helm-charts/agenticomics/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join our GitHub Discussions for questions and ideas

## 🗺️ Roadmap

- [ ] Core platform infrastructure
- [ ] Basic data upload and management
- [ ] AI chat interface
- [ ] Drag-and-drop pipeline builder
- [ ] Pre-built omics analysis templates
- [ ] Advanced visualization capabilities
- [ ] Multi-tenant support
- [ ] Cloud deployment options

---

**AgenticOmics** - Democratizing omics data analysis through AI-powered automation.