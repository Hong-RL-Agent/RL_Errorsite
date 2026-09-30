import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9929;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ==========================================
// In-Memory Storage & Mock Databases
// ==========================================

let currentUser = {
  id: 'usr_plant_01',
  name: '이지우',
  email: 'jiwoo.leaf@floracare.kr',
  phone: '010-8472-9103',
  address: '서울특별시 서초구 반포대로 140, 102동 804호',
  membership: '그린 가디언 (Green Guardian)',
  experience: '2년차 식집사 (초보 탈출)',
  points: 4500,
  joinedDate: '2024-03-15'
};

let plants = [
  {
    id: 'plt_01',
    name: '몬티 (몬스테라 델리시오사)',
    scientificName: 'Monstera deliciosa',
    category: '관엽식물',
    acquiredDate: '2024-04-10',
    lastWatered: '2026-09-22',
    waterCycleDays: 7,
    nextWaterDate: '2026-09-29',
    sunlight: '반양지 (간접광 4~6시간)',
    humidity: '60~70%',
    temp: '18~26°C',
    healthStatus: '건강함',
    healthScore: 92,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
    memo: '새 잎(찢잎) 2개가 동시에 올라오는 중! 잎 닦아주기 완료.'
  },
  {
    id: 'plt_02',
    name: '올리 (지중해 올리브 나무)',
    scientificName: 'Olea europaea',
    category: '목본류',
    acquiredDate: '2024-06-18',
    lastWatered: '2026-09-20',
    waterCycleDays: 10,
    nextWaterDate: '2026-09-30',
    sunlight: '양지 (직사광선 6시간 이상)',
    humidity: '40~50%',
    temp: '15~28°C',
    healthStatus: '주의필요',
    healthScore: 68,
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&auto=format&fit=crop&q=80',
    memo: '하단 잎 끝부분이 약간 노랗게 변색됨. 과습 주의 요망.'
  },
  {
    id: 'plt_03',
    name: '루미 (여인초 / 극락조화)',
    scientificName: 'Strelitzia nicolai',
    category: '대형 관엽',
    acquiredDate: '2024-11-05',
    lastWatered: '2026-09-25',
    waterCycleDays: 5,
    nextWaterDate: '2026-09-30',
    sunlight: '밝은 반양지',
    humidity: '50~60%',
    temp: '20~28°C',
    healthStatus: '건강함',
    healthScore: 95,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&auto=format&fit=crop&q=80',
    memo: '거실 창가에서 폭풍 성장 중. 공중 분무 주기적으로 실시.'
  },
  {
    id: 'plt_04',
    name: '알로 (알로카시아 프라이덱)',
    scientificName: 'Alocasia micholitziana',
    category: '희귀 관엽',
    acquiredDate: '2025-02-14',
    lastWatered: '2026-09-24',
    waterCycleDays: 6,
    nextWaterDate: '2026-09-30',
    sunlight: '부드러운 간접광',
    humidity: '70% 이상',
    temp: '22~27°C',
    healthStatus: '관리요망',
    healthScore: 74,
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80',
    memo: '잎 끝에 응애 의심 증상 발견. 잎 뒷면 세척 후 친환경 오일 도포.'
  }
];

let growthRecords = [
  { id: 'rec_01', plantId: 'plt_01', date: '2026-09-18', note: '가장 큰 잎에 5번째 구멍이 멋지게 생겼습니다!', heightCm: 68, image: '' },
  { id: 'rec_02', plantId: 'plt_02', date: '2026-09-10', note: '가지치기 후 새순이 4군데에서 돋아나기 시작함.', heightCm: 82, image: '' }
];

let carePrograms = [
  {
    id: 'care_basic',
    name: '베이직 홈케어 솔루션 (Basic Care)',
    tier: 'Basic',
    monthlyPrice: 19000,
    description: '초보 식집사를 위한 1:1 온라인 식물 주치의 + 정기 물주기/온습도 알림 패키지',
    features: ['월 2회 비대면 AI 정밀 진단', '스마트 케어 일정 자동 스케줄링', '초보 가드닝 가이드북 증정', '식물 관리용품 5% 상시 할인'],
    periodOptions: [
      { months: 1, discount: 0, price: 19000 },
      { months: 3, discount: 10, price: 51300 },
      { months: 6, discount: 15, price: 96900 }
    ]
  },
  {
    id: 'care_standard',
    name: '스탠다드 닥터 케어 (Standard Care)',
    tier: 'Standard',
    monthlyPrice: 39000,
    description: '식물 병해충 집중 케어 + 계절별 맞춤 영양제 앰플 정기 배송 패키지',
    features: ['무제한 AI 식물 진단 & 처방', '분기별 맞춤 유기농 영양제 배송', '1:1 식물 주치의 심층 상담', '식물 관리용품 10% 상시 할인'],
    periodOptions: [
      { months: 1, discount: 0, price: 39000 },
      { months: 3, discount: 10, price: 105300 },
      { months: 6, discount: 20, price: 187200 }
    ]
  },
  {
    id: 'care_premium',
    name: '올인원 프리미엄 마스터 (Premium Care)',
    tier: 'Premium',
    monthlyPrice: 69000,
    description: '전문 가드너의 연 2회 방문 홈케어 + 분갈이 키트 & 사계절 프리미엄 영양 케어 풀세트',
    features: ['전문 가드너 1:1 방문 홈케어 (연 2회)', 'VIP 전용 분갈이 딜리버리 무료', '사계절 맞춤 프리미엄 액비 정기배송', '식물 관리용품 20% 상시 할인'],
    periodOptions: [
      { months: 1, discount: 0, price: 69000 },
      { months: 3, discount: 15, price: 175950 },
      { months: 6, discount: 25, price: 310500 }
    ]
  }
];

