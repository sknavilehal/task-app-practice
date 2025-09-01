import { Task } from '../entities/Task';

describe('Task Entity', () => {
  describe('constructor', () => {
    it('should create a task with all properties', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
      
      const taskData = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending' as const,
        priority: 'high' as const,
        dueDate: futureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1
      };

      const task = new Task(taskData);

      expect(task.id).toBe(1);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toEqual(taskData.dueDate);
      expect(task.userId).toBe(1);
    });

    it('should create a task with optional fields as undefined', () => {
      const taskData = {
        id: 1,
        title: 'Minimal Task',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1
      };

      const task = new Task(taskData);

      expect(task.title).toBe('Minimal Task');
      expect(task.description).toBeUndefined();
      expect(task.dueDate).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should validate required fields', () => {
      expect(() => {
        new Task({} as any);
      }).toThrow();
    });

    it('should validate title is not empty', () => {
      const taskData = {
        id: 1,
        title: '',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1
      };

      expect(() => {
        new Task(taskData);
      }).toThrow('Title cannot be empty');
    });
  });

  describe('methods', () => {
    let task: Task;

      beforeEach(() => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future
      
      task = new Task({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        dueDate: futureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1
      });
    });    it('should check if task is overdue', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const overdueTask = new Task({
        id: 2,
        title: 'Overdue Task',
        status: 'pending',
        priority: 'high',
        dueDate: pastDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1
      });

      expect(overdueTask.isOverdue()).toBe(true);
      expect(task.isOverdue()).toBe(false);
    });

    it('should check if task is completed', () => {
      expect(task.isCompleted()).toBe(false);
      
      const completedTask = new Task({
        id: 2,
        title: 'Completed Task',
        status: 'completed',
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1
      });
      
      expect(completedTask.isCompleted()).toBe(true);
    });

    it('should convert to JSON', () => {
      const json = task.toJSON();
      
      expect(json).toHaveProperty('id', 1);
      expect(json).toHaveProperty('title', 'Test Task');
      expect(json).toHaveProperty('status', 'pending');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });
  });
});
