# Task Management SaaS - Multi-Tenant Application

A production-ready multi-tenant task management application demonstrating cloud-native architecture on AWS EKS. Features schema-per-tenant database isolation, JWT authentication, and automated CI/CD deployment.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

## Features

- **Multi-Tenant Isolation**: Schema-per-tenant database architecture ensuring complete data separation
- **JWT Authentication**: Secure token-based authentication for all API endpoints
- **Task Management**: Full CRUD operations for task creation, updates, and tracking
- **Health Monitoring**: Comprehensive health checks and Prometheus metrics
- **SSL/TLS Security**: Encrypted database connections for RDS PostgreSQL
- **CI/CD Pipeline**: Automated deployment via GitHub Actions
- **Kubernetes Native**: Designed for AWS EKS with namespace-based tenant isolation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS EKS Cluster                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐              │
│  │  Platform    │         │  Analytics   │              │
│  │  Namespace   │         │  Namespace   │              │
│  │              │         │              │              │
│  │  Frontend     │        │  Frontend    │              │
│  │  Backend      │        │  Backend     │              │
│  └──────────────┘         └──────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────┐
│              AWS RDS PostgreSQL                       │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ tenant_      │  │ tenant_      │  │ tenant_      │ │
│  │ platform     │  │ analytics    │  │ data         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└───────────────────────────────────────────────────────┘
```

## Prerequisites

- **AWS Account** with appropriate permissions
- **Terraform** >= 1.0
- **kubectl** configured for EKS cluster
- **Docker** and Docker Compose (for local development)
- **Node.js** >= 18.0.0 (for local development)
- **AWS CLI** configured with credentials

## Quick Start

### Deploy to Kubernetes

```bash
# Deploy to platform namespace
kubectl apply -k k8s/namespace-platform

# Deploy to analytics namespace
kubectl apply -k k8s/namespace-analytics
```

### Access the Application

```bash
# Get service URL
kubectl get service frontend-service -n platform

# Port-forward for local access
kubectl port-forward -n platform service/frontend-service 8080:80
```

Then open `http://localhost:8080` in your browser.

## Local Development

### Start Services

```bash
# Start database (migrations run automatically)
docker-compose up -d postgres

# Backend (in separate terminal)
cd backend && npm install && npm run dev

# Frontend (in separate terminal)
cd frontend && npm install && npm run dev
```

### Access Local Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:9090/metrics

For detailed local setup instructions, see [QUICK_START.md](QUICK_START.md).

## Deployment

### Infrastructure Setup

1. Deploy infrastructure using Terraform:
   ```bash
   cd cloudnative-saas-eks/examples/dev-environment/infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

2. Deploy tenants:
   ```bash
   cd ../tenants
   terraform init
   terraform apply
   ```

### CI/CD Deployment

The application uses GitHub Actions for automated deployment. See [CI_CD_SETUP.md](CI_CD_SETUP.md) for configuration details.

## Database

Database migrations are located in `database/migrations/` and run automatically:

- **Docker Compose**: Migrations execute on PostgreSQL first startup
- **Kubernetes**: Migrations run via `k8s/init-db-job.yaml` during deployment
- **Manual**: Use `scripts/init-rds-database.sh` or `scripts/init-rds-database.ps1`

For detailed database information, see [database/README.md](database/README.md).

## API Documentation

### Health Check Endpoints

- `GET /health` - General health status with database connectivity
- `GET /health/live` - Liveness probe (always returns 200)
- `GET /health/ready` - Readiness probe (checks database connection)

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires authentication)

### Task Endpoints

- `GET /api/tasks` - List all tasks (with optional filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/statistics` - Get task statistics

### Tenant Endpoints

- `GET /api/tenant/info` - Get tenant information
- `GET /api/tenant/usage` - Get tenant resource usage

All endpoints (except auth) require JWT authentication via `Authorization: Bearer <token>` header.

## Project Structure

```
Sample-saas-app/
├── backend/              # Node.js/Express backend API
│   ├── src/
│   │   ├── config/      # Database and tenant configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth and tenant isolation
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   └── server.js    # Application entry point
│   └── Dockerfile
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API client
│   └── Dockerfile
├── database/            # Database migrations
│   └── migrations/     # SQL migration files
├── k8s/                 # Kubernetes manifests
│   ├── namespace-platform/
│   ├── namespace-analytics/
│   └── init-db-job.yaml
├── scripts/             # Utility scripts
├── db-verification/     # Database connection tools
└── docker-compose.yml   # Local development setup
```

## Documentation

- [QUICK_START.md](QUICK_START.md) - Local development guide
- [CI_CD_SETUP.md](CI_CD_SETUP.md) - CI/CD pipeline configuration
- [database/README.md](database/README.md) - Database schema and migrations
- [scripts/README.md](scripts/README.md) - Utility scripts documentation
- [db-verification/README.md](db-verification/README.md) - Database connection tools

## Technology Stack

- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: React, Vite, React Query
- **Infrastructure**: AWS EKS, RDS PostgreSQL, Terraform
- **CI/CD**: GitHub Actions
- **Container**: Docker
- **Monitoring**: Prometheus metrics