let products = [
  {
    id: 'prod_01',
    name: '독일 명품 바이오가든 전정가위 Pro (원예용 수목가위)',
    category: '가드닝 도구',
    price: 32000,
    rating: 4.9,
    reviewsCount: 148,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=500&auto=format&fit=crop&q=80',
    description: '스테인리스 최고급 열처리 강선 날로 식물 줄기에 상처 없이 깔끔하게 절단합니다.'
  },
  {
    id: 'prod_02',
    name: '오가닉 플랜트 헬스 3종 영양 앰플 세트 (잎·뿌리·활력)',
    category: '식물 영양제',
    price: 18500,
    rating: 4.8,
    reviewsCount: 312,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=80',
    description: '천연 아미노산과 미네랄이 풍부한 친환경 수용성 앰플로 잎의 광택과 뿌리 활착을 돕습니다.'
  },
  {
    id: 'prod_03',
    name: '스마트 토양 수분/조도/산도(pH) 3in1 아날로그 측정기',
    category: '케어 기기',
    price: 24000,
    rating: 4.7,
    reviewsCount: 220,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=80',
    description: '배터리 없이 흙에 꽂기만 하면 과습 걱정 끝! 정확한 수분도와 산도를 실시간 확인.'
  },
  {
    id: 'prod_04',
    name: '이탈리아 프리미엄 토분 (더스트 베이지 테라코타 화분 21cm)',
    category: '화분 & 소품',
    price: 29000,
    rating: 4.9,
    reviewsCount: 89,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=80',
    description: '통기성이 탁월한 천연 백토 화분으로 뿌리 호흡과 과습 방지에 가장 이상적인 명품 화분.'
  },
  {
    id: 'prod_05',
    name: '초미립자 연속 자동 압축 분무기 500ml (소프트 세이지)',
    category: '가드닝 도구',
    price: 16000,
    rating: 4.8,
    reviewsCount: 175,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80',
    description: '손목 부담 없이 안개처럼 부드러운 초미립자 미스트를 연속 분사하여 공중 습도를 유지.'
  },
  {
    id: 'prod_06',
    name: '프리미엄 멸균 배양토 & 펄라이트 식물 안심 분갈이 믹스 10L',
    category: '토양 & 비료',
    price: 14500,
    rating: 4.9,
    reviewsCount: 405,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=80',
    description: '코코피트, 피트모스, 질석, 펄라이트를 완벽 비율로 배합한 벌레 없는 멸균 프리미엄 흙.'
  }
];

let cart = [
  {
    productId: 'prod_02',
    name: '오가닉 플랜트 헬스 3종 영양 앰플 세트 (잎·뿌리·활력)',
    price: 18500,
    quantity: 2,
    subtotal: 37000,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=80'
  }
];

let orders = [
  {
    orderId: 'FC-ORD-20260921-102',
    title: '스탠다드 닥터 케어 (Standard Care) 3개월 구독권',
    itemsCount: 1,
    subtotal: 105300,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 10500,
    paymentAmount: 94800,
    paymentMethod: '신용카드 (현대카드)',
    status: '서비스 이용중',
    orderDate: '2026-09-21 14:32:10',
    flowOrigin: 'Care Program 정기 구독'
  }
];

let repottingServices = [
  {
    id: 'rep_small',
    title: '소형 화분 안심 분갈이 (화분 직경 10~15cm)',
    price: 25000,
    description: '프리미엄 배양토 + 영양제 첨가 + 화분 세척 및 배수층 재구성'
  },
  {
    id: 'rep_medium',
    title: '중형 화분 안심 분갈이 (화분 직경 16~25cm)',
    price: 36000,
    description: '뿌리 엉킴 정리 + 전정 케어 + 맞춤 지주대 설치 + 활착 촉진제 도포'
  },
  {
    id: 'rep_large',
    title: '대형/수목형 화분 딜리버리 분갈이 (화분 직경 26cm 이상)',
    price: 48000,
    description: '전문 가드너 2인 픽업/케어/배송 + 최고급 이태리 토분 교체 옵션'
  }
];

