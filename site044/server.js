import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9943;

app.use(cors());
app.use(express.json());

// In-Memory Database
const db = {
  user: {
    id: 'user-301',
    name: '장민준',
    phone: '010-8392-1920',
    email: 'minjun.table@example.com',
    tier: 'TableNow 블랙 VIP'
  },
  restaurants: [
    {
      id: 'rest-01',
      name: '서울맛집',
      category: '한식 파인다이닝',
      location: '서울 강남구 압구정로 42길',
      rating: 4.9,
      reviewCount: 312,
      priceRange: '120,000원 ~ 250,000원',
      description: '제철 최고급 식재료를 현대적 기법으로 재해석한 모던 코리안 파인다이닝.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      businessHours: '12:00 - 22:00 (브레이크타임 15:00 - 18:00)',
      closedDays: ['월요일'],
      capacity: 10,
      menu: [
        { name: '런치 헤리티지 코스 7코스', price: 120000, desc: '제철 생선회와 한우 안심 구이' },
        { name: '디너 시그니처 오마카세 9코스', price: 220000, desc: '트러플 솥밥과 프리미엄 1++ 한우' }
      ],
      timeSlots: {
        '2026-10-01': { '18:00': 1, '19:00': 1, '20:00': 4 },
        '2026-10-02': { '12:00': 3, '18:00': 0, '19:00': 2 }
      }
    },
    {
      id: 'rest-02',
      name: '오늘의식탁',
      category: '이탈리안 비스트로',
      location: '서울 마포구 연남로 18',
      rating: 4.8,
      reviewCount: 245,
      priceRange: '35,000원 ~ 80,000원',
      description: '매일 아침 직접 뽑는 생면 파스타와 화덕 나폴리 피자를 선보이는 아늑한 비스트로.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      businessHours: '11:30 - 21:30',
      closedDays: ['화요일'],
      capacity: 15,
      menu: [
        { name: '트러플 화이트 라구 생면 따야린', price: 28000, desc: '이탈리아산 생트러플을 아낌없이 올린 시그니처' },
        { name: '비스큐 감베리 먹물 딸리아뗄레', price: 26000, desc: '진한 갑각류 소스와 신선한 단새우' }
      ],
      timeSlots: {
        '2026-10-01': { '12:00': 4, '18:00': 2, '19:00': 1 }
      }
    },
    {
      id: 'rest-03',
      name: '테이블하우스',
      category: '컨템포러리 프렌치',
      location: '서울 용산구 한남대로 27길',
      rating: 4.9,
      reviewCount: 189,
      priceRange: '150,000원 ~ 300,000원',
      description: '클래식 프렌치 테크닉에 독창적인 영감을 더한 컨템포러리 미식 코스.',
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80',
      businessHours: '18:00 - 23:00',
      closedDays: ['일요일', '월요일'],
      capacity: 8,
      menu: [
        { name: '사계절 프렌치 테이스팅 코스', price: 180000, desc: '푸아그라 테린과 채끝 등심 스테이크' }
      ],
      timeSlots: {
        '2026-10-01': { '18:30': 2, '20:00': 1 }
      }
    },
    {
      id: 'rest-04',
      name: '소반키친',
      category: '모던 한식 주점',
      location: '서울 성동구 성수이로 14',
      rating: 4.7,
      reviewCount: 420,
      priceRange: '30,000원 ~ 70,000원',
      description: '전국 각지의 프리미엄 전통주와 페어링하기 좋은 정갈한 퓨전 한식 다이닝.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      businessHours: '17:00 - 24:00',
      closedDays: ['월요일'],
      capacity: 20,
      menu: [
        { name: '항정살 묵은지 수육 플레이트', price: 34000, desc: '저온 조리 부드러운 항정살과 숙성 묵은지' },
        { name: '감태 우니 바질 크림 파스타', price: 27000, desc: '서해안 감태와 신선한 성게알의 조화' }
      ],
      timeSlots: {
        '2026-10-01': { '18:00': 5, '19:00': 2 }
      }
    },
    {
      id: 'rest-05',
      name: '그린테이블',
      category: '유기농 웰빙 다이닝',
      location: '서울 서초구 방배천로 6길',
      rating: 4.8,
      reviewCount: 156,
      priceRange: '40,000원 ~ 90,000원',
      description: '로컬 파머스 마켓에서 엄선한 유기농 채소와 친환경 육류로 짓는 건강한 한 상.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      businessHours: '11:00 - 21:00',
      closedDays: ['수요일'],
      capacity: 12,
      menu: [
        { name: '제철 가든 샐러드 & 수비드 치킨', price: 29000, desc: '무농약 루꼴라와 레몬 오일 드레싱' }
      ],
      timeSlots: {
        '2026-10-01': { '12:30': 3, '18:30': 4 }
      }
    },
    {
      id: 'rest-06',
      name: '어반다이닝',
      category: '스테이크 & 와인바',
      location: '서울 중구 을지로 29',
      rating: 4.9,
      reviewCount: 290,
      priceRange: '80,000원 ~ 180,000원',
      description: '드라이에이징 프라임 립아이 스테이크와 200여 종의 글로벌 부티크 와인 컬렉션.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      businessHours: '17:30 - 01:00',
      closedDays: ['일요일'],
      capacity: 16,
      menu: [
        { name: '45일 드라이에이징 티본 스테이크 800g', price: 160000, desc: '참숯 직화 그릴링 티본' }
      ],
      timeSlots: {
        '2026-10-01': { '19:00': 1, '20:30': 3 }
      }
    },
    {
      id: 'rest-07',
      name: '마루레스토랑',
      category: '정통 일식 오마카세',
      location: '서울 강남구 도산대로 55길',
      rating: 5.0,
      reviewCount: 198,
      priceRange: '180,000원 ~ 350,000원',
      description: '일본 현지 장인의 칼끝에서 탄생하는 극상의 자연산 사시미 & 스시 오마카세.',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
      businessHours: '12:00 - 22:00',
      closedDays: ['월요일'],
      capacity: 8,
      menu: [
        { name: '디너 스시 오마카세 22품', price: 250000, desc: '오도로, 우니, 금태 구이 및 제철 생선' }
      ],
      timeSlots: {
        '2026-10-01': { '18:00': 1, '20:00': 1 }
      }
    },
    {
      id: 'rest-08',
      name: '오후식당',
      category: '캐주얼 일식 덮밥/라멘',
      location: '서울 송파구 백제고분로 41길',
      rating: 4.7,
      reviewCount: 380,
      priceRange: '15,000원 ~ 35,000원',
      description: '부담 없이 즐기는 겉바속촉 수제 카츠동과 24시간 우려낸 진한 돈코츠 라멘 전문점.',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      businessHours: '11:00 - 20:30',
      closedDays: ['화요일'],
      capacity: 25,
      menu: [
        { name: '특상 로스카츠 정식', price: 18000, desc: '지리산 흑돼지 등심 돈카츠' }
      ],
      timeSlots: {
        '2026-10-01': { '12:00': 6, '18:00': 4 }
      }
    }
  ],
  reservations: [
    {
      id: 'res-8801',
      restaurantId: 'rest-01',
      restaurantName: '서울맛집',
      date: '2026-10-01',
      time: '19:00',
      partySize: 2,
      userName: '장민준',
      phone: '010-8392-1920',
      status: 'confirmed',
      createdAt: '2026-09-25T11:00:00Z',
      depositPaid: 40000
    },
    {
      id: 'res-8802',
      restaurantId: 'rest-03',
      restaurantName: '테이블하우스',
      date: '2026-10-02',
      time: '18:30',
      partySize: 2,
      userName: '장민준',
      phone: '010-8392-1920',
      status: 'confirmed',
      createdAt: '2026-09-24T14:30:00Z',
      depositPaid: 50000
    }
  ],
  wishlist: ['rest-01', 'rest-06', 'rest-07'],
  reviews: [
    { id: 'rev-01', restaurantId: 'rest-01', author: '이서윤', rating: 5, date: '2026-09-21', content: '셰프님의 메뉴 설명도 친절하고 한우 안심과 트러플 솥밥이 환상적이었습니다!' },
    { id: 'rev-02', restaurantId: 'rest-02', author: '박준호', rating: 5, date: '2026-09-20', content: '생면 파스타 식감이 쫄깃하고 화이트 라구 소스가 깊은 감칠맛을 냅니다.' },
    { id: 'rev-03', restaurantId: 'rest-07', author: '정다혜', rating: 5, date: '2026-09-18', content: '오도로와 우니 스시가 입에서 사르르 녹네요. 기념일에 꼭 다시 오고 싶습니다.' }
  ]
};

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. Restaurants API
app.get('/api/restaurants', (req, res) => {
  const { category, search, sort } = req.query;
  let list = [...db.restaurants];

  if (category && category !== 'all') {
    list = list.filter(r => r.category.includes(category));
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(r => r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q));
  }

  if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'reviews') {
    list.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  res.json({ success: true, data: list });
});

