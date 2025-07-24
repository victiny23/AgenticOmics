# AgenticOmics Platform - Project Structure

## Overview
This platform enables non-coder users (graduate students, lab technicians, professors) to upload, manage, and analyze omics data through AI-powered pipelines with both chat and drag-and-drop interfaces.

## Architecture
- **Backend**: Java-based microservices architecture
- **Frontend**: Modern web application (React/Vue/Angular)
- **AI/ML**: Python-based agents and models
- **Infrastructure**: Containerized deployment with Kubernetes

## Directory Structure

### `/backend/` - Java Backend Services
Microservices architecture with Spring Boot applications:

- **`core/`** - Core business logic and shared utilities
- **`auth/`** - Authentication and authorization service
- **`data-management/`** - Data upload, storage, and metadata management
- **`pipeline-engine/`** - Pipeline orchestration and execution
- **`api-gateway/`** - API gateway and routing
- **`notification/`** - Notification and messaging service

Each service follows Maven/Gradle structure:
```
service-name/
├── src/main/java/          # Java source code
├── src/main/resources/     # Configuration files
├── src/test/java/          # Unit tests
├── target/                 # Build artifacts
└── pom.xml                 # Maven configuration
```

### `/frontend/` - Web Applications
Modern web applications for user interfaces:

- **`web-app/`** - Main user interface for researchers
  - Drag-and-drop pipeline builder
  - Data upload and management
  - AI chat interface
  - Analysis results visualization
- **`admin-panel/`** - Administrative interface
  - User management
  - System monitoring
  - Pipeline templates management
- **`shared/`** - Shared components and utilities
  - Common UI components
  - Shared types and constants
  - Utility functions

### `/python-services/` - AI/ML Components
Python-based services for AI and data processing:

- **`agents/`** - AI agents for different tasks
  - `chat-agent/` - Conversational AI for user interaction
  - `pipeline-agent/` - Pipeline recommendation and optimization
  - `data-agent/` - Data analysis and insights
  - `analysis-agent/` - Automated analysis execution
- **`models/`** - Machine learning models
  - `llm-models/` - Large language models for chat
  - `analysis-models/` - Omics-specific analysis models
  - `prediction-models/` - Predictive models for experiments
- **`pipelines/`** - Data processing pipelines
  - `omics-pipelines/` - Specialized omics analysis workflows
  - `workflow-engine/` - Pipeline execution engine
  - `pipeline-templates/` - Pre-built pipeline templates
- **`data-processors/`** - Data processing utilities
  - `parsers/` - File format parsers (FASTQ, BAM, VCF, etc.)
  - `validators/` - Data quality validation
  - `transformers/` - Data transformation utilities
  - `exporters/` - Result export utilities
- **`ml-engine/`** - Machine learning infrastructure
  - `training/` - Model training pipelines
  - `inference/` - Model inference services
  - `model-registry/` - Model versioning and management

### `/infrastructure/` - Deployment and Operations
Infrastructure as code and deployment configurations:

- **`docker/`** - Docker configurations
  - `backend/` - Dockerfiles for Java services
  - `frontend/` - Dockerfiles for web applications
  - `python-services/` - Dockerfiles for Python services
- **`kubernetes/`** - Kubernetes deployment
  - `manifests/` - Raw Kubernetes YAML files
  - `helm-charts/` - Helm charts for complex deployments
- **`terraform/`** - Infrastructure provisioning
  - `aws/` - AWS infrastructure
  - `gcp/` - Google Cloud infrastructure
  - `azure/` - Azure infrastructure
- **`monitoring/`** - Monitoring and observability
  - `prometheus/` - Metrics collection
  - `grafana/` - Dashboards and visualization
  - `elk/` - Logging (Elasticsearch, Logstash, Kibana)

### `/data/` - Data Storage Structure
Organized data storage (typically mounted volumes in production):

- **`uploads/`** - User uploaded data
  - `raw-data/` - Original experimental data files
  - `metadata/` - Associated metadata files
  - `user-files/` - User-specific files and configurations
- **`processed/`** - Processed data
  - `cleaned-data/` - Quality-controlled and cleaned data
  - `analysis-results/` - Analysis output files
  - `reports/` - Generated reports and summaries
- **`pipelines/`** - Pipeline-related data
  - `definitions/` - Pipeline configuration files
  - `executions/` - Pipeline execution logs and intermediate files
  - `logs/` - Detailed execution logs
- **`models/`** - ML model artifacts
  - `trained-models/` - Serialized trained models
  - `model-artifacts/` - Model weights, configurations
  - `checkpoints/` - Training checkpoints
- **`exports/`** - Export-ready data
  - `results/` - Formatted analysis results
  - `reports/` - Publication-ready reports
  - `visualizations/` - Generated plots and charts

### `/config/` - Configuration Management
Environment-specific configurations:

- **`environments/`** - Environment-specific settings
  - `development/` - Development environment configs
  - `staging/` - Staging environment configs
  - `production/` - Production environment configs
- **`secrets/`** - Secret management (encrypted/external)
- **`database/`** - Database schemas and migrations

### `/scripts/` - Automation Scripts
Utility scripts for various operations:

- **`deployment/`** - Deployment automation scripts
- **`database/`** - Database setup and migration scripts
- **`data-migration/`** - Data migration utilities
- **`setup/`** - Environment setup scripts

### `/docs/` - Documentation
Comprehensive documentation:

- **`api/`** - API documentation (OpenAPI/Swagger)
- **`user-guide/`** - End-user documentation
- **`developer-guide/`** - Developer setup and contribution guide
- **`architecture/`** - System architecture documentation

### `/tests/` - Testing
Different types of testing:

- **`integration/`** - Integration tests across services
- **`e2e/`** - End-to-end user workflow tests
- **`performance/`** - Performance and load testing
- **`security/`** - Security testing scripts

### `/.github/` - GitHub Configuration
GitHub-specific configurations:

- **`workflows/`** - GitHub Actions CI/CD workflows
- **`templates/`** - Issue and PR templates

## Key Features Supported by This Structure

1. **Microservices Architecture**: Each backend service can be developed, deployed, and scaled independently
2. **Multi-language Support**: Clear separation between Java backend and Python AI/ML services
3. **Scalable Frontend**: Separate main app and admin panel with shared components
4. **Data Pipeline Management**: Dedicated structure for pipeline definitions and executions
5. **AI Agent Integration**: Modular agent architecture for different AI capabilities
6. **Infrastructure as Code**: Complete deployment automation
7. **Comprehensive Testing**: Multiple testing strategies supported
8. **Documentation**: Well-organized documentation for all stakeholders

## Getting Started

1. **Backend Development**: Start with the `backend/core` service
2. **Frontend Development**: Begin with `frontend/web-app`
3. **AI/ML Development**: Start with `python-services/agents/chat-agent`
4. **Infrastructure**: Use `infrastructure/docker` for local development

## Technology Stack Recommendations

- **Backend**: Spring Boot, Spring Security, Spring Data JPA
- **Frontend**: React/Vue.js with TypeScript, Material-UI/Ant Design
- **Python Services**: FastAPI, Celery, scikit-learn, TensorFlow/PyTorch
- **Database**: PostgreSQL (main), Redis (cache), MongoDB (documents)
- **Message Queue**: RabbitMQ or Apache Kafka
- **Container**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana, ELK Stack