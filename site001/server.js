const express = require('express');
const path = require('path');
const app = express();
const PORT = 9330;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const products = [
  { id: 'p1', title: '깨끗한 전공서적 팝니다 (컴퓨터구조)', price: 15000, category: '도서', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'p2', title: '거의 새것 무선 마우스', price: 20000, category: '전자기기', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'p3', title: '아이패드 프로 4세대', price: 700000, category: '전자기기', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'p4', title: '전자기기 입문용 키보드', price: 30000, category: '전자기기', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'p5', title: '편한 자취방 의자', price: 40000, category: '가구', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400&h=300' },
  { id: 'p6', title: '자취 필수품 전자레인지', price: 50000, category: '가전', image: 'https://images.unsplash.com/photo-1585659722983-3a6750f2fd82?auto=format&fit=crop&q=80&w=400&h=300' }
];

const reviews = [
  { id: 1, text: "물건 상태가 너무 좋아요!", rating: 5, author: "익명1" },
  { id: 2, text: "직거래 시간에 늦으셔서 조금 아쉬웠습니다.", rating: 3, author: "익명2" }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Market API is running' });
});

// API: Get Products
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { category, sort } = req.query;

  if (category && category !== '전체') {
    // INTENTIONAL BUG: site001-bug01
    // CSV Error: 잘못된 DB 필터 조건
    // Type: database-query
    // Description: 카테고리 필터 API에서 category 대신 title 필드로 검색하여 특정 카테고리 결과가 누락됨.
    result = result.filter(p => p.title.includes(category));
  }

  if (sort === 'priceAsc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'priceDesc') {
    result.sort((a, b) => b.price - a.price);
  }

  res.json(result);
});

// API: Get Product Detail
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// API: Toggle Favorite
app.post('/api/favorites', (req, res) => {
  const { productId } = req.body;
  
  if (productId === 'p3') {
    // INTENTIONAL BUG: site001-bug02
    // CSV Error: 네트워크 타임아웃 처리 누락
    // Type: network-timeout
    // Description: 관심 상품 저장 API가 특정 상품 id에서 지연 응답을 반환하지만 클라이언트가 명확한 재시도/오류 처리를 하지 못함.
    setTimeout(() => {
      res.json({ success: true, message: 'Added to favorites (delayed)' });
    }, 30000); // 30 seconds delay to trigger client timeout or infinite loading
  } else {
    res.json({ success: true, message: 'Added to favorites' });
  }
});

// API: Login mock
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'test' && password === '1234') {
    res.json({ success: true, token: 'mock-jwt-token-12345', userId: 'user-test-01' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// API: Get My Page Data
app.get('/api/mypage', (req, res) => {
  // INTENTIONAL BUG: site001-bug03
  // CSV Error: 인증 우회 취약점
  // Type: security-authentication
  // Description: 로그인하지 않아도 x-user-id 헤더만 임의로 보내면 마이페이지 데이터에 접근 가능함.
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Vulnerable: simply accepts the provided x-user-id
  res.json({
    userId: userId,
    name: '익명의 대학생',
    points: 1500,
    salesCount: 5,
    buyCount: 2
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
