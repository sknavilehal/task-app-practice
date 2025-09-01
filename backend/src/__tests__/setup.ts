// Test environment setup - Jest globals will be available at runtime
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Global test data
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

// This file is used by jest setupFilesAfterEnv, not as a test file
// Jest will automatically run this setup before each test
