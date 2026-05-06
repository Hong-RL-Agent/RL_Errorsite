import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9230;

app.use(cors());
app.use(express.json());

// Serve static files from the React app (vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

let tasks = [
  { id: 1, title: 'Implement Auth', description: 'Setup JWT authentication', status: 'todo', priority: 'high', assignee: 'JD' },
  { id: 2, title: 'Design Database', description: 'Create ERD and schema', status: 'in_progress', priority: 'medium', assignee: 'SL' },
  { id: 3, title: 'Create UI Components', description: 'Build React components based on Figma', status: 'in_progress', priority: 'high', assignee: 'JD' },
  { id: 4, title: 'Setup CI/CD', description: 'Configure GitHub Actions', status: 'done', priority: 'low', assignee: 'AM' },
  { id: 5, title: 'Write Unit Tests', description: 'Add Jest tests for utils', status: 'todo', priority: 'medium', assignee: 'SL' }
];

// API: Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', site: 'site011' });
});

// API: Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// API: Add a new task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title: req.body.title || 'New Task',
    description: req.body.description || '',
    status: req.body.status || 'todo',
    priority: req.body.priority || 'medium',
    assignee: req.body.assignee || 'Unassigned'
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// API: Update a task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
