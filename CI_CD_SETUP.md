# CI/CD Setup

Automated deployment using GitHub Actions with optimized timeouts and robust error handling.

## Prerequisites

- EKS cluster and ECR repositories deployed via Terraform
- GitHub Actions IAM role with permissions for:
  - ECR (push/pull images)
  - EKS (update kubeconfig, apply manifests)
  - S3 (read Terraform state)
  - Secrets Manager (read RDS credentials)

## Setup

1. Configure GitHub Secrets:
   - `AWS_ROLE_ARN` - IAM role ARN for GitHub Actions
   - `ECR_BACKEND_REPO` - ECR repository name for backend
   - `ECR_FRONTEND_REPO` - ECR repository name for frontend

2. Verify Infrastructure:
   ```bash
   cd cloudnative-saas-eks/examples/dev-environment/infrastructure
   terraform output rds_secret_arn
   
   cd ../tenants
   terraform apply -var-file="../tenants.tfvars"
   ```

3. Push to main branch - deployment happens automatically

## Workflows

### CI Pipeline (`ci.yml`)
- Triggers: Push to `main` or `develop`, Pull requests
- Jobs: Backend test, Frontend test, Docker build
- Duration: ~5-8 minutes

### CD Pipeline (`cd.yml`)
- Triggers: CI workflow success, Manual dispatch, Tag push
- Jobs: Build backend/frontend (parallel), Cluster setup, Deploy (matrix: platform, analytics)
- Duration: ~10-15 minutes

## Timeout Configuration

Pipeline timeouts are optimized for database connections and health checks:
- Backend rollout: 10 minutes
- Frontend rollout: 10 minutes
- Deploy step: 20 minutes
