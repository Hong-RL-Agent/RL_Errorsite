import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9957;

app.use(cors());
app.use(express.json());

// Serve static dist in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Mock In-Memory Database (Services, Laundry Items, Orders, Addresses, Slots)
// ----------------------------------------------------

// 서비스 카테고리 (Services)
const services = [
  { id: 'srv-01', name: '일반 생활세탁', icon: 'Shirt', description: '물세탁 및 고온 스팀 건조가 포함된 데일리 의류 케어', basePrice: 4000, estimatedDays: '1~2일', badge: '인기' },
  { id: 'srv-02', name: '셔츠 & 정장 세탁', icon: 'Scissors', description: '자동 다림질 및 목/소매 때 특수 처리 맞춤형 케어', basePrice: 2500, estimatedDays: '1~2일', badge: '베스트' },
  { id: 'srv-03', name: '이불 & 침구류 세탁', icon: 'Layers', description: '진드기 완벽 박멸 80도 고온 살균 텀블링 세탁', basePrice: 12000, estimatedDays: '2~3일', badge: '위생 케어' },
  { id: 'srv-04', name: '운동화 & 신발 케어', icon: 'Footprints', description: '수작업 솔질 손세탁 및 UV 자외선 살균 탈취', basePrice: 6000, estimatedDays: '2일', badge: '만족도 99%' },
  { id: 'srv-05', name: '프리미엄 드라이클리닝', icon: 'Sparkles', description: '친환경 실리콘 용제 사용으로 섬유 손상 최소화', basePrice: 8500, estimatedDays: '2~3일', badge: '고급 의류' },
  { id: 'srv-06', name: '패딩 & 아웃도어 특수세탁', icon: 'Shield', description: '고어텍스 발수가공 복원 및 프리미엄 다운 볼륨 복원', basePrice: 16000, estimatedDays: '3일', badge: '발수 복원' },
  { id: 'srv-07', name: '가죽 & 모피 전문 케어', icon: 'Award', description: '명품 피혁 전문 가공사의 1:1 수작업 영양/염색 코팅', basePrice: 35000, estimatedDays: '4~5일', badge: '명품 케어' },
  { id: 'srv-08', name: '커튼 & 대형 패브릭', icon: 'Maximize', description: '탈색 방지 대형 드럼 세탁 및 미세먼지 안심 제거', basePrice: 18000, estimatedDays: '3~4일', badge: '대형 세탁' }
];

// 세탁물 품목 (Laundry Items)
const laundryItems = [
  { id: 'item-01', serviceId: 'srv-02', name: '일반 와이셔츠', category: '상의', price: 2500, estHours: 24, icon: '👔', desc: '풀먹임 다림질 및 옷걸이 포장' },
  { id: 'item-02', serviceId: 'srv-02', name: '정장 자켓/상의', category: '정장', price: 6500, estHours: 48, icon: '🧥', desc: '고급 울 드라이클리닝' },
  { id: 'item-03', serviceId: 'srv-02', name: '정장 바지/슬랙스', category: '하의', price: 4500, estHours: 48, icon: '👖', desc: '칼주름 정밀 가압 다림질' },
  { id: 'item-04', serviceId: 'srv-01', name: '캐주얼 티셔츠/맨투맨', category: '상의', price: 3500, estHours: 24, icon: '👕', desc: '색상 보존 저온 건조' },
  { id: 'item-05', serviceId: 'srv-05', name: '니트 / 가디건', category: '니트', price: 5500, estHours: 48, icon: '🧶', desc: '보풀 제거 및 울 전용 중성세탁' },
  { id: 'item-06', serviceId: 'srv-05', name: '울/캐시미어 롱코트', category: '아우터', price: 15000, estHours: 72, icon: '🧥', desc: '먼지 털기 및 프리미엄 드라이' },
  { id: 'item-07', serviceId: 'srv-06', name: '롱패딩 / 구스다운', category: '아우터', price: 19000, estHours: 72, icon: '🧥', desc: '다운 볼륨 복원 텀블링' },
  { id: 'item-08', serviceId: 'srv-03', name: '차렵이불 (퀸/킹)', category: '침구', price: 14000, estHours: 48, icon: '🛏️', desc: '고온 진드기 살균 케어' },
  { id: 'item-09', serviceId: 'srv-04', name: '일반 캔버스 운동화', category: '신발', price: 6000, estHours: 48, icon: '👟', desc: '밑창 세척 및 향균 탈취' },
  { id: 'item-10', serviceId: 'srv-04', name: '가죽/스웨이드 스니커즈', category: '신발', price: 9000, estHours: 72, icon: '👞', desc: '스웨이드 결 살림 영양제 도포' },
  { id: 'item-11', serviceId: 'srv-07', name: '천연 가죽 라이더 자켓', category: '명품', price: 45000, estHours: 96, icon: '✨', desc: '전용 오일 영양 공급 및 코팅' }
];

