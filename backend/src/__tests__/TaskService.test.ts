import { TaskService, CreateTaskData, UpdateTaskData } from '../services/TaskService';
import { Task } from '../entities/Task';
import { Repository } from 'typeorm';

// Mock TypeORM Repository
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn()
} as unknown as jest.Mocked<Repository<Task>>;

// Mock QueryBuilder
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn()
};

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService(mockRepository);
    jest.clearAllMocks();
    
    // Setup default QueryBuilder mock
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const taskData: CreateTaskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        userId: 1
      };

      const expectedTask = {
        id: 1,
        ...taskData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Task;

      mockRepository.create.mockReturnValue(expectedTask);
      mockRepository.save.mockResolvedValue(expectedTask);

      const result = await taskService.createTask(taskData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        dueDate: undefined,
        userId: 1,
        status: 'pending'
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedTask);
      expect(result).toEqual(expectedTask);
    });

    it('should throw error if title is empty', async () => {
      const taskData: CreateTaskData = {
        title: '',
        userId: 1
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow('Title is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if userId is missing', async () => {
      const taskData = {
        title: 'New Task'
      } as CreateTaskData;

      await expect(taskService.createTask(taskData)).rejects.toThrow('User ID is required');
    });

    it('should set default priority to medium', async () => {
      const taskData: CreateTaskData = {
        title: 'New Task',
        userId: 1
      };

      const expectedTask = {
        id: 1,
        title: 'New Task',
        priority: 'medium',
        status: 'pending',
        userId: 1
      } as Task;

      mockRepository.create.mockReturnValue(expectedTask);
      mockRepository.save.mockResolvedValue(expectedTask);

      await taskService.createTask(taskData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: undefined,
        priority: 'medium',
        dueDate: undefined,
        userId: 1,
        status: 'pending'
      });
    });
  });

  describe('getTasksByUser', () => {
    it('should return tasks for a user', async () => {
      const userId = 1;
      const expectedTasks = [
        { id: 1, title: 'Task 1', userId },
        { id: 2, title: 'Task 2', userId }
      ] as Task[];

      mockQueryBuilder.getMany.mockResolvedValue(expectedTasks);

      const result = await taskService.getTasksByUser(userId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('task.userId = :userId', { userId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC');
      expect(result).toEqual(expectedTasks);
    });

    it('should filter tasks by status', async () => {
      const userId = 1;
      const filters = { status: 'completed' as const };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await taskService.getTasksByUser(userId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status = :status', { status: 'completed' });
    });

    it('should filter tasks by priority', async () => {
      const userId = 1;
      const filters = { priority: 'high' as const };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await taskService.getTasksByUser(userId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.priority = :priority', { priority: 'high' });
    });

    it('should filter overdue tasks', async () => {
      const userId = 1;
      const filters = { overdue: true };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await taskService.getTasksByUser(userId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.dueDate < :now', { now: expect.any(Date) });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status != :completed', { completed: 'completed' });
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const taskId = 1;
      const userId = 1;
      const updateData: UpdateTaskData = {
        title: 'Updated Task',
        status: 'completed'
      };

      const existingTask = {
        id: taskId,
        userId,
        title: 'Old Task',
        status: 'pending'
      } as Task;

      const updatedTask = {
        ...existingTask,
        ...updateData,
        updatedAt: expect.any(Date)
      } as Task;

      mockRepository.findOne.mockResolvedValue(existingTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Updated Task',
        status: 'completed'
      }));
      expect(result).toEqual(updatedTask);
    });

    it('should throw error if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(taskService.updateTask(999, 1, {})).rejects.toThrow('Task not found');
    });

    it('should throw error if user does not own task', async () => {
      const task = { id: 1, userId: 2 } as Task;
      mockRepository.findOne.mockResolvedValue(task);

      await expect(taskService.updateTask(1, 1, {})).rejects.toThrow('Unauthorized');
    });

    it('should throw error if title is empty', async () => {
      const task = { id: 1, userId: 1 } as Task;
      mockRepository.findOne.mockResolvedValue(task);

      await expect(taskService.updateTask(1, 1, { title: '' })).rejects.toThrow('Title cannot be empty');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = 1;
      const userId = 1;
      const task = { id: taskId, userId } as Task;

      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.remove.mockResolvedValue(task);

      await taskService.deleteTask(taskId, userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(task);
    });

    it('should throw error if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(taskService.deleteTask(999, 1)).rejects.toThrow('Task not found');
    });

    it('should throw error if user does not own task', async () => {
      const task = { id: 1, userId: 2 } as Task;
      mockRepository.findOne.mockResolvedValue(task);

      await expect(taskService.deleteTask(1, 1)).rejects.toThrow('Unauthorized');
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      const userId = 1;
      const mockTasks = [
        { status: 'pending', isOverdue: () => false },
        { status: 'completed', isOverdue: () => false },
        { status: 'in_progress', isOverdue: () => true },
        { status: 'pending', isOverdue: () => true }
      ] as Task[];

      mockQueryBuilder.getMany.mockResolvedValue(mockTasks);

      const result = await taskService.getTaskStats(userId);

      expect(result).toEqual({
        total: 4,
        completed: 1,
        pending: 2,
        inProgress: 1,
        overdue: 2
      });
    });
  });
});
