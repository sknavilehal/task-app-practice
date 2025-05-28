import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { Task } from './entities/Task';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taskmanager',
  entities: [Task],
  synchronize: true,
});

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await AppDataSource.getRepository(Task).find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const task = taskRepository.create(req.body);
    const result = await taskRepository.save(task);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id/complete', async (req, res) => {
  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({ where: { id: parseInt(req.params.id) } });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    const result = await taskRepository.save(task);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({ where: { id: parseInt(req.params.id) } });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await taskRepository.remove(task);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Initialize database connection and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
  }); 