// 주소록 (Addresses) Mock Data
let addresses = [
  { id: 'addr-01', label: '우리집 (기본배송지)', recipient: '김세탁', phone: '010-3456-7890', address: '서울 강남구 테헤란로 212', detailAddress: '101동 1504호', isDefault: true },
  { id: 'addr-02', label: '회사 / 사무실', recipient: '김세탁', phone: '010-3456-7890', address: '서울 서초구 강남대로 381', detailAddress: '두산베어스텔 8층 802호', isDefault: false },
  { id: 'addr-03', label: '부모님 댁', recipient: '이클린', phone: '010-1234-5678', address: '경기 성남시 분당구 정자일로 95', detailAddress: '203동 701호', isDefault: false }
];

// 수거/배송 시간대 (Slots)
const pickupSlots = [
  { id: 'slot-p1', time: '오늘 밤 23:00 ~ 익일 06:00 (새벽수거)', isOvernight: true, available: true },
  { id: 'slot-p2', time: '내일 오전 07:00 ~ 09:00', isOvernight: false, available: true },
  { id: 'slot-p3', time: '내일 오후 13:00 ~ 15:00', isOvernight: false, available: true },
  { id: 'slot-p4', time: '내일 저녁 18:00 ~ 20:00', isOvernight: false, available: true },
  { id: 'slot-p5', time: '내일 밤 23:00 ~ 익일 06:00 (새벽수거)', isOvernight: true, available: true },
  { id: 'slot-p6', time: '모레 오전 07:00 ~ 09:00', isOvernight: false, available: true }
];

const deliverySlots = [
  { id: 'slot-d1', time: '수거 후 2일 뒤 새벽 07:00 전 도착', available: true },
  { id: 'slot-d2', time: '수거 후 2일 뒤 오후 18:00 ~ 21:00', available: true },
  { id: 'slot-d3', time: '수거 후 3일 뒤 새벽 07:00 전 도착', available: true }
];

