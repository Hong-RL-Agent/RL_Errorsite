const express = require('express');
const path = require('path');
const app = express();
const PORT = 9401;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let clothes = [
  { id: 'c1', userId: 'user_A', name: '캐시미어 오버핏 코트', category: 'Outer', season: 'Winter', color: 'Beige' },
  { id: 'c2', userId: 'user_A', name: '스트레이트 데님 팬츠', category: 'Pants', season: 'All', color: 'Blue' },
  { id: 'c3', userId: 'user_B', name: '레더 미니스커트', category: 'Skirts', season: 'Autumn', color: 'Black' } // 타인의 옷
];

let history = [
  { id: 'h1', userId: 'user_A', clothId: 'c1', date: '2024-04-28' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MyCloset API is running' });
});

// API: Get Clothes (with multi-tenant data isolation bug)
app.get('/api/clothes', (req, res) => {
  const { userId } = req.query;

  // INTENTIONAL BUG: site072-bug03
  // CSV Error: 사용자 옷장 데이터 분리 실패
  // Type: security-multi-tenant
  // 보안 취약점: 요청한 userId로 필터링하지 않고 모든 사용자의 옷 정보를 반환함
  // 원래 로직: const userClothes = clothes.filter(c => c.userId === userId);
  res.json(clothes);
});

// API: Add Cloth (with category mapping bug)
app.post('/api/clothes', (req, res) => {
  const { userId, name, category, season, color } = req.body;
  
  // INTENTIONAL BUG: site072-bug01
  // CSV Error: DB 카테고리 매핑 오류
  // Type: database-relation
  // 버그: 클라이언트가 보낸 category 대신 무조건 'Top'으로 저장함
  const finalCategory = 'Top'; 

  const newCloth = {
    id: `c-${Date.now()}`,
    userId,
    name,
    category: finalCategory,
    season,
    color
  };

  clothes.push(newCloth);
  res.status(201).json(newCloth);
});

// API: Get Outfit Recommendations (with partial response bug)
app.get('/api/outfits/recommend', (req, res) => {
  const recommendations = [
    { 
      id: 'outfit-1', 
      title: '미니멀 위크엔드 룩', 
      items: [
        { type: 'Top', name: '화이트 옥스퍼드 셔츠' },
        { type: 'Pants', name: '베이지 슬랙스' },
        // INTENTIONAL BUG: site072-bug02
        // CSV Error: 네트워크 부분 응답
        // 버그: 특정 코디에서 아이템 정보를 고의로 누락함 (예: Shoes가 빠짐)
        { type: 'Outer', name: '네이비 가디건' }
      ]
    },
    {
      id: 'outfit-2',
      title: '비즈니스 시크',
      items: [
        { type: 'Top', name: '실크 블라우스' },
        { type: 'Pants', name: '와이드 슬랙스' },
        { type: 'Shoes', name: '포인티드 토 힐' }
      ]
    }
  ];

  res.json(recommendations);
});

app.get('/api/history', (req, res) => {
  res.json(history);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
