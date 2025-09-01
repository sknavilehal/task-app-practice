import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../entities/Task';

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  userId: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  overdue?: boolean;
}

export class TaskService {
  constructor(private taskRepository: Repository<Task>) {}

  async createTask(data: CreateTaskData): Promise<Task> {
    if (!data.title || data.title.trim() === '') {
      throw new Error('Title is required');
    }

    if (!data.userId) {
      throw new Error('User ID is required');
    }

    const task = this.taskRepository.create({
      title: data.title.trim(),
      description: data.description,
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      userId: data.userId,
      status: 'pending'
    });

    return await this.taskRepository.save(task);
  }

  async getTasksByUser(userId: number, filters?: TaskFilters): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .orderBy('task.createdAt', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    if (filters?.overdue) {
      queryBuilder.andWhere('task.dueDate < :now', { now: new Date() });
      queryBuilder.andWhere('task.status != :completed', { completed: 'completed' });
    }

    return await queryBuilder.getMany();
  }

  async getTaskById(id: number, userId: number): Promise<Task | null> {
    const task = await this.taskRepository.findOne({
      where: { id }
    });

    if (!task) {
      return null;
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return task;
  }

  async updateTask(id: number, userId: number, updateData: UpdateTaskData): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Update fields
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim() === '') {
        throw new Error('Title cannot be empty');
      }
      task.title = updateData.title.trim();
    }

    if (updateData.description !== undefined) {
      task.description = updateData.description;
    }

    if (updateData.status !== undefined) {
      task.status = updateData.status;
    }

    if (updateData.priority !== undefined) {
      task.priority = updateData.priority;
    }

    if (updateData.dueDate !== undefined) {
      task.dueDate = updateData.dueDate;
    }

    task.updatedAt = new Date();

    return await this.taskRepository.save(task);
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.taskRepository.remove(task);
  }

  async getTaskStats(userId: number): Promise<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
  }> {
    const tasks = await this.getTasksByUser(userId);
    
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: tasks.filter(t => t.isOverdue()).length
    };

    return stats;
  }
}
