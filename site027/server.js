import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9136;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Data
let posts = [
  { id: 1, name: "초코", age: 2, breed: "푸들", status: "available", likes: 5, description: "사람을 잘 따르는 명랑한 푸들입니다.", createdAt: 1710000000000 },
  { id: 2, name: "몽이", age: 3, breed: "진돗개", status: "available", likes: 12, description: "듬직하고 영리한 진돗개입니다.", createdAt: 1711000000000 },
  { id: 3, name: "루비", age: 1, breed: "말티즈", status: "adopted", likes: 24, description: "애교 많은 말티즈 루비는 새 가족을 만났습니다.", createdAt: 1712000000000 },
  { id: 4, name: "까미", age: 4, breed: "믹스", status: "available", likes: 8, description: "차분하고 조용한 성격의 까미입니다.", createdAt: 1713000000000 },
];

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site027",
    status: "healthy",
    timestamp: Date.now()
  });
});

// 2. GET /api/posts (bug01: timestamp-format-change)
app.get('/api/posts', (req, res) => {
  const { status, search } = req.query;
  let filtered = [...posts];

  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  if (search) {
    filtered = filtered.filter(p => p.name.includes(search) || p.breed.includes(search));
  }

  // bugId: site027-bug01 - createdAt이 ISO string으로 변경됨
  const data = filtered.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt).toISOString()
  }));

  res.json({
    data,
    bugId: "site027-bug01"
  });
});

// 3. POST /api/posts
app.post('/api/posts', (req, res) => {
  const { name, age, breed, description } = req.body;
  const newPost = {
    id: posts.length + 1,
    name,
    age: parseInt(age),
    breed,
    description,
    status: "available",
    likes: 0,
    createdAt: Date.now()
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// 4. GET /api/posts/:id (bug03: null-handling-change)
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: "Not found" });

  // bugId: site027-bug03 - description이 null 대신 "null" 문자열로 반환됨
  res.json({
    ...post,
    description: "null",
    bugId: "site027-bug03"
  });
});

// 5. POST /api/posts/:id/like
app.post('/api/posts/:id/like', (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Not found" });

  posts[index].likes += 1;
  res.json({ likes: posts[index].likes });
});

// 6. GET /api/posts/popular (bug02: numeric-overflow-change)
app.get('/api/posts/popular', (req, res) => {
  const sorted = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  // bugId: site027-bug02 - likes 값이 비정상적으로 큼
  const data = sorted.map(p => ({
    ...p,
    likes: 999999999999
  }));

  res.json({
    data,
    bugId: "site027-bug02"
  });
});

// 7. GET /api/search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = posts.filter(p => p.name.includes(q) || p.breed.includes(q));
  res.json(results);
});

// 8. GET /api/dashboard/summary (bug04: response-type-mismatch)
app.get('/api/dashboard/summary', (req, res) => {
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((acc, p) => acc + p.likes, 0);

  // bugId: site027-bug04 - totalLikes가 string으로 반환됨
  res.json({
    totalPosts,
    totalLikes: String(totalLikes),
    bugId: "site027-bug04"
  });
});

// Serve SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
