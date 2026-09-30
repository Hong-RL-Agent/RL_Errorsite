import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9956;

app.use(cors());
app.use(express.json());

// Serve static dist in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Mock In-Memory Database (18+ Vehicles, 10+ Stations, Rentals, History)
// ----------------------------------------------------

// 대여소 (Stations) Mock Data
const stations = [
  { id: 'st-01', name: '강남역 11번 출구 스테이션', address: '서울 강남구 강남대로 396', lat: 37.4979, lng: 127.0276, availableBikes: 5, availableScooters: 4 },
  { id: 'st-02', name: '역삼역 포스코타워 앞', address: '서울 강남구 테헤란로 134', lat: 37.5006, lng: 127.0364, availableBikes: 3, availableScooters: 6 },
  { id: 'st-03', name: '선릉역 1번 출구 광장', address: '서울 강남구 테헤란로 340', lat: 37.5045, lng: 127.0490, availableBikes: 7, availableScooters: 2 },
  { id: 'st-04', name: '삼성역 코엑스 동문', address: '서울 강남구 영동대로 513', lat: 37.5088, lng: 127.0632, availableBikes: 6, availableScooters: 5 },
  { id: 'st-05', name: '신논현역 교보타워 사거리', address: '서울 서초구 강남대로 465', lat: 37.5042, lng: 127.0255, availableBikes: 4, availableScooters: 3 },
  { id: 'st-06', name: '양재역 서초문화예술회관', address: '서울 서초구 남부순환로 2584', lat: 37.4843, lng: 127.0345, availableBikes: 8, availableScooters: 4 },
  { id: 'st-07', name: '잠실역 롯데월드몰 광장', address: '서울 송파구 올림픽로 300', lat: 37.5133, lng: 127.1001, availableBikes: 5, availableScooters: 8 },
  { id: 'st-08', name: '판교역 알파돔시티 정류장', address: '경기 성남시 분당구 판교역로 146', lat: 37.3948, lng: 127.1119, availableBikes: 9, availableScooters: 7 },
  { id: 'st-09', name: '성수역 3번 출구 카페거리', address: '서울 성동구 아차산로 100', lat: 37.5445, lng: 127.0560, availableBikes: 4, availableScooters: 6 },
  { id: 'st-10', name: '여의도역 5번 출구 IFC몰 앞', address: '서울 영등포구 여의나루로 42', lat: 37.5218, lng: 126.9242, availableBikes: 6, availableScooters: 5 }
];