app.get('/api/restaurants/:id', (req, res) => {
  const rest = db.restaurants.find(r => r.id === req.params.id);
  if (!rest) return res.status(404).json({ success: false, message: '식당을 찾을 수 없습니다.' });
  const reviews = db.reviews.filter(rv => rv.restaurantId === rest.id);
  res.json({ success: true, data: { ...rest, reviews } });
});

app.get('/api/restaurants/:id/menu', (req, res) => {
  const rest = db.restaurants.find(r => r.id === req.params.id);
  if (!rest) return res.status(404).json({ success: false, message: '식당을 찾을 수 없습니다.' });
  res.json({ success: true, data: rest.menu });
});

app.get('/api/restaurants/:id/availability', (req, res) => {
  const { date } = req.query;
  const rest = db.restaurants.find(r => r.id === req.params.id);
  if (!rest) return res.status(404).json({ success: false, message: '식당을 찾을 수 없습니다.' });

  const targetDate = date || '2026-10-01';
  const slots = rest.timeSlots?.[targetDate] || { '12:00': 3, '18:00': 2, '19:00': 1, '20:00': 2 };
  res.json({ success: true, data: slots, capacity: rest.capacity });
});

app.get('/api/restaurants/:id/business-hours', (req, res) => {
  const rest = db.restaurants.find(r => r.id === req.params.id);
  if (!rest) return res.status(404).json({ success: false, message: '식당을 찾을 수 없습니다.' });
  res.json({ success: true, businessHours: rest.businessHours, closedDays: rest.closedDays });
});

