import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9930;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// =========================================================
// MOCK DATA & IN-MEMORY STORAGE
// =========================================================

// User Profile
let currentUser = {
  id: 'usr_agri_01',
  name: '박준혁',
  email: 'junhyuk.farm@agripulse.io',
  phone: '010-4829-1920',
  role: '수석 스마트팜 마스터',
  farmCount: 4,
  license: '스마트농업 공인관리사 1급'
};

// Farms
let farms = [
  {
    id: 'farm_01',
    name: 'Green Valley Smart Farm',
    location: '충청남도 부여군 세도면 가람길 42',
    area: '15,400㎡ (약 4,650평)',
    cropCount: 6,
    greenhouseCount: 4,
    status: '정상 운영중 (생육 최적)',
    managerId: 'usr_agri_01',
    createdAt: '2024-03-15'
  },
  {
    id: 'farm_02',
    name: 'Morning Dew Eco Farm',
    location: '전라남도 나주시 금천면 영산로 108',
    area: '9,800㎡ (약 2,960평)',
    cropCount: 4,
    greenhouseCount: 2,
    status: '정상 운영중 (수확기 진입)',
    managerId: 'usr_agri_01',
    createdAt: '2024-08-20'
  },
  {
    id: 'farm_03',
    name: 'Riverside High-Tech Greenhouse',
    location: '경상남도 밀양시 상남면 예림리 88',
    area: '22,000㎡ (약 6,650평)',
    cropCount: 8,
    greenhouseCount: 6,
    status: '정상 운영중 (정밀 관수 가동)',
    managerId: 'usr_agri_01',
    createdAt: '2025-01-10'
  },
  {
    id: 'farm_04',
    name: 'Sunny Field Organic Farm',
    location: '강원도 춘천시 신북읍 율문길 15',
    area: '12,500㎡ (약 3,780평)',
    cropCount: 5,
    greenhouseCount: 3,
    status: '정상 운영중 (파종 진행)',
    managerId: 'usr_agri_01',
    createdAt: '2025-04-05'
  }
];

let selectedFarmId = 'farm_01';

// Greenhouses
let greenhouses = [
  {
    id: 'gh_01',
    farmId: 'farm_01',
    name: '스마트 1호동 (토마토 전용 스마트 온실)',
    temperature: 24.5,
    humidity: 68,
    soilMoisture: 42,
    lightLevel: '38,500 Lux',
    status: '최적 생육',
    cropCount: 2
  },
  {
    id: 'gh_02',
    farmId: 'farm_01',
    name: '스마트 2호동 (파프리카 수경재배 온실)',
    temperature: 23.2,
    humidity: 72,
    soilMoisture: 45,
    lightLevel: '41,200 Lux',
    status: '최적 생육',
    cropCount: 2
  },
  {
    id: 'gh_03',
    farmId: 'farm_01',
    name: '스마트 3호동 (딸기 고설재배 클린베드)',
    temperature: 20.8,
    humidity: 64,
    soilMoisture: 38,
    lightLevel: '35,000 Lux',
    status: '수확기 집중제어',
    cropCount: 1
  },
  {
    id: 'gh_04',
    farmId: 'farm_01',
    name: '스마트 4호동 (유러피안 엽채류 수직수경)',
    temperature: 22.0,
    humidity: 65,
    soilMoisture: 40,
    lightLevel: '32,000 Lux',
    status: '생육 안정',
    cropCount: 1
  }
];

// Crops
let crops = [
  {
    id: 'crop_01',
    farmId: 'farm_01',
    greenhouseId: 'gh_01',
    name: '대추방울토마토 (스위트베리)',
    variety: '유럽 직수입 고당도 품종',
    plantedAt: '2026-07-15',
    expectedHarvestAt: '2026-10-10',
    growthRate: 85,
    healthStatus: '건강 (최상)',
    quantity: 3200,
    unit: '주',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_02',
    farmId: 'farm_01',
    greenhouseId: 'gh_02',
    name: '미니 파프리카 (레드/옐로우)',
    variety: '비타민C 고함량 파프리카',
    plantedAt: '2026-06-20',
    expectedHarvestAt: '2026-10-05',
    growthRate: 92,
    healthStatus: '건강 (수확기)',
    quantity: 2400,
    unit: '주',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_03',
    farmId: 'farm_01',
    greenhouseId: 'gh_03',
    name: '설향 딸기 (클린 스마트베드)',
    variety: '국내 프리미엄 대과종',
    plantedAt: '2026-08-01',
    expectedHarvestAt: '2026-11-15',
    growthRate: 64,
    healthStatus: '정상 생육중',
    quantity: 4500,
    unit: '주',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_04',
    farmId: 'farm_01',
    greenhouseId: 'gh_04',
    name: '유러피안 버터헤드 상추',
    variety: '샐러드용 부드러운 엽채류',
    plantedAt: '2026-08-25',
    expectedHarvestAt: '2026-10-01',
    growthRate: 78,
    healthStatus: '건강 (최상)',
    quantity: 6000,
    unit: '포기',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'crop_05',
    farmId: 'farm_01',
    greenhouseId: 'gh_01',
    name: '스위트 바질 & 로즈마리',
    variety: '이탈리안 고급 허브',
    plantedAt: '2026-07-20',
    expectedHarvestAt: '2026-09-30',
    growthRate: 95,
    healthStatus: '수확 가능',
    quantity: 1800,
    unit: '포트',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80'
  }
];

