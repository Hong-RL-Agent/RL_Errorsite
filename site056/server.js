import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9955;

app.use(cors());
app.use(express.json());

// Serve static build in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Mock In-Memory Database
// ----------------------------------------------------

// 점검 센터 Mock Data
const centers = [
  {
    id: 'center-01',
    name: 'AutoCheck 강남센터',
    region: '서울 강남',
    address: '서울특별시 강남구 테헤란로 152',
    phone: '02-555-1234',
    operatingHours: '09:00 ~ 18:00 (일요일 휴무)',
    facilities: ['최신 리프트 6기', '3D 휠얼라인먼트', 'OBD-II 정밀진단기', '고객 전용 라운지'],
    services: ['기본 차량 점검', '사고 이력 정밀 진단', '엔진/미션 심층 점검', '하부 부식 점검', '전자장비 스캔'],
    availableSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    rating: 4.9,
    reviewCount: 342,
    image: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'center-02',
    name: 'AutoCheck 수원센터',
    region: '경기 수원',
    address: '경기도 수원시 권선구 권선로 308-5 (도이치오토월드점)',
    phone: '031-290-8800',
    operatingHours: '09:00 ~ 19:00 (연중무휴)',
    facilities: ['대형 리프트 10기', '실내 주행 테스트 트랙', '도막 두께 측정기', '커피 바'],
    services: ['종합 차량 진단', '침수차 판별 검사', '성능점검 재검증', '하부 점검', '전자장비 점검'],
    availableSlots: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30', '17:30'],
    rating: 4.8,
    reviewCount: 418,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'center-03',
    name: 'AutoCheck 분당센터',
    region: '경기 성남',
    address: '경기도 성남시 분당구 대왕판교로 712',
    phone: '031-789-3300',
    operatingHours: '09:00 ~ 18:30 (토/일 운영)',
    facilities: ['수입차 전용 스캐너', '초음파 누유 탐지기', '배터리 수명 분석기', '프라이빗 브리핑룸'],
    services: ['프리미엄 정밀 점검', '수입차 특화 점검', '전기차/하이브리드 배터리 점검', '사고 흔적 분석'],
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    rating: 4.9,
    reviewCount: 289,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'center-04',
    name: 'AutoCheck 인천센터',
    region: '인천 서구',
    address: '인천광역시 서구 염곡로 52 M파크',
    phone: '032-567-9911',
    operatingHours: '09:00 ~ 18:00 (일요일 휴무)',
    facilities: ['정밀 하체 촬영 시스템', '배기가스 분석기', '타이어 마모도 레이저 스캔', '상담실'],
    services: ['기본 차량 점검', '프레임 교정 여부 검사', '하체 부싱 점검', '소모품 잔여수명 분석'],
    availableSlots: ['09:00', '10:30', '13:00', '14:30', '16:00', '17:00'],
    rating: 4.7,
    reviewCount: 215,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'center-05',
    name: 'AutoCheck 일산센터',
    region: '경기 고양',
    address: '경기도 고양시 일산서구 경의로 834',
    phone: '031-923-4500',
    operatingHours: '09:30 ~ 18:30 (월~토)',
    facilities: ['열화상 카메라', '내시경 카메라', '브레이크 제동력 테스터', '대기 라운지'],
    services: ['종합 차량 진단', '엔진 블록 내시경 검사', '전장류 누전 점검', '사고 부위 도막 측정'],
    availableSlots: ['09:30', '11:00', '13:30', '15:00', '16:30', '17:30'],
    rating: 4.8,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'
  }
];

// 차량 Mock Data
// Unicode NFD (자모 분리형)로 저장된 특정 모델을 포함하여 SEC-460 구현
// "제네시스 G80"을 NFD decomposed unicode: "\u110C\u1166\u1102\u1166\u1109\u1175\u1109\u1173 G80"
const NFD_GENESIS = "제네시스 G80".normalize("NFD");
const NFD_GRANDEUR = "그랜저 GN7".normalize("NFD");