// 주문 (Orders) Mock Data (12건)
let orders = [
  {
    id: 'ord-1001',
    orderNumber: 'FL-20260930-101',
    createdAt: '2026-09-30 09:30',
    serviceName: '셔츠 & 정장 세탁',
    status: '수거 예정', // Will be mutated for SEC-470 ETag demo
    statusStep: 1,
    itemCount: 4,
    totalPrice: 18000,
    address: '서울 강남구 테헤란로 212 101동 1504호',
    pickupDate: '2026-10-01',
    pickupTime: '내일 밤 23:00 ~ 익일 06:00 (새벽수거)',
    deliveryDate: '2026-10-03',
    deliveryTime: '수거 후 2일 뒤 새벽 07:00 전 도착',
    pickupNote: '문 앞 프레시백에 담아두었습니다.',
    photos: []
  },
  {
    id: 'ord-1002',
    orderNumber: 'FL-20260928-204',
    createdAt: '2026-09-28 14:10',
    serviceName: '이불 & 프리미엄 케어',
    status: '세탁 중',
    statusStep: 3,
    itemCount: 3,
    totalPrice: 34500,
    address: '서울 강남구 테헤란로 212 101동 1504호',
    pickupDate: '2026-09-28',
    pickupTime: '밤 23:00 ~ 익일 06:00',
    deliveryDate: '2026-10-01',
    deliveryTime: '새벽 07:00 전 도착',
    pickupNote: '벨 누르지 말고 문 앞에 놔주세요.',
    photos: ['https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80']
  },
  {
    id: 'ord-1003',
    orderNumber: 'FL-20260925-309',
    createdAt: '2026-09-25 11:20',
    serviceName: '운동화 & 일반 생활세탁',
    status: '배송 완료',
    statusStep: 6,
    itemCount: 5,
    totalPrice: 22000,
    address: '서울 서초구 강남대로 381 8층 802호',
    pickupDate: '2026-09-25',
    pickupTime: '오후 13:00 ~ 15:00',
    deliveryDate: '2026-09-27',
    deliveryTime: '오후 18:00',
    pickupNote: '경비실에 맡겨두었습니다.',
    photos: []
  },
  {
    id: 'ord-1004', // Special Mock Order for SEC-467 Promise.all failure
    orderNumber: 'FL-20260924-412',
    createdAt: '2026-09-24 16:45',
    serviceName: '가죽 & 아웃도어 특수세탁',
    status: '검수 중',
    statusStep: 4,
    itemCount: 2,
    totalPrice: 54000,
    address: '서울 강남구 테헤란로 212 101동 1504호',
    pickupDate: '2026-09-24',
    pickupTime: '밤 23:00',
    deliveryDate: '2026-09-28',
    deliveryTime: '새벽 07:00',
    pickupNote: '고가 의류이므로 손상 주의 부탁드립니다.',
    photos: []
  },
  {
    id: 'ord-1005',
    orderNumber: 'FL-20260920-501',
    createdAt: '2026-09-20 08:30',
    serviceName: '셔츠 5벌 정기세탁',
    status: '배송 완료',
    statusStep: 6,
    itemCount: 5,
    totalPrice: 12500,
    address: '서울 강남구 테헤란로 212 101동 1504호',
    pickupDate: '2026-09-20',
    pickupTime: '새벽수거',
    deliveryDate: '2026-09-22',
    deliveryTime: '새벽배송',
    pickupNote: '문 앞 고리에 걸어주세요.',
    photos: []
  },
  {
    id: 'ord-1006',
    orderNumber: 'FL-20260915-602',
    createdAt: '2026-09-15 19:10',
    serviceName: '울코트 & 패딩 드라이',
    status: '배송 완료',
    statusStep: 6,
    itemCount: 3,
    totalPrice: 49000,
    address: '경기 성남시 분당구 정자일로 95',
    pickupDate: '2026-09-16',
    pickupTime: '오전 08:00',
    deliveryDate: '2026-09-19',
    deliveryTime: '저녁 19:00',
    pickupNote: '문 앞에 두었습니다.',
    photos: []
  }
];

// 주문별 세탁물 상세 (Order Items)
const orderItemsMap = {
  'ord-1001': [
    { itemId: 'item-01', name: '일반 와이셔츠', quantity: 3, unitPrice: 2500, totalPrice: 7500, icon: '👔' },
    { itemId: 'item-03', name: '정장 바지/슬랙스', quantity: 1, unitPrice: 4500, totalPrice: 4500, icon: '👖' },
    { itemId: 'item-05', name: '니트 / 가디건', quantity: 1, unitPrice: 5500, totalPrice: 5500, icon: '🧶' }
  ],
  'ord-1002': [
    { itemId: 'item-08', name: '차렵이불 (퀸/킹)', quantity: 2, unitPrice: 14000, totalPrice: 28000, icon: '🛏️' },
    { itemId: 'item-05', name: '니트 / 가디건', quantity: 1, unitPrice: 5500, totalPrice: 5500, icon: '🧶' }
  ],
  'ord-1003': [
    { itemId: 'item-09', name: '일반 캔버스 운동화', quantity: 2, unitPrice: 6000, totalPrice: 12000, icon: '👟' },
    { itemId: 'item-04', name: '캐주얼 티셔츠/맨투맨', quantity: 2, unitPrice: 3500, totalPrice: 7000, icon: '👕' }
  ],
  'ord-1004': [
    { itemId: 'item-07', name: '롱패딩 / 구스다운', quantity: 1, unitPrice: 19000, totalPrice: 19000, icon: '🧥' },
    { itemId: 'item-11', name: '천연 가죽 라이더 자켓', quantity: 1, unitPrice: 45000, totalPrice: 45000, icon: '✨' }
  ],
  'ord-1005': [
    { itemId: 'item-01', name: '일반 와이셔츠', quantity: 5, unitPrice: 2500, totalPrice: 12500, icon: '👔' }
  ],
  'ord-1006': [
    { itemId: 'item-06', name: '울/캐시미어 롱코트', quantity: 2, unitPrice: 15000, totalPrice: 30000, icon: '🧥' },
    { itemId: 'item-07', name: '롱패딩 / 구스다운', quantity: 1, unitPrice: 19000, totalPrice: 19000, icon: '🧥' }
  ]
};