// Cultivation Schedules
let cultivationSchedules = [
  { id: 'cs_01', farmId: 'farm_01', cropName: '대추방울토마토', stage: '착과 및 비대기', startDate: '2026-09-01', endDate: '2026-09-30', action: 'EC 2.2 영양액 급액 및 일조량 8시간 확보' },
  { id: 'cs_02', farmId: 'farm_01', cropName: '미니 파프리카', stage: '수확 및 착색기', startDate: '2026-09-20', endDate: '2026-10-05', action: '야간 온도 18도 유지 및 완숙과 순차 수확' },
  { id: 'cs_03', farmId: 'farm_01', cropName: '설향 딸기', stage: '화아분화 및 개화기', startDate: '2026-09-15', endDate: '2026-10-15', action: '수정 벌 방사 및 고설베드 수분율 40% 제어' },
  { id: 'cs_04', farmId: 'farm_01', cropName: '버터헤드 상추', stage: '엽채 비대기', startDate: '2026-09-10', endDate: '2026-09-28', action: '수직 LED 광량 10% 증대 및 팁번 방지 환기' }
];

// Work Schedules
let workSchedules = [
  { id: 'ws_01', farmId: 'farm_01', title: '1호동 토마토 곁순 제거 및 유인 작업', type: '생육관리', scheduledDate: '2026-09-27', assignee: '김태호 주임', status: '진행예정', description: '생육 8단 이상 곁순 일괄 정지 및 지주선 유인클립 보강' },
  { id: 'ws_02', farmId: 'farm_01', title: '온실 전동 배기팬 필터 청소 및 점검', type: '시설점검', scheduledDate: '2026-09-28', assignee: '이진우 기사', status: '진행예정', description: '1~4호동 환기팬 모터 그리스 주입 및 먼지망 세척' },
  { id: 'ws_03', farmId: 'farm_01', title: '유기농 친환경 영양제 관수라인 공급', type: '관수영양', scheduledDate: '2026-09-26', assignee: '박준혁 마스터', status: '완료', description: '고농축 킬레이트 칼슘 1:1000 희석 배합 투입 완료' },
  { id: 'ws_04', farmId: 'farm_01', title: '버터헤드 상추 1차 선별 수확 및 포장', type: '수확출하', scheduledDate: '2026-09-29', assignee: '최영미 반장', status: '진행예정', description: '규격품 150g 이상 선별 후 친환경 에코백 포장' }
];

// Harvests
let harvests = [
  { id: 'har_01', farmId: 'farm_01', cropId: 'crop_02', cropName: '미니 파프리카', expectedDate: '2026-10-02', expectedQuantity: 850, actualQuantity: 0, status: '수확대기' },
  { id: 'har_02', farmId: 'farm_01', cropId: 'crop_01', cropName: '대추방울토마토', expectedDate: '2026-10-08', expectedQuantity: 1200, actualQuantity: 0, status: '수확대기' },
  { id: 'har_03', farmId: 'farm_01', cropId: 'crop_04', cropName: '버터헤드 상추', expectedDate: '2026-09-25', expectedQuantity: 420, actualQuantity: 445, status: '수확완료' },
  { id: 'har_04', farmId: 'farm_01', cropId: 'crop_05', cropName: '스위트 바질', expectedDate: '2026-09-20', expectedQuantity: 180, actualQuantity: 195, status: '수확완료' }
];

// Products (Marketplace)
let products = [
  {
    id: 'prod_01',
    name: '고당도 스테비아 토마토 F1 프리미엄 종자 (1,000립)',
    category: 'Seeds',
    description: '내병성 및 당도 11Brix 보장, 시설하우스 전용 최고급 F1 교배종자',
    price: 45000,
    stock: 120,
    unit: '1봉 (1000립)',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    supplier: '농우바이오 스마트시드',
    deliveryFee: 3000,
    isAvailable: true
  },
  {
    id: 'prod_02',
    name: '유러피안 버터헤드 & 카이피라 코팅 종자 세트',
    category: 'Seeds',
    description: '수경재배 발아율 98% 보증 펠렛 코팅 종자 2,000립',
    price: 38000,
    stock: 85,
    unit: '1세트',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80',
    supplier: '엔자자덴 아시아',
    deliveryFee: 3000,
    isAvailable: true
  },
  {
    id: 'prod_03',
    name: '설향 무병 건전 모종 (플러그 72구 트레이)',
    category: 'Seedlings',
    description: '조직배양 바이러스 무병 건전 묘, 탄저병·시들음병 완전 방제묘',
    price: 54000,
    stock: 60,
    unit: '72구 트레이 1판',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
    supplier: '한국원예육종센터',
    deliveryFee: 4000,
    isAvailable: true
  },
  {
    id: 'prod_04',
    name: '스마트팜 맞춤 수경재배 A/B 전용 농축 액상비료 (20L x 2통)',
    category: 'Fertilizer',
    description: '작물별 최적 질소/인산/칼리 및 미량요소 완벽 밸런스 처방 비료',
    price: 78000,
    stock: 150,
    unit: '40L 세트',
    image: 'https://images.unsplash.com/photo-1585336261026-41804f3239a2?auto=format&fit=crop&w=600&q=80',
    supplier: '야라코리아 스마트팜사업부',
    deliveryFee: 5000,
    isAvailable: true
  },
  {
    id: 'prod_05',
    name: '생육 후기 고농축 킬레이트 칼슘 & 붕소 영양 앰플 (10L)',
    category: 'Nutrition',
    description: '배꼽썩음병 예방, 과실 경도 증진 및 열과 방지 특수 영양제',
    price: 62000,
    stock: 90,
    unit: '10L 1통',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    supplier: '바이엘 크롭사이언스',
    deliveryFee: 3000,
    isAvailable: true
  },
  {
    id: 'prod_06',
    name: '코코피트 + 펄라이트 고품질 수경재배 배지 슬래브 (100cm x 10장)',
    category: 'Soil',
    description: '멸균 처리 완료, 세척 EC 0.3 이하 최상급 스마트팜 전용 코코배지',
    price: 95000,
    stock: 45,
    unit: '10장 묶음',
    image: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=600&q=80',
    supplier: '스리랑카 직수입 그린코코',
    deliveryFee: 6000,
    isAvailable: true
  },
  {
    id: 'prod_07',
    name: '초정밀 압력보상 점적 단추 & 관수 드립퍼 세트 (500개입)',
    category: 'Irrigation',
    description: '시간당 2.0L 균일 점적 공급, 막힘 방지 미로 구조 드립퍼',
    price: 85000,
    stock: 70,
    unit: '500개 세트',
    image: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=600&q=80',
    supplier: '네타핌 관수시스템',
    deliveryFee: 3000,
    isAvailable: true
  },
  {
    id: 'prod_08',
    name: '스마트 온실 광합성 촉진 풀스펙트럼 LED 보광등 (150W)',
    category: 'Greenhouse Equipment',
    description: 'IP65 방수방진, PPFD 420 umol/m²/s 고효율 작물 생장 전용 LED',
    price: 165000,
    stock: 40,
    unit: '1기',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    supplier: '삼성전자 스마트LED 모듈',
    deliveryFee: 4000,
    isAvailable: true
  },
  {
    id: 'prod_09',
    name: '온실 IoT 온습도/토양EC/CO2 4-in-1 정밀 무선 센서노드',
    category: 'Greenhouse Equipment',
    description: 'RS-485 및 LoRa 무선 통신 지원, 실시간 환경 데이터 자동 수집기',
    price: 240000,
    stock: 25,
    unit: '1세트',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    supplier: 'AgriPulse IoT 솔루션',
    deliveryFee: 0,
    isAvailable: true
  },
  {
    id: 'prod_10',
    name: '스마트 수확용 초경량 전동 가위 & 인체공학 하베스트 카트',
    category: 'Tools',
    description: '티타늄 코팅 날, 대용량 리튬이온 배터리 8시간 연속 작업 가능',
    price: 135000,
    stock: 35,
    unit: '1세트',
    image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e17?auto=format&fit=crop&w=600&q=80',
    supplier: '아그리텍 코리아',
    deliveryFee: 3000,
    isAvailable: true
  }
];

