const express = require('express');
const path = require('path');
const app = express();
const PORT = 9346;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let recipes = [
  { id: 'rc1', title: '매콤 토마토 파스타', ingredients: ['파스타면', '토마토소스', '고추'], difficulty: '초급', time: '15분', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'rc2', title: '궁중 소고기 불고기', ingredients: ['소고기', '간장', '배', '파'], difficulty: '중급', time: '40분', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'rc3', title: '아삭아삭 닭가슴살 샐러드', ingredients: ['닭가슴살', '양상추', '오리엔탈드레싱'], difficulty: '초급', time: '10분', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=300&h=200' }
];

let savedRecipes = [];
let reviews = [
  { id: 'rv1', recipeId: 'rc1', user: '요리왕', content: '정말 맛있어요! 간단해서 좋네요.' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Recipe Cloud API is running' });
});

// API: Search Recipes
app.get('/api/recipes', (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) return res.json(recipes);

  // INTENTIONAL BUG: site017-bug01
  // CSV Error: DB LIKE 검색 오류
  // Type: database-search
  // Description: 재료 검색 시 정확히 일치하는 값만 반환하여 부분 검색 결과가 누락됨.
  // 원래는: recipes.filter(r => r.ingredients.some(i => i.includes(ingredient)))
  const filtered = recipes.filter(r => r.ingredients.some(i => i === ingredient));

  res.json(filtered);
});

// API: Saved Recipes
app.get('/api/saved', (req, res) => {
  res.json(savedRecipes);
});

app.post('/api/saved', (req, res) => {
  const { recipeId } = req.body;
  const exists = savedRecipes.includes(recipeId);

  // INTENTIONAL BUG: site017-bug02
  // CSV Error: 잘못된 응답 코드
  // Type: network-http-status
  // Description: 저장 실패 상황에서도 201 Created를 반환함.
  if (exists) {
    // 이미 저장된 경우 실제로는 400이나 409를 보내야 하지만, 버그로 인해 성공 코드를 보냄
    return res.status(201).json({ success: false, message: 'Already saved' });
  }

  savedRecipes.push(recipeId);
  res.status(201).json({ success: true, message: 'Saved successfully' });
});

// API: Reviews
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { recipeId, user, content } = req.body;

  // INTENTIONAL BUG: site017-bug03
  // CSV Error: 입력값 검증 누락
  // Type: security-input-validation
  // Description: 후기 내용 길이와 스크립트성 입력을 서버에서 검증하지 않고 저장함.
  // 어떠한 sanitize나 length check도 수행하지 않음
  const newReview = {
    id: 'rv' + Date.now(),
    recipeId,
    user,
    content
  };

  reviews.push(newReview);
  res.status(201).json(newReview);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
