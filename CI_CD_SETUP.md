# CI/CD Pipeline Setup

Automated CI/CD pipeline with GitOps deployment to AWS EKS using GitHub Actions.

## 📋 Prerequisites

- EKS cluster and ECR repositories deployed via Terraform
- ArgoCD installed on EKS cluster
- GitOps repository ([Gitops-pipeline](https://github.com/SaaSInfraLab/Gitops-pipeline))

## 🔐 Setup: GitHub Actions OIDC → AWS

### 1. Configure OIDC Provider (one-time)

- Go to **IAM → Identity providers**
- If `token.actions.githubusercontent.com` doesn't exist:
  - Click **Add provider**
  - Type: **OpenID Connect**
  - Provider URL: `https://token.actions.githubusercontent.com`
  - Audience: `sts.amazonaws.com`

### 2. Create IAM Role

- **IAM → Roles → Create role**
- Select **Web identity**
- Provider: `token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`
- Condition:
  - Key: `token.actions.githubusercontent.com:sub`
  - Operator: `StringLike`
  - Value: `repo:SaaSInfraLab/Sample-saas-app:*`

### 3. Attach Policies

Create and attach these policies:

**ECR Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload"
    ],
    "Resource": "*"
  }]
}
```

**EKS Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["eks:DescribeCluster", "eks:ListClusters"],
    "Resource": "*"
  }]
}
```

- Role name: `github-actions-ecr-eks-role`
- Copy the Role ARN

### 4. Add GitHub Secrets

**Settings → Secrets and variables → Actions:**

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | `arn:aws:iam::821368347884:role/github-actions-ecr-eks-role` |
| `ECR_BACKEND_REPO` | `saas-infra-lab-dev-backend` |
| `ECR_FRONTEND_REPO` | `saas-infra-lab-dev-frontend` |
| `GITOPS_REPO_TOKEN` | GitHub PAT with `repo` scope |

**Get ECR repo names:**
```bash
cd cloudnative-saas-eks/examples/dev-environment/infrastructure
terraform output ecr_backend_repository_name
terraform output ecr_frontend_repository_name
```

**Get AWS_ROLE_ARN:**
```bash
# From Terraform outputs
terraform output

# Or from AWS Console
# IAM → Roles → Find your GitHub Actions role → Copy ARN
```

**Create GITOPS_REPO_TOKEN:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `GitOps Pipeline Access`
4. Select expiration (recommend: 90 days or custom)
5. Select scope: ✅ `repo` (Full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)
8. Add as secret `GITOPS_REPO_TOKEN` in the `Sample-saas-app` repository

## 🔄 How It Works

```
Push code → CI (tests) → CD (build & push images) → Update GitOps repo → ArgoCD deploys
```

## 🚀 Deployment

**Automatic:**
- Push to `main` or `develop` → CI runs → CD runs → ArgoCD deploys

**Manual:**
- Actions tab → "CD - Build and Push Images" → Run workflow

**Tag-based:**
```bash
git tag v1.0.0 && git push origin v1.0.0
```

## 🔍 Verify Deployment

```bash
# Check CI/CD status
# GitHub Actions tab → Workflow runs

# Check ArgoCD sync
kubectl get applications -n argocd
argocd app get sample-saas-app

# Check pods
kubectl get pods -n platform
kubectl get pods -n analytics
```

## 🛠️ Troubleshooting

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

### CD Fails to Update GitOps

If pushing to GitOps repo fails:
- Check `GITOPS_REPO_TOKEN` has `repo` scope
- Verify token has write access to `Gitops-pipeline` repository
- Verify the token hasn't expired
- Check if the repository is private and the token has access

### Images Not Deploying

- Check ArgoCD sync: `argocd app get sample-saas-app`
- Check ArgoCD applications: `kubectl get applications -n argocd`
- Check deployments: `kubectl get deployments -n platform`
- View workflow logs in GitHub Actions

## 📚 Resources

- [Gitops-pipeline](https://github.com/SaaSInfraLab/Gitops-pipeline)
- [Sample-saas-app README](README.md)
