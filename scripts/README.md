# Scripts

Utility scripts for database initialization and AWS Secrets Manager setup.

## Database Initialization

**`init-rds-database.sh`** / **`init-rds-database.ps1`**
- Initializes RDS database with schemas and tables
- Run after RDS is created, before deploying applications
- Gets RDS endpoint from Terraform and runs migrations

```bash
# Bash (Linux/Mac)
./scripts/init-rds-database.sh

# PowerShell (Windows)
.\scripts\init-rds-database.ps1
```

## AWS Secrets Manager

**`setup-secrets-manager-iam.sh`**
- Creates IAM role and policy for Secrets Manager access
- Run during initial setup

**`deploy-secrets-manager.sh`**
- Deploys AWS Secrets Manager CSI Driver
- Run after IAM setup

```bash
# Step 1: Create IAM resources
./scripts/setup-secrets-manager-iam.sh

# Step 2: Deploy Secrets Manager
./scripts/deploy-secrets-manager.sh
```

## Requirements

- `kubectl` and AWS CLI configured
- PostgreSQL client (`psql`) or Docker (for database scripts)
- Terraform outputs (for Secrets Manager scripts)
