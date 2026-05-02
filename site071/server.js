const express = require('express');
const path = require('path');
const app = express();
const PORT = 9400;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let classes = [
  { 
    id: 'c1', title: '나만의 수제 향수 만들기', category: 'DIY', 
    location: '서울 성수', date: '2024-05-10', price: 45000,
    maxCapacity: 5, currentBookings: 5, // 정원 가득 참
    instructor: '이지현 향수 연구소',
    // INTENTIONAL BUG: site071-bug02
    // CSV Error: API 스키마 불일치
    // 버그: seatsLeft 대신 remainSeats를 사용하여 클라이언트 스키마와 불일치 유발
    remainSeats: 0 
  },
  { 
    id: 'c2', title: '아크릴 풍경화 기초 클래스', category: 'Art', 
    location: '경기 수원', date: '2024-05-12', price: 38000,
    maxCapacity: 8, currentBookings: 3,
    instructor: '김아뜰리에',
    remainSeats: 5
  },
  { 
    id: 'c3', title: '비건 베이킹 원데이 클래스', category: 'Food', 
    location: '서울 홍대', date: '2024-05-15', price: 55000,
    maxCapacity: 6, currentBookings: 2,
    instructor: '그린테이블',
    remainSeats: 4
  }
];

let bookings = [
  { id: 'b1', classId: 'c1', userName: '김철수' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LocalClass API is running' });
});

// API: Get Classes (with schema mismatch bug)
app.get('/api/classes', (req, res) => {
  res.json(classes);
});

// API: Booking (with capacity validation and auth bugs)
app.post('/api/bookings', (req, res) => {
  const { classId, userName } = req.body;
  const targetClass = classes.find(c => c.id === classId);

  if (!targetClass) return res.status(404).json({ error: 'Class not found' });

  // INTENTIONAL BUG: site071-bug03
  // CSV Error: 예약 인증 검증 누락
  // Type: security-authentication
  // 보안 취약점: Authorization 헤더 검증 없이 누구나 예약 API 호출 가능
  // 원래는 Bearer 토큰 등이 있어야 함

  // INTENTIONAL BUG: site071-bug01
  // CSV Error: DB 예약 정원 검증 누락
  // Type: database-validation
  // 버그: 정원을 초과해도 예약을 수락함 (targetClass.currentBookings >= targetClass.maxCapacity 체크 생략)

  const newBooking = {
    id: `b-${Date.now()}`,
    classId,
    userName
  };

  bookings.push(newBooking);
  targetClass.currentBookings += 1;
  targetClass.remainSeats -= 1;

  res.status(201).json({ success: true, message: '예약이 성공적으로 완료되었습니다.', booking: newBooking });
});

app.get('/api/instructors', (req, res) => {
  res.json([
    { id: 'i1', name: '이지현', bio: '조향사 경력 10년, 다수의 향수 런칭' },
    { id: 'i2', name: '김민수', bio: '현대미술 작가, 개인전 5회 개최' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
