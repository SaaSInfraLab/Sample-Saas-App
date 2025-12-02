# Database

Database migrations and schema definitions for the multi-tenant application.

## Structure

```
database/
├── migrations/          # SQL migration files
│   ├── 001_create_tenants.sql
│   ├── 002_create_users.sql
│   └── 003_create_tasks.sql
└── README.md           # This file
```

## Migrations

Migrations are automatically applied:

- **Docker Compose**: PostgreSQL runs migrations from `/docker-entrypoint-initdb.d` on first startup
- **Kubernetes**: `k8s/init-db-job.yaml` runs migrations during deployment
- **Manual**: Use `scripts/init-rds-database.sh` or `scripts/init-rds-database.ps1`

## Migration Files

1. **001_create_tenants.sql** - Creates the `tenants` table (shared across all tenants)
2. **002_create_users.sql** - Creates the `users` table in each tenant schema
3. **003_create_tasks.sql** - Creates the `tasks` table in each tenant schema

## Multi-Tenant Schema Structure

- **Public schema**: Contains the `tenants` table (shared metadata)
- **Tenant schemas**: `tenant_platform`, `tenant_analytics`, `tenant_data`
  - Each tenant schema contains isolated `users` and `tasks` tables
  - Schema-per-tenant isolation ensures data separation

## Notes

- Migrations are idempotent (safe to run multiple times)
- Tenant schemas are created dynamically when tenants are registered
- Always run migrations in order (001 → 002 → 003)

