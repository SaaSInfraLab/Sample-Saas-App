# Database Verification

Connect to and verify the RDS database.

> **Note:** This guide is for operational tasks (database verification, debugging). For deployment, see the [Gitops-pipeline](https://github.com/SaaSInfraLab/Gitops-pipeline) repository.

## Get Connection Details (Decoded)

### Platform Namespace

**Bash:**
```bash
echo "Host: $(kubectl get configmap backend-config -n platform -o jsonpath='{.data.db-host}')"
echo "Port: $(kubectl get configmap backend-config -n platform -o jsonpath='{.data.db-port}')"
echo "Database: $(kubectl get configmap backend-config -n platform -o jsonpath='{.data.db-name}')"
echo "Username: $(kubectl get secret postgresql-secret -n platform -o jsonpath='{.data.db-user}' | base64 -d)"
echo "Password: $(kubectl get secret postgresql-secret -n platform -o jsonpath='{.data.db-password}' | base64 -d)"
```

**PowerShell:**
```powershell
Write-Host "Host: $(kubectl get configmap backend-config -n platform -o jsonpath='{.data.db-host}')"
Write-Host "Port: $(kubectl get configmap backend-config -n platform -o jsonpath='{.data.db-port}')"
Write-Host "Database: $(kubectl get configmap backend-config -n platform -o jsonpath='{.data.db-name}')"
$user = kubectl get secret postgresql-secret -n platform -o jsonpath='{.data.db-user}' | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
$pass = kubectl get secret postgresql-secret -n platform -o jsonpath='{.data.db-password}' | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
Write-Host "Username: $user"
Write-Host "Password: $pass"
```

### Analytics Namespace

**Bash:**
```bash
echo "Host: $(kubectl get configmap backend-config -n analytics -o jsonpath='{.data.db-host}')"
echo "Port: $(kubectl get configmap backend-config -n analytics -o jsonpath='{.data.db-port}')"
echo "Database: $(kubectl get configmap backend-config -n analytics -o jsonpath='{.data.db-name}')"
echo "Username: $(kubectl get secret postgresql-secret -n analytics -o jsonpath='{.data.db-user}' | base64 -d)"
echo "Password: $(kubectl get secret postgresql-secret -n analytics -o jsonpath='{.data.db-password}' | base64 -d)"
```

## Connect with pgAdmin

1. **Get connection details** (run commands above)
2. **Create proxy pod** (if not exists):
   ```bash
   kubectl apply -f create-db-proxy-pod.yaml
   kubectl wait --for=condition=ready pod/db-proxy -n platform --timeout=30s
   ```
3. **Port forward** (run this in a separate terminal and keep it running):
   ```bash
   kubectl port-forward -n platform db-proxy 5433:5432
   ```
   **Important**: Keep this terminal window open while connecting!
4. **Connect in pgAdmin** (in a new terminal/window):
   - Host: `localhost`
   - Port: `5433` (NOT 5432 - this avoids conflicts)
   - Database: `taskdb` (or value from step 1)
   - Username: (from `postgresql-secret`)
   - Password: (from `postgresql-secret`)

**Troubleshooting:**
- If connection fails, ensure port-forward is running
- Check pod status: `kubectl get pod db-proxy -n platform`
- Check pod logs: `kubectl logs db-proxy -n platform`
- Verify RDS security group allows traffic from EKS cluster

## Connect via psql

```bash
bash connect-db-direct.sh
```

## Database Schema Overview

The RDS database uses a **multi-tenant schema architecture**:

### Public Schema
- **`tenants`** - Tenant metadata table (id, tenant_id, name, namespace, created_at, updated_at)

### Tenant Schemas
Each tenant has its own isolated schema with identical table structure:

**`tenant_platform` schema:**
- **`users`** - User accounts (id, email, password_hash, name, tenant_id, created_at, updated_at)
- **`tasks`** - Task management (id, title, description, status, assignee, due_date, created_by, created_at, updated_at)

**`tenant_analytics` schema:**
- **`users`** - User accounts (same structure as tenant_platform)
- **`tasks`** - Task management (same structure as tenant_platform)

## Sample Verification Queries

Once connected, use these queries to verify the database:

### Basic Connection Test
```sql
SELECT version();
SELECT current_database();
SELECT current_user;
```

### List All Tables (All Schemas)
```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'tenant_platform', 'tenant_analytics')
ORDER BY table_schema, table_name;
```

### List Tables in Public Schema
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check Tenant Schemas
```sql
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name LIKE 'tenant_%' 
ORDER BY schema_name;
```

### Verify Tenants Table
```sql
SELECT * FROM tenants;
SELECT id, name, namespace, created_at FROM tenants ORDER BY created_at;
```

### Check Tenant Data (e.g., tenant_analytics)
```sql
-- Users in analytics tenant
SELECT * FROM tenant_analytics.users LIMIT 10;
SELECT COUNT(*) as user_count FROM tenant_analytics.users;

-- Tasks in analytics tenant
SELECT * FROM tenant_analytics.tasks LIMIT 10;
SELECT COUNT(*) as task_count FROM tenant_analytics.tasks;

-- Tasks by status
SELECT status, COUNT(*) as count FROM tenant_analytics.tasks GROUP BY status;
```

### Check Platform Tenant Data
```sql
SELECT * FROM tenant_platform.users LIMIT 10;
SELECT * FROM tenant_platform.tasks LIMIT 10;
SELECT COUNT(*) FROM tenant_platform.users;
SELECT COUNT(*) FROM tenant_platform.tasks;
```

### Verify Users Table
```sql
SELECT * FROM users LIMIT 10;
SELECT id, email, tenant_id, created_at FROM users ORDER BY created_at DESC LIMIT 10;
```

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
```

### List All Schemas
```sql
SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;
```

### View Table Structure
```sql
-- View tenants table structure
\d tenants

-- View users table in tenant schema
\d tenant_analytics.users

-- View tasks table in tenant schema
\d tenant_analytics.tasks
```

## Cleanup

```bash
kubectl delete pod db-proxy -n platform
```