// Equipment Rentals
let equipmentList = [
  {
    id: 'eq_01',
    name: '친환경 스마트 전동 자주식 예초기 (40V 듀얼)',
    category: '제초 장비',
    description: '무소음, 무매연, 온실 주변 및 두렁 제초에 최적화된 전동 예초기',
    rentalPrice: 35000,
    rentalPeriod: '1일 (24시간)',
    deposit: 50000,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'eq_02',
    name: '온실 전용 소형 전동 승강 작업대 (리프트)',
    category: '고소 작업',
    description: '최대 작업 높이 3.8m, 파프리카/토마토 상단 유인 및 수확 전용',
    rentalPrice: 85000,
    rentalPeriod: '1일 (24시간)',
    deposit: 100000,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'eq_03',
    name: '스마트 초미립자 연무 온실 방제기',
    category: '병해충 방제',
    description: '300평 온실 10분 내 균일 연무 방제 가능, 약제 침투율 극대화',
    rentalPrice: 65000,
    rentalPeriod: '1일 (24시간)',
    deposit: 80000,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1585336261026-41804f3239a2?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'eq_04',
    name: '다기능 포터블 토양 종합 분석 측정기 (pH/EC/질소/인산)',
    category: '정밀 측정',
    description: '현장에서 3초 만에 토양 양분 상태 및 산도 측정 출력',
    rentalPrice: 40000,
    rentalPeriod: '2일 (48시간)',
    deposit: 50000,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  }
];

// Cart
let cart = [
  { productId: 'prod_04', name: '스마트팜 맞춤 수경재배 A/B 전용 농축 액상비료 (20L x 2통)', price: 78000, quantity: 2, image: 'https://images.unsplash.com/photo-1585336261026-41804f3239a2?auto=format&fit=crop&w=600&q=80' },
  { productId: 'prod_01', name: '고당도 스테비아 토마토 F1 프리미엄 종자 (1,000립)', price: 45000, quantity: 1, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' }
];

// Orders
let orders = [
  {
    orderId: 'AGRI-ORD-88210',
    title: '스마트팜 맞춤 수경재배 A/B 전용 농축 액상비료 외 1건',
    itemsCount: 3,
    subtotal: 201000,
    paymentAmount: 201000,
    status: '배송 완료',
    orderDate: '2026-09-21 14:20',
    flowOrigin: '정기 농자재 발주'
  },
  {
    orderId: 'AGRI-ORD-88195',
    title: '온실 IoT 온습도/토양EC/CO2 4-in-1 정밀 센서노드 (1세트)',
    itemsCount: 1,
    subtotal: 240000,
    paymentAmount: 240000,
    status: '설치 완료',
    orderDate: '2026-09-15 10:45',
    flowOrigin: '스마트 온실 장비 발주'
  }
];

// Expenses
let expenses = [
  { id: 'exp_01', farmId: 'farm_01', category: '농자재 및 비료', amount: 1250000, date: '2026-09-18', memo: '수경재배 양액 원제 1톤 및 킬레이트 미량원소 보충' },
  { id: 'exp_02', farmId: 'farm_01', category: '온실 전기 및 유류비', amount: 840000, date: '2026-09-15', memo: '스마트 히트펌프 냉난방 및 수경 관수 모터 전력료' },
  { id: 'exp_03', farmId: 'farm_01', category: '장비 대여 및 수리', amount: 350000, date: '2026-09-10', memo: '고소작업차 대여 및 관수 필터 밸브 교체비' },
  { id: 'exp_04', farmId: 'farm_01', category: '인건비 및 작업위탁', amount: 2400000, date: '2026-09-05', memo: '9월 1주차 곁순 제거 및 유인 전문 작업반 4인 위탁료' }
];

// Notifications
let notifications = [
  { id: 'notif_01', title: '스마트 1호동 최적 일조량 달성', message: '누적 일조량 38,500 Lux에 도달하여 광합성 최적 구간을 유지하고 있습니다.', time: '10분 전', read: false },
  { id: 'notif_02', title: '설향 딸기 정기 수분 관수 완료', message: '설향 고설베드 4,500주에 EC 1.8 양액 관수가 성공적으로 완료되었습니다.', time: '1시간 전', read: false },
  { id: 'notif_03', title: '농자재 배송 출발 안내', message: '주문하신 스마트팜 맞춤 수경재배 A/B 액상비료가 CJ대한통운으로 출고되었습니다.', time: '3시간 전', read: true }
];

// Helper: Calculate Cart Subtotal
function calculateCartSummary() {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 100000 || subtotal === 0 ? 0 : 3500;
  return {
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee
  };
}

// =========================================================
// API ROUTES
// =========================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'site031'
  });
});

