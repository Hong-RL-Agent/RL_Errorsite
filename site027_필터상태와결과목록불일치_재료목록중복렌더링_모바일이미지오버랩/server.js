const express = require('express');
const path = require('path');
const app = express();
const PORT = 9246;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const recipes = [
  { id: 1, title: "정통 이탈리안 까르보나라", difficulty: "쉬움", time: "20분", ingredients: ["스파게티면", "판체타", "계란 노른자", "페코리노 로마노 치즈", "후추"], steps: ["물을 끓이고 소금을 넣은 뒤 면을 삶는다.", "판체타를 잘게 썰어 팬에 노릇하게 굽는다.", "볼에 계란 노른자와 치즈를 섞어 소스를 만든다."], image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop", saved: 1240 },
  { id: 2, title: "매콤 달콤 떡볶이", difficulty: "중간", time: "30분", ingredients: ["떡볶이 떡", "어묵", "고추장", "고춧가루", "설탕", "대파"], steps: ["냄비에 물과 육수 팩을 넣고 끓인다.", "소스 재료를 넣고 잘 풀어준다.", "떡과 어묵, 대파를 넣고 국물이 자작해질 때까지 졸인다."], image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=400&fit=crop", saved: 850 },
  { id: 3, title: "풍미 가득 버섯 리조또", difficulty: "어려움", time: "50분", ingredients: ["아르보리오 쌀", "모둠 버섯", "양파", "버터", "치킨 스톡", "화이트 와인"], steps: ["양파와 버섯을 손질하여 볶는다.", "쌀을 넣고 투명해질 때까지 볶다가 와인을 넣는다.", "육수를 조금씩 부어가며 쌀이 익을 때까지 계속 저어준다."], image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop", saved: 620 },
  { id: 4, title: "아보카도 연어 샐러드", difficulty: "쉬움", time: "15분", ingredients: ["연어", "아보카도", "어린잎 채소", "레몬 드레싱", "올리브유"], steps: ["연어와 아보카도를 한입 크기로 썬다.", "볼에 채소를 담고 연어와 아보카도를 올린다.", "드레싱을 골고루 뿌려 완성한다."], image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop", saved: 2100 }
];

const chefs = [
  { name: "Gordon Ramsay", specialty: "프렌치/모던 영국 요리", followers: "15M", topRecipe: "Beef Wellington" },
  { name: "백종원", specialty: "한식 대중 요리", followers: "8M", topRecipe: "제육볶음" }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/recipes', (req, res) => {
  const { difficulty, search } = req.query;
  let filtered = recipes;
  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(r => r.difficulty === difficulty);
  }
  if (search) {
    filtered = filtered.filter(r => r.title.includes(search));
  }
  res.json(filtered);
});

app.get('/api/chefs', (req, res) => {
  res.json(chefs);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
