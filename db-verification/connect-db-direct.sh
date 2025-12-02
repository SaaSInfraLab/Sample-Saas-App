#!/bin/bash
set -e

BACKEND_POD=$(kubectl get pod -n platform -l app=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$BACKEND_POD" ]; then
    echo "❌ Backend pod not found!"
    exit 1
fi

echo "✅ Found backend pod: $BACKEND_POD"
echo "📡 Creating temporary database client pod..."
echo ""
kubectl run db-client --rm -i --restart=Never \
  --image=postgres:15-alpine \
  --namespace=platform \
  --limits="cpu=100m,memory=128Mi" \
  --requests="cpu=50m,memory=64Mi" \
  --env="PGPASSWORD=$(kubectl get secret db-credentials -n platform -o jsonpath='{.data.db-password}' | base64 -d)" \
  --env="PGHOST=$(kubectl get secret db-credentials -n platform -o jsonpath='{.data.db-host}' | base64 -d)" \
  --env="PGUSER=$(kubectl get secret db-credentials -n platform -o jsonpath='{.data.db-username}' | base64 -d)" \
  --env="PGDATABASE=$(kubectl get secret db-credentials -n platform -o jsonpath='{.data.db-name}' | base64 -d)" \
  -- psql

echo ""
echo "✅ Connection closed. Pod has been removed."