// 차량 (Vehicles) Mock Data (ID is integer numbers: 102, 118, 205...)
const vehicles = [
  {
    id: 102, // numeric ID
    code: 'BK-102',
    name: 'RideOn Bike 102',
    type: 'bike',
    typeName: '전기자전거',
    battery: 92,
    estimatedRangeKm: 38,
    stationId: 'st-01',
    stationName: '강남역 11번 출구 스테이션',
    distanceMeters: 120,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-28',
    brakesCondition: '우수',
    tiresCondition: '양호',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    description: '고출력 350W 허브모터와 내장 3단 기어로 언덕길도 부드럽게 주행 가능합니다.'
  },
  {
    id: 118, // numeric ID
    code: 'BK-118',
    name: 'RideOn Bike 118',
    type: 'bike',
    typeName: '전기자전거',
    battery: 84,
    estimatedRangeKm: 32,
    stationId: 'st-02',
    stationName: '역삼역 포스코타워 앞',
    distanceMeters: 280,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-27',
    brakesCondition: '우수',
    tiresCondition: '우수',
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
    description: '충격 흡수 프론트 서스펜션과 넉넉한 바구니가 장착된 도심형 전기자전거.'
  },
  {
    id: 205, // numeric ID
    code: 'BK-205',
    name: 'RideOn Bike 205',
    type: 'bike',
    typeName: '전기자전거',
    battery: 45,
    estimatedRangeKm: 18,
    stationId: 'st-03',
    stationName: '선릉역 1번 출구 광장',
    distanceMeters: 450,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-25',
    brakesCondition: '양호',
    tiresCondition: '양호',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
    description: '가벼운 알루미늄 프레임과 직관적인 스마트 디스플레이 탑재.'
  },
  {
    id: 220,
    code: 'BK-220',
    name: 'RideOn Bike 220',
    type: 'bike',
    typeName: '전기자전거',
    battery: 98,
    estimatedRangeKm: 42,
    stationId: 'st-04',
    stationName: '삼성역 코엑스 동문',
    distanceMeters: 560,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-29',
    brakesCondition: '우수',
    tiresCondition: '우수',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    description: '최신형 대용량 배터리 장착으로 장거리 라이딩에 최적화된 신형 자전거.'
  },
  {
    id: 241,
    code: 'BK-241',
    name: 'RideOn Bike 241',
    type: 'bike',
    typeName: '전기자전거',
    battery: 15,
    estimatedRangeKm: 5,
    stationId: 'st-05',
    stationName: '신논현역 교보타워 사거리',
    distanceMeters: 620,
    status: 'charging',
    statusText: '충전 필요',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-26',
    brakesCondition: '양호',
    tiresCondition: '양호',
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
    description: '배터리 잔량이 부족하여 현재 충전 대기 중인 상태입니다.'
  },
  {
    id: 301, // numeric ID
    code: 'SC-301',
    name: 'RideOn Scooter 301',
    type: 'scooter',
    typeName: '전동킥보드',
    battery: 95,
    estimatedRangeKm: 28,
    stationId: 'st-01',
    stationName: '강남역 11번 출구 스테이션',
    distanceMeters: 80,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 600,
    perMinuteFare: 180,
    lastInspected: '2026-09-29',
    brakesCondition: '우수 (전자식+드럼)',
    tiresCondition: '10인치 튜브리스 우수',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: '10인치 광폭 타이어와 듀얼 브레이크 시스템으로 탁월한 안정성 제공.'
  },
  {
    id: 317, // numeric ID
    code: 'SC-317',
    name: 'RideOn Scooter 317',
    type: 'scooter',
    typeName: '전동킥보드',
    battery: 78,
    estimatedRangeKm: 22,
    stationId: 'st-02',
    stationName: '역삼역 포스코타워 앞',
    distanceMeters: 210,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 600,
    perMinuteFare: 180,
    lastInspected: '2026-09-28',
    brakesCondition: '우수',
    tiresCondition: '양호',
    image: 'https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95?auto=format&fit=crop&w=600&q=80',
    description: '야간 주행을 위한 고휘도 LED 라이트와 턴 시그널(방향지시등) 탑재.'
  },
  {
    id: 325,
    code: 'SC-325',
    name: 'RideOn Scooter 325',
    type: 'scooter',
    typeName: '전동킥보드',
    battery: 62,
    estimatedRangeKm: 17,
    stationId: 'st-03',
    stationName: '선릉역 1번 출구 광장',
    distanceMeters: 380,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 600,
    perMinuteFare: 180,
    lastInspected: '2026-09-27',
    brakesCondition: '우수',
    tiresCondition: '양호',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: '도심 속 빠른 이동을 위한 최신 에어로다이내믹 설계 킥보드.'
  },
  {
    id: 412, // numeric ID
    code: 'SC-412',
    name: 'RideOn Scooter 412',
    type: 'scooter',
    typeName: '전동킥보드',
    battery: 88,
    estimatedRangeKm: 25,
    stationId: 'st-04',
    stationName: '삼성역 코엑스 동문',
    distanceMeters: 490,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 600,
    perMinuteFare: 180,
    lastInspected: '2026-09-29',
    brakesCondition: '우수',
    tiresCondition: '우수',
    image: 'https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95?auto=format&fit=crop&w=600&q=80',
    description: '미끄럼 방지 실리콘 발판과 서스펜션으로 편안한 승차감.'
  },
  {
    id: 428,
    code: 'SC-428',
    name: 'RideOn Scooter 428',
    type: 'scooter',
    typeName: '전동킥보드',
    battery: 18,
    estimatedRangeKm: 4,
    stationId: 'st-06',
    stationName: '양재역 서초문화예술회관',
    distanceMeters: 750,
    status: 'charging',
    statusText: '충전 필요',
    baseFare: 600,
    perMinuteFare: 180,
    lastInspected: '2026-09-26',
    brakesCondition: '양호',
    tiresCondition: '양호',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: '배터리 부족으로 대여가 일시 중지된 기기입니다.'
  },
  {
    id: 501,
    code: 'BK-501',
    name: 'RideOn Bike 501',
    type: 'bike',
    typeName: '전기자전거',
    battery: 91,
    estimatedRangeKm: 36,
    stationId: 'st-07',
    stationName: '잠실역 롯데월드몰 광장',
    distanceMeters: 310,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-28',
    brakesCondition: '우수',
    tiresCondition: '우수',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    description: '석촌호수 및 한강 자전거 도로 주행에 최적화된 고급 파워 어시스트 모델.'
  },
  {
    id: 512,
    code: 'SC-512',
    name: 'RideOn Scooter 512',
    type: 'scooter',
    typeName: '전동킥보드',
    battery: 82,
    estimatedRangeKm: 24,
    stationId: 'st-07',
    stationName: '잠실역 롯데월드몰 광장',
    distanceMeters: 350,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 600,
    perMinuteFare: 180,
    lastInspected: '2026-09-29',
    brakesCondition: '우수',
    tiresCondition: '우수',
    image: 'https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95?auto=format&fit=crop&w=600&q=80',
    description: '경쾌한 가속력과 전자식 ABS 제동 시스템 탑재.'
  },
  {
    id: 604,
    code: 'BK-604',
    name: 'RideOn Bike 604',
    type: 'bike',
    typeName: '전기자전거',
    battery: 76,
    estimatedRangeKm: 30,
    stationId: 'st-08',
    stationName: '판교역 알파돔시티 정류장',
    distanceMeters: 190,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-27',
    brakesCondition: '우수',
    tiresCondition: '우수',
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
    description: '판교 테크노밸리 출퇴근용으로 인기 있는 장거리용 전기자전거.'
  },
  {
    id: 619,
    code: 'SC-619',
    name: 'RideOn Scooter 619',
    type: 'scooter',
    typeName: '전동킥보드',
    battery: 89,
    estimatedRangeKm: 26,
    stationId: 'st-09',
    stationName: '성수역 3번 출구 카페거리',
    distanceMeters: 240,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 600,
    perMinuteFare: 180,
    lastInspected: '2026-09-29',
    brakesCondition: '우수',
    tiresCondition: '우수',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: '트렌디한 올블랙 디자인과 스마트폰 거치대 일체형 핸들바.'
  },
  {
    id: 702,
    code: 'BK-702',
    name: 'RideOn Bike 702',
    type: 'bike',
    typeName: '전기자전거',
    battery: 87,
    estimatedRangeKm: 34,
    stationId: 'st-10',
    stationName: '여의도역 5번 출구 IFC몰 앞',
    distanceMeters: 160,
    status: 'available',
    statusText: '이용 가능',
    baseFare: 800,
    perMinuteFare: 150,
    lastInspected: '2026-09-28',
    brakesCondition: '우수',
    tiresCondition: '양호',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    description: '여의도 한강공원 순환 라이딩에 안성맞춤인 부드러운 승차감.'
  }
];