const vehicles = [
  {
    id: 'vh-01',
    brand: '현대',
    model: '그랜저 GN7 하이브리드 익스클루시브',
    searchKeywordModel: NFD_GRANDEUR, // SEC-460: stored as NFD
    year: 2023,
    mileage: 24500,
    price: 3850,
    fuel: '하이브리드',
    transmission: '오토',
    displacement: '1,598cc',
    color: '어비스 블랙 펄',
    region: '서울 강남',
    accidentHistory: '무사고 (단순 판금 0건)',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-15',
    inspectionGrade: 'A+',
    inspectionScore: 96,
    hasReport: true,
    reportId: 'rep-01',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',
    description: '1인 신조, 완전 무사고, 스마트 크루즈 컨트롤 및 헤드업 디스플레이 풀옵션 탑재.',
    options: ['파노라마 선루프', '어라운드 뷰', '헤드업 디스플레이', '스마트 크루즈', '통풍/열선 시트', '빌트인 캠 2'],
    insuranceRecord: '내차 피해 0건, 타차 가해 0건'
  },
  {
    id: 'vh-02',
    brand: '기아',
    model: 'K5 3세대 1.6 터보 시그니처',
    searchKeywordModel: 'K5',
    year: 2022,
    mileage: 41200,
    price: 2420,
    fuel: '가솔린',
    transmission: '오토',
    displacement: '1,598cc',
    color: '스노우 화이트 펄',
    region: '경기 수원',
    accidentHistory: '무사고 (단순 범퍼 교환 1회)',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-20',
    inspectionGrade: 'A',
    inspectionScore: 92,
    hasReport: true,
    reportId: 'rep-02',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=700&q=80',
    description: '젊은 감각의 스포티 세단. 고속도로 주행 위주로 엔진 컨디션 최상.',
    options: ['파노라마 선루프', '10.25인치 내비', '전자식 계기판', '드라이브 와이즈', '보스 사운드'],
    insuranceRecord: '내차 피해 1건 (단순 도색 범퍼 35만원)'
  },
  {
    id: 'vh-03',
    brand: '현대',
    model: '아반떼 (CN7) 1.6 가솔린 인스퍼레이션',
    searchKeywordModel: '아반떼 CN7',
    year: 2021,
    mileage: 38000,
    price: 1920,
    fuel: '가솔린',
    transmission: '오토',
    displacement: '1,598cc',
    color: '사이버 그레이 메탈릭',
    region: '경기 성남',
    accidentHistory: '완전 무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-18',
    inspectionGrade: 'A+',
    inspectionScore: 95,
    hasReport: true,
    reportId: 'rep-03',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=700&q=80',
    description: '인기 가성비 준중형 세단 최고 트림. 모든 편의/안전 옵션 포함.',
    options: ['고속도로 주행 보조', '후측방 충돌방지', '스마트폰 무선충전', '통풍시트', '엠비언트 라이트'],
    insuranceRecord: '내차 피해 0건, 타차 가해 0건'
  },
  {
    id: 'vh-04',
    brand: '제네시스',
    model: 'G80 (RG3) 2.5T AWD',
    searchKeywordModel: NFD_GENESIS, // SEC-460: stored as NFD
    year: 2022,
    mileage: 33000,
    price: 4950,
    fuel: '가솔린',
    transmission: '오토',
    displacement: '2,497cc',
    color: '우유니 화이트',
    region: '서울 강남',
    accidentHistory: '완전 무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-22',
    inspectionGrade: 'S',
    inspectionScore: 98,
    hasReport: true,
    reportId: 'rep-04',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=700&q=80',
    description: '럭셔리 비즈니스 프리미엄 세단. AWD 4륜구동 및 파퓰러 패키지 포함.',
    options: ['파퓰러 패키지', '헤드업 디스플레이', '서라운드 뷰', '나파가죽 시트', '렉시콘 사운드', '전자제어 서스펜션'],
    insuranceRecord: '내차 피해 0건, 타차 가해 0건'
  },
  {
    id: 'vh-05',
    brand: '기아',
    model: '쏘렌토 4세대 1.6 하이브리드 그래비티',
    searchKeywordModel: '쏘렌토 하이브리드',
    year: 2023,
    mileage: 28900,
    price: 4150,
    fuel: '하이브리드',
    transmission: '오토',
    displacement: '1,598cc',
    color: '미네랄 블루',
    region: '인천 서구',
    accidentHistory: '무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-10',
    inspectionGrade: 'A+',
    inspectionScore: 97,
    hasReport: true,
    reportId: 'rep-05',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80',
    description: '패밀리 SUV 최강자. 6인승 독립 시트 및 하이브리드의 압도적 연비.',
    options: ['6인승 시트', '파노라마 선루f', 'HUD', '스마트 파워테일게이트', '원격 스마트 주차보조'],
    insuranceRecord: '내차 피해 0건, 타차 가해 0건'
  },
  {
    id: 'vh-06',
    brand: '현대',
    model: '투싼 (NX4) 1.6 터보 하이브리드 인스퍼레이션',
    searchKeywordModel: '투싼 NX4',
    year: 2022,
    mileage: 36500,
    price: 3180,
    fuel: '하이브리드',
    transmission: '오토',
    displacement: '1,598cc',
    color: '아마존 그레이 메탈릭',
    region: '경기 고양',
    accidentHistory: '무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-25',
    inspectionGrade: 'A',
    inspectionScore: 93,
    hasReport: true,
    reportId: 'rep-06',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=700&q=80',
    description: '도심 및 캠핑에 완벽한 컴팩트 SUV. 정숙성과 공간 효율성 우수.',
    options: ['BOSE 프리미엄 사운드', '서라운드 뷰 모니터', '전자식 AWD', '빌트인 캠', '통풍시트'],
    insuranceRecord: '내차 피해 0건, 타차 가해 0건'
  },
  {
    id: 'vh-07',
    brand: '제네시스',
    model: 'GV70 2.5T 스포츠 패키지',
    searchKeywordModel: 'GV70',
    year: 2023,
    mileage: 19800,
    price: 5350,
    fuel: '가솔린',
    transmission: '오토',
    displacement: '2,497cc',
    color: '마테호른 화이트',
    region: '서울 강남',
    accidentHistory: '완전 무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-28',
    inspectionGrade: 'S',
    inspectionScore: 99,
    hasReport: false,
    reportId: null,
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=700&q=80',
    description: '스포티한 역동성과 고급스러운 실내. 스포츠 전용 전자식 차동제한장치(e-LSD) 장착.',
    options: ['스포츠 전용 인테리어', '21인치 다크 스퍼터링 휠', '렉시콘 사운드', '지능형 헤드램프'],
    insuranceRecord: '내차 피해 0건'
  },
  {
    id: 'vh-08',
    brand: '기아',
    model: '카니발 4세대 9인승 디젤 시그니처',
    searchKeywordModel: '카니발',
    year: 2021,
    mileage: 52000,
    price: 3350,
    fuel: '디젤',
    transmission: '오토',
    displacement: '2,151cc',
    color: '오로라 블랙 펄',
    region: '경기 수원',
    accidentHistory: '무사고 (도어 단순 도색 1회)',
    ownerChanges: 1,
    lastInspectionDate: '2026-08-30',
    inspectionGrade: 'B+',
    inspectionScore: 89,
    hasReport: false,
    reportId: null,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80',
    description: '가족 여행 및 비즈니스에 최적화된 대형 미니밴. 스마트 파워 슬라이딩 도어 탑재.',
    options: ['파워 슬라이딩 도어', '스마트 크루즈', '2열 통풍시트', '후석 엔터테인먼트', '듀얼 선루프'],
    insuranceRecord: '내차 피해 1건 (단순 칠까짐 도색 28만원)'
  },
  {
    id: 'vh-09',
    brand: '현대',
    model: '아이오닉 5 롱레인지 2WD 프레스티지',
    searchKeywordModel: '아이오닉 5',
    year: 2022,
    mileage: 31000,
    price: 3580,
    fuel: '전기',
    transmission: '오토',
    displacement: '전기모터',
    color: '디지털 틸-그린 펄',
    region: '경기 성남',
    accidentHistory: '완전 무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-12',
    inspectionGrade: 'A+',
    inspectionScore: 97,
    hasReport: false,
    reportId: null,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=700&q=80',
    description: '배터리 SOH(잔존수명) 99.4% 진단 완료. V2L 실내외 콘센트 및 증강현실 HUD.',
    options: ['비전루프', '디지털 사이드미러', 'V2L 커넥터', '증강현실 헤드업 디스플레이', '릴랙션 컴포트 시트'],
    insuranceRecord: '내차 피해 0건'
  },
  {
    id: 'vh-10',
    brand: '기아',
    model: 'EV6 롱레인지 4WD 어스',
    searchKeywordModel: 'EV6',
    year: 2023,
    mileage: 21500,
    price: 3950,
    fuel: '전기',
    transmission: '오토',
    displacement: '전기모터',
    color: '요트 블루',
    region: '인천 서구',
    accidentHistory: '완전 무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-19',
    inspectionGrade: 'S',
    inspectionScore: 98,
    hasReport: false,
    reportId: null,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=700&q=80',
    description: '듀얼모터 4WD의 폭발적인 가속력. 800V 초급속 충전 시스템 및 메리디안 사운드.',
    options: ['메리디안 프리미엄 사운드', '와이드 선루프', '지능형 헤드램프', '원격 스마트 주차', '서라운드 뷰'],
    insuranceRecord: '내차 피해 0건'
  },
  {
    id: 'vh-11',
    brand: 'BMW',
    model: '5시리즈 (G30) 520i M 스포츠',
    searchKeywordModel: 'BMW 520i',
    year: 2022,
    mileage: 39000,
    price: 4480,
    fuel: '가솔린',
    transmission: '오토',
    displacement: '1,998cc',
    color: '소피스토 그레이',
    region: '서울 강남',
    accidentHistory: '무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-24',
    inspectionGrade: 'A+',
    inspectionScore: 96,
    hasReport: false,
    reportId: null,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=700&q=80',
    description: 'BMW 공식 서비스센터 정기 관리 이력 완비. M 스포츠 패키지 외관 및 하만카돈 오디오.',
    options: ['M 스포츠 패키지', '하만카돈 오디오', '제스처 컨트롤', '컴포트 액세스', '드라이빙 어시스턴트 프로'],
    insuranceRecord: '내차 피해 0건'
  },
  {
    id: 'vh-12',
    brand: '벤츠',
    model: 'E-클래스 (W213) E250 아방가르드',
    searchKeywordModel: '벤츠 E250',
    year: 2021,
    mileage: 45000,
    price: 4720,
    fuel: '가솔린',
    transmission: '오토',
    displacement: '1,991cc',
    color: '옵시디언 블랙',
    region: '경기 고양',
    accidentHistory: '무사고',
    ownerChanges: 1,
    lastInspectionDate: '2026-09-14',
    inspectionGrade: 'A',
    inspectionScore: 94,
    hasReport: false,
    reportId: null,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=700&q=80',
    description: '베스트셀링 프리미엄 세단. 부메스터 서라운드 사운드 및 앰비언트 라이트 64색.',
    options: ['와이드스크린 콕핏', '부메스터 사운드', '드라이빙 어시스턴스 패키지', '파노라믹 선루프'],
    insuranceRecord: '내차 피해 0건'
  }
];

