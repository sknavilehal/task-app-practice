package models

import (
	"time"

	"gorm.io/gorm"
)

type TaskStatus string
type TaskPriority string

const (
	StatusPending   TaskStatus = "pending"
	StatusCompleted TaskStatus = "completed"
)

const (
	PriorityLow    TaskPriority = "low"
	PriorityMedium TaskPriority = "medium"
	PriorityHigh   TaskPriority = "high"
)

type Task struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null" validate:"required,min=1,max=200"`
	Description *string        `json:"description" gorm:"type:text"`
	Status      TaskStatus     `json:"status" gorm:"default:'pending'" validate:"oneof=pending completed"`
	Priority    TaskPriority   `json:"priority" gorm:"default:'medium'" validate:"oneof=low medium high"`
	DueDate     *time.Time     `json:"dueDate"`
	UserID      uint           `json:"userId" gorm:"not null" validate:"required"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName returns the table name for the Task model
func (Task) TableName() string {
	return "tasks"
}

// IsOverdue checks if the task is overdue
func (t *Task) IsOverdue() bool {
	if t.DueDate == nil || t.Status == StatusCompleted {
		return false
	}
	return t.DueDate.Before(time.Now())
}

// IsCompleted checks if the task is completed
func (t *Task) IsCompleted() bool {
	return t.Status == StatusCompleted
}

// MarkAsCompleted marks the task as completed
func (t *Task) MarkAsCompleted() {
	t.Status = StatusCompleted
}

// MarkAsPending marks the task as pending
func (t *Task) MarkAsPending() {
	t.Status = StatusPending
}

// GetPriorityWeight returns numeric weight for priority (for sorting)
func (t *Task) GetPriorityWeight() int {
	switch t.Priority {
	case PriorityHigh:
		return 3
	case PriorityMedium:
		return 2
	case PriorityLow:
		return 1
	default:
		return 2
	}
}

// CreateTaskRequest represents the request payload for creating a task
type CreateTaskRequest struct {
	Title       string        `json:"title" validate:"required,min=1,max=200"`
	Description *string       `json:"description"`
	Priority    *TaskPriority `json:"priority" validate:"omitempty,oneof=low medium high"`
	DueDate     *time.Time    `json:"dueDate"`
}

// UpdateTaskRequest represents the request payload for updating a task
type UpdateTaskRequest struct {
	Title       *string       `json:"title" validate:"omitempty,min=1,max=200"`
	Description *string       `json:"description"`
	Status      *TaskStatus   `json:"status" validate:"omitempty,oneof=pending completed"`
	Priority    *TaskPriority `json:"priority" validate:"omitempty,oneof=low medium high"`
	DueDate     *time.Time    `json:"dueDate"`
}

// TaskFilter represents filter options for querying tasks
type TaskFilter struct {
	Status   *TaskStatus   `form:"status" validate:"omitempty,oneof=pending completed"`
	Priority *TaskPriority `form:"priority" validate:"omitempty,oneof=low medium high"`
	Overdue  *bool         `form:"overdue"`
	Page     int           `form:"page" validate:"min=1"`
	Limit    int           `form:"limit" validate:"min=1,max=100"`
}

// TaskStats represents task statistics
type TaskStats struct {
	Total     int64 `json:"total"`
	Pending   int64 `json:"pending"`
	Completed int64 `json:"completed"`
	Overdue   int64 `json:"overdue"`
}

// BeforeCreate sets default values before creating a task
func (t *Task) BeforeCreate(tx *gorm.DB) error {
	if t.Priority == "" {
		t.Priority = PriorityMedium
	}
	if t.Status == "" {
		t.Status = StatusPending
	}
	return nil
}