// 대여 (Rentals) Mock Data (진행 중 / 완료 / 취소 혼합)
let rentals = [
  {
    id: 'rt-101',
    rentalNumber: 'RO-20260930-101',
    vehicleId: 102,
    vehicleCode: 'BK-102',
    vehicleName: 'RideOn Bike 102',
    vehicleType: 'bike',
    startTime: '2026-09-30 14:15:00',
    endTime: null, // Still in progress
    durationMinutes: 18,
    distanceKm: 2.8,
    status: 'active',
    statusText: '이용 중',
    startStation: '강남역 11번 출구 스테이션',
    endStation: null,
    baseFare: 800,
    perMinuteFare: 150,
    calculatedFare: 3500,
    paymentMethod: 'RideOn 페이'
  },
  {
    id: 'rt-102',
    rentalNumber: 'RO-20260929-204',
    vehicleId: 301,
    vehicleCode: 'SC-301',
    vehicleName: 'RideOn Scooter 301',
    vehicleType: 'scooter',
    startTime: '2026-09-29 18:30:00',
    endTime: '2026-09-29 18:44:00',
    durationMinutes: 14,
    distanceKm: 2.1,
    status: 'completed',
    statusText: '이용 완료',
    startStation: '역삼역 포스코타워 앞',
    endStation: '선릉역 1번 출구 광장',
    baseFare: 600,
    perMinuteFare: 180,
    calculatedFare: 3120,
    paymentMethod: '카카오페이'
  },
  {
    id: 'rt-103', // Has missing endTime in a specific ride calculation
    rentalNumber: 'RO-20260928-309',
    vehicleId: 118,
    vehicleCode: 'BK-118',
    vehicleName: 'RideOn Bike 118',
    vehicleType: 'bike',
    startTime: '2026-09-28 09:10:00',
    endTime: undefined, // undefined endTime for SEC-462
    durationMinutes: null,
    distanceKm: 3.4,
    status: 'completed',
    statusText: '이용 완료',
    startStation: '선릉역 1번 출구 광장',
    endStation: '삼성역 코엑스 동문',
    baseFare: 800,
    perMinuteFare: 150,
    calculatedFare: null,
    paymentMethod: '신용카드'
  }
];

