const express = require('express');
const path = require('path');
const app = express();
const PORT = 9403;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let recipes = [
  { id: 'r1', title: '토마토 바질 파스타', ingredients: ['토마토', '바질', '파스타'], category: '양식', difficulty: '중' },
  { id: 'r2', title: '바질 페스토 샐러드', ingredients: ['바질', '양상추', '치즈'], category: '다이어트', difficulty: '하' },
  { id: 'r3', title: '토마토 수프', ingredients: ['토마토', '양파', '버터'], category: '양식', difficulty: '중' }
];

let prices = [
  { ingredient: '토마토', market: 'A마트', price: 3500 },
  { ingredient: '토마토', market: 'B마트', price: 3200 },
  { ingredient: '바질', market: 'A마트', price: 2000 }
];

let savedRecipes = [
  { id: 'save-1', userId: 'user_A', recipeId: 'r1', date: '2024-05-01' },
  { id: 'save-99', userId: 'user_B', recipeId: 'r3', date: '2024-05-01' } // 타인의 데이터
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MarketRecipe API is running' });
});

app.get('/api/ingredients', (req, res) => {
  res.json(['토마토', '바질', '파스타', '양상추', '치즈', '양파', '버터']);
});

// API: Get Recipes (with filtering bug)
app.get('/api/recipes', (req, res) => {
  const selected = req.query.ingredients ? req.query.ingredients.split(',') : [];
  
  if (selected.length === 0) return res.json(recipes);

  // INTENTIONAL BUG: site074-bug01
  // CSV Error: DB 재료 필터 오류
  // Type: database-filter
  // 버그: 선택한 재료를 모두(AND) 포함해야 하는데, 하나만(OR) 포함해도 결과에 포함함
  const filtered = recipes.filter(r => 
    selected.some(ing => r.ingredients.includes(ing)) // 원래는 selected.every(...) 이어야 함
  );

  res.json(filtered);
});

// API: Get Prices (with Content-Type bug)
app.get('/api/prices', (req, res) => {
  // INTENTIONAL BUG: site074-bug02
  // CSV Error: 네트워크 응답 Content-Type 오류
  // Type: network-content-type
  // 버그: JSON 데이터를 전송하면서 헤더를 text/html로 잘못 설정함
  res.setHeader('Content-Type', 'text/html');
  res.send(JSON.stringify(prices));
});

// API: Get Saved Details (with security authorization bug)
app.get('/api/saved/:id', (req, res) => {
  const { id } = req.params;
  const saved = savedRecipes.find(s => s.id === id);

  if (saved) {
    // INTENTIONAL BUG: site074-bug03
    // CSV Error: 저장 레시피 권한 검증 누락
    // Type: security-authorization
    // 보안 취약점: savedId만 알면 다른 사용자의 저장 정보를 조회할 수 있음 (권한 체크 생략)
    const recipe = recipes.find(r => r.id === saved.recipeId);
    res.json({ ...saved, recipeDetails: recipe });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
