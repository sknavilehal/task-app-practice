package models_test

import (
	"testing"
	"time"

	"task-manager-backend/internal/models"

	"github.com/stretchr/testify/assert"
)

func TestTaskModel(t *testing.T) {
	t.Run("should create task with default values", func(t *testing.T) {
		task := &models.Task{
			Title:  "Test Task",
			UserID: 1,
		}

		assert.Equal(t, "Test Task", task.Title)
		assert.Equal(t, uint(1), task.UserID)
		assert.Equal(t, models.TaskStatus(""), task.Status)
		assert.Equal(t, models.TaskPriority(""), task.Priority)
	})

	t.Run("should check if task is overdue", func(t *testing.T) {
		now := time.Now()
		yesterday := now.Add(-24 * time.Hour)
		tomorrow := now.Add(24 * time.Hour)

		// Task with past due date and pending status should be overdue
		overdueTask := &models.Task{
			DueDate: &yesterday,
			Status:  models.StatusPending,
		}
		assert.True(t, overdueTask.IsOverdue())

		// Task with future due date should not be overdue
		futureTask := &models.Task{
			DueDate: &tomorrow,
			Status:  models.StatusPending,
		}
		assert.False(t, futureTask.IsOverdue())

		// Completed task should not be overdue even if past due date
		completedTask := &models.Task{
			DueDate: &yesterday,
			Status:  models.StatusCompleted,
		}
		assert.False(t, completedTask.IsOverdue())

		// Task without due date should not be overdue
		noDueDateTask := &models.Task{
			Status: models.StatusPending,
		}
		assert.False(t, noDueDateTask.IsOverdue())
	})

	t.Run("should check if task is completed", func(t *testing.T) {
		completedTask := &models.Task{Status: models.StatusCompleted}
		assert.True(t, completedTask.IsCompleted())

		pendingTask := &models.Task{Status: models.StatusPending}
		assert.False(t, pendingTask.IsCompleted())
	})

	t.Run("should mark task as completed", func(t *testing.T) {
		task := &models.Task{Status: models.StatusPending}
		task.MarkAsCompleted()
		assert.Equal(t, models.StatusCompleted, task.Status)
	})

	t.Run("should mark task as pending", func(t *testing.T) {
		task := &models.Task{Status: models.StatusCompleted}
		task.MarkAsPending()
		assert.Equal(t, models.StatusPending, task.Status)
	})

	t.Run("should get priority weight", func(t *testing.T) {
		highTask := &models.Task{Priority: models.PriorityHigh}
		assert.Equal(t, 3, highTask.GetPriorityWeight())

		mediumTask := &models.Task{Priority: models.PriorityMedium}
		assert.Equal(t, 2, mediumTask.GetPriorityWeight())

		lowTask := &models.Task{Priority: models.PriorityLow}
		assert.Equal(t, 1, lowTask.GetPriorityWeight())

		// Default case for unknown priority
		unknownTask := &models.Task{Priority: "unknown"}
		assert.Equal(t, 2, unknownTask.GetPriorityWeight())
	})

	t.Run("should validate task constants", func(t *testing.T) {
		// Status constants
		assert.Equal(t, models.TaskStatus("pending"), models.StatusPending)
		assert.Equal(t, models.TaskStatus("completed"), models.StatusCompleted)

		// Priority constants
		assert.Equal(t, models.TaskPriority("low"), models.PriorityLow)
		assert.Equal(t, models.TaskPriority("medium"), models.PriorityMedium)
		assert.Equal(t, models.TaskPriority("high"), models.PriorityHigh)
	})
}

func TestCreateTaskRequest(t *testing.T) {
	t.Run("should create valid request", func(t *testing.T) {
		dueDate := time.Now().Add(24 * time.Hour)
		priority := models.PriorityHigh
		description := "Test description"

		req := &models.CreateTaskRequest{
			Title:       "Test Task",
			Description: &description,
			Priority:    &priority,
			DueDate:     &dueDate,
		}

		assert.Equal(t, "Test Task", req.Title)
		assert.Equal(t, "Test description", *req.Description)
		assert.Equal(t, models.PriorityHigh, *req.Priority)
		assert.Equal(t, dueDate, *req.DueDate)
	})
}

func TestUpdateTaskRequest(t *testing.T) {
	t.Run("should create valid update request", func(t *testing.T) {
		title := "Updated Task"
		status := models.StatusCompleted
		priority := models.PriorityLow
		description := "Updated description"
		dueDate := time.Now().Add(48 * time.Hour)

		req := &models.UpdateTaskRequest{
			Title:       &title,
			Description: &description,
			Status:      &status,
			Priority:    &priority,
			DueDate:     &dueDate,
		}

		assert.Equal(t, "Updated Task", *req.Title)
		assert.Equal(t, "Updated description", *req.Description)
		assert.Equal(t, models.StatusCompleted, *req.Status)
		assert.Equal(t, models.PriorityLow, *req.Priority)
		assert.Equal(t, dueDate, *req.DueDate)
	})
}

func TestTaskFilter(t *testing.T) {
	t.Run("should create valid filter", func(t *testing.T) {
		status := models.StatusPending
		priority := models.PriorityHigh
		overdue := true

		filter := &models.TaskFilter{
			Status:   &status,
			Priority: &priority,
			Overdue:  &overdue,
			Page:     1,
			Limit:    20,
		}

		assert.Equal(t, models.StatusPending, *filter.Status)
		assert.Equal(t, models.PriorityHigh, *filter.Priority)
		assert.True(t, *filter.Overdue)
		assert.Equal(t, 1, filter.Page)
		assert.Equal(t, 20, filter.Limit)
	})
}

func TestTaskStats(t *testing.T) {
	t.Run("should create valid stats", func(t *testing.T) {
		stats := &models.TaskStats{
			Total:     100,
			Pending:   30,
			Completed: 60,
			Overdue:   10,
		}

		assert.Equal(t, int64(100), stats.Total)
		assert.Equal(t, int64(30), stats.Pending)
		assert.Equal(t, int64(60), stats.Completed)
		assert.Equal(t, int64(10), stats.Overdue)
	})
}