// 이용 기록 (Ride History) Mock Data (Includes single-digit dates for SEC-464)
const rawRideHistories = [
  {
    id: 'rh-01',
    rentalNumber: 'RO-20260930-101',
    vehicleName: 'RideOn Bike 102 (전기자전거)',
    dateRaw: new Date(2026, 8, 30), // 2026-09-30
    startTime: '14:15',
    endTime: '-',
    duration: '18분 (이용 중)',
    distance: '2.8 km',
    amount: 3500,
    status: '이용 중',
    startStation: '강남역 11번 출구',
    endStation: '이용 중'
  },
  {
    id: 'rh-02',
    rentalNumber: 'RO-20260929-204',
    vehicleName: 'RideOn Scooter 301 (전동킥보드)',
    dateRaw: new Date(2026, 8, 29), // 2026-09-29
    startTime: '18:30',
    endTime: '18:44',
    duration: '14분',
    distance: '2.1 km',
    amount: 3120,
    status: '이용 완료',
    startStation: '역삼역 포스코타워 앞',
    endStation: '선릉역 1번 출구 광장'
  },
  {
    id: 'rh-03',
    rentalNumber: 'RO-20260928-309',
    vehicleName: 'RideOn Bike 118 (전기자전거)',
    dateRaw: new Date(2026, 8, 28), // 2026-09-28
    startTime: '09:10',
    endTime: '09:32',
    duration: '22분',
    distance: '3.4 km',
    amount: 4100,
    status: '이용 완료',
    startStation: '선릉역 1번 출구',
    endStation: '삼성역 코엑스 동문'
  },
  {
    id: 'rh-04',
    rentalNumber: 'RO-20260908-412',
    vehicleName: 'RideOn Scooter 412 (전동킥보드)',
    dateRaw: new Date(2026, 8, 8), // 2026-09-08 -> formatting token mismatch produces 2026-9-8
    startTime: '20:05',
    endTime: '20:17',
    duration: '12분',
    distance: '1.9 km',
    amount: 2760,
    status: '이용 완료',
    startStation: '삼성역 코엑스 동문',
    endStation: '선릉역 광장'
  },
  {
    id: 'rh-05',
    rentalNumber: 'RO-20260901-501',
    vehicleName: 'RideOn Bike 501 (전기자전거)',
    dateRaw: new Date(2026, 8, 1), // 2026-09-01 -> formatting token mismatch produces 2026-9-1
    startTime: '11:20',
    endTime: '11:55',
    duration: '35분',
    distance: '5.2 km',
    amount: 6050,
    status: '이용 완료',
    startStation: '잠실역 롯데월드몰',
    endStation: '올림픽공원 입구'
  },
  {
    id: 'rh-06',
    rentalNumber: 'RO-20260824-602',
    vehicleName: 'RideOn Scooter 317 (전동킥보드)',
    dateRaw: new Date(2026, 7, 24), // 2026-08-24
    startTime: '17:40',
    endTime: '17:51',
    duration: '11분',
    distance: '1.5 km',
    amount: 2580,
    status: '이용 완료',
    startStation: '신논현역 교보타워',
    endStation: '강남역 11번 출구'
  },
  {
    id: 'rh-07',
    rentalNumber: 'RO-20260815-703',
    vehicleName: 'RideOn Bike 205 (전기자전거)',
    dateRaw: new Date(2026, 7, 15), // 2026-08-15
    startTime: '15:10',
    endTime: '15:30',
    duration: '20분',
    distance: '3.0 km',
    amount: 3800,
    status: '이용 완료',
    startStation: '양재역 문화예술회관',
    endStation: '매봉역 사거리'
  },
  {
    id: 'rh-08',
    rentalNumber: 'RO-20260805-804',
    vehicleName: 'RideOn Scooter 325 (전동킥보드)',
    dateRaw: new Date(2026, 7, 5), // 2026-08-05 -> formatting token mismatch produces 2026-8-5
    startTime: '13:00',
    endTime: '13:08',
    duration: '8분',
    distance: '1.2 km',
    amount: 2040,
    status: '이용 완료',
    startStation: '판교역 알파돔시티',
    endStation: '판교 테크노밸리'
  }
];