// 점검 리포트 Mock Data
const reports = [
  {
    id: 'rep-01',
    vehicleId: 'vh-01',
    vehicleName: '현대 그랜저 GN7 하이브리드 익스클루시브',
    vehicleNumber: '12가 3456',
    inspectionDate: '2026-09-15',
    inspector: '김진단 수석점검원 (자동차정비기능장)',
    centerName: 'AutoCheck 강남센터',
    overallScore: 96,
    overallGrade: 'A+',
    summary: '주요 골격 및 하체 프레임 손상 일체 없음. 하이브리드 고전압 배터리 상태 98.7% 우수. 엔진오일 및 브레이크 패드 잔여수명 85% 이상.',
    categories: [
      { name: '엔진/동력계통', score: 98, status: '양호', detail: '누유 및 미세누유 없음, 엔진 마운트 상태 양호, 공회전 RPM 안정적' },
      { name: '변속기/구동축', score: 97, status: '양호', detail: '변속 충격 없음, 등속조인트 부트 손상 없음, 미션오일 상태 적정' },
      { name: '제동장치 (브레이크)', score: 95, status: '양호', detail: '앞 패드 잔여 80%, 뒤 패드 잔여 85%, 디스크 로터 편마모 없음' },
      { name: '타이어/휠', score: 92, status: '양호', detail: '미쉐린 19인치 트레드 잔여 75%, 휠 미세 스크래치 1개소 외 양호' },
      { name: '하부/서스펜션', score: 96, status: '양호', detail: '하부 부식 0건, 로어암 및 스테빌라이저 링크 유격 없음' },
      { name: '전장/전자장비', score: 99, status: '양호', detail: '스마트 크루즈, HUD, 어라운드뷰 등 전자장비 센서 에러코드 0건' },
      { name: '외관/도막 두께', score: 93, status: '양호', detail: '도막 두께 평균 110~125μm (순정 수치 일치), 재도색 부위 없음' },
      { name: '사고 흔적/골격', score: 100, status: '양호', detail: '하우스, 필러, 사이드실 패널 용접 및 교환 흔적 없음' }
    ],
    recommendations: [
      { item: '에어컨 캐빈 필터', advice: '약 5,000km 주행 후 계절 환절기 교체 권장' },
      { item: '엔진오일 교환주기', advice: '다음 점검주기(30,000km) 도래 시 합성유 교체 권장' }
    ],
    documents: [
      { id: 'doc-01', filename: 'inspection_certificate_vh01.pdf', originalName: '차량정밀점검확인서.pdf', mimeType: 'application/pdf', size: 1048576, uploadDate: '2026-09-15' },
      { id: 'doc-02', filename: 'obd_scan_data.pdf', originalName: 'OBD2_진단데이터로그.pdf', mimeType: 'application/pdf', size: 524288, uploadDate: '2026-09-15' },
      { id: 'doc-03', filename: 'chassis_undercarriage.jpg', originalName: '하부점검고해상도사진.jpg', mimeType: 'image/jpeg', size: 2097152, uploadDate: '2026-09-15' }
    ]
  },
  {
    id: 'rep-02',
    vehicleId: 'vh-02',
    vehicleName: '기아 K5 3세대 1.6 터보 시그니처',
    vehicleNumber: '34나 7890',
    inspectionDate: '2026-09-20',
    inspector: '이정밀 선임진단사',
    centerName: 'AutoCheck 수원센터',
    overallScore: 92,
    overallGrade: 'A',
    summary: '프론트 범퍼 단순 탈부착 도색 이력 1건 확인(내부 지지대 무손상). 터보차저 및 인터쿨러 호스 체결 양호.',
    categories: [
      { name: '엔진/동력계통', score: 94, status: '양호', detail: '터보차저 부스트압 정상, 엔진오일 미세누유 없음' },
      { name: '변속기/구동축', score: 92, status: '양호', detail: '8단 자동변속기 체결감 우수, 변속 딜레이 없음' },
      { name: '제동장치 (브레이크)', score: 90, status: '확인 필요', detail: '앞 브레이크 패드 잔여 약 40%, 1만km 내 교체 권장' },
      { name: '타이어/휠', score: 88, status: '확인 필요', detail: '앞 타이어 트레드 50%, 뒤 타이어 70%' },
      { name: '하부/서스펜션', score: 93, status: '양호', detail: '하부 커버 손상 없음, 쇼크업소버 감쇠력 정상' },
      { name: '전장/전자장비', score: 95, status: '양호', detail: '10.25인치 UVO 내비게이션 및 드라이브와이즈 센서 정상' },
      { name: '외관/도막 두께', score: 89, status: '양호', detail: '앞 범퍼 도색(160μm), 휀더 및 보닛은 순정 도막 유지' },
      { name: '사고 흔적/골격', score: 98, status: '양호', detail: '주요 골격 부위 변형 없음' }
    ],
    recommendations: [
      { item: '앞 브레이크 패드', advice: '잔여량 40%로 향후 8,000~10,000km 주행 후 교체 권장' },
      { item: '앞/뒤 타이어 위치교환', advice: '편마모 예방을 위해 다음 엔진오일 교환 시 위치교환 권장' }
    ],
    documents: [
      { id: 'doc-04', filename: 'k5_inspection_report.pdf', originalName: 'K5_정밀진단결과표.pdf', mimeType: 'application/pdf', size: 1240000, uploadDate: '2026-09-20' },
      { id: 'doc-05', filename: 'front_bumper_paint.jpg', originalName: '범퍼도막측정사진.jpg', mimeType: 'image/jpeg', size: 1800000, uploadDate: '2026-09-20' }
    ]
  },
  {
    id: 'rep-03',
    vehicleId: 'vh-03',
    vehicleName: '현대 아반떼 (CN7) 1.6 가솔린 인스퍼레이션',
    vehicleNumber: '56다 1234',
    inspectionDate: '2026-09-18',
    inspector: '박성능 수석진단원',
    centerName: 'AutoCheck 분당센터',
    overallScore: 95,
    overallGrade: 'A+',
    summary: '완전 무사고 차량으로 외관 및 실내 컨디션 신차급 유지. 스마트스트림 IVT 변속기 반응 매우 부드러움.',
    categories: [
      { name: '엔진/동력계통', score: 96, status: '양호', detail: '스마트스트림 G1.6 엔진 잡음 없음, 벨트 장력 양호' },
      { name: '변속기/구동축', score: 96, status: '양호', detail: 'IVT 무단변속기 로직 정상 작동' },
      { name: '제동장치 (브레이크)', score: 94, status: '양호', detail: '앞/뒤 패드 75% 잔여, 브레이크 오일 수분도 1% 미만' },
      { name: '타이어/휠', score: 92, status: '양호', detail: '17인치 순정 휠 스크래치 없음, 트레드 잔여 70%' },
      { name: '하부/서스펜션', score: 95, status: '양호', detail: '하부 언더코팅 깔끔, 배기라인 녹 없음' },
      { name: '전장/전자장비', score: 97, status: '양호', detail: '전방 카메라 및 후측방 레이더 정상' },
      { name: '외관/도막 두께', score: 96, status: '양호', detail: '전 패널 순정 도막 두께 균일' },
      { name: '사고 흔적/골격', score: 100, status: '양호', detail: '볼트 체결 흔적 및 실링 상태 출고 당시 동일' }
    ],
    recommendations: [
      { item: '배터리 상태', advice: '현재 전압 12.6V로 양호하나 2년 경과 시점 전압 점검 권장' }
    ],
    documents: [
      { id: 'doc-06', filename: 'avante_inspection.pdf', originalName: '아반떼CN7_점검리포트.pdf', mimeType: 'application/pdf', size: 980000, uploadDate: '2026-09-18' }
    ]
  },
  {
    id: 'rep-04',
    vehicleId: 'vh-04',
    vehicleName: '제네시스 G80 (RG3) 2.5T AWD',
    vehicleNumber: '78라 5678',
    inspectionDate: '2026-09-22',
    inspector: '최명품 프리미엄진단마스터',
    centerName: 'AutoCheck 강남센터',
    overallScore: 98,
    overallGrade: 'S',
    summary: '프리미엄 세단답게 완벽한 관리 상태. AWD 디퍼렌셜 오일 및 감쇠력 조절식 전자 서스펜션 완벽 작동.',
    categories: [
      { name: '엔진/동력계통', score: 99, status: '양호', detail: '세타3 2.5T 엔진 진동 0.02G 이하로 극히 정숙' },
      { name: '변속기/구동축', score: 98, status: '양호', detail: '8단 자동변속기 및 AWD 구동축 유격 없음' },
      { name: '제동장치 (브레이크)', score: 97, status: '양호', detail: '모노블럭 4P 브레이크 시스템 잔여 85%' },
      { name: '타이어/휠', score: 96, status: '양호', detail: '컨티넨탈 타이어 트레드 80% 이상' },
      { name: '하부/서스펜션', score: 99, status: '양호', detail: '알루미늄 멀티링크 하체 부품 완벽' },
      { name: '전장/전자장비', score: 99, status: '양호', detail: '렉시콘 18스피커, HUD, 서라운드뷰 정상' },
      { name: '외관/도막 두께', score: 98, status: '양호', detail: '무도색 무판금 올 순정' },
      { name: '사고 흔적/골격', score: 100, status: '양호', detail: '완전 무사고 신차급 골격' }
    ],
    recommendations: [
      { item: '엔진오일', advice: '제네시스 프리케어 무상 서비스 쿠폰 잔여 1회 확인' }
    ],
    documents: [
      { id: 'doc-07', filename: 'genesis_g80_master_check.pdf', originalName: '제네시스G80_마스터진단서.pdf', mimeType: 'application/pdf', size: 1540000, uploadDate: '2026-09-22' }
    ]
  },
  {
    id: 'rep-05',
    vehicleId: 'vh-05',
    vehicleName: '기아 쏘렌토 4세대 1.6 하이브리드 그래비티',
    vehicleNumber: '90마 9012',
    inspectionDate: '2026-09-10',
    inspector: '정안전 수석연구원',
    centerName: 'AutoCheck 인천센터',
    overallScore: 97,
    overallGrade: 'A+',
    summary: '패밀리 SUV로 사용되었으나 2/3열 시트 가죽 및 내장재 매우 청결. 하부 언더바디 긁힘 전무.',
    categories: [
      { name: '엔진/동력계통', score: 97, status: '양호', detail: '하이브리드 모터 변환 시 이음 없음' },
      { name: '변속기/구동축', score: 96, status: '양호', detail: '6단 자동변속기 부드러운 체결감' },
      { name: '제동장치 (브레이크)', score: 96, status: '양호', detail: '회생제동 시스템 및 기계식 브레이크 정상' },
      { name: '타이어/휠', score: 95, status: '양호', detail: '19인치 그래비티 휠 손상 없음, 잔여 75%' },
      { name: '하부/서스펜션', score: 98, status: '양호', detail: '하부 방청 코팅 상태 최상' },
      { name: '전장/전자장비', score: 98, status: '양호', detail: '파워테일게이트 및 스마트키 원격시동 정상' },
      { name: '외관/도막 두께', score: 96, status: '양호', detail: '광택 상태 양호, 도막 수치 정상' },
      { name: '사고 흔적/골격', score: 100, status: '양호', detail: '교환 및 판금 흔적 없음' }
    ],
    recommendations: [
      { item: '와이퍼 블레이드', advice: '겨울철 대비 전면 와이퍼 고무 블레이드 교체 권장' }
    ],
    documents: [
      { id: 'doc-08', filename: 'sorento_inspection_report.pdf', originalName: '쏘렌토HEV_정밀점검표.pdf', mimeType: 'application/pdf', size: 1120000, uploadDate: '2026-09-10' }
    ]
  },
  {
    id: 'rep-06',
    vehicleId: 'vh-06',
    vehicleName: '현대 투싼 (NX4) 1.6 터보 하이브리드 인스퍼레이션',
    vehicleNumber: '11바 2345',
    inspectionDate: '2026-09-25',
    inspector: '한기술 진단전문가',
    centerName: 'AutoCheck 일산센터',
    overallScore: 93,
    overallGrade: 'A',
    summary: '1인 소유 여성 비흡연 운전자 차량. 엔진룸 클리닝 상태 양호하며 하이브리드 인버터 쿨런트 수위 적정.',
    categories: [
      { name: '엔진/동력계통', score: 94, status: '양호', detail: '냉각수 누수 없음, 엔진 진동 정상' },
      { name: '변속기/구동축', score: 93, status: '양호', detail: '변속 충격 및 웅거림 없음' },
      { name: '제동장치 (브레이크)', score: 92, status: '양호', detail: '브레이크 패드 앞 70%, 뒤 75%' },
      { name: '타이어/휠', score: 91, status: '양호', detail: '타이어 공기압 센서(TPMS) 정상, 잔여 70%' },
      { name: '하부/서스펜션', score: 94, status: '양호', detail: '로어암 부싱 탄성 양호' },
      { name: '전장/전자장비', score: 95, status: '양호', detail: '터치식 공조기 및 인포테인먼트 정상 작동' },
      { name: '외관/도막 두께', score: 92, status: '양호', detail: '운전석 도어 미세 문콕 1개소 외 도막 균일' },
      { name: '사고 흔적/골격', score: 99, status: '양호', detail: '주요 뼈대 무손상' }
    ],
    recommendations: [
      { item: '하이브리드 냉각수', advice: '절연성 전용 냉각수 레벨 정상 유지 중, 다음 정기점검 시 확인' }
    ],
    documents: [
      { id: 'doc-09', filename: 'tucson_inspection.pdf', originalName: '투싼NX4_정밀진단기록.pdf', mimeType: 'application/pdf', size: 1080000, uploadDate: '2026-09-25' }
    ]
  }
];

