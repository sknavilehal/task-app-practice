import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      const data = await response.json();
      setTasks([...tasks, data]);
      setNewTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Manager</h1>
      </header>
      <main>
        <section className="task-form">
          <h2>Add New Task</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="task-list">
          <h2>Your Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks yet. Add one above!</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className={task.completed ? 'completed' : ''}>
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <small>Created: {new Date(task.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => handleComplete(task.id)}
                      className={`complete-btn ${task.completed ? 'completed' : ''}`}
                    >
                      {task.completed ? '✓' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App; 