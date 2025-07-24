# AgenticOmics Platform Makefile

.PHONY: help build test clean dev prod logs stop

# Default target
help:
	@echo "AgenticOmics Platform - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev          - Start development environment"
	@echo "  dev-backend  - Start only backend services"
	@echo "  dev-frontend - Start only frontend services"
	@echo "  dev-python   - Start only Python services"
	@echo ""
	@echo "Production:"
	@echo "  prod         - Start production environment"
	@echo "  build        - Build all services"
	@echo "  build-backend - Build backend services"
	@echo "  build-frontend - Build frontend services"
	@echo "  build-python - Build Python services"
	@echo ""
	@echo "Testing:"
	@echo "  test         - Run all tests"
	@echo "  test-backend - Run backend tests"
	@echo "  test-frontend - Run frontend tests"
	@echo "  test-python  - Run Python tests"
	@echo ""
	@echo "Utilities:"
	@echo "  logs         - Show logs from all services"
	@echo "  stop         - Stop all services"
	@echo "  clean        - Clean up containers and volumes"
	@echo "  setup        - Initial setup for development"

# Development
dev:
	docker-compose up -d

dev-backend:
	docker-compose up -d postgres redis mongodb rabbitmq api-gateway auth-service data-management-service pipeline-engine-service

dev-frontend:
	docker-compose up -d web-app admin-panel

dev-python:
	docker-compose up -d chat-agent pipeline-agent data-processor

# Production
prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Build
build: build-backend build-frontend build-python

build-backend:
	cd backend && mvn clean package -DskipTests
	docker-compose build api-gateway auth-service data-management-service pipeline-engine-service

build-frontend:
	cd frontend && npm run build
	docker-compose build web-app admin-panel

build-python:
	docker-compose build chat-agent pipeline-agent data-processor

# Testing
test: test-backend test-frontend test-python

test-backend:
	cd backend && mvn test

test-frontend:
	cd frontend && npm test

test-python:
	cd python-services && python -m pytest

# Utilities
logs:
	docker-compose logs -f

stop:
	docker-compose down

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

setup:
	@echo "Setting up AgenticOmics development environment..."
	@echo "1. Installing backend dependencies..."
	cd backend && mvn clean install -DskipTests
	@echo "2. Installing frontend dependencies..."
	cd frontend && npm install
	@echo "3. Installing Python dependencies..."
	cd python-services && pip install -r requirements.txt
	@echo "4. Starting infrastructure services..."
	docker-compose up -d postgres redis mongodb rabbitmq
	@echo "Setup complete! Run 'make dev' to start all services."

# Database operations
db-migrate:
	docker-compose exec postgres psql -U agenticomics -d agenticomics -f /docker-entrypoint-initdb.d/migrations.sql

db-seed:
	docker-compose exec postgres psql -U agenticomics -d agenticomics -f /docker-entrypoint-initdb.d/seed.sql

# Monitoring
monitor:
	docker-compose up -d prometheus grafana
	@echo "Monitoring services started:"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  Grafana: http://localhost:3002 (admin/admin)"

# Security scan
security-scan:
	@echo "Running security scans..."
	cd backend && mvn org.owasp:dependency-check-maven:check
	cd frontend && npm audit
	cd python-services && safety check

# Documentation
docs:
	@echo "Generating documentation..."
	cd docs && make html

# Kubernetes deployment
k8s-deploy:
	kubectl apply -f infrastructure/kubernetes/manifests/

k8s-delete:
	kubectl delete -f infrastructure/kubernetes/manifests/

# Helm deployment
helm-install:
	helm install agenticomics infrastructure/kubernetes/helm-charts/agenticomics/

helm-upgrade:
	helm upgrade agenticomics infrastructure/kubernetes/helm-charts/agenticomics/

helm-uninstall:
	helm uninstall agenticomics