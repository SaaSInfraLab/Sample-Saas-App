# CI/CD Pipeline Setup

Automated deployment to AWS EKS using GitHub Actions.

## 📋 Prerequisites

- EKS cluster and ECR repositories deployed via Terraform
- GitHub Actions IAM role with permissions for:
  - ECR (push/pull images)
  - EKS (update kubeconfig, apply manifests)
  - S3 (read Terraform state)
  - Secrets Manager (read RDS credentials)

## ⚙️ Configuration

### GitHub Secrets

Configure these secrets in your GitHub repository:

- `AWS_ROLE_ARN` - IAM role ARN for GitHub Actions
- `ECR_BACKEND_REPO` - ECR repository name for backend
- `ECR_FRONTEND_REPO` - ECR repository name for frontend
- `TERRAFORM_STATE_BUCKET` - S3 bucket for Terraform state
- `TERRAFORM_STATE_KEY` - S3 key for Terraform state

### Infrastructure Verification

```bash
# Verify RDS secret exists
cd cloudnative-saas-eks/examples/dev-environment/infrastructure
terraform output rds_secret_arn

# Verify tenant namespaces
cd ../tenants
terraform apply -var-file="../tenants.tfvars"
```

## 🔄 Workflows

### CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests

**Jobs:**
- Backend tests
- Frontend tests
- Docker image builds

**Duration:** ~5-8 minutes

### CD Pipeline (`cd.yml`)

**Triggers:**
- CI workflow success
- Manual dispatch
- Tag push

**Jobs:**
1. **Build** - Build and push backend/frontend images (parallel)
2. **Cluster Setup** - Configure kubectl for EKS
3. **Setup Secrets** - Create/update Kubernetes secrets from AWS Secrets Manager
4. **Deploy** - Deploy to platform and analytics namespaces (matrix strategy)

**Duration:** ~10-15 minutes

## 🔐 Secret Management

The CD pipeline automatically:
- Fetches RDS credentials from AWS Secrets Manager
- Creates/updates `postgresql-secret` and `backend-secret` in both namespaces
- Validates secret values before deployment
- Restarts deployments to pick up new secrets

## ⏱️ Timeout Configuration

Optimized timeouts for database connections and health checks:
- Backend rollout: 10 minutes
- Frontend rollout: 10 minutes
- Deploy step: 20 minutes

## 🚀 Deployment

1. Push to `main` branch - deployment happens automatically
2. Or manually trigger via GitHub Actions UI
3. Monitor deployment in Actions tab

## 📝 Notes

- Secrets are automatically synchronized from AWS Secrets Manager
- Both `platform` and `analytics` namespaces use the same RDS credentials
- Failed deployments are automatically rolled back by Kubernetes