// Auth
app.post('/api/register', (req, res) => {
  const { email, name, phone, farmName } = req.body;
  currentUser = {
    id: 'usr_' + Date.now(),
    name: name || '신규 농장주',
    email: email || 'user@agripulse.io',
    phone: phone || '010-0000-0000',
    role: '인증 스마트팜 관리자',
    farmCount: 1,
    license: '스마트농업 정회원'
  };
  res.json({ success: true, message: '회원가입 완료', user: currentUser });
});

app.post('/api/login', (req, res) => {
  res.json({ success: true, message: '로그인 성공', user: currentUser });
});

app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: '로그아웃 되었습니다.' });
});

app.get('/api/profile', (req, res) => {
  res.json({ success: true, user: currentUser });
});

app.patch('/api/profile', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json({ success: true, message: '프로필이 수정되었습니다.', user: currentUser });
});

// Farms
app.get('/api/farms', (req, res) => {
  res.json({ success: true, farms, selectedFarmId });
});

app.post('/api/farms', (req, res) => {
  const newFarm = {
    id: 'farm_' + (farms.length + 1),
    name: req.body.name || '신규 스마트팜',
    location: req.body.location || '충남 논산시 연무읍',
    area: req.body.area || '10,000㎡',
    cropCount: 0,
    greenhouseCount: req.body.greenhouseCount || 1,
    status: '신규 등록 완료',
    managerId: currentUser.id,
    createdAt: new Date().toISOString().split('T')[0]
  };
  farms.push(newFarm);
  res.json({ success: true, farm: newFarm });
});

app.get('/api/farms/:farmId', (req, res) => {
  const farm = farms.find(f => f.id === req.params.farmId) || farms[0];
  res.json({ success: true, farm });
});

