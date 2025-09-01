package services

import (
	"errors"
	"fmt"
	"time"

	"task-manager-backend/internal/models"

	"gorm.io/gorm"
)

type TaskService struct {
	db *gorm.DB
}

func NewTaskService(db *gorm.DB) *TaskService {
	return &TaskService{db: db}
}

// CreateTask creates a new task
func (s *TaskService) CreateTask(userID uint, req *models.CreateTaskRequest) (*models.Task, error) {
	task := &models.Task{
		Title:       req.Title,
		Description: req.Description,
		UserID:      userID,
		DueDate:     req.DueDate,
	}

	if req.Priority != nil {
		task.Priority = *req.Priority
	} else {
		task.Priority = models.PriorityMedium
	}

	if err := s.db.Create(task).Error; err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return task, nil
}

// GetTaskByID retrieves a task by ID for a specific user
func (s *TaskService) GetTaskByID(userID, taskID uint) (*models.Task, error) {
	var task models.Task
	err := s.db.Where("id = ? AND user_id = ?", taskID, userID).First(&task).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("task not found")
		}
		return nil, fmt.Errorf("failed to get task: %w", err)
	}
	return &task, nil
}

// GetTasksByUser retrieves tasks for a user with filtering and pagination
func (s *TaskService) GetTasksByUser(userID uint, filter *models.TaskFilter) ([]models.Task, int64, error) {
	query := s.db.Where("user_id = ?", userID)

	// Apply filters
	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}
	if filter.Priority != nil {
		query = query.Where("priority = ?", *filter.Priority)
	}
	if filter.Overdue != nil && *filter.Overdue {
		query = query.Where("due_date < ? AND status != ?", time.Now(), models.StatusCompleted)
	}

	// Count total records
	var total int64
	if err := query.Model(&models.Task{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count tasks: %w", err)
	}

	// Apply pagination
	offset := (filter.Page - 1) * filter.Limit
	query = query.Offset(offset).Limit(filter.Limit)

	// Order by priority (high to low) and creation date (newest first)
	query = query.Order("CASE WHEN priority = 'high' THEN 3 WHEN priority = 'medium' THEN 2 ELSE 1 END DESC, created_at DESC")

	var tasks []models.Task
	if err := query.Find(&tasks).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get tasks: %w", err)
	}

	return tasks, total, nil
}

// UpdateTask updates an existing task
func (s *TaskService) UpdateTask(userID, taskID uint, req *models.UpdateTaskRequest) (*models.Task, error) {
	task, err := s.GetTaskByID(userID, taskID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Title != nil {
		task.Title = *req.Title
	}
	if req.Description != nil {
		task.Description = req.Description
	}
	if req.Status != nil {
		task.Status = *req.Status
	}
	if req.Priority != nil {
		task.Priority = *req.Priority
	}
	if req.DueDate != nil {
		task.DueDate = req.DueDate
	}

	if err := s.db.Save(task).Error; err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return task, nil
}

// DeleteTask deletes a task (soft delete)
func (s *TaskService) DeleteTask(userID, taskID uint) error {
	result := s.db.Where("id = ? AND user_id = ?", taskID, userID).Delete(&models.Task{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete task: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("task not found")
	}
	return nil
}

// GetTaskStats returns task statistics for a user
func (s *TaskService) GetTaskStats(userID uint) (*models.TaskStats, error) {
	stats := &models.TaskStats{}

	// Total tasks
	if err := s.db.Model(&models.Task{}).Where("user_id = ?", userID).Count(&stats.Total).Error; err != nil {
		return nil, fmt.Errorf("failed to count total tasks: %w", err)
	}

	// Pending tasks
	if err := s.db.Model(&models.Task{}).Where("user_id = ? AND status = ?", userID, models.StatusPending).Count(&stats.Pending).Error; err != nil {
		return nil, fmt.Errorf("failed to count pending tasks: %w", err)
	}

	// Completed tasks
	if err := s.db.Model(&models.Task{}).Where("user_id = ? AND status = ?", userID, models.StatusCompleted).Count(&stats.Completed).Error; err != nil {
		return nil, fmt.Errorf("failed to count completed tasks: %w", err)
	}

	// Overdue tasks
	if err := s.db.Model(&models.Task{}).
		Where("user_id = ? AND due_date < ? AND status != ?", userID, time.Now(), models.StatusCompleted).
		Count(&stats.Overdue).Error; err != nil {
		return nil, fmt.Errorf("failed to count overdue tasks: %w", err)
	}

	return stats, nil
}

// MarkTaskAsCompleted marks a task as completed
func (s *TaskService) MarkTaskAsCompleted(userID, taskID uint) (*models.Task, error) {
	task, err := s.GetTaskByID(userID, taskID)
	if err != nil {
		return nil, err
	}

	task.MarkAsCompleted()
	if err := s.db.Save(task).Error; err != nil {
		return nil, fmt.Errorf("failed to mark task as completed: %w", err)
	}

	return task, nil
}

// MarkTaskAsPending marks a task as pending
func (s *TaskService) MarkTaskAsPending(userID, taskID uint) (*models.Task, error) {
	task, err := s.GetTaskByID(userID, taskID)
	if err != nil {
		return nil, err
	}

	task.MarkAsPending()
	if err := s.db.Save(task).Error; err != nil {
		return nil, fmt.Errorf("failed to mark task as pending: %w", err)
	}

	return task, nil
}
