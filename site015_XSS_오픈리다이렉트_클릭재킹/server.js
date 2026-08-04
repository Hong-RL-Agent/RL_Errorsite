import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9234;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const posts = [
  { 
    id: 1, 
    tag: 'General', 
    title: 'Welcome to our community!', 
    author: 'Admin',
    content: 'We are glad to have you here. Please follow the rules.', 
    likes: 12,
    comments: [
      { id: 101, author: 'User1', text: 'Great start!' }
    ]
  },
  { 
    id: 2, 
    tag: 'Tech', 
    title: 'React vs Vue in 2026', 
    author: 'DevMaster',
    content: 'Which one do you prefer for large scale projects?', 
    likes: 45,
    comments: []
  },
  { 
    id: 3, 
    tag: 'Bug', 
    title: 'Check out this cool trick!', 
    author: 'Hacker',
    // INTENTIONAL GUI BUG: site015-bug01 (XSS payload)
    content: 'Look at this: <img src=x onerror="document.getElementById(\'xss-alert\').style.display=\'block\'">', 
    likes: 0,
    comments: []
  }
];

const tags = ['General', 'Tech', 'Bug', 'Lifestyle', 'Market'];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site015' });
});

app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.get('/api/tags', (req, res) => {
  res.json(tags);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Community Server running on http://localhost:${PORT}`);
});
