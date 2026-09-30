import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9933;

app.use(cors());
app.use(express.json());

// In-Memory Database
let users = [
  { id: 'usr-001', name: '이지은', email: 'jieun.lee@pawmate.kr', role: 'customer', region: '서울/강남', points: 15000, createdAt: '2026-01-10T09:00:00Z' },
  { id: 'usr-002', name: '강동원', email: 'dongwon.kang@pawmate.kr', role: 'customer', region: '서울/서초', points: 3200, createdAt: '2026-01-15T10:00:00Z' },
  { id: 'usr-003', name: '박보검 (전문 펫시터)', email: 'bogum.park@pawmate.kr', role: 'sitter', region: '서울/송파', points: 45000, createdAt: '2026-01-05T08:00:00Z' },
  { id: 'usr-004', name: '한소희 (수석 그루머)', email: 'sohee.han@pawmate.kr', role: 'groomer', region: '서울/강남', points: 28000, createdAt: '2026-01-08T09:30:00Z' },
  { id: 'usr-005', name: '관리자', email: 'admin@pawmate.kr', role: 'admin', region: '서울/종로', points: 99999, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'usr-006', name: '임시온', email: 'sion.lim@pawmate.kr', role: 'customer', region: '경기/성남', points: 8000, createdAt: '2026-02-01T12:00:00Z' }
];

let currentUser = users[0]; // Default logged-in user (이지은)

