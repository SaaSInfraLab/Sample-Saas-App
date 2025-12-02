# Database Verification

Connect to and verify the RDS database.

## Connect with pgAdmin

1. Create proxy pod:
   ```bash
   kubectl apply -f create-db-proxy-pod.yaml
   ```

2. Wait for pod ready:
   ```bash
   kubectl wait --for=condition=ready pod/db-proxy -n platform --timeout=30s
   ```

3. Start port forwarding (keep terminal open):
   ```bash
   kubectl port-forward -n platform db-proxy 5433:5432
   ```

4. Connect in pgAdmin:
   - Get connection details: `kubectl get secret db-credentials -n platform -o yaml`
   - Host: `localhost`
   - Port: `5433`
   - Database/Username: From secret above

## Connect via psql

```bash
bash connect-db-direct.sh
```

Opens psql directly in a temporary pod.

## Cleanup

```bash
kubectl delete pod db-proxy -n platform
```