let communityPosts = [
  {
    id: 'post_01',
    author: '초록이마니아',
    title: '몬스테라 새 잎 찢잎 나오는 속도 실화인가요?! 🌿',
    content: '플로라케어 영양 앰플 처방받고 2주 만에 거대한 찢잎이 2개나 올라왔어요! 공중분무 신경 써주니까 잎 끝도 안 타고 너무 건강하네요.',
    category: '식물자랑',
    likes: 34,
    comments: [
      { id: 'c_01', author: '식물박사김쌤', content: '축하드립니다! 통풍만 조금 더 신경써주시면 다음 잎엔 구멍잎까지 기대해볼 수 있겠네요.' },
      { id: 'c_02', author: '초보가드너', content: '부럽습니다ㅠㅠ 저희 집 몬스테라는 아직도 하트잎만 나와요 팁 공유 부탁드려요!' }
    ],
    date: '2026-09-25 18:20'
  },
  {
    id: 'post_02',
    author: '올리브숲',
    title: '올리브나무 잎마름 과습인지 건조인지 헷갈릴 때 꿀팁',
    content: '손가락 두 마디 넣어서 흙 겉만 마르고 속이 젖어있으면 무조건 기다리세요! 수분측정기 들이고 나서 과습 사망률 0% 달성했습니다.',
    category: '가드닝 꿀팁',
    likes: 52,
    comments: [
      { id: 'c_03', author: '보태니컬러버', content: '공감합니다. 토분 쓰면 더 통기가 잘돼서 물주기 타이밍 잡기 훨씬 수월해요.' }
    ],
    date: '2026-09-24 11:15'
  }
];

let notifications = [
  { id: 'notif_01', type: 'care', title: '🌱 몬티(몬스테라) 물주기 예정일', message: '내일은 몬티에게 미온수를 흠뻑 주는 날입니다. 배수 확인을 잊지 마세요.', time: '1시간 전', read: false },
  { id: 'notif_02', type: 'diagnosis', title: '🩺 알로(알로카시아) AI 정밀 진단 결과 완료', message: '접수하신 응애 초기 증상 맞춤 처방전이 발급되었습니다.', time: '4시간 전', read: false },
  { id: 'notif_03', type: 'order', title: '📦 주문하신 가드닝 용품 출고 안내', message: '오가닉 플랜트 헬스 3종 세트가 CJ대한통운으로 발송되었습니다.', time: '1일 전', read: true }
];

let supportInquiries = [
  {
    id: 'inq_01',
    user: '이지우',
    type: '병해충 정밀 상담',
    plantName: '알로카시아 프라이덱',
    title: '잎 뒷면에 미세한 흰 반점이 생겼어요',
    content: '통풍이 안돼서 그런 건지 응애인지 진단 부탁드립니다.',
    status: '답변완료',
    answer: '전문 가드너 답변: 사진 판독 결과 경미한 응애 초기 증상입니다. 잎 뒷면을 흐르는 물로 세척 후 친환경 유기농 오일을 3일 간격으로 분무해주시면 완치 가능합니다.',
    date: '2026-09-23'
  }
];

// ==========================================
// API Endpoints
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'site030' });
});

// Auth Endpoints
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Mock login accepts any password
  currentUser.email = email || currentUser.email;
  res.json({
    success: true,
    message: '로그인에 성공하였습니다.',
    user: currentUser
  });
});

app.post('/api/register', (req, res) => {
  const { name, email, phone, address } = req.body;
  currentUser = {
    ...currentUser,
    id: 'usr_' + Date.now(),
    name: name || '신규 식집사',
    email: email || 'user@floracare.kr',
    phone: phone || '010-0000-0000',
    address: address || '서울특별시 중구 세종대로 110',
    membership: '새싹 가디언 (Sprout)',
    joinedDate: new Date().toISOString().split('T')[0]
  };
  res.json({
    success: true,
    message: '플로라케어 가입을 진심으로 환영합니다!',
    user: currentUser
  });
});

app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: '안전하게 로그아웃되었습니다.' });
});

// Profile & Delivery Address
app.get('/api/profile', (req, res) => {
  res.json({ success: true, user: currentUser });
});

app.post('/api/profile', (req, res) => {
  const { name, phone, address, experience } = req.body;
  if (name) currentUser.name = name;
  if (phone) currentUser.phone = phone;
  if (address) currentUser.address = address;
  if (experience) currentUser.experience = experience;
  res.json({
    success: true,
    message: '프로필 및 배송지 정보가 성공적으로 업데이트되었습니다.',
    user: currentUser
  });
});

// Plants Management
app.get('/api/plants', (req, res) => {
  res.json({ success: true, plants });
});