// 예약 Mock Data (예정, 완료, 취소 혼합)
let bookings = [
  {
    id: 'bk-1001',
    bookingNumber: 'AC-20260930-101',
    vehicleId: 'vh-01',
    vehicleName: '현대 그랜저 GN7 하이브리드 익스클루시브',
    centerId: 'center-01',
    centerName: 'AutoCheck 강남센터',
    centerAddress: '서울특별시 강남구 테헤란로 152',
    date: '2026-10-05',
    time: '14:00',
    serviceType: '종합 정밀 진단 (120개 항목)',
    customerName: '홍길동',
    phone: '010-1234-5678',
    status: '예정', // Upcoming
    price: 150000,
    paymentStatus: '현장결제',
    createdAt: '2026-09-28 11:30'
  },
  {
    id: 'bk-1002',
    bookingNumber: 'AC-20260925-204',
    vehicleId: 'vh-02',
    vehicleName: '기아 K5 3세대 1.6 터보 시그니처',
    centerId: 'center-02',
    centerName: 'AutoCheck 수원센터',
    centerAddress: '경기도 수원시 권선구 권선로 308-5',
    date: '2026-09-20',
    time: '10:30',
    serviceType: '사고 이력 및 하부 정밀 점검',
    customerName: '홍길동',
    phone: '010-1234-5678',
    status: '완료', // Completed
    reportId: 'rep-02',
    price: 120000,
    paymentStatus: '결제완료',
    createdAt: '2026-09-18 16:20'
  },
  {
    id: 'bk-1003',
    bookingNumber: 'AC-20260915-309',
    vehicleId: 'vh-07',
    vehicleName: '제네시스 GV70 2.5T 스포츠 패키지',
    centerId: 'center-03',
    centerName: 'AutoCheck 분당센터',
    centerAddress: '경기도 성남시 분당구 대왕판교로 712',
    date: '2026-09-16',
    time: '15:00',
    serviceType: '수입/고급차 특화 정밀 점검',
    customerName: '홍길동',
    phone: '010-1234-5678',
    status: '취소', // Cancelled
    price: 180000,
    paymentStatus: '취소완료',
    createdAt: '2026-09-14 09:10'
  },
  {
    id: 'bk-1004',
    bookingNumber: 'AC-20261001-412',
    vehicleId: 'vh-04',
    vehicleName: '제네시스 G80 (RG3) 2.5T AWD',
    centerId: 'center-01',
    centerName: 'AutoCheck 강남센터',
    centerAddress: '서울특별시 강남구 테헤란로 152',
    date: '2026-10-08',
    time: '11:00',
    serviceType: '프리미엄 정밀 점검 & 배터리 진단',
    customerName: '홍길동',
    phone: '010-1234-5678',
    status: '예정', // Upcoming
    price: 160000,
    paymentStatus: '현장결제',
    createdAt: '2026-09-29 14:45'
  }
];