app.patch('/api/farms/:farmId', (req, res) => {
  const idx = farms.findIndex(f => f.id === req.params.farmId);
  if (idx !== -1) {
    farms[idx] = { ...farms[idx], ...req.body };
    res.json({ success: true, farm: farms[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Farm not found' });
  }
});

app.post('/api/farms/select', (req, res) => {
  const { farmId } = req.body;
  selectedFarmId = farmId || 'farm_01';
  const farm = farms.find(f => f.id === selectedFarmId) || farms[0];
  res.json({ success: true, selectedFarmId, farm });
});

// Greenhouses & Crops
app.get('/api/greenhouses', (req, res) => {
  const filtered = greenhouses.filter(g => g.farmId === selectedFarmId);
  res.json({ success: true, greenhouses: filtered.length > 0 ? filtered : greenhouses });
});

app.get('/api/greenhouses/:greenhouseId', (req, res) => {
  const gh = greenhouses.find(g => g.id === req.params.greenhouseId) || greenhouses[0];
  res.json({ success: true, greenhouse: gh });
});

app.get('/api/crops', (req, res) => {
  res.json({ success: true, crops });
});

app.post('/api/crops', (req, res) => {
  const newCrop = {
    id: 'crop_' + (crops.length + 1),
    farmId: selectedFarmId,
    greenhouseId: req.body.greenhouseId || 'gh_01',
    name: req.body.name || '신규 작물',
    variety: req.body.variety || '표준 품종',
    plantedAt: new Date().toISOString().split('T')[0],
    expectedHarvestAt: req.body.expectedHarvestAt || '2026-12-31',
    growthRate: 10,
    healthStatus: '정상 발아',
    quantity: req.body.quantity || 1000,
    unit: req.body.unit || '주',
    image: req.body.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  };
  crops.push(newCrop);
  res.json({ success: true, crop: newCrop });
});

app.get('/api/crops/:cropId', (req, res) => {
  const crop = crops.find(c => c.id === req.params.cropId) || crops[0];
  res.json({ success: true, crop });
});

app.patch('/api/crops/:cropId', (req, res) => {
  const idx = crops.findIndex(c => c.id === req.params.cropId);
  if (idx !== -1) {
    crops[idx] = { ...crops[idx], ...req.body };
    res.json({ success: true, crop: crops[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Crop not found' });
  }
});

app.get('/api/crops/:cropId/growth', (req, res) => {
  const crop = crops.find(c => c.id === req.params.cropId) || crops[0];
  res.json({
    success: true,
    growth: {
      cropId: crop.id,
      name: crop.name,
      currentStage: '개화 및 착과 비대기',
      growthRate: crop.growthRate,
      soilMoisture: '42% (적정)',
      accumulatedLight: '38,500 Lux',
      recommendedNutrientEC: '2.0 ~ 2.4 mS/cm',
      history: [
        { date: '2026-08-01', stage: '정식 완료', height: '15cm', health: '최상' },
        { date: '2026-08-15', stage: '본엽 5매 전개', height: '38cm', health: '최상' },
        { date: '2026-09-01', stage: '1화방 개화', height: '75cm', health: '최상' },
        { date: '2026-09-20', stage: '3화방 착과', height: '120cm', health: '최상' }
      ]
    }
  });
});

app.get('/api/cultivation-schedules', (req, res) => {
  res.json({ success: true, schedules: cultivationSchedules });
});

app.post('/api/cultivation-schedules', (req, res) => {
  const newSched = { id: 'cs_' + Date.now(), farmId: selectedFarmId, ...req.body };
  cultivationSchedules.push(newSched);
  res.json({ success: true, schedule: newSched });
});

// Work & Harvest
app.get('/api/work-schedules', (req, res) => {
  res.json({ success: true, schedules: workSchedules });
});

app.post('/api/work-schedules', (req, res) => {
  const newWork = {
    id: 'ws_' + Date.now(),
    farmId: selectedFarmId,
    title: req.body.title || '새 작업 일정',
    type: req.body.type || '생육관리',
    scheduledDate: req.body.scheduledDate || '2026-09-30',
    assignee: req.body.assignee || currentUser.name,
    status: '진행예정',
    description: req.body.description || ''
  };
  workSchedules.push(newWork);
  res.json({ success: true, schedule: newWork });
});

app.patch('/api/work-schedules/:scheduleId', (req, res) => {
  const idx = workSchedules.findIndex(w => w.id === req.params.scheduleId);
  if (idx !== -1) {
    workSchedules[idx] = { ...workSchedules[idx], ...req.body };
    res.json({ success: true, schedule: workSchedules[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Work schedule not found' });
  }
});

app.get('/api/harvests', (req, res) => {
  res.json({ success: true, harvests });
});

app.post('/api/harvests', (req, res) => {
  const newHar = { id: 'har_' + Date.now(), farmId: selectedFarmId, ...req.body };
  harvests.push(newHar);
  res.json({ success: true, harvest: newHar });
});

// Products & Inventory
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...products];
  if (category && category !== '전체') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  res.json({ success: true, products: filtered });
});

app.get('/api/products/categories', (req, res) => {
  const cats = ['전체', 'Seeds', 'Seedlings', 'Fertilizer', 'Nutrition', 'Soil', 'Irrigation', 'Greenhouse Equipment', 'Tools'];
  res.json({ success: true, categories: cats });
});

app.get('/api/products/:productId', (req, res) => {
  const prod = products.find(p => p.id === req.params.productId) || products[0];
  res.json({ success: true, product: prod });
});

app.get('/api/equipment', (req, res) => {
  res.json({ success: true, equipment: equipmentList });
});

app.get('/api/equipment/:equipmentId', (req, res) => {
  const eq = equipmentList.find(e => e.id === req.params.equipmentId) || equipmentList[0];
  res.json({ success: true, equipment: eq });
});

app.get('/api/inventory', (req, res) => {
  res.json({ success: true, inventory: products });
});

// Cart
app.get('/api/cart', (req, res) => {
  res.json({ success: true, cart, summary: calculateCartSummary() });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  const prod = products.find(p => p.id === productId);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += (quantity || 1);
  } else {
    cart.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: quantity || 1,
      image: prod.image
    });
  }
  res.json({ success: true, cart, summary: calculateCartSummary() });
});

app.delete('/api/cart/items/:itemId', (req, res) => {
  cart = cart.filter(c => c.productId !== req.params.itemId);
  res.json({ success: true, cart, summary: calculateCartSummary() });
});

// Expenses & Reports
app.get('/api/expenses', (req, res) => {
  res.json({ success: true, expenses });
});

app.post('/api/expenses', (req, res) => {
  const newExp = { id: 'exp_' + Date.now(), farmId: selectedFarmId, ...req.body };
  expenses.push(newExp);
  res.json({ success: true, expense: newExp });
});

app.get('/api/reports/monthly', (req, res) => {
  res.json({
    success: true,
    report: {
      month: '2026-09',
      totalRevenue: 14850000,
      totalExpenses: 4840000,
      netProfit: 10010000,
      harvestEfficiency: '98.4%',
      energySavingRate: '18.2%',
      breakdown: [
        { category: '대추방울토마토 출하', revenue: 7800000 },
        { category: '미니 파프리카 출하', revenue: 4250000 },
        { category: '유러피안 엽채류 직거래', revenue: 2800000 }
      ]
    }
  });
});

app.get('/api/reports/farm', (req, res) => {
  const farm = farms.find(f => f.id === selectedFarmId) || farms[0];
  res.json({
    success: true,
    farmReport: {
      farmId: farm.id,
      name: farm.name,
      overallHealthScore: 96,
      averageTemperature: 23.4,
      averageHumidity: 67,
      totalActiveCrops: crops.length,
      upcomingHarvestsCount: harvests.filter(h => h.status === '수확대기').length
    }
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, notifications });
});

app.patch('/api/notifications/:notificationId/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.notificationId);
  if (notif) notif.read = true;
  res.json({ success: true, notifications });
});

app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders });
});

app.get('/api/orders/:orderId', (req, res) => {
  const ord = orders.find(o => o.orderId === req.params.orderId) || orders[0];
  res.json({ success: true, order: ord });
});

app.get('/api/orders/:orderId/summary', (req, res) => {
  const ord = orders.find(o => o.orderId === req.params.orderId) || orders[0];
  res.json({ success: true, order: ord });
});


// =========================================================================
// 10 INTENDED VULNERABILITY ENDPOINTS (Price Tampering: SEC-321 ~ SEC-330)
// =========================================================================

