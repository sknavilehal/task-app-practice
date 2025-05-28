# Task Management Application

A full-stack task management application designed to demonstrate cloud-native principles and Kubernetes deployment practices. Built with React, Node.js, and PostgreSQL, it serves as both a practical task management tool and a learning platform for container orchestration.

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express and TypeScript
- Database: PostgreSQL
- Reverse Proxy: Nginx
- Containerization: Docker & Docker Compose
- Cloud Ready: Kubernetes deployment ready

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```
3. Start the development environment:
   ```bash
   docker-compose up
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Nginx: http://localhost:80

## Project Structure

```
.
├── frontend/           # React frontend application
├── backend/           # Node.js backend application
├── nginx/            # Nginx configuration
├── docker-compose.yml # Development environment setup
└── kubernetes/       # Kubernetes deployment manifests (coming soon)
```

## Development

- Frontend runs on port 3000
- Backend API runs on port 3001
- PostgreSQL runs on port 5432
- Nginx serves as reverse proxy on port 80

## Production Deployment

The application is designed to be deployed to Kubernetes. Deployment manifests will be available in the `kubernetes/` directory. 