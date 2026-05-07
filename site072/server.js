import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9181;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let recipes = [
  { id: 1, title: '토마토 파스타', category: 'pasta', likes: 120, rating: 4.8, ingredients: ['토마토', '면', '마늘'], createdAt: '2024-05-01' },
  { id: 2, title: '바닐라 아이스크림', category: 'dessert', likes: 85, rating: 4.5, ingredients: ['우유', '바닐라', '설탕'], createdAt: '2024-05-03' },
  { id: 3, title: '김치찌개', category: 'korean', likes: 300, rating: 4.9, ingredients: ['김치', '돼지고기', '두부'], createdAt: '2024-05-02' },
  { id: 4, title: '알리오 올리오', category: 'pasta', likes: 150, rating: 4.2, ingredients: ['마늘', '올리브유', '면'], createdAt: '2024-05-05' },
  { id: 5, title: '초코 브라우니', category: 'dessert', likes: 200, rating: 4.7, ingredients: ['초콜릿', '밀가루', '버터'], createdAt: '2024-05-04' }
];

let logs = [
  { id: 1, time: new Date().toISOString(), msg: '새로운 레시피 "김치찌개"가 등록되었습니다.' },
  { id: 2, time: new Date().toISOString(), msg: '인기순 정렬 요청이 발생했습니다.' }
];

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site072', status: 'healthy' });
});

app.get('/api/recipes', (req, res) => {
  const { search, sort, category, triggerBug } = req.query;
  let filtered = [...recipes];

  // BUG-01: String Normalization Mismatch
  if (triggerBug === 'site072-bug01' && search) {
    // Intentionally filter only case-sensitive
    filtered = filtered.filter(r => r.title.includes(search));
    return res.json({ data: filtered, bugId: 'site072-bug01' });
  } else if (search) {
    filtered = filtered.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
  }

  if (category) {
    filtered = filtered.filter(r => r.category === category);
  }

  // BUG-02: Incorrect Sort Key Selection
  // Any request for 'popular' sort will now trigger the bug for consistent PPO training
  if (sort === 'popular') {
    // Intentionally sorting by id ascending (oldest first) instead of likes
    filtered.sort((a, b) => a.id - b.id);
    return res.json({ data: filtered, bugId: 'site072-bug02' });
  } else if (sort === 'latest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({ data: filtered });
});

app.post('/api/recipes', (req, res) => {
  const { title, ingredients, category } = req.body;
  const newRecipe = {
    id: recipes.length + 1,
    title,
    ingredients,
    category,
    likes: 0,
    rating: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
  recipes.push(newRecipe);
  logs.push({ id: logs.length + 1, time: new Date().toISOString(), msg: `새 레시피 "${title}"가 등록되었습니다.` });
  res.status(201).json(newRecipe);
});

app.get('/api/recipes/ratings', (req, res) => {
  // BUG-03: Floating-point precision error
  const avg = 4.5 / 1.0000001; // Results in 4.49999955...
  res.json({ average: avg, bugId: 'site072-bug03' });
});

app.get('/api/categories', (req, res) => {
  res.json({ data: ['pasta', 'dessert', 'korean'] });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalRecipes: recipes.length,
    avgRating: 4.6,
    totalLikes: recipes.reduce((sum, r) => sum + r.likes, 0)
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Recipe Platform running on http://localhost:${PORT}`);
});