// 주문별 배송 상태 추적 정보
const orderDeliveryMap = {
  'ord-1001': { driverName: '박수거 매니저', driverPhone: '010-5555-1111', currentStep: '수거 준비 중', location: '강남 물류센터 출발 대기', eta: '2026-10-01 23:30' },
  'ord-1002': { driverName: '이세탁 마스터', driverPhone: '010-5555-2222', currentStep: '세탁 팩토리 가동 중', location: 'FreshLaundry 송파 스마트팩토리 2공구', eta: '2026-10-01 06:00' },
  'ord-1003': { driverName: '최배송 매니저', driverPhone: '010-5555-3333', currentStep: '배송 완료', location: '문 앞 배송 사진 등록 완료', eta: '2026-09-27 17:40' },
  // ord-1004 intentionally missing or errors in API for SEC-467
  'ord-1005': { driverName: '정새벽 라이더', driverPhone: '010-5555-4444', currentStep: '배송 완료', location: '문 앞 고리 안심 거치 완료', eta: '2026-09-22 06:15' },
  'ord-1006': { driverName: '김프리미엄 기사', driverPhone: '010-5555-5555', currentStep: '배송 완료', location: '고객 직접 수령 완료', eta: '2026-09-19 18:50' }
};

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FreshLaundry', timestamp: new Date().toISOString() });
});

// 2. 서비스 목록
app.get('/api/services', (req, res) => {
  res.json({ success: true, services });
});

app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, message: '서비스를 찾을 수 없습니다.' });
  res.json({ success: true, service });
});

// 3. 세탁물 품목
app.get('/api/laundry-items', (req, res) => {
  const { serviceId } = req.query;
  let results = laundryItems;
  if (serviceId) {
    results = results.filter(i => i.serviceId === serviceId);
  }
  res.json({ success: true, total: results.length, items: results });
});

app.get('/api/laundry-items/:id', (req, res) => {
  const item = laundryItems.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: '품목을 찾을 수 없습니다.' });
  res.json({ success: true, item });
});

// 4. 주소록
app.get('/api/addresses', (req, res) => {
  res.json({ success: true, addresses });
});

app.post('/api/addresses', (req, res) => {
  const { label, recipient, phone, address, detailAddress, isDefault } = req.body;
  if (!address || !recipient) {
    return res.status(400).json({ success: false, message: '필수 주소 정보가 누락되었습니다.' });
  }
  const newAddr = {
    id: `addr-${Date.now()}`,
    label: label || '새 주소',
    recipient,
    phone: phone || '010-0000-0000',
    address,
    detailAddress: detailAddress || '',
    isDefault: Boolean(isDefault)
  };
  if (newAddr.isDefault) {
    addresses.forEach(a => a.isDefault = false);
  }
  addresses.push(newAddr);
  res.status(201).json({ success: true, address: newAddr });
});

// 5. 시간대 슬롯
app.get('/api/pickup-slots', (req, res) => {
  res.json({ success: true, slots: pickupSlots });
});

app.get('/api/delivery-slots', (req, res) => {
  res.json({ success: true, slots: deliverySlots });
});

// 6. 주문 목록
app.get('/api/orders', (req, res) => {
  res.json({ success: true, total: orders.length, orders });
});