// 계정 Mock Data
let userAccount = {
  id: 'usr-001',
  name: '김라이더',
  email: 'rider.kim@rideon.city',
  phone: '010-9876-5432',
  membership: 'RideOn 그린 패스 멤버',
  creditBalance: 24500,
  totalRides: 42,
  totalDistanceKm: 118.5,
  carbonSavedKg: 16.2,
  paymentCard: '현대카드 (끝자리 7821)',
  autoPayment: true,
  helmetSafetyVerified: true,
  favoriteStations: ['st-01', 'st-02', 'st-07']
};

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RideOn', timestamp: new Date().toISOString() });
});

// 2. 차량 목록 조회
app.get('/api/vehicles', (req, res) => {
  const { type, batteryMin, status, sort } = req.query;
  let results = [...vehicles];

  if (type && type !== 'all') {
    results = results.filter(v => v.type === type);
  }

  if (batteryMin) {
    results = results.filter(v => v.battery >= Number(batteryMin));
  }

  if (status && status !== 'all') {
    results = results.filter(v => v.status === status);
  }

  if (sort === 'distance') {
    results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  } else if (sort === 'battery') {
    results.sort((a, b) => b.battery - a.battery);
  }

  res.json({
    success: true,
    total: results.length,
    vehicles: results
  });
});

// 3. 차량 상세 조회
// INTENTIONAL BACKEND BUG: site057-SEC-461
// 숫자형 ID를 문자열 ID와 잘못 strict comparison (===) 하는 오류:
// Mock Data의 vehicle.id는 Number(102, 118, 205 등)이지만 req.params.id는 String("102")이므로
// v.id === req.params.id 비교가 항상 false가 되어 차량이 존재함에도 404를 반환함.
app.get('/api/vehicles/:id', (req, res) => {
  // INTENTIONAL BACKEND BUG: site057-SEC-461
  const vehicle = vehicles.find(v => v.id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: '차량을 찾을 수 없습니다.' });
  }

  res.json({
    success: true,
    vehicle
  });
});

// 4. 스테이션 목록
app.get('/api/stations', (req, res) => {
  res.json({
    success: true,
    stations
  });
});

// 5. 스테이션 상세
app.get('/api/stations/:id', (req, res) => {
  const station = stations.find(s => s.id === req.params.id);
  if (!station) {
    return res.status(404).json({ success: false, message: '스테이션을 찾을 수 없습니다.' });
  }
  const stationVehicles = vehicles.filter(v => v.stationId === station.id);
  res.json({
    success: true,
    station,
    vehicles: stationVehicles
  });
});

