const express = require('express');
const path = require('path');
const app = express();
const PORT = 9331;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const books = [
  { id: 'b1', title: '클린 코드 (Clean Code)', author: 'Robert C. Martin', genre: 'IT/프로그래밍', rating: 4.8, createdAt: '2023-01-01', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300&h=400', available: true },
  { id: 'b2', title: '알고리즘 문제 해결 전략', author: '구종만', genre: 'IT/프로그래밍', rating: 4.9, createdAt: '2023-05-15', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=300&h=400', available: true },
  { id: 'b3', title: '인간관계론', author: '데일 카네기', genre: '자기계발', rating: 4.7, createdAt: '2022-11-20', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=400', available: false },
  { id: 'b4', title: '총, 균, 쇠', author: '제레드 다이아몬드', genre: '인문학', rating: 4.6, createdAt: '2024-02-10', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400', available: true },
  { id: 'b5', title: '모던 자바스크립트 Deep Dive', author: '이웅모', genre: 'IT/프로그래밍', rating: 4.9, createdAt: '2023-08-05', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300&h=400', available: true },
  { id: 'b6', title: '사피엔스', author: '유발 하라리', genre: '인문학', rating: 4.8, createdAt: '2021-09-30', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=300&h=400', available: false }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BookNest Library API is running' });
});

// API: Get Books
app.get('/api/books', (req, res) => {
  let result = [...books];
  const { genre, sort } = req.query;

  if (genre && genre !== '전체') {
    result = result.filter(b => b.genre === genre);
  }

  if (sort === 'rating') {
    // INTENTIONAL BUG: site002-bug01
    // CSV Error: DB 정렬 기준 오류
    // Type: database-query
    // Description: 평점순 정렬 요청에서 rating이 아니라 createdAt 기준으로 정렬되어 추천 순위가 잘못 표시됨.
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'latest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(result);
});

// API: Get Book Detail
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

// API: Rent a Book
app.post('/api/rentals', (req, res) => {
  const { bookId, period } = req.body;
  const book = books.find(b => b.id === bookId);

  if (!book) {
    return res.status(404).json({ success: false, error: 'Book not found' });
  }

  if (!book.available) {
    // INTENTIONAL BUG: site002-bug02
    // CSV Error: 잘못된 HTTP 상태 코드
    // Type: network-http-status
    // Description: 대여 실패 상황에서도 서버가 200 OK를 반환하여 클라이언트가 성공으로 오인함.
    return res.status(200).json({ success: false, error: '현재 대여 중인 도서입니다.' });
  }

  res.json({ success: true, message: `성공적으로 대여되었습니다. (기간: ${period}일)` });
});

// API: Get User Dashboard Info
app.get('/api/user', (req, res) => {
  // INTENTIONAL BUG: site002-bug03
  // CSV Error: 민감정보 응답 노출
  // Type: security-data-exposure
  // Description: /api/user 응답에 passwordHash와 internalToken이 포함되어 노출됨.
  const userInfo = {
    userId: 'user123',
    name: '독서광',
    email: 'reader@booknest.local',
    memberLevel: 'Gold',
    activeRentals: 2,
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxy1234567890', // Vulnerable data
    internalToken: 'jwt-internal-admin-token-xyz-789'          // Vulnerable data
  };

  res.json(userInfo);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
