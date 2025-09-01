package api

import (
	"log"

	"task-manager-backend/internal/config"
	"task-manager-backend/internal/handlers"
	"task-manager-backend/internal/middleware"
	"task-manager-backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Server struct {
	router      *gin.Engine
	taskHandler *handlers.TaskHandler
	config      *config.Config
}

func NewServer(db *gorm.DB, cfg *config.Config) *Server {
	// Set Gin mode based on environment
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Add middleware
	router.Use(middleware.CORSMiddleware())

	// Initialize services
	taskService := services.NewTaskService(db)

	// Initialize handlers
	taskHandler := handlers.NewTaskHandler(taskService)

	server := &Server{
		router:      router,
		taskHandler: taskHandler,
		config:      cfg,
	}

	server.setupRoutes()
	return server
}

func (s *Server) setupRoutes() {
	// Health check endpoint
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "OK"})
	})

	// API v1 routes
	v1 := s.router.Group("/api/v1")

	// Public demo endpoints (no authentication required)
	v1.GET("/test-tasks", func(c *gin.Context) {
		mockTasks := []gin.H{
			{
				"id":          1,
				"title":       "Sample Task 1",
				"description": "This is a test task from the Go backend",
				"status":      "pending",
				"priority":    "medium",
				"userId":      1,
				"createdAt":   "2025-09-01T10:00:00Z",
				"updatedAt":   "2025-09-01T10:00:00Z",
			},
			{
				"id":          2,
				"title":       "Sample Task 2",
				"description": "Another test task",
				"status":      "completed",
				"priority":    "high",
				"userId":      1,
				"createdAt":   "2025-09-01T09:00:00Z",
				"updatedAt":   "2025-09-01T10:30:00Z",
			},
		}
		c.JSON(200, gin.H{"tasks": mockTasks, "total": 2})
	})

	// Demo endpoints for testing frontend functionality
	v1.POST("/demo-tasks", func(c *gin.Context) {
		c.JSON(201, gin.H{"message": "Task created successfully", "id": 3})
	})

	v1.PATCH("/demo-tasks/:id/complete", func(c *gin.Context) {
		id := c.Param("id")
		c.JSON(200, gin.H{"message": "Task completed", "id": id})
	})

	v1.DELETE("/demo-tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		c.JSON(200, gin.H{"message": "Task deleted", "id": id})
	})

	// Protected routes (require authentication)
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware(s.config.JWTSecret))
	{
		// Task routes
		tasks := protected.Group("/tasks")
		{
			tasks.POST("", s.taskHandler.CreateTask)
			tasks.GET("", s.taskHandler.GetTasks)
			tasks.GET("/stats", s.taskHandler.GetTaskStats)
			tasks.GET("/:id", s.taskHandler.GetTask)
			tasks.PUT("/:id", s.taskHandler.UpdateTask)
			tasks.DELETE("/:id", s.taskHandler.DeleteTask)
			tasks.PATCH("/:id/complete", s.taskHandler.MarkTaskAsCompleted)
			tasks.PATCH("/:id/pending", s.taskHandler.MarkTaskAsPending)
		}
	}
}

func (s *Server) Start(addr string) error {
	log.Printf("Starting server on %s", addr)
	return s.router.Run(addr)
}