// 6. 차량 대여 가능 여부 확인
app.get('/api/vehicles/:id/availability', (req, res) => {
  const vehicleId = Number(req.params.id);
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: '차량을 찾을 수 없습니다.' });
  }

  res.json({
    success: true,
    vehicleId: vehicle.id,
    available: vehicle.status === 'available',
    status: vehicle.status,
    battery: vehicle.battery
  });
});

// 7. 대여 목록 조회
app.get('/api/rentals', (req, res) => {
  res.json({
    success: true,
    rentals
  });
});

// 8. 대여 상세 조회
app.get('/api/rentals/:id', (req, res) => {
  const rental = rentals.find(r => r.id === req.params.id);
  if (!rental) {
    return res.status(404).json({ success: false, message: '대여 내역을 찾을 수 없습니다.' });
  }
  res.json({
    success: true,
    rental
  });
});

// 9. 대여 요금 계산
// INTENTIONAL BACKEND BUG: site057-SEC-462
// NaN이 요금 계산 결과에 전파되는 오류:
// endTime이 없는 rental 데이터(예: rt-103)에 대해 유효성 검사 없이 Date 변환 및 산술 연산을 수행하여
// duration = NaN, totalFare = NaN이 되고, 클라이언트로 NaN 요금 계산 결과가 전파됨.
app.get('/api/rentals/:id/fare', (req, res) => {
  const rental = rentals.find(r => r.id === req.params.id);
  if (!rental) {
    return res.status(404).json({ success: false, message: '대여 내역을 찾을 수 없습니다.' });
  }

  // INTENTIONAL BACKEND BUG: site057-SEC-462
  // When rental.endTime is missing/undefined, new Date(rental.endTime).getTime() yields NaN.
  const startMs = new Date(rental.startTime).getTime();
  const endMs = new Date(rental.endTime).getTime();
  const durationMinutes = Math.ceil((endMs - startMs) / (1000 * 60));
  const totalFare = rental.baseFare + (durationMinutes * rental.perMinuteFare);

  res.json({
    success: true,
    rentalId: rental.id,
    durationMinutes: isNaN(durationMinutes) ? null : durationMinutes,
    baseFare: rental.baseFare,
    perMinuteFare: rental.perMinuteFare,
    totalFare: isNaN(totalFare) ? null : totalFare,
    rawDuration: isNaN(durationMinutes) ? 'NaN' : durationMinutes,
    rawTotalFare: isNaN(totalFare) ? 'NaN' : totalFare
  });
});

// 10. 신규 대여 생성
app.post('/api/rentals', (req, res) => {
  const { vehicleId } = req.body;
  const targetId = Number(vehicleId);
  const vehicle = vehicles.find(v => v.id === targetId);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: '대여할 차량을 찾을 수 없습니다.' });
  }

  const now = new Date();
  const newRental = {
    id: `rt-${Date.now()}`,
    rentalNumber: `RO-${now.toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100+Math.random()*900)}`,
    vehicleId: vehicle.id,
    vehicleCode: vehicle.code,
    vehicleName: vehicle.name,
    vehicleType: vehicle.type,
    startTime: now.toISOString().replace('T', ' ').slice(0, 19),
    endTime: null,
    durationMinutes: 0,
    distanceKm: 0,
    status: 'active',
    statusText: '이용 중',
    startStation: vehicle.stationName,
    endStation: null,
    baseFare: vehicle.baseFare,
    perMinuteFare: vehicle.perMinuteFare,
    calculatedFare: vehicle.baseFare,
    paymentMethod: 'RideOn 페이'
  };

  vehicle.status = 'in_use';
  vehicle.statusText = '이용 중';
  rentals.unshift(newRental);

  res.status(201).json({
    success: true,
    message: '대여가 성공적으로 시작되었습니다.',
    rental: newRental
  });
});

// 11. 대여 시작 (QR 잠금해제)
app.post('/api/rentals/:id/start', (req, res) => {
  const rental = rentals.find(r => r.id === req.params.id);
  if (!rental) {
    return res.status(404).json({ success: false, message: '대여 건을 찾을 수 없습니다.' });
  }
  rental.status = 'active';
  rental.statusText = '이용 중';
  res.json({ success: true, message: '잠금이 해제되었습니다. 안전하게 주행하세요.', rental });
});