// 관심 차량 Mock List
let favorites = ['vh-01', 'vh-04', 'vh-05'];

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AutoCheck', timestamp: new Date().toISOString() });
});

// 차량 목록 조회 (검색, 필터)
app.get('/api/vehicles', (req, res) => {
  const { search, brand, model, region, priceMin, priceMax } = req.query;
  let results = [...vehicles];

  if (brand && brand !== '전체') {
    results = results.filter(v => v.brand === brand);
  }

  if (region && region !== '전체') {
    results = results.filter(v => v.region.includes(region));
  }

  if (priceMin) {
    results = results.filter(v => v.price >= Number(priceMin));
  }
  if (priceMax) {
    results = results.filter(v => v.price <= Number(priceMax));
  }

  // INTENTIONAL BACKEND BUG: site056-SEC-460
  // Unicode 정규화 차이로 인한 정확 검색 실패:
  // query에서 들어온 `model` 필터 문자열과 mock 데이터의 `searchKeywordModel` / `model` 문자열을 비교할 때,
  // UTF-8 NFC / NFD normalization을 일치시키지 않아 유저가 입력한 NFC 문자열이 NFD로 저장된 차량 모델과 일치하지 않아 검색 결과에서 누락됨.
  if (model) {
    const queryModel = String(model);
    results = results.filter(v => {
      // Intentionally does NOT normalize both strings to NFC.
      // v.searchKeywordModel has NFD for "그랜저 GN7" and "제네시스 G80"
      return v.model.includes(queryModel) || (v.searchKeywordModel && v.searchKeywordModel.includes(queryModel));
    });
  }

  if (search) {
    const query = String(search).toLowerCase();
    results = results.filter(v => 
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.region.toLowerCase().includes(query) ||
      v.fuel.toLowerCase().includes(query)
    );
  }

  res.json({
    success: true,
    total: results.length,
    vehicles: results
  });
});

