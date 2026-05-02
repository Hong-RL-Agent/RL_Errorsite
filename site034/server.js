const express = require('express');
const path = require('path');
const app = express();
const PORT = 9363;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let sitters = [
  { id: 's1', name: '김민지', location: '서울 강남구', rate: 25000, rating: 4.9, bio: '강아지 고양이 가리지 않고 사랑으로 돌봅니다.' },
  { id: 's2', name: '이정훈', location: '서울 서초구', rate: 22000, rating: 4.7, bio: '대형견 산책 전문입니다. 넓은 마당이 있어요.' },
  { id: 's3', name: '박하늘', location: '경기 성남시', rate: 20000, rating: 4.8, bio: '반려견 행동 교정사 자격증 보유 중입니다.' }
];

let pets = [
  { id: 'p1', userId: 'user_A', name: '초코', type: 'Dog', breed: 'Poodle', age: 3, note: '간식을 좋아함' },
  { id: 'p2', userId: 'user_A', name: '치즈', type: 'Cat', breed: 'Korean Shorthair', age: 2, note: '낯가림이 있음' },
  { id: 'p99', userId: 'user_B', name: '몽이', type: 'Dog', breed: 'Maltese', age: 5, note: '비밀 정보: 분리불안 있음' }
];

let bookings = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PetSitter Match API is running' });
});

app.get('/api/sitters', (req, res) => {
  res.json(sitters);
});

app.get('/api/pets', (req, res) => {
  // 실제로는 userId로 필터링해야 하지만 IDOR 테스트를 위해 목록만 제공
  res.json(pets.filter(p => p.userId === 'user_A'));
});

// API: Get Pet Detail (with IDOR bug)
// INTENTIONAL BUG: site034-bug03
// CSV Error: 반려동물 정보 접근 제어 실패
// Type: security-idor
app.get('/api/pets/:id', (req, res) => {
  const pet = pets.find(p => p.id === req.params.id);
  if (pet) {
    // 보안 취약점: 요청한 사용자가 소유자인지 확인하는 로직(e.g. pet.userId === currentUser.id)이 없음
    res.json(pet);
  } else {
    res.status(404).json({ error: 'Pet not found' });
  }
});

// API: Create Booking
app.post('/api/bookings', (req, res) => {
  const { sitterId, petId, startDate, endDate, userId } = req.body;

  // INTENTIONAL BUG: site034-bug02
  // CSV Error: 네트워크 요청 본문 누락
  // Type: network-request-validation
  // Description: 필수 petId가 없어도 서버가 성공 응답을 보냄.
  // 원래는: if (!petId) return res.status(400).json({ error: 'Pet selection is required' });

  // INTENTIONAL BUG: site034-bug01
  // CSV Error: DB 예약 날짜 검증 누락
  // Type: database-validation
  // Description: 종료일이 시작일보다 빠른 예약도 저장됨.
  // 원래는: if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ error: 'Invalid dates' });

  const newBooking = {
    id: 'bk-' + Date.now(),
    sitterId,
    petId,
    startDate,
    endDate,
    userId,
    status: 'Confirmed',
    createdAt: new Date()
  };

  bookings.push(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

app.get('/api/bookings/:userId', (req, res) => {
  res.json(bookings.filter(b => b.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