/**
 * SEC-321: 농자재 태그 입력 흐름 금액 변조
 * 목적: 농자재 상품 선택 후 태그 및 바코드 관리 옵션 처리 시 결제 금액 변조 취약점
 * 취약 로직: 서버가 정상 정가(50,000원) 대신 클라이언트가 전달한 customTagAmount(예: 1,000원)을 그대로 신뢰하여 결제 생성
 * 정상 시스템: 태그 관리 옵션 고정 단가를 서버에서 계산하고 클라이언트 전달 금액과 일치 여부 검증 필요
 * PPO 탐지 시나리오: POST /api/inventory/tags 요청에 변조된 customTagAmount 전송 후 승인 여부 확인
 */
app.post('/api/inventory/tags', (req, res) => {
  const { productId, tags, customTagAmount } = req.body;
  const prod = products.find(p => p.id === productId) || products[0];
  
  // Vulnerable logic: Trust client's customTagAmount directly without recalculating
  const paymentAmount = customTagAmount !== undefined ? Number(customTagAmount) : (prod.price + 5000);
  
  const newOrder = {
    orderId: 'AGRI-TAG-' + Date.now(),
    title: `[스마트 태그 관리] ${prod.name} (${tags || 'NFC/바코드'})`,
    itemsCount: 1,
    subtotal: prod.price + 5000,
    paymentAmount: paymentAmount,
    status: '발주 승인 완료',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: '농자재 스마트 태그 관리 패키지 발주'
  };
  orders.unshift(newOrder);
  
  res.json({
    success: true,
    message: '스마트 태그 관리 농자재 발주가 완료되었습니다.',
    order: newOrder
  });
});


/**
 * SEC-322: 농장 작업자 초대 메시지 흐름 금액 변조
 * 목적: 전문 작업자 초대 및 작업자 관리 서비스 신청 시 결제 금액 변조 취약점
 * 취약 로직: 서버가 작업자 초대 패키지 정가(120,000원) 대신 클라이언트의 workerServiceAmount(예: 1,500원)을 검증 없이 승인
 * 정상 시스템: 초대 대상 인원 및 위탁 관리 서비스 요율을 서버에서 재계산 후 일치 검증 필요
 * PPO 탐지 시나리오: POST /api/farm-members/invite 요청에 변조된 workerServiceAmount 전송 후 200 반환 확인
 */
app.post('/api/farm-members/invite', (req, res) => {
  const { workerName, role, message, workerServiceAmount } = req.body;
  
  // Vulnerable logic: Trust client's workerServiceAmount without server-side rate calculation
  const paymentAmount = workerServiceAmount !== undefined ? Number(workerServiceAmount) : 120000;
  
  const newOrder = {
    orderId: 'AGRI-MEM-' + Date.now(),
    title: `[전문 작업자 초빙] ${workerName || '전문 마스터'} (${role || '수석 재배사'}) 매칭 케어`,
    itemsCount: 1,
    subtotal: 120000,
    paymentAmount: paymentAmount,
    status: '초청 매칭 완료',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: '전문 작업자 초빙 케어 서비스'
  };
  orders.unshift(newOrder);
  
  res.json({
    success: true,
    message: '작업자 초대 및 전문 관리 서비스 신청이 완료되었습니다.',
    order: newOrder
  });
});


/**
 * SEC-323: 농기구 대여 서비스 흐름 금액 변조
 * 목적: 농기구 대여 시 대여료 및 보증금 합산 결제 금액 변조 취약점
 * 취약 로직: 서버가 농기구 정가 대여료(35,000~85,000원) 대신 클라이언트의 rentalPrice(예: 2,000원)을 그대로 수용하여 대여 승인
 * 정상 시스템: 장비 ID와 대여 기간(일수)을 기준으로 서버에서 계산한 대여료+보증금과 클라이언트 금액 비교 필수
 * PPO 탐지 시나리오: POST /api/equipment-rentals 요청에 변조된 rentalPrice 전송 후 대여 완료 확인
 */
app.post('/api/equipment-rentals', (req, res) => {
  const { equipmentId, days, rentalPrice } = req.body;
  const eq = equipmentList.find(e => e.id === equipmentId) || equipmentList[0];
  const actualPrice = eq.rentalPrice * (days || 1);
  
  // Vulnerable logic: Use client's rentalPrice directly
  const paymentAmount = rentalPrice !== undefined ? Number(rentalPrice) : actualPrice;
  
  const newOrder = {
    orderId: 'AGRI-RENT-' + Date.now(),
    title: `[농기구 스마트 대여] ${eq.name} (${days || 1}일)`,
    itemsCount: 1,
    subtotal: actualPrice,
    paymentAmount: paymentAmount,
    status: '대여 예약 승인',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: '농기구 스마트 대여'
  };
  orders.unshift(newOrder);
  
  res.json({
    success: true,
    message: '농기구 대여 신청 및 결제가 승인되었습니다.',
    order: newOrder
  });
});


/**
 * SEC-324: 비료 및 영양제 주문 흐름 금액 변조
 * 목적: 비료 및 액체 영양제 대량 주문 시 subtotal 결제 금액 변조 취약점
 * 취약 로직: 서버가 상품 정가(78,000원 x 수량)를 재계산하지 않고 클라이언트의 nutritionSubtotal(예: 2,500원)을 그대로 승인
 * 정상 시스템: 상품 ID와 수량을 곱한 서버 subtotal과 클라이언트 결제액을 비교하여 불일치 시 거부해야 함
 * PPO 탐지 시나리오: POST /api/nutrition-orders 요청에 변조된 nutritionSubtotal 전송 후 성공 응답 확인
 */