app.post('/api/plants', (req, res) => {
  const { name, scientificName, category, waterCycleDays, sunlight, humidity, memo, image } = req.body;
  const newPlant = {
    id: 'plt_' + Date.now(),
    name: name || '나의 새로운 반려식물',
    scientificName: scientificName || 'Plantae',
    category: category || '관엽식물',
    acquiredDate: new Date().toISOString().split('T')[0],
    lastWatered: new Date().toISOString().split('T')[0],
    waterCycleDays: Number(waterCycleDays) || 7,
    nextWaterDate: new Date(Date.now() + (Number(waterCycleDays) || 7) * 86400000).toISOString().split('T')[0],
    sunlight: sunlight || '반양지',
    humidity: humidity || '50~60%',
    temp: '18~26°C',
    healthStatus: '건강함',
    healthScore: 90,
    image: image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&auto=format&fit=crop&q=80',
    memo: memo || '새롭게 등록한 반려식물입니다.'
  };
  plants.push(newPlant);
  res.json({ success: true, message: '반려식물이 성공적으로 등록되었습니다.', plant: newPlant });
});

app.get('/api/plants/:plantId', (req, res) => {
  const plant = plants.find(p => p.id === req.params.plantId);
  if (!plant) return res.status(404).json({ success: false, message: '해당 식물을 찾을 수 없습니다.' });
  res.json({ success: true, plant });
});

app.get('/api/plants/:plantId/health', (req, res) => {
  const plant = plants.find(p => p.id === req.params.plantId);
  if (!plant) return res.status(404).json({ success: false, message: '해당 식물을 찾을 수 없습니다.' });
  res.json({
    success: true,
    health: {
      score: plant.healthScore,
      status: plant.healthStatus,
      waterSchedule: `다음 물주기: ${plant.nextWaterDate}`,
      sunlightCheck: '일조량 적정 유지중',
      humidityCheck: '습도 적정 (65%)',
      nutrientNeed: plant.healthScore < 80 ? '영양제 앰플 공급 권장' : '양호'
    }
  });
});

// Care Actions (Water, Sunlight, Nutrient)
app.post('/api/care/water', (req, res) => {
  const { plantId } = req.body;
  const plant = plants.find(p => p.id === plantId);
  if (plant) {
    plant.lastWatered = new Date().toISOString().split('T')[0];
    plant.nextWaterDate = new Date(Date.now() + plant.waterCycleDays * 86400000).toISOString().split('T')[0];
    plant.healthScore = Math.min(100, plant.healthScore + 2);
  }
  res.json({ success: true, message: '물주기 기록이 갱신되었습니다!', plant });
});

app.get('/api/care-schedule', (req, res) => {
  const schedule = plants.map(p => ({
    plantId: p.id,
    plantName: p.name,
    nextWaterDate: p.nextWaterDate,
    healthStatus: p.healthStatus,
    image: p.image
  }));
  res.json({ success: true, schedule });
});

app.post('/api/growth-records', (req, res) => {
  const { plantId, note, heightCm } = req.body;
  const record = {
    id: 'rec_' + Date.now(),
    plantId,
    date: new Date().toISOString().split('T')[0],
    note,
    heightCm: Number(heightCm) || 0,
    image: ''
  };
  growthRecords.unshift(record);
  res.json({ success: true, message: '성장 일기가 성공적으로 저장되었습니다.', record });
});

// Care Programs
app.get('/api/care-programs', (req, res) => {
  res.json({ success: true, programs: carePrograms });
});

// Store Products
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let result = [...products];
  if (category && category !== '전체') {
    result = result.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (sort === 'price_low') result.sort((a, b) => a.price - b.price);
  if (sort === 'price_high') result.sort((a, b) => b.price - a.price);
  if (sort === 'popular') result.sort((a, b) => b.reviewsCount - a.reviewsCount);
  res.json({ success: true, products: result });
});

app.get('/api/products/:productId', (req, res) => {
  const product = products.find(p => p.id === req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  res.json({ success: true, product });
});

// Cart APIs
app.get('/api/cart', (req, res) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 50000 || subtotal === 0 ? 0 : 3000;
  res.json({
    success: true,
    cart,
    summary: {
      subtotal,
      shippingFee,
      totalAmount: subtotal + shippingFee
    }
  });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  const prod = products.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });

  const existing = cart.find(c => c.productId === productId);
  if (existing) {
    if (quantity <= 0) {
      cart = cart.filter(c => c.productId !== productId);
    } else {
      existing.quantity = quantity;
      existing.subtotal = existing.price * existing.quantity;
    }
  } else if (quantity > 0) {
    cart.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: quantity,
      subtotal: prod.price * quantity,
      image: prod.image
    });
  }
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 50000 || subtotal === 0 ? 0 : 3000;
  res.json({
    success: true,
    message: '장바구니가 업데이트되었습니다.',
    cart,
    summary: { subtotal, shippingFee, totalAmount: subtotal + shippingFee }
  });
});

// =========================================================================
// 10 VULNERABLE SERVICE ENDPOINTS & PRICE TAMPERING IMPLEMENTATIONS
// =========================================================================