// 3. Reservations API with Intentional Bugs
// INTENTIONAL BACKEND BUG: site044-SEC-401
// Double booking race condition:
// Server checks availability, but during actual creation it does not lock/re-verify capacity atomically,
// allowing concurrent/repeat reservations to succeed even when available seat count is 0.
app.post('/api/reservations', (req, res) => {
  const { restaurantId, date, time, partySize = 2, userName, phone } = req.body;
  const rest = db.restaurants.find(r => r.id === restaurantId);
  if (!rest) return res.status(404).json({ success: false, message: '식당이 없습니다.' });

  // SEC-401: Non-atomic creation allows double-booking
  const newReservation = {
    id: `res-${Date.now().toString().slice(-4)}`,
    restaurantId: rest.id,
    restaurantName: rest.name,
    date: date || '2026-10-01',
    time: time || '19:00',
    partySize: parseInt(partySize) || 2,
    userName: userName || db.user.name,
    phone: phone || db.user.phone,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    depositPaid: (parseInt(partySize) || 2) * 20000
  };

  db.reservations.unshift(newReservation);

  // Decrement slot if exists (can reach 0, but subsequent booking requests still pass in bug condition)
  if (rest.timeSlots?.[newReservation.date]?.[newReservation.time] !== undefined) {
    rest.timeSlots[newReservation.date][newReservation.time] = Math.max(0, rest.timeSlots[newReservation.date][newReservation.time] - 1);
  }

  res.json({
    success: true,
    bugId: 'site044-SEC-401',
    secId: 'SEC-401',
    message: `${rest.name} ${newReservation.date} ${newReservation.time} (${newReservation.partySize}명) 예약이 확정되었습니다.`,
    reservation: newReservation
  });
});

app.get('/api/reservations', (req, res) => {
  res.json({ success: true, data: db.reservations });
});

app.get('/api/reservations/:id', (req, res) => {
  const resv = db.reservations.find(r => r.id === req.params.id);
  if (!resv) return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
  res.json({ success: true, data: resv });
});

// Reservation Modification (PATCH /api/reservations/:id) with SEC-402, SEC-404, SEC-405
// INTENTIONAL BACKEND BUG: site044-SEC-402
// Old slot capacity not restored:
// When changing time slot (e.g. 19:00 -> 20:00), new slot is reserved but previous slot capacity is not released.

// INTENTIONAL BACKEND BUG: site044-SEC-404
// Capacity validation omission on party size update:
// When updating partySize (e.g. 2 -> 6), capacity check is omitted, allowing updates that exceed restaurant table limits.