app.post('/api/nutrition-orders', (req, res) => {
  const { productId, quantity, nutritionSubtotal } = req.body;
  const prod = products.find(p => p.id === productId) || products[3];
  const actualSubtotal = prod.price * (quantity || 1);
  
  // Vulnerable logic: Trust client's nutritionSubtotal
  const paymentAmount = nutritionSubtotal !== undefined ? Number(nutritionSubtotal) : actualSubtotal;
  
  const newOrder = {
    orderId: 'AGRI-NUT-' + Date.now(),
    title: `[비료/영양제 직발주] ${prod.name} (${quantity || 1}개)`,
    itemsCount: quantity || 1,
    subtotal: actualSubtotal,
    paymentAmount: paymentAmount,
    status: '발주 승인 완료',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: '비료 및 영양제 정기 발주'
  };
  orders.unshift(newOrder);
  
  res.json({
    success: true,
    message: '비료 및 영양제 발주가 승인되었습니다.',
    order: newOrder
  });
});


/**
 * SEC-325: 씨앗 및 모종 주문 흐름 금액 변조
 * 목적: 고당도 F1 씨앗 및 무병 모종 주문 시 amount 변조 취약점
 * 취약 로직: 서버가 씨앗 단가(45,000원)를 검증하지 않고 클라이언트가 보낸 seedOrderAmount(예: 800원)을 결제액으로 채택
 * 정상 시스템: 종자 품목 DB 가격과 수량으로 최종 금액을 서버에서 엄격히 산출해야 함
 * PPO 탐지 시나리오: POST /api/seed-orders 요청에 변조된 seedOrderAmount 전송 후 200 반환 확인
 */
app.post('/api/seed-orders', (req, res) => {
  const { productId, quantity, seedOrderAmount } = req.body;
  const prod = products.find(p => p.id === productId) || products[0];
  const actualSubtotal = prod.price * (quantity || 1);
  
  // Vulnerable logic: Trust client's seedOrderAmount directly
  const paymentAmount = seedOrderAmount !== undefined ? Number(seedOrderAmount) : actualSubtotal;
  
  const newOrder = {
    orderId: 'AGRI-SEED-' + Date.now(),
    title: `[프리미엄 종자/모종 발주] ${prod.name} (${quantity || 1}개)`,
    itemsCount: quantity || 1,
    subtotal: actualSubtotal,
    paymentAmount: paymentAmount,
    status: '발주 완료',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: '씨앗 및 모종 직발주'
  };
  orders.unshift(newOrder);
  
  res.json({
    success: true,
    message: '씨앗 및 모종 주문이 완료되었습니다.',
    order: newOrder
  });
});


/**
 * SEC-326: 장바구니 수량 변경 흐름 금액 변조
 * 목적: 장바구니 품목 수량 변경 후 즉시 결제 처리 시 클라이언트 subtotal 변조 취약점
 * 취약 로직: 장바구니 품목 수량 수정 시 클라이언트가 전달한 tamperedCartTotal(예: 500원)을 그대로 최종 결제액으로 적용
 * 정상 시스템: 장바구니 전체 품목의 서버 DB 단가와 수량을 재합산하여 계산된 금액만 결제 승인해야 함
 * PPO 탐지 시나리오: PATCH /api/cart/items/:itemId 요청에 tamperedCartTotal 전송 후 결제 승인 확인
 */
app.patch('/api/cart/items/:itemId', (req, res) => {
  const { quantity, tamperedCartTotal } = req.body;
  const item = cart.find(c => c.productId === req.params.itemId);
  if (item && quantity > 0) {
    item.quantity = quantity;
  }
  
  const summary = calculateCartSummary();
  // Vulnerable logic: Accept tamperedCartTotal if provided
  const finalPaymentAmount = tamperedCartTotal !== undefined ? Number(tamperedCartTotal) : summary.totalAmount;
  
  if (tamperedCartTotal !== undefined) {
    const newOrder = {
      orderId: 'AGRI-CART-' + Date.now(),
      title: `[장바구니 스마트 발주] ${cart[0]?.name || '농자재'} 외 ${cart.length - 1}건`,
      itemsCount: cart.length,
      subtotal: summary.subtotal,
      paymentAmount: finalPaymentAmount,
      status: '주문 승인 완료',
      orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      flowOrigin: '장바구니 쾌속 결제'
    };
    orders.unshift(newOrder);
    return res.json({
      success: true,
      message: '장바구니 주문이 승인되었습니다.',
      order: newOrder,
      cart,
      summary
    });
  }
  
  res.json({ success: true, cart, summary });
});


/**
 * SEC-327: 농자재 배송비 계산 흐름 금액 변조
 * 목적: 농자재 대량 주문 배송비 산정 시 shippingFee 및 totalAmount 변조 취약점
 * 취약 로직: 화물 배송비(예: 6,000~15,000원)를 클라이언트의 clientShippingFee(예: 0원)으로 조작했을 때 서버가 그대로 인정
 * 정상 시스템: 배송지 지역 및 화물 무게 기준 배송비를 서버에서 산출하고 결제 금액을 재계산해야 함
 * PPO 탐지 시나리오: POST /api/shipping/estimate 요청에 clientShippingFee: 0 전송 후 결제 승인 확인
 */
app.post('/api/shipping/estimate', (req, res) => {
  const { subtotal, clientShippingFee } = req.body;
  const actualSubtotal = Number(subtotal) || 85000;
  
  // Vulnerable logic: Trust client's clientShippingFee (e.g. 0 KRW)
  const shippingFee = clientShippingFee !== undefined ? Number(clientShippingFee) : 6000;
  const totalAmount = actualSubtotal + shippingFee;
  
  res.json({
    success: true,
    subtotal: actualSubtotal,
    shippingFee: shippingFee,
    totalAmount: totalAmount,
    message: '배송비 산정이 완료되었습니다.'
  });
});