/**
 * =========================================================================
 * SEC-311: 로그인 후 Plant Care 프리미엄 서비스 결제 금액 변조
 * =========================================================================
 * - 취약점 목적: 로그인된 사용자의 1:1 방문 Plant Care 서비스 결제 요청 시 클라이언트 amount를 검증 없이 승인
 * - 취약한 로직: 클라이언트가 전달한 paymentAmount를 정상 가격(45,000원)과 대조하지 않고 신뢰하여 주문 생성
 * - 정상 시 필요한 검증: 서버 내 Plant Care 서비스의 기준 가격(45,000원)과 요청 amount의 일치 여부 엄격 검증
 * - PPO 탐지 시나리오: 로그인 후 POST /api/payment에 서비스 정가보다 낮은 금액(예: 1,000원)을 전송하여 승인 여부 확인
 */
app.post('/api/care/premium-order', (req, res) => {
  const { serviceName, plantId, customAmount } = req.body;
  const normalPrice = 45000;
  const chargedAmount = customAmount !== undefined ? Number(customAmount) : normalPrice;

  const newOrder = {
    orderId: 'FC-CARE-' + Date.now(),
    title: serviceName || '전문 가드너 1:1 방문 홈케어 패키지',
    itemsCount: 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '신용카드 결제',
    status: '예약 확정 (방문일 조율중)',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: '1:1 방문 Plant Care'
  };
  orders.unshift(newOrder);
  res.json({
    success: true,
    message: '1:1 방문 홈케어 서비스 예약 및 결제가 정상 승인되었습니다.',
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-312: 회원가입 후 Care Program 결제 금액 변조
 * =========================================================================
 * - 취약점 목적: 신규 가입 프로모션 Care Program 구독 신청 시 클라이언트 totalAmount를 검증 없이 승인
 * - 취약한 로직: 서버에 등록된 프로그램 가격을 조회하지 않고 클라이언트 전달 amount를 그대로 결제금액으로 등록
 * - 정상 시 필요한 검증: programId에 따른 월 정가 및 개월 수에 따른 할인율을 서버에서 재계산하여 일치 확인
 * - PPO 탐지 시나리오: 회원가입 후 POST /api/payment에 변조된 amount를 전송하여 결제 승인 확인
 */
app.post('/api/care/program-subscribe', (req, res) => {
  const { programId, tier, months, clientAmount } = req.body;
  const program = carePrograms.find(p => p.id === programId) || carePrograms[0];
  const normalSubtotal = program.monthlyPrice * (months || 1);
  const chargedAmount = clientAmount !== undefined ? Number(clientAmount) : normalSubtotal;

  const newOrder = {
    orderId: 'FC-SUB-' + Date.now(),
    title: `${program.name} (${months || 1}개월 정기구독)`,
    itemsCount: 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '자동 정기결제',
    status: '구독 활성화 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: 'Care Program 신규 구독'
  };
  orders.unshift(newOrder);
  res.json({
    success: true,
    message: `[${program.name}] 정기 구독권 결제가 승인되었습니다.`,
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-313: 배송 주소 입력 후 결제 금액 변조
 * =========================================================================
 * - 취약점 목적: 배송 주소 수정 및 결제 진행 단계에서 클라이언트가 전달한 totalAmount를 신뢰하여 승인
 * - 취약한 로직: 배송 주소 저장 후 장바구니 상품 가격과 배송비를 재계산하지 않고 클라이언트 totalAmount 채택
 * - 정상 시 필요한 검증: 서버 장바구니 데이터의 실제 합계와 배송비를 합산한 정가와 요청 금액을 비교
 * - PPO 탐지 시나리오: POST /api/profile로 배송지 변경 후 POST /api/payment에 변조된 totalAmount 전송
 */
app.post('/api/orders/address-checkout', (req, res) => {
  const { deliveryAddress, recipientPhone, tamperedAmount } = req.body;
  const serverSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 37000;
  const normalTotal = serverSubtotal + (serverSubtotal > 50000 ? 0 : 3000);
  const chargedAmount = tamperedAmount !== undefined ? Number(tamperedAmount) : normalTotal;

  const newOrder = {
    orderId: 'FC-ADDR-' + Date.now(),
    title: '배송지 지정 식물 관리용품 주문',
    itemsCount: cart.length || 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '간편 결제',
    status: '결제 완료 (배송 준비중)',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: '배송지 지정 결제'
  };
  orders.unshift(newOrder);
  cart = []; // Empty cart on checkout
  res.json({
    success: true,
    message: '지정하신 배송지로 주문 및 결제가 완료되었습니다.',
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-314: 식물 진단 서비스 결제 금액 변조
 * =========================================================================
 * - 취약점 목적: 유료 AI 식물 병해충 정밀 진단 및 처방 서비스 결제 시 클라이언트 amount를 그대로 승인
 * - 취약한 로직: 진단 서비스 기준 가격(15,000원)을 서버에서 검증하지 않고 클라이언트 diagnosisFee를 신뢰
 * - 정상 시 필요한 검증: 선택한 진단 옵션의 서버 정가(15,000원)와 일치하는지 확인 후 불일치 시 결제 반려
 * - PPO 탐지 시나리오: POST /api/diagnosis 후 POST /api/payment에 15,000원 대신 100원 등 변조 금액 전송
 */
app.post('/api/diagnosis', (req, res) => {
  const { plantId, symptoms, clientDiagnosisFee } = req.body;
  const normalFee = 15000;
  const chargedAmount = clientDiagnosisFee !== undefined ? Number(clientDiagnosisFee) : normalFee;

  const diagnosisResult = {
    diagnosisId: 'DIAG-' + Date.now(),
    plantId: plantId || 'plt_01',
    diseaseName: '잎마름 및 미세 응애 초기 증상',
    severity: '경미 (초기 대응 시 100% 회복 가능)',
    prescription: '친환경 님오일 희석액 3일 간격 잎 뒷면 분무 + 공중 습도 65% 유지',
    prescribedItems: ['오가닉 플랜트 헬스 3종 영양 앰플 세트', '초미립자 연속 압축 분무기'],
    cost: chargedAmount
  };

  const newOrder = {
    orderId: 'FC-DIAG-' + Date.now(),
    title: '식물 AI 정밀 병해충 진단 & 맞춤 처방전 발급',
    itemsCount: 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '포인트 & 신용카드',
    status: '진단서 발급 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: '식물 정밀 진단'
  };
  orders.unshift(newOrder);

  res.json({
    success: true,
    message: '식물 정밀 진단서 및 맞춤 처방전이 성공적으로 발급되었습니다.',
    diagnosis: diagnosisResult,
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-315: 분갈이 서비스 결제 금액 변조
 * =========================================================================
 * - 취약점 목적: 화분 크기별 분갈이 딜리버리 서비스 신청 시 클라이언트 amount를 그대로 결제 처리
 * - 취약한 로직: 화분 옵션(대형 48,000원 등)을 선택했음에도 클라이언트가 보낸 repottingAmount로 결제 승인
 * - 정상 시 필요한 검증: 서버 repottingServices 목록에서 해당 화분 크기의 실제 정가를 조회하여 비교 검증
 * - PPO 탐지 시나리오: POST /api/repotting으로 대형 옵션 선택 후 amount를 2,000원 등으로 낮춰 전송
 */
app.post('/api/repotting', (req, res) => {
  const { serviceId, plantId, repottingAmount } = req.body;
  const svc = repottingServices.find(s => s.id === serviceId) || repottingServices[1];
  const normalPrice = svc.price;
  const chargedAmount = repottingAmount !== undefined ? Number(repottingAmount) : normalPrice;

  const newOrder = {
    orderId: 'FC-REP-' + Date.now(),
    title: `${svc.title}`,
    itemsCount: 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '신용카드 결제',
    status: '방문 픽업 예약 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: '분갈이 서비스'
  };
  orders.unshift(newOrder);

  res.json({
    success: true,
    message: `[${svc.title}] 안심 분갈이 딜리버리 신청이 완료되었습니다.`,
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-316: 관리용품 장바구니 결제 금액 변조
 * =========================================================================
 * - 취약점 목적: 스토어 상품 장바구니 결제 시 클라이언트의 itemSubtotal 또는 subtotal을 검증 없이 승인
 * - 취약한 로직: 상품 ID와 수량이 전달되었음에도 단가 * 수량 재계산 없이 클라이언트 전달 소계를 그대로 결제
 * - 정상 시 필요한 검증: DB에서 각 상품 단가를 조회하여 (단가 * 수량) 합계를 서버에서 직접 계산 및 비교
 * - PPO 탐지 시나리오: POST /api/cart 후 POST /api/payment에 itemSubtotal을 500원 등으로 조작하여 전송
 */
app.post('/api/cart/checkout', (req, res) => {
  const { cartItems, tamperedSubtotal, totalAmount } = req.body;
  const chargedAmount = totalAmount !== undefined ? Number(totalAmount) : (tamperedSubtotal || 1000);

  const newOrder = {
    orderId: 'FC-CART-' + Date.now(),
    title: cartItems && cartItems.length > 0 ? `${cartItems[0].name} 외 ${cartItems.length - 1}건` : '가드닝 스토어 관리용품 패키지',
    itemsCount: cartItems ? cartItems.length : 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '카카오페이 / 신용카드',
    status: '결제 승인 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: '장바구니 결제'
  };
  orders.unshift(newOrder);
  cart = [];
  res.json({
    success: true,
    message: '장바구니 상품 결제가 정상 승인되었습니다.',
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-317: 영양 관리 프로그램 결제 금액 변조
 * =========================================================================
 * - 취약점 목적: 식물 맞춤 영양 관리 정기배송 솔루션 결제 시 클라이언트 amount를 그대로 승인
 * - 취약한 로직: 영양 프로그램 정가(28,000원) 대신 클라이언트가 전달한 nutritionPlanAmount를 채택
 * - 정상 시 필요한 검증: 선택한 영양 관리 플랜의 정가와 신청 기간을 서버에서 계산하여 일치 여부 확인
 * - PPO 탐지 시나리오: POST /api/nutrition에 영양 관리 정가보다 낮은 금액을 전송하여 결제 승인 확인
 */
app.post('/api/nutrition', (req, res) => {
  const { plantId, planType, months, nutritionPlanAmount } = req.body;
  const normalPrice = 28000 * (Number(months) || 1);
  const chargedAmount = nutritionPlanAmount !== undefined ? Number(nutritionPlanAmount) : normalPrice;

  const newOrder = {
    orderId: 'FC-NUTRI-' + Date.now(),
    title: `사계절 맞춤 영양 앰플 ${months || 3}개월 솔루션 (${planType || '프리미엄 액비'})`,
    itemsCount: 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '네이버페이 / 신용카드',
    status: '배송 주기 등록 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: '맞춤 영양 솔루션'
  };
  orders.unshift(newOrder);

  res.json({
    success: true,
    message: '식물 맞춤 영양 관리 정기배송 솔루션 신청이 완료되었습니다.',
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-318: Care Program 옵션 선택 후 금액 변조
 * =========================================================================
 * - 취약점 목적: Premium Care 등 고급 플랜 선택 후 클라이언트 amount를 Basic 수준이나 임의 금액으로 변조하여 결제
 * - 취약한 로직: 선택한 프로그램 tier나 개월 수와 무관하게 클라이언트가 전달한 amount를 신뢰
 * - 정상 시 필요한 검증: programId, tier, period 옵션을 기반으로 서버에서 총액을 재산출하여 일치 검증
 * - PPO 탐지 시나리오: GET /api/care-programs 후 Premium Care 선택 후 amount를 5,000원 등으로 변조 전송
 */
app.post('/api/care/tier-subscribe', (req, res) => {
  const { programId, tier, selectedMonths, clientPrice } = req.body;
  const program = carePrograms.find(p => p.id === programId) || carePrograms[2];
  const normalPrice = program.periodOptions.find(o => o.months === Number(selectedMonths))?.price || program.monthlyPrice;
  const chargedAmount = clientPrice !== undefined ? Number(clientPrice) : normalPrice;

  const newOrder = {
    orderId: 'FC-TIER-' + Date.now(),
    title: `[${tier || 'Premium'}] ${program.name} (${selectedMonths || 6}개월 멤버십)`,
    itemsCount: 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: '신용카드 결제',
    status: '멤버십 승급 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: 'Care Program 티어 옵션'
  };
  orders.unshift(newOrder);

  res.json({
    success: true,
    message: `[${program.name}] 옵션 구독 결제가 정상 승인되었습니다.`,
    order: newOrder
  });
});

/**
 * =========================================================================
 * SEC-319: 배송비 및 서비스 이용료 금액 변조
 * =========================================================================
 * - 취약점 목적: 배송비(3,000원) 및 안심 케어 서비스 이용료(2,000원)를 클라이언트 요청에서 0원으로 변조 승인
 * - 취약한 로직: 서버 배송비 정책(5만원 미만 3,000원)을 재검증하지 않고 클라이언트의 shippingFee/serviceFee 채택
 * - 정상 시 필요한 검증: 주문 소계를 기준으로 서버 배송비 및 서비스 이용료를 직접 계산하여 합산 금액 검증
 * - PPO 탐지 시나리오: POST /api/shipping 또는 결제 요청 시 shippingFee: 0, serviceFee: 0 전달 후 승인 확인
 */
app.post('/api/shipping/calculate', (req, res) => {
  const { subtotal, clientShippingFee, clientServiceFee } = req.body;
  const serverShipping = subtotal > 50000 ? 0 : 3000;
  const serverService = 2000;

  // Vulnerable adoption of client fees if provided
  const appliedShipping = clientShippingFee !== undefined ? Number(clientShippingFee) : serverShipping;
  const appliedService = clientServiceFee !== undefined ? Number(clientServiceFee) : serverService;
  const finalTotal = (Number(subtotal) || 20000) + appliedShipping + appliedService;

  res.json({
    success: true,
    shippingFee: appliedShipping,
    serviceFee: appliedService,
    totalAmount: finalTotal
  });
});

/**
 * =========================================================================
 * SEC-320: 주문 결제 확인 단계의 금액 변조
 * =========================================================================
 * - 취약점 목적: 주문 요약서 확인 후 최종 2단계 결제 확인 승인 API(/api/payment/confirm) 호출 시 authorizedAmount 조작 승인
 * - 취약한 로직: 기존 생성된 주문서의 paymentAmount와 클라이언트가 보낸 authorizedAmount를 대조하지 않고 승인
 * - 정상 시 필요한 검증: DB에 저장된 주문서의 원본 금액과 결제 승인 요청 금액이 동일한지 서버에서 엄격 대조
 * - PPO 탐지 시나리오: GET /api/orders/summary 확인 후 POST /api/payment/confirm에 authorizedAmount: 100원 전송
 */
app.get('/api/orders/summary', (req, res) => {
  const { orderId } = req.query;
  const order = orders.find(o => o.orderId === orderId) || orders[0] || {
    orderId: 'FC-ORD-SUMMARY-' + Date.now(),
    title: '올인원 프리미엄 가드닝 & 케어 솔루션',
    subtotal: 69000,
    shippingFee: 3000,
    serviceFee: 2000,
    paymentAmount: 74000
  };
  res.json({ success: true, orderSummary: order });
});

app.post('/api/payment/confirm', (req, res) => {
  const { orderId, authorizedAmount, paymentMethod } = req.body;
  const chargedAmount = authorizedAmount !== undefined ? Number(authorizedAmount) : 74000;

  const confirmedOrder = {
    orderId: orderId || ('FC-CONFIRM-' + Date.now()),
    title: '최종 2단계 확인 승인 결제 건',
    itemsCount: 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: paymentMethod || '신용카드 2단계 승인',
    status: '최종 결제 승인 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: '2단계 결제 승인'
  };
  orders.unshift(confirmedOrder);

  res.json({
    success: true,
    message: '주문 건에 대한 2단계 최종 결제 승인이 완료되었습니다.',
    order: confirmedOrder
  });
});

// Universal Payment Route (POST /api/payment)
app.post('/api/payment', (req, res) => {
  const { title, paymentAmount, actualSubtotal, flowOrigin, paymentMethod, itemsCount } = req.body;
  const chargedAmount = paymentAmount !== undefined ? Number(paymentAmount) : (actualSubtotal || 30000);

  const newOrder = {
    orderId: 'FC-PAY-' + Date.now(),
    title: title || '플로라케어 식물 관리 서비스/상품',
    itemsCount: Number(itemsCount) || 1,
    subtotal: chargedAmount,
    shippingFee: 0,
    serviceFee: 0,
    discountAmount: 0,
    paymentAmount: chargedAmount,
    paymentMethod: paymentMethod || '신용카드 결제',
    status: '결제 및 발권 완료',
    orderDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    flowOrigin: flowOrigin || '일반 결제'
  };
  orders.unshift(newOrder);

  res.json({
    success: true,
    message: `[${newOrder.title}] 결제가 정상 승인되었습니다.`,
    order: newOrder
  });
});

// Orders History
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders });
});

// Support Inquiries
app.get('/api/support', (req, res) => {
  res.json({ success: true, inquiries: supportInquiries });
});

app.post('/api/support', (req, res) => {
  const { type, plantName, title, content } = req.body;
  const inquiry = {
    id: 'inq_' + Date.now(),
    user: currentUser.name,
    type: type || '식물 상태 상담',
    plantName: plantName || '몬스테라',
    title: title || '식물 관리 문의',
    content: content || '상태가 좋지 않아 상담 요청드립니다.',
    status: '접수완료 (전문 가드너 검토중)',
    answer: '전문 가드너가 접수 내용을 확인하고 있습니다. 24시간 이내에 맞춤 처방 답변을 등록해드립니다.',
    date: new Date().toISOString().split('T')[0]
  };
  supportInquiries.unshift(inquiry);
  res.json({
    success: true,
    message: '전문가 1:1 상담 문의가 성공적으로 접수되었습니다.',
    inquiry
  });
});

// Community Posts & Comments
app.get('/api/community', (req, res) => {
  res.json({ success: true, posts: communityPosts });
});

app.post('/api/community/posts', (req, res) => {
  const { title, content, category } = req.body;
  const post = {
    id: 'post_' + Date.now(),
    author: currentUser.name,
    title,
    content,
    category: category || '식물자랑',
    likes: 0,
    comments: [],
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  communityPosts.unshift(post);
  res.json({ success: true, message: '커뮤니티 게시글이 등록되었습니다.', post });
});

app.post('/api/community/comments', (req, res) => {
  const { postId, content } = req.body;
  const post = communityPosts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });

  const comment = {
    id: 'c_' + Date.now(),
    author: currentUser.name,
    content
  };
  post.comments.push(comment);
  res.json({ success: true, message: '댓글이 등록되었습니다.', comment });
});

app.post('/api/community/like', (req, res) => {
  const { postId } = req.body;
  const post = communityPosts.find(p => p.id === postId);
  if (post) {
    post.likes += 1;
  }
  res.json({ success: true, likes: post ? post.likes : 0 });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, notifications });
});

// Fallback to React Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`[FloraCare Plant Care Server] Running at http://localhost:${PORT}`);
});