let pets = [
  { id: 'pet-001', ownerId: 'usr-001', name: '초코', species: '강아지', breed: '토이푸들', age: 3, weight: 3.8, gender: '남아(중성화)', notes: '낯가림이 조금 있으나 간식을 주면 금방 친해집니다. 관절 영양제 복용 중.', vaccinationStatus: '종합백신 5차 완료, 광견병 접종 완료', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', createdAt: '2026-01-10T10:00:00Z' },
  { id: 'pet-002', ownerId: 'usr-001', name: '라떼', species: '고양이', breed: '스코티시 폴드', age: 2, weight: 4.2, gender: '여아(중성화)', notes: '조용한 환경을 선호하며 깃털 장난감 놀이를 매우 좋아합니다.', vaccinationStatus: '기본 접종 완료', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', createdAt: '2026-01-12T14:00:00Z' },
  { id: 'pet-003', ownerId: 'usr-002', name: '뭉치', species: '강아지', breed: '비숑 프리제', age: 4, weight: 5.5, gender: '남아', notes: '에너지가 넘치고 다른 강아지와 어울리는 것을 좋아합니다.', vaccinationStatus: '광견병 및 인플루엔자 완료', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&q=80', createdAt: '2026-01-16T11:00:00Z' },
  { id: 'pet-004', ownerId: 'usr-002', name: '호두', species: '강아지', breed: '골든 리트리버', age: 5, weight: 28.0, gender: '여아(중성화)', notes: '순하고 사람을 아주 좋아하며 긴 산책 코스를 즐깁니다.', vaccinationStatus: '종합백신 정기 접종 완료', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80', createdAt: '2026-01-20T09:30:00Z' },
  { id: 'pet-005', ownerId: 'usr-006', name: '구름이', species: '고양이', breed: '러시안 블루', age: 1, weight: 3.2, gender: '남아', notes: '호기심이 많고 츄르를 매우 좋아합니다.', vaccinationStatus: '1차 예방접종 완료', image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80', createdAt: '2026-02-05T16:00:00Z' }
];

let providers = [
  { id: 'prov-001', name: '박보검 매니저', role: 'sitter', region: '서울/강남·서초', introduction: '반려동물행동교정사 1급 자격 보유, 5년 경력의 베테랑 펫시터', serviceTypes: ['산책 돌봄', '방문 돌봄'], rating: 4.95, reviewCount: 142, price: 25000, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', availableDays: '월, 화, 수, 목, 금, 토' },
  { id: 'prov-002', name: '한소희 마스터', role: 'groomer', region: '서울/강남', introduction: '스트레스 프리 프리미엄 1:1 맞춤형 펫 스파 & 가위컷 전문', serviceTypes: ['미용/스파', '위생케어'], rating: 4.98, reviewCount: 98, price: 65000, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', availableDays: '화, 수, 목, 금, 일' },
  { id: 'prov-003', name: '해피하우스 펫호텔', role: 'hotel_operator', region: '서울/송파', introduction: '24시간 훈련사 상주, 개별 테라스 룸 & CCTV 실시간 확인', serviceTypes: ['호텔링', '데이케어'], rating: 4.88, reviewCount: 76, price: 45000, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80', availableDays: '매일' },
  { id: 'prov-004', name: '정해인 시터', role: 'sitter', region: '경기/분당·성남', introduction: '대형견 맞춤 트레이닝 및 에너지 소모 산책 전문 파트너', serviceTypes: ['산책 돌봄', '방문 케어'], rating: 4.9, reviewCount: 65, price: 28000, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', availableDays: '수, 목, 금, 토, 일' }
];

let services = [
  { id: 'srv-001', providerId: 'prov-001', title: '맞춤 1:1 안심 산책 & 케어 (60분)', type: 'walk', region: '서울/강남·서초', description: 'GPS 실시간 이동 경로 공유, 발 닦기 및 급수 케어 포함', price: 25000, duration: 60, rating: 4.95, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80' },
  { id: 'srv-002', providerId: 'prov-001', title: '홈 방문 돌봄 & 배변 정리 (90분)', type: 'visit-care', region: '서울/강남·서초', description: '사료/물 급여, 실내 놀이, 배변판 세척 및 실시간 사진 전송', price: 35000, duration: 90, rating: 4.92, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80' },
  { id: 'srv-003', providerId: 'prov-002', title: '프리미엄 탄산 스파 & 스타일 가위컷', type: 'grooming', region: '서울/강남', description: '피부 진정 천연 아로마 탄산 스파 및 견종별 맞춤형 디자인 미용', price: 65000, duration: 120, rating: 4.98, image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=400&q=80' },
  { id: 'srv-004', providerId: 'prov-003', title: '스위트룸 1박 24시 호텔링', type: 'hotel', region: '서울/송파', description: '개별 냉난방 룸, 야외 플레이그라운드 자유 산책 2회 포함', price: 45000, duration: 1440, rating: 4.88, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80' }
];

let bookings = [
  { id: 'bk-1001', userId: 'usr-001', petId: 'pet-001', providerId: 'prov-001', serviceId: 'srv-001', date: '2026-04-05', startTime: '14:00', endTime: '15:00', status: 'confirmed', price: 25000, refundAmount: 0, createdAt: '2026-03-20T10:00:00Z' },
  { id: 'bk-1002', userId: 'usr-001', petId: 'pet-001', providerId: 'prov-002', serviceId: 'srv-003', date: '2026-03-15', startTime: '11:00', endTime: '13:00', status: 'completed', price: 65000, refundAmount: 0, createdAt: '2026-03-10T14:00:00Z' },
  { id: 'bk-1003', userId: 'usr-001', petId: 'pet-002', providerId: 'prov-001', serviceId: 'srv-002', date: '2026-03-25', startTime: '16:00', endTime: '17:30', status: 'cancelled', price: 35000, refundAmount: 0, createdAt: '2026-03-22T09:00:00Z' },
  { id: 'bk-1004', userId: 'usr-002', petId: 'pet-003', providerId: 'prov-001', serviceId: 'srv-001', date: '2026-04-10', startTime: '10:00', endTime: '11:00', status: 'confirmed', price: 25000, refundAmount: 0, createdAt: '2026-03-21T11:30:00Z' }
];

let products = [
  { id: 'prod-001', name: '오리진 핏 무곡물 연어 동결건조 사료 (1.8kg)', category: '사료', description: '90% 고단백 생육으로 만든 알러지 케어 프리미엄 영양식', price: 38000, stock: 25, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', rating: 4.9, reviewCount: 56 },
  { id: 'prod-002', name: '바삭바삭 유기농 치킨 트릿 간식 (120g)', category: '간식', description: '국내산 무항생제 닭가슴살 100% 원물 그대로 건조', price: 9500, stock: 40, image: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=400&q=80', rating: 4.85, reviewCount: 84 },
  { id: 'prod-003', name: '천연 라텍스 치발 삑삑이 토이 세트', category: '장난감', description: '무독성 친환경 소재로 치석 제거와 스트레스 해소에 탁월', price: 12000, stock: 18, image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=400&q=80', rating: 4.78, reviewCount: 32 },
  { id: 'prod-004', name: '노즈워크 푹신 마약 쿠션 베드 (L사이즈)', category: '하우스', description: '관절을 받쳐주는 고밀도 메모리폼과 분리 세탁 가능한 극세사 커버', price: 49000, stock: 12, image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=400&q=80', rating: 4.92, reviewCount: 45 },
  { id: 'prod-005', name: '무자극 세라마이드 보습 샴푸 & 컨디셔너 (500ml)', category: '위생용품', description: 'EWG 그린등급 식물성 계면활성제 민감 피부 진정 샴푸', price: 21000, stock: 30, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80', rating: 4.88, reviewCount: 29 }
];

let cart = [
  { id: 'cart-001', userId: 'usr-001', productId: 'prod-001', quantity: 1 },
  { id: 'cart-002', userId: 'usr-001', productId: 'prod-002', quantity: 2 }
];

let orders = [
  { id: 'ord-5001', userId: 'usr-001', items: [{ productId: 'prod-001', name: '오리진 핏 무곡물 연어 동결건조 사료', quantity: 1, price: 38000 }], subtotal: 38000, shippingFee: 0, discountAmount: 5000, usedPoints: 0, totalAmount: 33000, status: 'delivered', createdAt: '2026-03-10T14:30:00Z' }
];

let coupons = [
  { id: 'coup-001', code: 'WELCOME5000', name: '신규 가입 5,000원 웰컴 쿠폰', type: 'fixed', discountValue: 5000, minimumOrderAmount: 30000, usageLimit: 1, usedCount: 0, userUsageLimit: 1, expiresAt: '2026-12-31', isActive: true },
  { id: 'coup-002', code: 'SPRING10', name: '봄맞이 전 상품 10% 특별 할인 쿠폰', type: 'percentage', discountValue: 10, minimumOrderAmount: 20000, usageLimit: 1, usedCount: 0, userUsageLimit: 1, expiresAt: '2026-12-31', isActive: true },
  { id: 'coup-003', code: 'CAREVIP10000', name: '돌봄 서비스 이용 감사 10,000원 쿠폰', type: 'fixed', discountValue: 10000, minimumOrderAmount: 40000, usageLimit: 1, usedCount: 0, userUsageLimit: 1, expiresAt: '2026-12-31', isActive: true }
];

let pointHistory = [
  { id: 'pt-001', userId: 'usr-001', type: 'earn', amount: 10000, balanceAfter: 10000, reason: '신규 회원가입 웰컴 포인트 지급', bookingId: null, orderId: null, createdAt: '2026-01-10T09:00:00Z' },
  { id: 'pt-002', userId: 'usr-001', type: 'earn', amount: 5000, balanceAfter: 15000, reason: '첫 돌봄 서비스 이용 완료 감사 리워드', bookingId: 'bk-1002', orderId: null, createdAt: '2026-03-15T13:00:00Z' }
];

let reviews = [
  { id: 'rev-001', userId: 'usr-001', serviceId: 'srv-003', rating: 5, content: '초코가 미용 스트레스 없이 너무 예쁘게 잘 다듬어졌어요! 쌤 최고입니다.', createdAt: '2026-03-16T10:00:00Z' },
  { id: 'rev-002', userId: 'usr-002', serviceId: 'srv-001', rating: 5, content: '산책 코스도 꼼꼼히 기록해주시고 사진도 많이 보내주셔서 안심했습니다.', createdAt: '2026-03-18T14:30:00Z' }
];

let posts = [
  { id: 'post-001', userId: 'usr-001', authorName: '이지은', category: '일상자랑', title: '우리집 푸들 초코의 산책 후 꿀잠 타임 🐶', content: '오늘 60분 산책 알차게 하고 와서 발 닦자마자 마약 방석에 파묻혀서 자네요 ㅎㅎ', likes: 34, commentsCount: 6, createdAt: '2026-03-24T15:00:00Z' },
  { id: 'post-002', userId: 'usr-003', authorName: '박보검 매니저', category: '돌봄팁', title: '봄철 강아지 진드기 예방 및 산책 후 체크리스트 🌿', content: '풀숲에 들어간 후에는 반드시 귀 안쪽, 발가락 사이, 배 부위를 꼼꼼히 빗질하며 확인해주세요!', likes: 52, commentsCount: 11, createdAt: '2026-03-22T11:20:00Z' }
];

// ==========================================
// 1. Health Endpoint
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site034',
    service: 'PawMate Pet Care Booking & Supplies Platform'
  });
});

// ==========================================
// 2. Auth & User Switching
// ==========================================
app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, data: currentUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email) || users[0];
  currentUser = user;
  res.json({ success: true, message: '로그인되었습니다.', data: currentUser });
});

app.post('/api/auth/switch', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    currentUser = user;
    res.json({ success: true, data: currentUser });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// ==========================================
// 3. Pets Management (SEC-355: Resource Ownership Missing)
// ==========================================
app.get('/api/pets', (req, res) => {
  const userPets = pets.filter(p => p.ownerId === currentUser.id);
  res.json({ success: true, data: userPets });
});

// INTENTIONAL BACKEND BUG: site034-bug05 (SEC-355)
// Pet resource ownership is intentionally not verified in every access path.
// Any authenticated user can view, update, or delete any pet by petId.
app.get('/api/pets/:petId', (req, res) => {
  const pet = pets.find(p => p.id === req.params.petId);
  if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

  // Bug: No pet.ownerId === currentUser.id check
  res.json({ success: true, data: pet });
});

app.post('/api/pets', (req, res) => {
  const { name, species = '강아지', breed, age, weight, notes } = req.body;
  const newPet = {
    id: `pet-${Date.now()}`,
    ownerId: currentUser.id,
    name: name || '우리 아가',
    species,
    breed: breed || '믹스견',
    age: Number(age) || 1,
    weight: Number(weight) || 3.0,
    gender: '남아',
    notes: notes || '',
    vaccinationStatus: '정기 접종 완료',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date().toISOString()
  };
  pets.push(newPet);
  res.json({ success: true, message: '반려동물이 등록되었습니다.', data: newPet });
});

app.patch('/api/pets/:petId', (req, res) => {
  const pet = pets.find(p => p.id === req.params.petId);
  if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

  // Bug (SEC-355): Missing ownership check (pet.ownerId === currentUser.id)
  const { name, age, weight, notes, vaccinationStatus } = req.body;
  if (name !== undefined) pet.name = name;
  if (age !== undefined) pet.age = Number(age);
  if (weight !== undefined) pet.weight = Number(weight);
  if (notes !== undefined) pet.notes = notes;
  if (vaccinationStatus !== undefined) pet.vaccinationStatus = vaccinationStatus;

  res.json({ success: true, message: '반려동물 정보가 수정되었습니다.', data: pet });
});

app.delete('/api/pets/:petId', (req, res) => {
  const idx = pets.findIndex(p => p.id === req.params.petId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Pet not found' });

  // Bug (SEC-355): Missing ownership check
  const deleted = pets.splice(idx, 1)[0];
  res.json({ success: true, message: '반려동물이 삭제되었습니다.', data: deleted });
});

// ==========================================
// 4. Care Services & Providers
// ==========================================
app.get('/api/services', (req, res) => {
  const { type, region } = req.query;
  let filtered = [...services];
  if (type && type !== '전체') filtered = filtered.filter(s => s.type === type);
  if (region && region !== '전체') filtered = filtered.filter(s => s.region.includes(region));
  res.json({ success: true, data: filtered });
});

app.get('/api/services/:serviceId', (req, res) => {
  const srv = services.find(s => s.id === req.params.serviceId);
  if (!srv) return res.status(404).json({ success: false, message: 'Service not found' });
  const prov = providers.find(p => p.id === srv.providerId);
  res.json({ success: true, data: { ...srv, provider: prov } });
});

app.get('/api/providers', (req, res) => {
  res.json({ success: true, data: providers });
});

// ==========================================
// 5. Bookings & Cancellations (SEC-351 & SEC-352)
// ==========================================
app.get('/api/bookings', (req, res) => {
  const userBookings = bookings.filter(b => b.userId === currentUser.id).map(b => {
    const srv = services.find(s => s.id === b.serviceId);
    const prov = providers.find(p => p.id === b.providerId);
    const pet = pets.find(p => p.id === b.petId);
    return { ...b, service: srv, provider: prov, pet };
  });
  res.json({ success: true, data: userBookings });
});

app.get('/api/bookings/:bookingId', (req, res) => {
  const b = bookings.find(x => x.id === req.params.bookingId);
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
  const srv = services.find(s => s.id === b.serviceId);
  const prov = providers.find(p => p.id === b.providerId);
  const pet = pets.find(p => p.id === b.petId);
  res.json({ success: true, data: { ...b, service: srv, provider: prov, pet } });
});

// INTENTIONAL BACKEND BUG: site034-bug01 (SEC-351)
// Booking availability and overlapping time validation are intentionally incomplete.
// Double bookings for the same provider, date, and time slot are allowed without rejection.
app.post('/api/bookings', (req, res) => {
  const { providerId, serviceId, petId, date, startTime, endTime, price } = req.body;

  // Bug: No validation checking if another booking with same providerId, date, startTime already exists.
  const newBooking = {
    id: `bk-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: currentUser.id,
    petId: petId || (pets[0] ? pets[0].id : 'pet-001'),
    providerId: providerId || 'prov-001',
    serviceId: serviceId || 'srv-001',
    date: date || '2026-04-05',
    startTime: startTime || '14:00',
    endTime: endTime || '15:00',
    status: 'confirmed',
    price: Number(price) || 25000,
    refundAmount: 0,
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);

  res.json({
    success: true,
    message: '돌봄 서비스 예약이 확정되었습니다.',
    data: newBooking
  });
});

app.post('/api/bookings/:bookingId/cancel', (req, res) => {
  const b = bookings.find(x => x.id === req.params.bookingId);
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
  b.status = 'cancelled';
  res.json({ success: true, message: '예약이 취소되었습니다.', data: b });
});

// INTENTIONAL BACKEND BUG: site034-bug02 (SEC-352)
// Refund processing does not fully prevent duplicate refund credits.
// Repeated calls to refund on the same cancelled booking grant refund points repeatedly.
app.post('/api/bookings/:bookingId/refund', (req, res) => {
  const b = bookings.find(x => x.id === req.params.bookingId);
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });

  // Bug: Does not verify if booking was already refunded (b.refundAmount > 0)
  const refundValue = b.price || 25000;
  currentUser.points += refundValue;
  b.refundAmount = (b.refundAmount || 0) + refundValue;
  b.status = 'refunded';

  const refundHistory = {
    id: `pt-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: currentUser.id,
    type: 'refund',
    amount: refundValue,
    balanceAfter: currentUser.points,
    reason: `예약 취소 환불 포인트 지급 (예약번호: ${b.id})`,
    bookingId: b.id,
    createdAt: new Date().toISOString()
  };

  pointHistory.unshift(refundHistory);

  res.json({
    success: true,
    message: `예약 취소에 따른 ${refundValue.toLocaleString()}P 환불 처리가 완료되었습니다.`,
    data: { booking: b, refundHistory, currentPoints: currentUser.points }
  });
});

// ==========================================
// 6. Supplies Market & Orders (SEC-353 & SEC-354)
// ==========================================
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...products];
  if (category && category !== '전체') filtered = filtered.filter(p => p.category === category);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  res.json({ success: true, data: filtered });
});

app.get('/api/cart', (req, res) => {
  const userCart = cart.filter(c => c.userId === currentUser.id).map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  });
  res.json({ success: true, data: userCart });
});

app.post('/api/cart/items', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const existing = cart.find(c => c.userId === currentUser.id && c.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    res.json({ success: true, data: existing });
  } else {
    const newItem = { id: `cart-${Date.now()}`, userId: currentUser.id, productId, quantity };
    cart.push(newItem);
    res.json({ success: true, data: newItem });
  }
});

app.delete('/api/cart', (req, res) => {
  cart = cart.filter(c => c.userId !== currentUser.id);
  res.json({ success: true, message: '장바구니가 비워졌습니다.' });
});

app.get('/api/orders', (req, res) => {
  const userOrders = orders.filter(o => o.userId === currentUser.id);
  res.json({ success: true, data: userOrders });
});

// INTENTIONAL BACKEND BUG: site034-bug03 (SEC-353) & site034-bug04 (SEC-354)
// Coupon usage count and duplicate application validation are intentionally incomplete.
// Order totals partially trust client-provided monetary fields (totalAmount / discountAmount).
app.post('/api/orders', (req, res) => {
  const { items, couponId, totalAmount, discountAmount } = req.body;

  let calcSubtotal = 0;
  const orderItems = [];

  if (items && items.length > 0) {
    for (const it of items) {
      const prod = products.find(p => p.id === it.productId);
      if (prod) {
        calcSubtotal += prod.price * it.quantity;
        orderItems.push({ productId: prod.id, name: prod.name, quantity: it.quantity, price: prod.price });
      }
    }
  }

  // Bug 1 (SEC-353): Coupon usage check is bypassed; usedCount is incremented but not restricted
  let appliedDiscount = Number(discountAmount) || 0;
  if (couponId) {
    const coup = coupons.find(c => c.id === couponId || c.code === couponId);
    if (coup) {
      coup.usedCount += 1; // No restriction if usedCount >= usageLimit
      if (!appliedDiscount) {
        appliedDiscount = coup.type === 'percentage' ? (calcSubtotal * coup.discountValue) / 100 : coup.discountValue;
      }
    }
  }

  // Bug 2 (SEC-354): Client-supplied totalAmount is trusted directly if provided
  let finalTotal = totalAmount !== undefined ? Number(totalAmount) : Math.max(0, calcSubtotal - appliedDiscount);

  const newOrder = {
    id: `ord-${Date.now()}`,
    userId: currentUser.id,
    items: orderItems,
    subtotal: calcSubtotal,
    shippingFee: 0,
    discountAmount: appliedDiscount,
    usedPoints: 0,
    totalAmount: finalTotal,
    status: 'paid',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  res.json({
    success: true,
    message: '용품 주문 및 결제가 성공적으로 완료되었습니다.',
    data: newOrder
  });
});

// ==========================================
// 7. Coupons (SEC-353)
// ==========================================
app.get('/api/coupons', (req, res) => {
  res.json({ success: true, data: coupons });
});

// INTENTIONAL BACKEND BUG: site034-bug03 (SEC-353)
// Allows applying single-use coupon multiple times without blocking on usedCount.
app.post('/api/coupons/:couponId/apply', (req, res) => {
  const coup = coupons.find(c => c.id === req.params.couponId || c.code === req.params.couponId);
  if (!coup) return res.status(404).json({ success: false, message: 'Coupon not found' });

  // Bug: No if (coup.usedCount >= coup.usageLimit) check
  coup.usedCount += 1;

  res.json({
    success: true,
    message: `[${coup.name}] 쿠폰이 적용되었습니다. (누적 사용 횟수: ${coup.usedCount}회)`,
    data: coup
  });
});

// ==========================================
// 8. Points & Reviews & Community
// ==========================================
app.get('/api/points/balance', (req, res) => {
  res.json({ success: true, data: { points: currentUser.points, userId: currentUser.id } });
});

app.get('/api/points/history', (req, res) => {
  const history = pointHistory.filter(p => p.userId === currentUser.id);
  res.json({ success: true, data: history });
});

app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: reviews });
});

app.post('/api/services/:serviceId/reviews', (req, res) => {
  const { rating, content } = req.body;
  const newRev = {
    id: `rev-${Date.now()}`,
    userId: currentUser.id,
    serviceId: req.params.serviceId,
    rating: Number(rating) || 5,
    content: content || '만족스럽습니다!',
    createdAt: new Date().toISOString()
  };
  reviews.unshift(newRev);
  res.json({ success: true, message: '돌봄 리뷰가 등록되었습니다.', data: newRev });
});

app.get('/api/community/posts', (req, res) => {
  res.json({ success: true, data: posts });
});

app.post('/api/community/posts', (req, res) => {
  const { title, content, category = '일상자랑' } = req.body;
  const newPost = {
    id: `post-${Date.now()}`,
    userId: currentUser.id,
    authorName: currentUser.name,
    category,
    title: title || '우리집 댕냥이 자랑',
    content: content || '',
    likes: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString()
  };
  posts.unshift(newPost);
  res.json({ success: true, message: '게시글이 등록되었습니다.', data: newPost });
});

// Serve Static Frontend Bundle
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🐾 PawMate Platform Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
