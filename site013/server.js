const express = require('express');
const path = require('path');
const app = express();
const PORT = 9342;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let classes = [
  { id: 'c1', title: '유화 기초 마스터', difficulty: '초급', price: 40000, instructor: '이사벨라', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'c2', title: '현대 추상화 클래스', difficulty: '중급', price: 55000, instructor: '마르크', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=300&h=200' },
  { id: 'c3', title: '인물화 소묘 완성', difficulty: '고급', price: 60000, instructor: '줄리안', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=300&h=200' }
];

let reservations = [];
let reviews = [
  { id: 'r1', classId: 'c1', user: '김민지', content: '처음인데 너무 친절하게 알려주셨어요!', rating: 5 },
  { id: 'r2', classId: 'c2', user: '이정우', content: '색채 사용법이 인상적이었습니다.', rating: 4 }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ArtClass Studio API is running' });
});

app.get('/api/classes', (req, res) => {
  res.json(classes);
});

app.get('/api/instructors', (req, res) => {
  res.json([
    { name: '이사벨라', specialty: '정물유화', bio: '파리 국립 미술학교 졸업' },
    { name: '마르크', specialty: '현대미술', bio: '추상화 부문 다수 수상' }
  ]);
});

// INTENTIONAL BUG: site013-bug03
// CSV Error: CSRF 방어 누락
// Type: security-csrf
// Description: 예약 생성 API가 CSRF 토큰 없이도 상태 변경 요청을 허용함.
app.post('/api/reservations', (req, res) => {
  const { classId, date, user } = req.body;

  // INTENTIONAL BUG: site013-bug01
  // CSV Error: DB 외래키 검증 누락
  // Type: database-integrity
  // Description: 존재하지 않는 classId로도 예약 데이터가 저장됨.
  // 원래는: if (!classes.find(c => c.id === classId)) return res.status(400);

  const newReservation = {
    id: 'res' + Date.now(),
    classId,
    date,
    user,
    status: 'confirmed'
  };

  reservations.push(newReservation);
  res.status(201).json({ success: true, reservation: newReservation });
});

app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

// INTENTIONAL BUG: site013-bug02
// CSV Error: HTTP 메서드 오용
// Type: network-method
// Description: 후기 삭제성 요청을 GET으로 처리하여 의도치 않은 데이터 변경이 발생할 수 있음.
app.get('/api/reviews/delete/:id', (req, res) => {
  const reviewId = req.params.id;
  const initialLength = reviews.length;
  reviews = reviews.filter(r => r.id !== reviewId);

  if (reviews.length < initialLength) {
    res.json({ success: true, message: 'Review deleted successfully (via GET)' });
  } else {
    res.status(404).json({ error: 'Review not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