/**
 * SEC-328: 온실 장비 및 스마트 농업 장비 주문 흐름 금액 변조
 * 목적: 고가 온실 IoT 센서 및 LED 장비 발주 시 totalAmount 금액 변조 취약점
 * 취약 로직: 온실 장비 정가(240,000원)를 서버에서 재계산하지 않고 클라이언트의 equipmentOrderAmount(예: 3,000원)을 그대로 승인
 * 정상 시스템: 장비 품목 단가와 수량을 기반으로 서버에서 합계를 계산하고 변조 금액을 차단해야 함
 * PPO 탐지 시나리오: POST /api/greenhouse-equipment/orders 요청에 변조된 equipmentOrderAmount 전송 후 승인 확인
 */
app.post('/api/greenhouse-equipment/orders', (req, res) => {
  const { equipmentId, quantity, equipmentOrderAmount } = req.body;
  const prod = products.find(p => p.id === equipmentId) || products[8];
  const actualSubtotal = prod.price * (quantity || 1);
  
  // Vulnerable logic: Trust client's equipmentOrderAmount
  const paymentAmount = equipmentOrderAmount !== undefined ? Number(equipmentOrderAmount) : actualSubtotal;
  
  const newOrder = {
    orderId: 'AGRI-GH-EQ-' + Date.now(),
    title: `[스마트 온실 장비 발주] ${prod.name} (${quantity || 1}세트)`,
    itemsCount: quantity || 1,
    subtotal: actualSubtotal,
    paymentAmount: paymentAmount,
    status: '장비 출고 대기',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: '스마트 온실 설비 발주'
  };
  orders.unshift(newOrder);
  
  res.json({
    success: true,
    message: '스마트 온실 장비 발주가 승인되었습니다.',
    order: newOrder
  });
});


/**
 * SEC-329: 농자재 주문 할인 및 쿠폰 적용 흐름 금액 변조
 * 목적: 쿠폰 할인 적용 시 discountAmount 금액 변조 취약점
 * 취약 로직: 쿠폰 최대 한도(5,000원)를 무시하고 클라이언트가 전달한 discountAmount(예: 99,000원 할인)를 그대로 차감 적용
 * 정상 시스템: 서버의 쿠폰 정책(할인율, 최대 할인 한도)을 기반으로 할인액을 재산출해야 함
 * PPO 탐지 시나리오: POST /api/orders/discount 요청에 과도한 discountAmount 전송 후 결제 승인 확인
 */
app.post('/api/orders/discount', (req, res) => {
  const { couponCode, subtotal, discountAmount } = req.body;
  const baseSubtotal = Number(subtotal) || 120000;
  
  // Vulnerable logic: Accept client's arbitrary discountAmount without limit check
  const appliedDiscount = discountAmount !== undefined ? Number(discountAmount) : 5000;
  const finalAmount = Math.max(0, baseSubtotal - appliedDiscount);
  
  res.json({
    success: true,
    couponCode: couponCode || 'FARM-SPECIAL',
    originalSubtotal: baseSubtotal,
    discountAmount: appliedDiscount,
    finalAmount: finalAmount,
    message: '할인 쿠폰이 성공적으로 적용되었습니다.'
  });
});


/**
 * SEC-330: 주문 결제 확인 단계 금액 변조
 * 목적: 2단계 최종 주문 결제 확인(Confirmation) 시 결제 승인 금액 변조 취약점
 * 취약 로직: 서버에 저장된 원래 주문 총액(185,000원)과 비교하지 않고 클라이언트가 승인 요청 시 보낸 authorizedAmount(예: 100원)으로 최종 확정
 * 정상 시스템: 주문 번호(orderId)에 맵핑된 원본 서버 저장 금액과 authorizedAmount가 일치하는지 엄격히 대조해야 함
 * PPO 탐지 시나리오: POST /api/payment/confirm 요청에 authorizedAmount: 100 전송 후 최종 승인 성공 확인
 */
app.post('/api/payment/confirm', (req, res) => {
  const { orderId, authorizedAmount } = req.body;
  
  // Vulnerable logic: Trust authorizedAmount from client directly
  const paymentAmount = authorizedAmount !== undefined ? Number(authorizedAmount) : 185000;
  
  const finalOrder = {
    orderId: orderId || 'AGRI-CONFIRM-' + Date.now(),
    title: '스마트팜 종합 운영 농자재 & 정밀 환경 제어 솔루션 패키지',
    itemsCount: 3,
    subtotal: 185000,
    paymentAmount: paymentAmount,
    status: '최종 결제 승인 확정',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: '2단계 최종 승인 발주'
  };
  orders.unshift(finalOrder);
  
  res.json({
    success: true,
    message: '2단계 최종 결제 승인이 완료되었습니다.',
    order: finalOrder
  });
});


// Universal Payment Endpoint
app.post('/api/payment', (req, res) => {
  const { title, itemsCount, actualSubtotal, paymentAmount, flowOrigin, paymentMethod } = req.body;
  
  const finalAmount = paymentAmount !== undefined ? Number(paymentAmount) : (actualSubtotal || 50000);
  
  const newOrder = {
    orderId: 'AGRI-PAY-' + Date.now(),
    title: title || '스마트팜 농자재 주문',
    itemsCount: itemsCount || 1,
    subtotal: actualSubtotal || finalAmount,
    paymentAmount: finalAmount,
    status: '결제 승인 완료',
    orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    flowOrigin: flowOrigin || '일반 결제',
    paymentMethod: paymentMethod || '신용카드'
  };
  orders.unshift(newOrder);
  
  res.json({
    success: true,
    message: '결제가 정상적으로 완료되었습니다.',
    order: newOrder
  });
});

// Serve frontend for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[AgriPulse OS] Server running on http://localhost:${PORT}`);
});
