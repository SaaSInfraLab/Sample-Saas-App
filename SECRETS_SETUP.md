# GitHub Secrets Setup Guide

Complete guide for configuring all required GitHub Actions secrets for the CI/CD pipeline.

## Required Secrets

Configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. AWS_ROLE_ARN

**Description**: IAM role ARN for GitHub Actions to access AWS services (ECR, S3, EKS)

**How to get**:
```bash
# From Terraform outputs
cd cloudnative-saas-eks/examples/dev-environment/infrastructure
terraform output

# Or from AWS Console
# IAM → Roles → Find your GitHub Actions role → Copy ARN
```

**Example**: `arn:aws:iam::821368347884:role/github-actions-ecr-eks-role`

**Required permissions**:
- ECR: Push/pull images
- S3: Read Terraform state (if needed)
- EKS: Cluster access (if needed)

---

### 2. ECR_BACKEND_REPO

**Description**: ECR repository name for backend (just the name, not the full path)

**How to get**:
```bash
# From Terraform outputs
cd cloudnative-saas-eks/examples/dev-environment/infrastructure
terraform output ecr_backend_repository_name

# Or extract from full URL
terraform output ecr_backend_repository_url
# Example output: 821368347884.dkr.ecr.us-east-1.amazonaws.com/saas-infra-lab-dev-backend
# Extract: saas-infra-lab-dev-backend
```

**Example**: `saas-infra-lab-dev-backend`

**Note**: Only the repository name, not the full ECR URL

---

### 3. ECR_FRONTEND_REPO

**Description**: ECR repository name for frontend (just the name, not the full path)

**How to get**:
```bash
# From Terraform outputs
cd cloudnative-saas-eks/examples/dev-environment/infrastructure
terraform output ecr_frontend_repository_name

# Or extract from full URL
terraform output ecr_frontend_repository_url
# Example output: 821368347884.dkr.ecr.us-east-1.amazonaws.com/saas-infra-lab-dev-frontend
# Extract: saas-infra-lab-dev-frontend
```

**Example**: `saas-infra-lab-dev-frontend`

**Note**: Only the repository name, not the full ECR URL

---

### 4. GITOPS_REPO_TOKEN

**Description**: Personal Access Token (PAT) with `repo` scope for the Gitops-pipeline repository

**How to create**:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `GitOps Pipeline Access`
4. Select expiration (recommend: 90 days or custom)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)
8. Add as secret `GITOPS_REPO_TOKEN` in the `Sample-saas-app` repository

**Example**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Important**:
- The token must have write access to the `Gitops-pipeline` repository
- If the repository is in a different organization, ensure the token has access
- Store the token securely - you cannot view it again after creation

---

## Quick Setup Checklist

- [ ] Get `AWS_ROLE_ARN` from Terraform outputs or AWS Console
- [ ] Get `ECR_BACKEND_REPO` from Terraform: `terraform output ecr_backend_repository_name`
- [ ] Get `ECR_FRONTEND_REPO` from Terraform: `terraform output ecr_frontend_repository_name`
- [ ] Create `GITOPS_REPO_TOKEN` in GitHub with `repo` scope
- [ ] Add all 4 secrets to `Sample-saas-app` repository
- [ ] Verify secrets are set correctly (check in GitHub UI)

## Verification

After setting up secrets, verify the CD pipeline can access them:

1. Push a change to trigger the CD workflow
2. Check the workflow logs for:
   - ✅ AWS credentials configured successfully
   - ✅ ECR repository names extracted from secrets
   - ✅ GitOps repository updated successfully

## Troubleshooting

### Secret Not Found Error

If you see `Secret not found` errors:
- Verify the secret name matches exactly (case-sensitive)
- Check you're adding secrets to the correct repository (`Sample-saas-app`)
- Ensure the secret is added under "Actions" secrets, not "Dependabot" secrets

### ECR Access Denied

If you see ECR access errors:
- Verify `AWS_ROLE_ARN` is correct
- Check the IAM role has ECR push/pull permissions
- Verify the role trust relationship allows GitHub Actions

### GitOps Repo Push Failed

If pushing to GitOps repo fails:
- Verify `GITOPS_REPO_TOKEN` has `repo` scope
- Check the token has write access to `Gitops-pipeline` repository
- Verify the token hasn't expired
- Check if the repository is private and the token has access

## Additional Secrets (Optional)

You may also want to store these for future use:

- `AWS_REGION` - AWS region (can be in workflow env instead)
- `CLUSTER_NAME` - EKS cluster name (if needed for kubectl operations)
- `ENVIRONMENT` - Environment name (dev/staging/prod)

These can be added as workflow environment variables instead of secrets if they're not sensitive.

