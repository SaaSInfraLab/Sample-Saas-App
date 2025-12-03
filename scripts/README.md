# Utility Scripts

Scripts for database initialization and AWS Secrets Manager setup.

## 📋 Available Scripts

### Database Initialization

**`init-rds-database.sh`** (Bash) / **`init-rds-database.ps1`** (PowerShell)

Initializes RDS PostgreSQL database with schemas and tables.

**Usage:**
```bash
# Bash (Linux/Mac/Git Bash)
./scripts/init-rds-database.sh

# PowerShell (Windows)
.\scripts\init-rds-database.ps1
```

**What it does:**
- Gets RDS endpoint from Terraform state
- Runs all database migrations
- Creates tenant schemas and tables
- Verifies database setup

**Requirements:**
- Terraform state file accessible
- PostgreSQL client (`psql`) or Docker
- AWS CLI configured

### AWS Secrets Manager Setup

**`setup-secrets-manager-iam.sh`**

Creates IAM role and policy for Secrets Manager CSI Driver access.

**Usage:**
```bash
./scripts/setup-secrets-manager-iam.sh
```

**What it does:**
- Creates IAM role for Secrets Manager access
- Attaches required policies
- Configures trust relationship

**`deploy-secrets-manager.sh`**

Deploys AWS Secrets Manager CSI Driver to Kubernetes cluster.

**Usage:**
```bash
./scripts/deploy-secrets-manager.sh
```

**What it does:**
- Installs Secrets Store CSI Driver
- Installs AWS Provider for CSI Driver
- Enables secret synchronization

## 🔄 Complete Setup Workflow

```bash
# 1. Initialize database
./scripts/init-rds-database.sh

# 2. Setup IAM for Secrets Manager
./scripts/setup-secrets-manager-iam.sh

# 3. Deploy Secrets Manager CSI Driver
./scripts/deploy-secrets-manager.sh
```

## ⚙️ Requirements

- `kubectl` configured for EKS cluster
- AWS CLI configured with credentials
- Terraform outputs available (for database script)
- PostgreSQL client or Docker (for database script)

## 📝 Notes

- Scripts are idempotent (safe to run multiple times)
- Database script requires Terraform state to be accessible
- Secrets Manager scripts require cluster admin permissions
