# Task Management SaaS - Multi-Tenant Application

Production-ready multi-tenant task management application built for AWS EKS with complete tenant isolation, automated CI/CD, and cloud-native architecture.

## 🚀 Quick Start

### Local Development
```bash
# Start all services
docker-compose up -d

# Access application
# Frontend: http://localhost:8080
# Backend: http://localhost:3000
```

See [QUICK_START.md](QUICK_START.md) for detailed local setup.

### Kubernetes Deployment
```bash
# Deploy to platform namespace
kubectl apply -k k8s/namespace-platform

# Deploy to analytics namespace
kubectl apply -k k8s/namespace-analytics
```

## 📋 Features

- **Multi-Tenant Isolation**: Schema-per-tenant database architecture
- **JWT Authentication**: Secure token-based API authentication
- **Task Management**: Full CRUD operations with status tracking
- **Health Monitoring**: Health checks and Prometheus metrics
- **CI/CD Pipeline**: Automated deployment via GitHub Actions
- **Kubernetes Native**: Designed for AWS EKS with namespace isolation

## 🏗️ Architecture

```
┌───────────────────────────────────────────┐
│         AWS EKS Cluster                   │
├───────────────────────────────────────────┤
│  Platform Namespace │ Analytics Namespace │
│  ┌──────────────┐   │  ┌──────────────┐   │
│  │ Frontend     │   │  │ Frontend     │   │
│  │ Backend      │   │  │ Backend      │   │
│  └──────────────┘   │  └──────────────┘   │
└───────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│      AWS RDS PostgreSQL                 │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ tenant_      │  │ tenant_      │     │
│  │ platform     │  │ analytics    │     │
│  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```
Sample-saas-app/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/      # Database & tenant config
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth & tenant isolation
│   │   ├── models/      # Data models
│   │   └── routes/      # API routes
│   └── Dockerfile
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page views
│   │   └── services/    # API client
│   └── Dockerfile
├── database/            # SQL migrations
│   └── migrations/     # Schema definitions
├── k8s/                 # Kubernetes manifests
│   ├── namespace-platform/
│   └── namespace-analytics/
├── scripts/             # Utility scripts
└── db-verification/     # DB connection tools
```

## 🔧 Prerequisites

- **AWS Account** with EKS access
- **Terraform** >= 1.0
- **kubectl** configured for EKS
- **Docker** & Docker Compose (local dev)
- **Node.js** >= 18.0.0 (local dev)
- **AWS CLI** configured

## 📚 Documentation

- [QUICK_START.md](QUICK_START.md) - Local development guide
- [CI_CD_SETUP.md](CI_CD_SETUP.md) - CI/CD pipeline configuration
- [database/README.md](database/README.md) - Database schema & migrations
- [scripts/README.md](scripts/README.md) - Utility scripts
- [db-verification/README.md](db-verification/README.md) - Database connection guide

## 🔌 API Endpoints

### Health Checks
- `GET /health` - General health status
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user (auth required)

### Tasks
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/statistics` - Task statistics

### Tenant
- `GET /api/tenant/info` - Tenant information
- `GET /api/tenant/usage` - Resource usage

**Note:** All endpoints (except auth) require JWT: `Authorization: Bearer <token>`

## 🗄️ Database

Multi-tenant PostgreSQL with schema-per-tenant isolation:

- **Public Schema**: `tenants` table (shared metadata)
- **Tenant Schemas**: `tenant_platform`, `tenant_analytics`
  - Each contains: `users` and `tasks` tables

Migrations run automatically on deployment. See [database/README.md](database/README.md) for details.

## 🚢 Deployment

### Infrastructure (Terraform)
```bash
cd cloudnative-saas-eks/examples/dev-environment/infrastructure
terraform init && terraform apply
```

### Tenants
```bash
cd ../tenants
terraform init && terraform apply
```

### CI/CD
Automated via GitHub Actions. See [CI_CD_SETUP.md](CI_CD_SETUP.md).

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: React, Vite
- **Infrastructure**: AWS EKS, RDS PostgreSQL, Terraform
- **CI/CD**: GitHub Actions