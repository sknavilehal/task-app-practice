# GitHub Actions Configuration

This repository includes a comprehensive CI/CD pipeline using GitHub Actions. The workflows are designed to ensure code quality, security, and automated deployment.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)
- **Triggers**: Push to `main`/`develop` branches, Pull requests
- **Features**:
  - Backend and frontend testing with PostgreSQL service
  - TypeScript compilation and linting
  - Docker image building and pushing to GitHub Container Registry
  - Security scanning with Trivy
  - Code quality analysis with SonarCloud

### 2. Deployment (`deploy.yml`)
- **Triggers**: Push to `main` branch, Version tags (`v*`)
- **Features**:
  - Staging deployment on main branch
  - Production deployment on version tags
  - Kubernetes deployment automation
  - Post-deployment health checks

### 3. Pull Request Validation (`pr-validation.yml`)
- **Triggers**: Pull request events
- **Features**:
  - Semantic PR title validation
  - Change detection (backend/frontend/kubernetes)
  - Targeted testing based on changes
  - Bundle size analysis
  - Kubernetes manifest validation

### 4. Dependency Management (`dependencies.yml`)
- **Triggers**: Weekly schedule, Manual trigger
- **Features**:
  - Dependency update checks
  - Security audit with npm audit and Snyk
  - Automated PR creation for dependency updates

## Required Secrets

To fully utilize these workflows, configure the following secrets in your repository:

### Required
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Optional (for enhanced features)
- `SONAR_TOKEN` - SonarCloud integration
- `SNYK_TOKEN` - Snyk security scanning
- `KUBE_CONFIG` - Kubernetes cluster configuration (base64 encoded)

## Environment Setup

1. **SonarCloud**: Update `sonar-project.properties` with your project key and organization
2. **Container Registry**: Images are pushed to GitHub Container Registry (ghcr.io)
3. **Kubernetes**: Update deployment manifests in the `kubernetes/` directory
4. **Dependabot**: Configured to automatically create PRs for dependency updates

## Configuration Files

- `.github/workflows/` - GitHub Actions workflow definitions
- `.github/dependabot.yml` - Dependabot configuration
- `sonar-project.properties` - SonarCloud configuration

## Usage

### Running Tests Locally
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building Docker Images
```bash
# Backend
docker build -t task-app-backend ./backend

# Frontend
docker build -t task-app-frontend ./frontend
```

### Deploying with Docker Compose
```bash
docker-compose up
```

## Customization

### Adding New Environments
1. Create new environment in GitHub repository settings
2. Add deployment job in `deploy.yml`
3. Configure environment-specific secrets

### Modifying Test Coverage
- Backend: Configure Jest in `backend/package.json`
- Frontend: Configure React Testing Library in `frontend/package.json`

### Adding New Services
1. Update `docker-compose.yml`
2. Add corresponding Dockerfile
3. Update CI workflow to include new service

## Monitoring and Notifications

- **Pull Request Checks**: All workflows must pass before merging
- **Security Alerts**: Dependabot creates PRs for security vulnerabilities
- **Weekly Audits**: Automated dependency and security scanning

## Troubleshooting

### Common Issues
1. **Test Failures**: Check service configurations and environment variables
2. **Docker Build Failures**: Verify Dockerfile syntax and dependencies
3. **Deployment Issues**: Check Kubernetes configurations and secrets

### Getting Help
- Check workflow logs in the Actions tab
- Review error messages in pull request checks
- Consult the GitHub Actions documentation

## Best Practices

1. **Branch Protection**: Enable required status checks for main branch
2. **Security**: Regularly update dependencies and monitor security alerts
3. **Testing**: Maintain good test coverage (aim for >80%)
4. **Documentation**: Keep deployment and configuration documentation updated
