# Task Manager Deployment Guide

This guide covers both development and production deployment of the Task Manager application.

## Development Setup

### Prerequisites
- Docker
- Docker Compose
- Node.js (for local development)

### Running in Development Mode

1. Start the development environment:
```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Nginx: http://localhost:80

## Production Deployment

### Prerequisites
- Kubernetes cluster
- kubectl configured
- Docker registry access
- Domain name (for production)

### Building Production Images

1. Build and push the frontend image:
```bash
# Build frontend
docker build -t your-registry/task-manager-frontend:latest ./frontend
docker push your-registry/task-manager-frontend:latest
```

2. Build and push the backend image:
```bash
# Build backend
docker build -t your-registry/task-manager-backend:latest ./backend
docker push your-registry/task-manager-backend:latest
```

### Deploying to Kubernetes

1. Update the Kubernetes manifests with your registry:
```bash
export DOCKER_REGISTRY=your-registry
```

2. Apply the Kubernetes configurations:
```bash
# Apply frontend deployment
envsubst < kubernetes/frontend-deployment.yaml | kubectl apply -f -

# Apply backend deployment
envsubst < kubernetes/backend-deployment.yaml | kubectl apply -f -

# Apply PostgreSQL deployment
kubectl apply -f kubernetes/postgres-deployment.yaml

# Apply ingress configuration
kubectl apply -f kubernetes/ingress.yaml
```

3. Update the ingress host:
   - Edit `kubernetes/ingress.yaml`
   - Replace `task-manager.example.com` with your actual domain

## Production Architecture

### Components
1. **Frontend**
   - 2 replicas for high availability
   - Served by Nginx
   - Resource limits: 256Mi memory, 200m CPU

2. **Backend**
   - 2 replicas for high availability
   - Node.js Express server
   - Resource limits: 512Mi memory, 500m CPU

3. **Database**
   - PostgreSQL 14
   - Single replica (data consistency)
   - Persistent storage (1Gi)
   - Resource limits: 512Mi memory, 500m CPU

### Security Features
- Secrets for sensitive data (database credentials)
- ConfigMaps for environment variables
- Resource limits to prevent DoS
- Proper ingress configuration

### Key Differences from Development
1. **Docker Images**
   - Development: Uses `Dockerfile.dev` with hot-reloading
   - Production: Optimized multi-stage builds
   - Production dependencies only
   - Built and minified assets
   - Nginx for serving static files

2. **Kubernetes Features**
   - High availability with multiple replicas
   - Resource management
   - Secret management
   - Persistent storage
   - Ingress routing

3. **Security**
   - Development: Default credentials
   - Production: Kubernetes secrets
   - Resource limits
   - Domain-based routing

## Monitoring and Maintenance

### Checking Deployment Status
```bash
# Check all deployments
kubectl get deployments

# Check all pods
kubectl get pods

# Check services
kubectl get services

# Check ingress
kubectl get ingress
```

### Viewing Logs
```bash
# Frontend logs
kubectl logs -l app=frontend

# Backend logs
kubectl logs -l app=backend

# Database logs
kubectl logs -l app=postgres
```

### Scaling
```bash
# Scale frontend
kubectl scale deployment frontend --replicas=3

# Scale backend
kubectl scale deployment backend --replicas=3
```

## Troubleshooting

### Common Issues
1. **Database Connection Issues**
   - Check PostgreSQL pod status
   - Verify secrets and configmaps
   - Check network policies

2. **Frontend Not Loading**
   - Check ingress configuration
   - Verify frontend pod status
   - Check nginx configuration

3. **Backend API Issues**
   - Check backend pod status
   - Verify environment variables
   - Check API logs

### Debugging Commands
```bash
# Describe resources
kubectl describe pod <pod-name>
kubectl describe service <service-name>
kubectl describe ingress <ingress-name>

# Get detailed pod information
kubectl get pod <pod-name> -o yaml

# Check pod events
kubectl get events --sort-by='.lastTimestamp'
``` 