// 차량 상세 조회
app.get('/api/vehicles/:id', (req, res) => {
  const vehicle = vehicles.find(v => v.id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: '차량 정보를 찾을 수 없습니다.' });
  }

  // 관련 리포트 및 센터 정보 매핑
  const report = vehicle.hasReport ? reports.find(r => r.id === vehicle.reportId) : null;
  res.json({
    success: true,
    vehicle,
    report
  });
});

// 점검 센터 목록
app.get('/api/centers', (req, res) => {
  res.json({
    success: true,
    centers
  });
});

// 점검 센터 상세
app.get('/api/centers/:id', (req, res) => {
  const center = centers.find(c => c.id === req.params.id);
  if (!center) {
    return res.status(404).json({ success: false, message: '점검 센터를 찾을 수 없습니다.' });
  }
  res.json({
    success: true,
    center
  });
});

// 센터별 예약 가능 시간 조회
app.get('/api/availability', (req, res) => {
  const { centerId, date } = req.query;
  const center = centers.find(c => c.id === centerId);
  if (!center) {
    return res.status(404).json({ success: false, message: '센터를 찾을 수 없습니다.' });
  }

  // 특정 시간대(10:00 또는 특정 날짜의 10:00) 예약 충돌 슬롯 마킹
  const slots = center.availableSlots.map(time => {
    // 10:00 슬롯은 마감된 상태로 모사
    const isBooked = (centerId === 'center-01' && time === '10:00') || (time === '09:00' && date === '2026-10-05');
    return {
      time,
      available: !isBooked,
      reason: isBooked ? '마감됨' : '예약가능'
    };
  });

  res.json({
    success: true,
    centerId,
    date,
    slots
  });
});

