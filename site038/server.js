import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9147;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let meals = [
  { id: 1, food: "닭가슴살 샐러드", calories: 350, category: "Lunch", date: new Date().toISOString().split('T')[0] },
  { id: 2, food: "사과", calories: 95, category: "Snack", date: new Date().toISOString().split('T')[0] },
  { id: 3, food: "현미밥 & 생선구이", calories: 450, category: "Dinner", date: new Date().toISOString().split('T')[0] }
];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site038", status: "healthy" });
});

// 2. GET /api/meals
app.get('/api/meals', (req, res) => {
  const { slow } = req.query;

  if (slow === 'true') {
    // INTENTIONAL BUG: site038-bug02
    // 유형: timeout-calculation-error (타임아웃 계산 오류)
    // 설명: 타임아웃 시간이 잘못 계산되어 너무 빨리 실패하거나 너무 늦게 응답
    setTimeout(() => {
      res.status(408).json({ 
        error: "timeout", 
        bugId: "site038-bug02",
        message: "Request timed out due to internal calculation error"
      });
    }, 100); // Intentionally very fast "timeout"
    return;
  }

  // INTENTIONAL BUG: site038-bug01
  // 유형: partial-header-send (헤더 부분 전송)
  // 설명: 응답 헤더가 완전히 설정되기 전에 일부만 전송됨
  
  // To simulate partial header/parsing error for PPO agent:
  // We'll write the status and some headers manually, then flush, then send the rest.
  res.status(200);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Bug-Id', 'site038-bug01');
  
  res.json({
    data: meals,
    bugId: "site038-bug01"
  });
});

// 3. POST /api/meals
app.post('/api/meals', (req, res) => {
  const { food, calories, category } = req.body;
  
  // INTENTIONAL BUG: site038-bug03
  // 유형: retry-without-backoff (백오프 미적용 재시도)
  // 설명: 실패 시 즉시 재시도 반복 (지연 없음)
  if (food === 'pizza' || food === 'hamburger') {
    return res.json({
      saved: true,
      retryCount: 5,
      bugId: "site038-bug03"
    });
  }

  const newMeal = {
    id: Date.now(),
    food: food || "Unknown",
    calories: parseInt(calories) || 0,
    category: category || "General",
    date: new Date().toISOString().split('T')[0]
  };
  meals.unshift(newMeal);
  res.json({ saved: true, meal: newMeal });
});

// 4. GET /api/meals/retry-test
app.get('/api/meals/retry-test', (req, res) => {
  // INTENTIONAL BUG: site038-bug04
  // 유형: retry-starvation (재시도 기아)
  // 설명: 특정 요청이 계속 재시도 큐에 밀려 실행되지 않음
  res.json({
    processed: 3,
    starved: 2,
    bugId: "site038-bug04"
  });
});

// 5. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  const total = meals.reduce((acc, m) => acc + m.calories, 0);
  res.json({
    totalCalories: total,
    mealCount: meals.length
  });
});

// 6. GET /api/history
app.get('/api/history', (req, res) => {
  res.json({
    data: meals.map(m => ({ ...m, note: "History log" }))
  });
});

// 7. DELETE /api/meals/:id
app.delete('/api/meals/:id', (req, res) => {
  const initialLen = meals.length;
  meals = meals.filter(m => m.id !== parseInt(req.params.id));
  res.json({ deleted: meals.length < initialLen });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site038 Diet App running on http://localhost:${PORT}`);
});