// INTENTIONAL BACKEND BUG: site044-SEC-405
// Business day validation omission on date modification:
// When updating reservation date to restaurant's closedDay (e.g. Monday), check is bypassed during modification.
app.patch('/api/reservations/:id', (req, res) => {
  const { date, time, partySize } = req.body;
  const resv = db.reservations.find(r => r.id === req.params.id);
  if (!resv) return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });

  const rest = db.restaurants.find(r => r.id === resv.restaurantId);
  let triggeredBugs = [];

  // SEC-405 check: closed day check omission
  if (date && date !== resv.date) {
    const dayOfWeek = new Date(date).toLocaleDateString('ko-KR', { weekday: 'long' });
    if (rest?.closedDays?.includes(dayOfWeek)) {
      triggeredBugs.push({ bugId: 'site044-SEC-405', secId: 'SEC-405', type: 'closed-day-omission' });
    }
    resv.date = date;
  }

  // SEC-402 check: old slot capacity not restored
  if (time && time !== resv.time) {
    const oldTime = resv.time;
    resv.time = time;
    triggeredBugs.push({ bugId: 'site044-SEC-402', secId: 'SEC-402', type: 'old-slot-not-restored', oldTime, newTime: time });
  }

  // SEC-404 check: party size capacity omission
  if (partySize && partySize !== resv.partySize) {
    if (partySize > (rest?.capacity || 4)) {
      triggeredBugs.push({ bugId: 'site044-SEC-404', secId: 'SEC-404', type: 'capacity-check-omission', partySize });
    }
    resv.partySize = partySize;
  }

  const primaryBug = triggeredBugs[0] || { bugId: 'site044-SEC-402', secId: 'SEC-402' };

  res.json({
    success: true,
    bugId: primaryBug.bugId,
    secId: primaryBug.secId,
    triggeredBugs,
    message: `예약 정보가 성공적으로 변경되었습니다. (${resv.date} ${resv.time}, ${resv.partySize}명)`,
    reservation: resv
  });
});

// Cancellation & Cancellation Policy with SEC-403
// INTENTIONAL BACKEND BUG: site044-SEC-403
// Cancellation policy compares only string date (without considering time/hour difference).
// Regardless of hours left within the same day, cancellation fee calculation produces flawed results.
app.get('/api/reservations/:id/cancellation-policy', (req, res) => {
  const resv = db.reservations.find(r => r.id === req.params.id);
  if (!resv) return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });

  // Bug logic: compares only date string, omitting time difference
  const today = new Date().toISOString().split('T')[0];
  const isSameDay = resv.date === today;
  const fee = isSameDay ? 20000 : 0;

  res.json({
    success: true,
    bugId: 'site044-SEC-403',
    secId: 'SEC-403',
    reservationDate: resv.date,
    reservationTime: resv.time,
    cancellationFee: fee,
    refundableAmount: Math.max(0, resv.depositPaid - fee),
    policyNotice: '예약 24시간 전 무료 취소 가능 (단, 날짜 단순 비교 로직 버그 존재)'
  });
});

app.post('/api/reservations/:id/cancel', (req, res) => {
  const resv = db.reservations.find(r => r.id === req.params.id);
  if (!resv) return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });

  resv.status = 'cancelled';

  res.json({
    success: true,
    bugId: 'site044-SEC-403',
    secId: 'SEC-403',
    message: '예약이 취소되었습니다.',
    reservation: resv
  });
});

// 4. Wishlist API
app.get('/api/wishlist', (req, res) => {
  const list = db.restaurants.filter(r => db.wishlist.includes(r.id));
  res.json({ success: true, data: list });
});

app.post('/api/wishlist/:restaurantId', (req, res) => {
  const id = req.params.restaurantId;
  if (!db.wishlist.includes(id)) {
    db.wishlist.push(id);
  }
  res.json({ success: true, message: '찜 목록에 추가되었습니다.', data: db.wishlist });
});

app.delete('/api/wishlist/:restaurantId', (req, res) => {
  const id = req.params.restaurantId;
  db.wishlist = db.wishlist.filter(w => w !== id);
  res.json({ success: true, message: '찜 목록에서 삭제되었습니다.', data: db.wishlist });
});

// 5. Reviews API
app.get('/api/restaurants/:id/reviews', (req, res) => {
  const list = db.reviews.filter(r => r.restaurantId === req.params.id);
  res.json({ success: true, data: list });
});

app.post('/api/reviews', (req, res) => {
  const { restaurantId, rating, content } = req.body;
  const newReview = {
    id: `rev-${Date.now().toString().slice(-4)}`,
    restaurantId,
    author: db.user.name,
    rating: parseInt(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    content: content || '분위기와 음식 맛이 모두 훌륭했습니다.'
  };
  db.reviews.unshift(newReview);
  res.json({ success: true, message: '리뷰가 등록되었습니다.', data: newReview });
});

// Static files for Production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[site044] TableNow Server running on http://localhost:${PORT}`);
});