// 예약 목록 조회
app.get('/api/bookings', (req, res) => {
  res.json({
    success: true,
    bookings
  });
});

// 예약 상세 조회
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: '예약 내역을 찾을 수 없습니다.' });
  }
  res.json({
    success: true,
    booking
  });
});

// 예약 생성
app.post('/api/bookings', (req, res) => {
  const { vehicleId, centerId, date, time, customerName, phone, serviceType } = req.body;

  if (!vehicleId || !centerId || !date || !time || !customerName || !phone) {
    return res.status(400).json({ success: false, message: '필수 예약 정보가 누락되었습니다.' });
  }

  // INTENTIONAL BACKEND BUG: site056-SEC-459
  // 예약 실패 상황(특정 충돌 조건: 강남센터 center-01의 10:00 시간대 또는 이미 예약 마감된 슬롯 요청 시)에서
  // 서버가 400/409 에러 상태코드가 아닌 HTTP 200 OK를 반환하면서 body에만 success: false를 담음.
  // Frontend는 HTTP 200을 보고 성공 처리하지만 실제 DB에는 저장이 안 됨.
  if ((centerId === 'center-01' && time === '10:00') || (time === '09:00' && date === '2026-10-05')) {
    return res.status(200).json({
      success: false,
      message: '해당 시간은 이미 예약되었습니다. 다른 시간대를 선택해 주세요.'
    });
  }

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const center = centers.find(c => c.id === centerId);

  const newBooking = {
    id: `bk-${Date.now()}`,
    bookingNumber: `AC-${date.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    vehicleId,
    vehicleName: vehicle ? vehicle.model : '선택 차량',
    centerId,
    centerName: center ? center.name : 'AutoCheck 센터',
    centerAddress: center ? center.address : '',
    date,
    time,
    serviceType: serviceType || '기본 차량 정밀 점검',
    customerName,
    phone,
    status: '예정',
    price: 150000,
    paymentStatus: '현장결제',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  bookings.unshift(newBooking);

  res.status(201).json({
    success: true,
    message: '예약이 성공적으로 완료되었습니다.',
    booking: newBooking
  });
});

// 예약 취소
// INTENTIONAL BACKEND BUG: site056-SEC-456
// 예약 취소 성공 시 서버는 HTTP 204 No Content(바디 없음)를 반환하지만,
// 프론트엔드 API 클라이언트는 204 응답에 대해 response.json() 파싱을 시도하여 클라이언트 예외를 발생시킴.
app.delete('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: '취소할 예약을 찾을 수 없습니다.' });
  }

  // 실제 데이터 상태 변경 (취소 처리 또는 삭제)
  bookings[index].status = '취소';
  // Return HTTP 204 No Content with completely empty response body
  res.status(204).end();
});

// 점검 리포트 목록 조회
app.get('/api/reports', (req, res) => {
  res.json({
    success: true,
    reports
  });
});

// 점검 리포트 상세 조회
app.get('/api/reports/:id', (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: '점검 리포트를 찾을 수 없습니다.' });
  }
  res.json({
    success: true,
    report
  });
});

// 점검 리포트 관련 서류/사진 업로드
app.post('/api/reports/:reportId/documents', (req, res) => {
  const { reportId } = req.params;
  const { filename, mimeType, size } = req.body;

  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ success: false, message: '점검 리포트를 찾을 수 없습니다.' });
  }

  if (!filename) {
    return res.status(400).json({ success: false, message: '업로드할 파일명이 필요합니다.' });
  }

  // INTENTIONAL BACKEND BUG: site058 (site056-SEC-458)
  // 파일 확장자와 MIME Type 검증 불일치:
  // 파일의 확장자(.jpg, .jpeg, .png, .pdf)만 단순 정규식으로 검증하고 실제 요청의 mimeType은 검증하지 않음.
  // 따라서 파일명이 document.jpg이지만 mimeType이 application/pdf이거나, 반대로 실제 이미지인데 파일명 확장자가 다르면 오판됨.
  const extMatch = filename.match(/\.([0-9a-z]+)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];

  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({
      success: false,
      message: '지원하지 않는 파일 확장자입니다. (jpg, jpeg, png, pdf만 허용됩니다.)'
    });
  }

  const newDoc = {
    id: `doc-${Date.now()}`,
    filename,
    originalName: filename,
    mimeType: mimeType || 'application/octet-stream',
    size: size || 102400,
    uploadDate: new Date().toISOString().substring(0, 10)
  };

  if (!report.documents) {
    report.documents = [];
  }
  report.documents.push(newDoc);

  res.status(201).json({
    success: true,
    message: '문서가 정상적으로 등록되었습니다.',
    document: newDoc
  });
});

// 관심 차량 목록
app.get('/api/favorites', (req, res) => {
  const favVehicles = vehicles.filter(v => favorites.includes(v.id));
  res.json({
    success: true,
    favorites: favVehicles,
    favoriteIds: favorites
  });
});

// 관심 차량 추가
app.post('/api/favorites/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  if (!favorites.includes(vehicleId)) {
    favorites.push(vehicleId);
  }
  res.json({
    success: true,
    favoriteIds: favorites
  });
});

// 관심 차량 삭제
app.delete('/api/favorites/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  favorites = favorites.filter(id => id !== vehicleId);
  res.json({
    success: true,
    favoriteIds: favorites
  });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('AutoCheck API Server Running. Please build the frontend.');
  }
});

app.listen(PORT, () => {
  console.log(`[AutoCheck] site056 server listening on http://localhost:${PORT}`);
});