// 12. 대여 종료 (반납)
app.post('/api/rentals/:id/finish', (req, res) => {
  const rental = rentals.find(r => r.id === req.params.id);
  if (!rental) {
    return res.status(404).json({ success: false, message: '대여 건을 찾을 수 없습니다.' });
  }

  const now = new Date();
  rental.endTime = now.toISOString().replace('T', ' ').slice(0, 19);
  rental.status = 'completed';
  rental.statusText = '이용 완료';
  rental.endStation = req.body.endStation || '역삼역 포스코타워 앞';

  const startMs = new Date(rental.startTime).getTime();
  const endMs = now.getTime();
  rental.durationMinutes = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60)));
  rental.distanceKm = Number((rental.durationMinutes * 0.18).toFixed(1));
  rental.calculatedFare = rental.baseFare + (rental.durationMinutes * rental.perMinuteFare);

  const vehicle = vehicles.find(v => v.id === rental.vehicleId);
  if (vehicle) {
    vehicle.status = 'available';
    vehicle.statusText = '이용 가능';
    vehicle.battery = Math.max(10, vehicle.battery - Math.floor(rental.durationMinutes * 0.5));
  }

  // Add to history
  rawRideHistories.unshift({
    id: `rh-${Date.now()}`,
    rentalNumber: rental.rentalNumber,
    vehicleName: `${rental.vehicleName} (${rental.vehicleType === 'bike' ? '전기자전거' : '전동킥보드'})`,
    dateRaw: now,
    startTime: rental.startTime.slice(11, 16),
    endTime: rental.endTime.slice(11, 16),
    duration: `${rental.durationMinutes}분`,
    distance: `${rental.distanceKm} km`,
    amount: rental.calculatedFare,
    status: '이용 완료',
    startStation: rental.startStation,
    endStation: rental.endStation
  });

  res.json({
    success: true,
    message: '반납이 정상적으로 완료되었습니다.',
    rental
  });
});

// 13. 이용 기록 조회
// INTENTIONAL BACKEND BUG: site057-SEC-464
// 날짜 포맷 YYYY-MM-DD와 locale 포맷을 잘못 혼합하는 오류:
// 월(month)과 일(date)에 대해 2자리 패딩(padStart) 없이 getMonth()+1, getDate()를 조합하여
// 2026-09-08이 2026-9-8로 표시되는 포맷팅 불일치 발생.
app.get('/api/rides/history', (req, res) => {
  // INTENTIONAL BACKEND BUG: site057-SEC-464
  const histories = rawRideHistories.map(item => {
    const d = item.dateRaw;
    // Bug: Concatenates single-digit month and day without padStart(2, '0')
    const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    return {
      id: item.id,
      rentalNumber: item.rentalNumber,
      vehicleName: item.vehicleName,
      date: formattedDate,
      startTime: item.startTime,
      endTime: item.endTime,
      duration: item.duration,
      distance: item.distance,
      amount: item.amount,
      status: item.status,
      startStation: item.startStation,
      endStation: item.endStation
    };
  });

  res.json({
    success: true,
    total: histories.length,
    history: histories
  });
});

// 14. 계정 정보 조회 및 수정
app.get('/api/account', (req, res) => {
  res.json({
    success: true,
    account: userAccount
  });
});

app.patch('/api/account', (req, res) => {
  const { name, email, phone, autoPayment } = req.body;
  if (name) userAccount.name = name;
  if (email) userAccount.email = email;
  if (phone) userAccount.phone = phone;
  if (typeof autoPayment === 'boolean') userAccount.autoPayment = autoPayment;

  res.json({
    success: true,
    message: '계정 정보가 수정되었습니다.',
    account: userAccount
  });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('RideOn Mobility API Server is Running. Please build the frontend.');
  }
});

app.listen(PORT, () => {
  console.log(`[RideOn] site057 mobility server listening on http://localhost:${PORT}`);
});