// 7. 주문 기본 정보 상세
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });
  res.json({ success: true, order });
});

// 8. 주문 항목 목록
app.get('/api/orders/:id/items', (req, res) => {
  const items = orderItemsMap[req.params.id] || [];
  res.json({ success: true, items });
});

// 9. 주문 배송 정보
// INTENTIONAL BACKEND BUG: site058-SEC-467
// Promise.all() 중 하나의 실패가 전체 주문 정보 렌더링을 차단하는 오류를 유발하기 위해
// 특정 주문(ord-1004)에 대해 배송 정보 조회 시 의도적으로 500 에러를 반환함.
app.get('/api/orders/:id/delivery', (req, res) => {
  if (req.params.id === 'ord-1004') {
    // INTENTIONAL BACKEND BUG: site058-SEC-467
    return res.status(500).json({
      success: false,
      message: '배송 관제 시스템 일시적 통신 지연 (배송 정보 로드 실패)'
    });
  }

  const delivery = orderDeliveryMap[req.params.id];
  if (!delivery) {
    return res.status(404).json({ success: false, message: '배송 정보를 찾을 수 없습니다.' });
  }
  res.json({ success: true, delivery });
});

// 10. 주문 상태 실시간 폴링 및 ETag 재검증
// INTENTIONAL BACKEND BUG: site058-SEC-470
// 서버가 ETag를 잘못 재사용하여 변경된 주문 상태에 304 Not Modified를 반환:
// 주문 상태가 '수거 예정' -> '세탁 중' -> '배송 중'으로 변경되어도 ETag를 static 문자열("etag-" + order.id)로 고정.
// 클라이언트가 If-None-Match 헤더를 전송하면 상태 변경 여부를 무시하고 304를 반환하여 클라이언트가 구 상태를 유지하게 만듦.
app.get('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

  // INTENTIONAL BACKEND BUG: site058-SEC-470
  // Static ETag that does not change when order.status changes
  const staticETag = `"etag-${order.id}"`;
  const clientIfNoneMatch = req.headers['if-none-match'];

  res.setHeader('ETag', staticETag);

  if (clientIfNoneMatch === staticETag) {
    // Return 304 Not Modified without checking updated status
    return res.status(304).end();
  }

  res.json({
    success: true,
    orderId: order.id,
    status: order.status,
    statusStep: order.statusStep,
    updatedAt: new Date().toISOString()
  });
});

