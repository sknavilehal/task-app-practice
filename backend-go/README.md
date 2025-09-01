# Go Task Manager Backend

A Go implementation of the task management backend API using Gin framework, GORM, and PostgreSQL.

## Features

- RESTful API for task management
- JWT authentication middleware
- PostgreSQL database with GORM
- Input validation
- Pagination and filtering
- Task statistics
- Soft delete functionality
- Comprehensive error handling

## Project Structure

```
backend-go/
├── cmd/                    # Application entry point
│   └── main.go
├── internal/
│   ├── api/               # API server setup
│   │   └── server.go
│   ├── config/            # Configuration management
│   │   └── config.go
│   ├── database/          # Database connection and migrations
│   │   └── database.go
│   ├── handlers/          # HTTP request handlers
│   │   └── task_handler.go
│   ├── middleware/        # HTTP middleware
│   │   └── auth.go
│   ├── models/           # Data models
│   │   └── task.go
│   └── services/         # Business logic
│       └── task_service.go
├── tests/                # Test files
├── .env.example         # Environment variables template
├── go.mod              # Go module file
└── README.md
```

## API Endpoints

### Tasks
- `GET /api/v1/tasks` - List tasks with filtering and pagination
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/:id` - Get task by ID
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task (soft delete)
- `PATCH /api/v1/tasks/:id/complete` - Mark task as completed
- `PATCH /api/v1/tasks/:id/pending` - Mark task as pending
- `GET /api/v1/tasks/stats` - Get task statistics

### Task Filtering
Query parameters for `GET /api/v1/tasks`:
- `status` - Filter by status (pending, completed)
- `priority` - Filter by priority (low, medium, high)
- `overdue` - Filter overdue tasks (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## Data Models

### Task
```go
type Task struct {
    ID          uint         `json:"id"`
    Title       string       `json:"title"`
    Description *string      `json:"description"`
    Status      TaskStatus   `json:"status"`
    Priority    TaskPriority `json:"priority"`
    DueDate     *time.Time   `json:"dueDate"`
    UserID      uint         `json:"userId"`
    CreatedAt   time.Time    `json:"createdAt"`
    UpdatedAt   time.Time    `json:"updatedAt"`
}
```

### Task Status
- `pending` - Task is not completed
- `completed` - Task is completed

### Task Priority
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgres://user:password@localhost:5432/taskdb?sslmode=disable

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
```

## Setup and Installation

1. **Prerequisites**
   - Go 1.21 or higher
   - PostgreSQL database

2. **Clone and setup**
   ```bash
   cd backend-go
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**
   ```bash
   go mod download
   ```

4. **Run the application**
   ```bash
   go run cmd/main.go
   ```

## Development

### Running Tests
```bash
go test ./...
```

### Building for Production
```bash
go build -o bin/task-manager cmd/main.go
```

### Docker Build
```bash
docker build -t task-manager-go .
```

## Authentication

This API expects JWT tokens in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token should contain a `userId` claim that identifies the authenticated user.

## Error Handling

The API returns structured error responses:
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Features Implemented

### Task Management
- ✅ Create tasks with title, description, priority, and due date
- ✅ Update task properties
- ✅ Mark tasks as completed/pending
- ✅ Delete tasks (soft delete)
- ✅ List tasks with filtering and pagination

### Data Validation
- ✅ Input validation using struct tags
- ✅ Custom validation for enums (status, priority)
- ✅ Required field validation

### Business Logic
- ✅ Task statistics (total, pending, completed, overdue)
- ✅ Overdue task detection
- ✅ Priority-based sorting
- ✅ User-specific task isolation

### Security
- ✅ JWT authentication middleware
- ✅ User context isolation
- ✅ CORS support

## Architecture

This Go backend follows clean architecture principles:

1. **Models** - Define data structures and validation
2. **Services** - Implement business logic
3. **Handlers** - Handle HTTP requests/responses
4. **Middleware** - Cross-cutting concerns (auth, CORS)
5. **Database** - Data persistence layer

The architecture ensures separation of concerns and makes the codebase maintainable and testable.
