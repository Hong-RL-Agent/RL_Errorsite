import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9150;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Memory Storage (Localized)
let recipes = [
  { id: 1, name: "모히또", ingredients: ["화이트 럼", "설탕", "라임 즙", "탄산수", "민트"], abv: 15, difficulty: "보통", description: "쿠바의 전통적인 하이볼 스타일 칵테일입니다." },
  { id: 2, name: "마티니", ingredients: ["진", "드라이 베르무트", "오렌지 비터"], abv: 30, difficulty: "어려움", description: "칵테일의 왕이라고 불리는 클래식 칵테일입니다." },
  { id: 3, name: "올드 패션드", ingredients: ["버번 위스키", "설탕", "앙고스투라 비터", "물"], abv: 32, difficulty: "보통", description: "가장 오래된 칵테일 중 하나로 위스키 본연의 맛을 느낄 수 있습니다." },
  { id: 4, name: "마가리타", ingredients: ["데킬라", "트리플 섹", "라임 즙"], abv: 25, difficulty: "쉬움", description: "소금 리밍이 매력적인 멕시코 스타일 칵테일입니다." },
  { id: 5, name: "에스프레소 마티니", ingredients: ["보드카", "에스프레소", "커피 리큐르", "설탕 시럽"], abv: 20, difficulty: "보통", description: "커피 향과 보드카의 강렬함이 어우러진 칵테일입니다." }
];

// Cache for Bug 04
let staleCache = {};

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site041", status: "healthy" });
});

// 2. GET /api/recipes
app.get('/api/recipes', (req, res) => {
  // INTENTIONAL BUG: site041-bug01
  const useAltField = Math.random() > 0.5;
  
  const data = recipes.map(r => {
    const newObj = { id: r.id, name: r.name, abv: r.abv, difficulty: r.difficulty };
    if (useAltField) {
      newObj.ingredientList = r.ingredients;
    } else {
      newObj.ingredients = r.ingredients;
    }
    return newObj;
  });

  res.json({
    data,
    bugId: "site041-bug01"
  });
});

// 3. GET /api/recipes/:id
app.get('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (staleCache[id]) {
    return res.json({
      ...staleCache[id],
      bugId: "site041-bug04"
    });
  }

  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });

  // INTENTIONAL BUG: site041-bug02
  const manipulatedAbv = recipe.id % 2 === 0 ? recipe.abv * 3 : recipe.abv / 5;

  res.json({
    ...recipe,
    abv: manipulatedAbv,
    bugId: "site041-bug02"
  });
});

// 4. POST /api/recipes
app.post('/api/recipes', (req, res) => {
  const { name, ingredients, difficulty, abv, description } = req.body;

  // INTENTIONAL BUG: site041-bug03
  if (!name) return res.status(400).json({ error: "이름은 필수 입력 항목입니다." });

  const newRecipe = {
    id: recipes.length + 1,
    name,
    ingredients: ingredients || [],
    difficulty: difficulty || "알 수 없음",
    abv: abv || 0,
    description: description || ""
  };
  
  recipes.push(newRecipe);

  res.json({
    created: true,
    data: newRecipe,
    bugId: ingredients ? null : "site041-bug03"
  });
});

// 5. PUT /api/recipes/:id
app.put('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  
  const recipeIdx = recipes.findIndex(r => r.id === id);
  if (recipeIdx === -1) return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });

  // INTENTIONAL BUG: site041-bug04
  staleCache[id] = { ...recipes[recipeIdx] };
  
  recipes[recipeIdx].name = name;

  res.json({ updated: true });
});

// 6. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  const total = recipes.length;
  const avgAbv = recipes.reduce((acc, r) => acc + r.abv, 0) / total;
  res.json({
    totalRecipes: total,
    avgAbv: Math.round(avgAbv)
  });
});

// 7. GET /api/shaker/random
app.get('/api/shaker/random', (req, res) => {
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
  res.json(randomRecipe);
});

// 8. GET /api/filter
app.get('/api/filter', (req, res) => {
  const { ingredient } = req.query;
  const filtered = recipes.filter(r => 
    r.ingredients.some(i => i.toLowerCase().includes(ingredient.toLowerCase()))
  );
  res.json({ data: filtered });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site041 Cocktail App running on http://localhost:${PORT}`);
});
