// Test utilities for consistent Jest setup
export const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn()
});

export const createMockQueryBuilder = () => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  getOne: jest.fn()
});

export const testUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const testTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending' as const,
  priority: 'medium' as const,
  dueDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 1
};