// 11. 주문 생성
app.post('/api/orders', (req, res) => {
  const { serviceName, items, address, pickupDate, pickupTime, deliveryDate, deliveryTime, pickupNote } = req.body;

  if (!items || items.length === 0 || !address || !pickupDate) {
    return res.status(400).json({ success: false, message: '주문 필수 항목이 누락되었습니다.' });
  }

  const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const newId = `ord-${Date.now()}`;
  const now = new Date();
  const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');

  const newOrder = {
    id: newId,
    orderNumber: `FL-${datePrefix}-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: now.toISOString().replace('T', ' ').slice(0, 16),
    serviceName: serviceName || '맞춤 세탁 서비스',
    status: '수거 예정',
    statusStep: 1,
    itemCount: totalItemsCount,
    totalPrice: calculatedTotal,
    address,
    pickupDate,
    pickupTime: pickupTime || '오늘 밤 23:00 ~ 익일 06:00 (새벽수거)',
    deliveryDate: deliveryDate || '2일 뒤',
    deliveryTime: deliveryTime || '새벽 07:00 전 도착',
    pickupNote: pickupNote || '문 앞에 보관했습니다.',
    photos: []
  };

  orders.unshift(newOrder);

  // Store items
  orderItemsMap[newId] = items.map(i => ({
    itemId: i.id,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.price,
    totalPrice: i.price * i.quantity,
    icon: i.icon || '👕'
  }));

  // Store delivery initial tracker
  orderDeliveryMap[newId] = {
    driverName: '안심수거 매니저',
    driverPhone: '010-5555-9999',
    currentStep: '수거 준비 중',
    location: '배정 완료 (수거 예정)',
    eta: `${pickupDate} ${pickupTime}`
  };

  res.status(201).json({
    success: true,
    message: '세탁 수거 신청이 완료되었습니다.',
    order: newOrder
  });
});

// 12. 주문 상태 강제 변경 (테스트 및 시연용)
app.patch('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

  if (req.body.status) {
    order.status = req.body.status;
    const steps = ['수거 예정', '수거 완료', '세탁 중', '검수 중', '배송 중', '배송 완료'];
    order.statusStep = steps.indexOf(order.status) + 1 || 1;
  }

  res.json({ success: true, message: '주문 상태가 갱신되었습니다.', order });
});

// 13. 세탁물 사진 업로드 (멀티파트)
// INTENTIONAL BACKEND BUG: site058-SEC-466
// Content-Type boundary가 없는 multipart 요청 처리 오류:
// Express 또는 multipart 파서는 Content-Type 헤더의 boundary 파라미터를 필요로 함.
// 프론트엔드가 'Content-Type': 'multipart/form-data'를 수동 설정하여 boundary가 누락된 요청을 보내면
// 서버는 파싱 에러(400 Bad Request: missing boundary)를 발생시킴.
app.post('/api/orders/:orderId/items/photo', (req, res) => {
  const contentType = req.headers['content-type'] || '';

  // INTENTIONAL BACKEND BUG: site058-SEC-466
  if (contentType.includes('multipart/form-data') && !contentType.includes('boundary=')) {
    return res.status(400).json({
      success: false,
      message: '잘못된 멀티파트 요청입니다. (Content-Type에 boundary 파라미터가 누락되었습니다.)'
    });
  }

  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

  const dummyPhotoUrl = 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80';
  order.photos.push(dummyPhotoUrl);

  res.status(201).json({
    success: true,
    message: '세탁물 사진이 등록되었습니다.',
    photoUrl: dummyPhotoUrl,
    photos: order.photos
  });
});

// 14. 영수증 미리보기 (Range 헤더 처리)
// INTENTIONAL BACKEND BUG: site058-SEC-468
// HTTP Range 헤더 처리 오류로 일부 콘텐츠 요청이 항상 전체 콘텐츠(200 OK)로 반환됨:
// 클라이언트가 Range: bytes=0-99 헤더를 보내도 Range를 무시하고 전체 텍스트를 200 OK로 반환함 (206 Partial Content 미지원).
app.get('/api/orders/:id/receipt', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

  const receiptContent = `
================================================================
[FreshLaundry 공식 세탁 수거·배송 영수증 및 전자 인수증]
================================================================
주문번호: ${order.orderNumber}
신청일시: ${order.createdAt}
고객성명: 김세탁 고객님
수거주소: ${order.address}
수거일정: ${order.pickupDate} (${order.pickupTime})
배송예정: ${order.deliveryDate} (${order.deliveryTime})
진행상태: [${order.status}]
----------------------------------------------------------------
서비스 구분: ${order.serviceName}
세탁물 수량: 총 ${order.itemCount}개
결제 총액: ₩${order.totalPrice.toLocaleString()} (부가세 포함)
결제수단: FreshPay 안심 자동결제
----------------------------------------------------------------
품질 보증 및 배상 책임:
본 영수증은 한국소비자원 세탁업 표준약관에 의거하여 발행되었습니다.
세탁물 분실/훼손 시 세탁물 배상 책임보험에 따라 100% 보상됩니다.
고객센터: 1588-0580 (평일 09:00 ~ 18:00)
================================================================
`.trim();

  // INTENTIONAL BACKEND BUG: site058-SEC-468
  // Range header is present, but server ignores it and always returns full content with 200 OK
  const rangeHeader = req.headers['range'];
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('X-Receipt-Order-Id', order.id);

  // Return 200 OK with full content regardless of range
  res.status(200).send(receiptContent);
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('FreshLaundry Laundry Service API Server is Running. Please build the frontend.');
  }
});

app.listen(PORT, () => {
  console.log(`[FreshLaundry] site058 laundry server listening on http://localhost:${PORT}`);
});
