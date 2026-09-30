import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9958;

app.use(cors());
app.use(express.json());

// In-Memory Mock Data
const departments = [
  { id: 'dept-1', code: 'internal', name: '내과', icon: 'Stethoscope', description: '소화기, 호흡기, 순환기 등 일반 성인 내과 질환' },
  { id: 'dept-2', code: 'orthopedic', name: '정형외과', icon: 'Activity', description: '관절, 척추, 인대, 골절 및 스포츠 손상' },
  { id: 'dept-3', code: 'dermatology', name: '피부과', icon: 'Sparkles', description: '여드름, 알레르기, 피부염 및 레이저 클리닉' },
  { id: 'dept-4', code: 'ent', name: '이비인후과', icon: 'Volume2', description: '비염, 축농증, 중이염, 어지럼증 및 음성' },
  { id: 'dept-5', code: 'ophthalmology', name: '안과', icon: 'Eye', description: '시력교정, 백내장, 안구건조증 및 망막질환' },
  { id: 'dept-6', code: 'dental', name: '치과', icon: 'Smile', description: '임플란트, 교정, 스케일링 및 충치 치료' },
  { id: 'dept-7', code: 'pediatrics', name: '소아청소년과', icon: 'Baby', description: '영유아 검진, 예방접종 및 성장 발달 클리닉' },
  { id: 'dept-8', code: 'neurology', name: '신경과', icon: 'Brain', description: '두통, 수면장애, 뇌졸중 및 치매 예방' }
];

const hospitals = [
  {
    id: 'hosp-101',
    name: '서울메디컬 종합의원',
    departments: ['internal', 'orthopedic', 'dermatology', 'ent'],
    departmentNames: ['내과', '정형외과', '피부과', '이비인후과'],
    address: '서울특별시 강남구 테헤란로 152 강남타워 3~5층',
    area: '강남구',
    phone: '02-555-1004',
    rating: 4.9,
    reviewCount: 342,
    operatingHours: '평일 09:00 - 19:00 | 토요일 09:00 - 14:00 (일요일 휴진)',
    doctorCount: 6,
    distanceMeters: 450,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    description: '대학병원급 첨단 영상 장비와 각 분야별 전문의 협진 시스템을 갖춘 도심형 종합 메디컬 클리닉입니다.'
  },
  {
    id: 'hosp-102',
    name: '연세바른 정형외과·통증의학과의원',
    departments: ['orthopedic', 'neurology'],
    departmentNames: ['정형외과', '신경과'],
    address: '서울특별시 서초구 서초대로 301 서초메디빌딩 2층',
    area: '서초구',
    phone: '02-588-7755',
    rating: 4.8,
    reviewCount: 218,
    operatingHours: '평일 09:00 - 20:00 (야간진료) | 토요일 09:00 - 15:00',
    doctorCount: 4,
    distanceMeters: 820,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    description: '비수술 척추 관절 치료 및 도수 치료 전문 센터를 운영합니다.'
  },
  {
    id: 'hosp-103',
    name: '맑은숲 피부과의원',
    departments: ['dermatology'],
    departmentNames: ['피부과'],
    address: '서울특별시 강남구 압구정로 140 현대빌딩 4층',
    area: '강남구',
    phone: '02-512-3301',
    rating: 4.95,
    reviewCount: 489,
    operatingHours: '평일 10:00 - 20:00 | 토요일 10:00 - 16:00',
    doctorCount: 3,
    distanceMeters: 1200,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    description: '피부과 전문의 3인 진료, 1:1 맞춤형 메디컬 스킨케어 및 안티에이징 센터.'
  },
  {
    id: 'hosp-104',
    name: '하나이비인후과 안심클리닉',
    departments: ['ent', 'pediatrics'],
    departmentNames: ['이비인후과', '소아청소년과'],
    address: '서울특별시 송파구 올림픽로 289 잠실시그마타워 3층',
    area: '송파구',
    phone: '02-414-9988',
    rating: 4.75,
    reviewCount: 167,
    operatingHours: '평일 08:30 - 18:30 | 토요일 08:30 - 13:00',
    doctorCount: 3,
    distanceMeters: 1600,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80',
    description: '호흡기 안심진료소 운영, 알레르기 비염 면역치료 및 수면다원검사.'
  },
  {
    id: 'hosp-105',
    name: '센트럴 밝은안과의원',
    departments: ['ophthalmology'],
    departmentNames: ['안과'],
    address: '서울특별시 강남구 봉은사로 402 센트럴메디타워 6층',
    area: '강남구',
    phone: '02-567-2020',
    rating: 4.9,
    reviewCount: 310,
    operatingHours: '평일 09:30 - 18:30 | 토요일 09:30 - 15:00',
    doctorCount: 4,
    distanceMeters: 950,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    description: '스마일라식, 노안 백내장 특화 안과 수술 전문 센터.'
  },
  {
    id: 'hosp-106',
    name: '미소드림치과의원',
    departments: ['dental'],
    departmentNames: ['치과'],
    address: '서울특별시 마포구 양화로 160 홍대입구역 에이스빌딩 5층',
    area: '마포구',
    phone: '02-333-8275',
    rating: 4.88,
    reviewCount: 275,
    operatingHours: '평일 10:00 - 21:00 (화/목 야간진료) | 토요일 10:00 - 16:00',
    doctorCount: 3,
    distanceMeters: 2400,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80',
    description: '무통 마취 시스템, 3D 디지털 구강 스캐너 구비 치아교정 및 임플란트.'
  },
  {
    id: 'hosp-107',
    name: '아이사랑 소아청소년과의원',
    departments: ['pediatrics', 'internal'],
    departmentNames: ['소아청소년과', '내과'],
    address: '서울특별시 성동구 왕십리로 222 한양빌딩 2층',
    area: '성동구',
    phone: '02-2290-5050',
    rating: 4.82,
    reviewCount: 198,
    operatingHours: '평일 08:30 - 19:30 | 토요일/공휴일 09:00 - 14:00',
    doctorCount: 3,
    distanceMeters: 1800,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    description: '아이들의 편안한 진료 환경 조성, 영유아 건강검진 및 알레르기 클리닉.'
  },
  {
    id: 'hosp-108',
    name: '세브란스플러스 신경과의원',
    departments: ['neurology', 'internal'],
    departmentNames: ['신경과', '내과'],
    address: '서울특별시 영등포구 여의대로 108 더현대 서울 인근 메디타워 4층',
    area: '영등포구',
    phone: '02-780-3366',
    rating: 4.79,
    reviewCount: 142,
    operatingHours: '평일 09:00 - 18:00 | 토요일 09:00 - 13:00',
    doctorCount: 2,
    distanceMeters: 3100,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    description: '만성 두통, 어지럼증, 수면 무호흡증 정밀 뇌파 검사 센터.'
  },
  {
    id: 'hosp-109',
    name: '강남연세 웰내과의원',
    departments: ['internal'],
    departmentNames: ['내과'],
    address: '서울특별시 강남구 역삼로 180 웰빙메디타워 3층',
    area: '강남구',
    phone: '02-556-9119',
    rating: 4.85,
    reviewCount: 230,
    operatingHours: '평일 08:00 - 18:30 | 토요일 08:00 - 13:30',
    doctorCount: 3,
    distanceMeters: 620,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    description: '5대 암 건강검진 지정 의료기관, 위/대장 당일 용종 절제술 전문.'
  },
  {
    id: 'hosp-110',
    name: '바른숨 이비인후과의원',
    departments: ['ent'],
    departmentNames: ['이비인후과'],
    address: '서울특별시 서초구 반포대로 287 래미안상가 3층',
    area: '서초구',
    phone: '02-595-1234',
    rating: 4.76,
    reviewCount: 112,
    operatingHours: '평일 09:00 - 19:00 | 토요일 09:00 - 14:00',
    doctorCount: 2,
    distanceMeters: 1450,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=600&q=80',
    description: '소아 및 성인 축농증/비염 내시경 정밀 검사 및 레이저 치료.'
  },
  {
    id: 'hosp-111',
    name: '더플러스 정형외과의원',
    departments: ['orthopedic'],
    departmentNames: ['정형외과'],
    address: '서울특별시 송파구 백제고분로 415 서진빌딩 2층',
    area: '송파구',
    phone: '02-422-8080',
    rating: 4.81,
    reviewCount: 178,
    operatingHours: '평일 09:00 - 19:30 | 토요일 09:00 - 14:30',
    doctorCount: 3,
    distanceMeters: 2100,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
    description: '체외충격파 치료, 관절 프롤로 주사 및 재활 물리치료 센터.'
  },
  {
    id: 'hosp-112',
    name: '연세스타 피부과의원',
    departments: ['dermatology'],
    departmentNames: ['피부과'],
    address: '서울특별시 서대문구 신촌로 109 신촌타워 5층',
    area: '서대문구',
    phone: '02-332-9922',
    rating: 4.92,
    reviewCount: 420,
    operatingHours: '평일 10:00 - 20:00 | 토요일 10:00 - 16:00',
    doctorCount: 4,
    distanceMeters: 3800,
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
    description: '난치성 흉터, 여드름 자국, 색소 질환 전문 레이저 센터.'
  }
];

const doctors = [
  {
    id: 'doc-201',
    name: '김서연 원장',
    hospitalId: 'hosp-101',
    hospitalName: '서울메디컬 종합의원',
    department: 'internal',
    departmentName: '내과',
    specialty: '소화기 질환, 위/대장 내시경, 만성 간질환, 고혈압/당뇨',
    experience: 14,
    rating: 4.95,
    reviewCount: 164,
    education: '서울대학교 의과대학 졸업 / 서울대병원 소화기내과 외래교수',
    schedule: '월/수/금 전일, 화/목/토 오전',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-202',
    name: '이준호 원장',
    hospitalId: 'hosp-101',
    hospitalName: '서울메디컬 종합의원',
    department: 'orthopedic',
    departmentName: '정형외과',
    specialty: '무릎 관절염, 어깨 회전근개 손상, 비수술 척추 도수치료',
    experience: 11,
    rating: 4.88,
    reviewCount: 98,
    education: '연세대학교 의과대학 졸업 / 신촌세브란스 관절경 전임의',
    schedule: '화/목/토 전일, 월/수/금 오후',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-203',
    name: '박민지 과장',
    hospitalId: 'hosp-101',
    hospitalName: '서울메디컬 종합의원',
    department: 'dermatology',
    departmentName: '피부과',
    specialty: '여드름/흉터 치료, 색소 레이저, 안티에이징 리프팅',
    experience: 7,
    rating: 4.92,
    reviewCount: 82,
    education: '고려대학교 의과대학 졸업 / 고대안암병원 피부과 전공의 수료',
    schedule: '월~금 전일, 토요일 격주 오전',
    image: 'https://images.unsplash.com/photo-1594824813590-78965a396265?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-204',
    name: '강현우 전임의',
    hospitalId: 'hosp-101',
    hospitalName: '서울메디컬 종합의원',
    department: 'internal',
    departmentName: '내과',
    specialty: '일반 내과 진료, 건강검진 상담, 감기/독감 클리닉',
    experience: 0, // 0 years experience (intern/first-year fellow) -> triggers SEC-471
    rating: 4.65,
    reviewCount: 19,
    education: '한양대학교 의과대학 졸업 / 서울메디컬 전임의',
    schedule: '월~금 오전/오후',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-205',
    name: '최원진 대표원장',
    hospitalId: 'hosp-102',
    hospitalName: '연세바른 정형외과·통증의학과의원',
    department: 'orthopedic',
    departmentName: '정형외과',
    specialty: '목/허리 디스크 비수술 신경차단술, 척추관협착증',
    experience: 18,
    rating: 4.96,
    reviewCount: 205,
    education: '연세대학교 의과대학 졸업 / 강남세브란스 척추센터 임상교수',
    schedule: '월~금 오전/오후 (화/목 야간진료)',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-206',
    name: '윤하은 원장',
    hospitalId: 'hosp-103',
    hospitalName: '맑은숲 피부과의원',
    department: 'dermatology',
    departmentName: '피부과',
    specialty: '기미/잡티 색소 질환, 리프팅, 알레르기 접촉피부염',
    experience: 12,
    rating: 4.94,
    reviewCount: 310,
    education: '서울대학교 의과대학 졸업 / 서울대병원 피부과 전문의',
    schedule: '월/화/목/금 10:00~19:30, 토 10:00~15:30',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-207',
    name: '정우성 원장',
    hospitalId: 'hosp-104',
    hospitalName: '하나이비인후과 안심클리닉',
    department: 'ent',
    departmentName: '이비인후과',
    specialty: '알레르기 비염, 축농증 내시경 수술, 코골이 및 수면무호흡',
    experience: 15,
    rating: 4.87,
    reviewCount: 145,
    education: '가톨릭대학교 의과대학 졸업 / 서울성모병원 이비인후과 외래교수',
    schedule: '월~금 08:30~18:30, 토 08:30~13:00',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-208',
    name: '한예슬 원장',
    hospitalId: 'hosp-105',
    hospitalName: '센트럴 밝은안과의원',
    department: 'ophthalmology',
    departmentName: '안과',
    specialty: '스마일라식/라섹, 안내렌즈삽입술, 건성안 특화 치료',
    experience: 9,
    rating: 4.91,
    reviewCount: 180,
    education: '성균관대학교 의과대학 졸업 / 삼성서울병원 안과 전문의',
    schedule: '월~금 09:30~18:30, 토 09:30~15:00',
    image: 'https://images.unsplash.com/photo-1594824813590-78965a396265?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-209',
    name: '조현철 대표원장',
    hospitalId: 'hosp-106',
    hospitalName: '미소드림치과의원',
    department: 'dental',
    departmentName: '치과',
    specialty: '네비게이션 디지털 임플란트, 투명 치아교정, 심미보철',
    experience: 16,
    rating: 4.89,
    reviewCount: 220,
    education: '서울대학교 치과대학 졸업 / 서울대 치과병원 보철과 수련',
    schedule: '월~금 10:00~19:00 (화/목 야간 ~21:00)',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-210',
    name: '송지우 원장',
    hospitalId: 'hosp-107',
    hospitalName: '아이사랑 소아청소년과의원',
    department: 'pediatrics',
    departmentName: '소아청소년과',
    specialty: '소아 호흡기/알레르기, 영유아 건강검진, 소아 감염',
    experience: 13,
    rating: 4.93,
    reviewCount: 176,
    education: '이화여자대학교 의과대학 졸업 / 이대목동병원 소아과 전문의',
    schedule: '월~금 08:30~19:30, 토/공휴 09:00~14:00',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-211',
    name: '오상진 원장',
    hospitalId: 'hosp-108',
    hospitalName: '세브란스플러스 신경과의원',
    department: 'neurology',
    departmentName: '신경과',
    specialty: '편두통/경추성 두통, 어지럼증, 수면다원검사 및 불면증',
    experience: 14,
    rating: 4.82,
    reviewCount: 95,
    education: '연세대학교 의과대학 졸업 / 신촌세브란스 신경과 외래교수',
    schedule: '월~금 09:00~18:00, 토 09:00~13:00',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-212',
    name: '배수진 진료부장',
    hospitalId: 'hosp-109',
    hospitalName: '강남연세 웰내과의원',
    department: 'internal',
    departmentName: '내과',
    specialty: '위/대장 내시경, 만성 소화불량, 역류성 식도염, 간질환',
    experience: 10,
    rating: 4.86,
    reviewCount: 114,
    education: '경희대학교 의과대학 졸업 / 강동경희대병원 소화기내과 전임의',
    schedule: '월~금 08:00~18:00, 토 08:00~13:00',
    image: 'https://images.unsplash.com/photo-1594824813590-78965a396265?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-213',
    name: '유태오 진료의',
    hospitalId: 'hosp-109',
    hospitalName: '강남연세 웰내과의원',
    department: 'internal',
    departmentName: '내과',
    specialty: '일반 내과 검진, 수액 치료, 예방접종 클리닉',
    experience: 0, // 0 years experience -> triggers SEC-471
    rating: 4.7,
    reviewCount: 22,
    education: '중앙대학교 의과대학 졸업 / 내과 전공의 수료',
    schedule: '월~금 전일',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-214',
    name: '서재형 원장',
    hospitalId: 'hosp-110',
    hospitalName: '바른숨 이비인후과의원',
    department: 'ent',
    departmentName: '이비인후과',
    specialty: '만성 비염 고주파 수술, 후두염, 중이염 및 이명 치료',
    experience: 8,
    rating: 4.79,
    reviewCount: 78,
    education: '순천향대학교 의과대학 졸업 / 순천향대병원 이비인후과 전문의',
    schedule: '월~금 09:00~19:00, 토 09:00~14:00',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-215',
    name: '신동엽 원장',
    hospitalId: 'hosp-111',
    hospitalName: '더플러스 정형외과의원',
    department: 'orthopedic',
    departmentName: '정형외과',
    specialty: '오십견, 테니스엘보, 족저근막염 체외충격파, 척추 통증',
    experience: 17,
    rating: 4.84,
    reviewCount: 130,
    education: '경북대학교 의과대학 졸업 / 서울아산병원 정형외과 외래교수',
    schedule: '월~금 09:00~19:30, 토 09:00~14:30',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-216',
    name: '문채원 원장',
    hospitalId: 'hosp-112',
    hospitalName: '연세스타 피부과의원',
    department: 'dermatology',
    departmentName: '피부과',
    specialty: '여드름 붉은자국, 모공/흉터 레이저, 써마지/울쎄라 리프팅',
    experience: 11,
    rating: 4.95,
    reviewCount: 280,
    education: '연세대학교 의과대학 졸업 / 신촌세브란스병원 피부과 전문의',
    schedule: '월/수/금 10:00~20:00, 토 10:00~16:00',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'
  }
];

let appointments = [
  {
    id: 'apt-301',
    bookingNumber: 'CB-20260930-101',
    hospitalId: 'hosp-101',
    hospitalName: '서울메디컬 종합의원',
    doctorId: 'doc-201',
    doctorName: '김서연 원장',
    department: 'internal',
    departmentName: '내과',
    date: '2026-10-02',
    time: '10:30',
    patientName: '이주이',
    patientPhone: '010-3849-1928',
    symptoms: '만성 소화불량 및 복부 팽만감 진료 상담',
    status: '예약 완료',
    createdAt: '2026-09-30T08:30:00Z'
  },
  {
    id: 'apt-302',
    bookingNumber: 'CB-20260928-088',
    hospitalId: 'hosp-103',
    hospitalName: '맑은숲 피부과의원',
    doctorId: 'doc-206',
    doctorName: '윤하은 원장',
    department: 'dermatology',
    departmentName: '피부과',
    date: '2026-10-05',
    time: '14:00',
    patientName: '이주이',
    patientPhone: '010-3849-1928',
    symptoms: '환절기 접촉성 피부염 및 가려움증',
    status: '예약 예정',
    createdAt: '2026-09-28T11:20:00Z'
  },
  {
    id: 'apt-303',
    bookingNumber: 'CB-20260922-045',
    hospitalId: 'hosp-105',
    hospitalName: '센트럴 밝은안과의원',
    doctorId: 'doc-208',
    doctorName: '한예슬 원장',
    department: 'ophthalmology',
    departmentName: '안과',
    date: '2026-09-23',
    time: '11:00',
    patientName: '이주이',
    patientPhone: '010-3849-1928',
    symptoms: '정기 시력검사 및 안구건조증 치료제 처방',
    status: '진료 완료',
    createdAt: '2026-09-20T09:15:00Z'
  },
  {
    id: 'apt-304',
    bookingNumber: 'CB-20260915-021',
    hospitalId: 'hosp-102',
    hospitalName: '연세바른 정형외과·통증의학과의원',
    doctorId: 'doc-205',
    doctorName: '최원진 대표원장',
    department: 'orthopedic',
    departmentName: '정형외과',
    date: '2026-09-16',
    time: '15:30',
    patientName: '이주이',
    patientPhone: '010-3849-1928',
    symptoms: '우측 발목 접질림 후 통증 및 부종',
    status: '진료 완료',
    createdAt: '2026-09-15T08:00:00Z'
  },
  {
    id: 'apt-305',
    bookingNumber: 'CB-20260910-009',
    hospitalId: 'hosp-106',
    hospitalName: '미소드림치과의원',
    doctorId: 'doc-209',
    doctorName: '조현철 대표원장',
    department: 'dental',
    departmentName: '치과',
    date: '2026-09-12',
    time: '16:00',
    patientName: '이주이',
    patientPhone: '010-3849-1928',
    symptoms: '정기 스케일링 및 우측 어금니 시림 증상',
    status: '취소',
    createdAt: '2026-09-09T14:40:00Z'
  }
];

const notices = [
  { id: 'not-1', title: '2026년 가을철 독감(인플루엔자) 국가예방접종 안내', date: '2026-09-25', category: '접종안내' },
  { id: 'not-2', title: 'CareBridge 진료 예약 시스템 비대면 안심 알림 서비스 도입', date: '2026-09-20', category: '서비스' },
  { id: 'not-3', title: '추석 연휴 기간 비상진료 병의원 및 당직 약국 안내', date: '2026-09-18', category: '운영안내' },
  { id: 'not-4', title: '신규 제휴 병원: 연세스타 피부과 및 세브란스플러스 신경과 오픈', date: '2026-09-15', category: '제휴안내' },
  { id: 'not-5', title: '모바일 진료 예약 취소 및 일정 변경 정책 변경 안내', date: '2026-09-10', category: '정책' },
  { id: 'not-6', title: '영유아 건강검진 예약 시 사전 문진표 작성 가이드', date: '2026-09-05', category: '안내' },
  { id: 'not-7', title: '의료기관 본인확인 의무화 제도(신분증 지참) 준수 안내', date: '2026-08-28', category: '의료법' },
  { id: 'not-8', title: '서초/강남권역 야간 진료 병의원 실시간 검색 기능 지원', date: '2026-08-20', category: '기능업데이트' }
];

// Available Time Slots
const standardTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CareBridge', timestamp: new Date().toISOString() });
});

// 2. Departments
app.get('/api/departments', (req, res) => {
  res.json({ departments });
});

// 3. Hospitals with SEC-474 Bug
app.get('/api/hospitals', (req, res) => {
  const { area, department, departments: deptParam, search } = req.query;
  let results = [...hospitals];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.departmentNames.some(dn => dn.toLowerCase().includes(q))
    );
  }

  if (area && area !== 'all') {
    results = results.filter(h => h.area === area);
  }

  if (department && department !== 'all') {
    results = results.filter(h => h.departments.includes(department));
  }

  // INTENTIONAL BACKEND BUG: site059-SEC-474
  // URL query parameter의 배열 직렬화 형식 불일치 오류:
  // 프론트엔드가 다중 진료과를 선택하여 ?departments=internal,orthopedic,dermatology (쉼표 구분 문자열)로 전송하지만,
  // 백엔드는 departments 파라미터가 이미 배열이거나 단일 진료과 코드와 일치할 것으로 가정하여
  // h.departments.includes(deptParam)를 직접 검사함.
  // 이로 인해 쉼표로 연결된 "internal,orthopedic" 전체가 단일 진료과 코드로 매칭 시도되어 일치하는 병원이 0개로 반환됨.
  if (deptParam) {
    if (Array.isArray(deptParam)) {
      results = results.filter(h => deptParam.some(d => h.departments.includes(d)));
    } else {
      // Buggy behavior: does not split comma string, attempts exact inclusion check with full string
      results = results.filter(h => h.departments.includes(deptParam));
    }
  }

  res.json({ hospitals: results });
});

app.get('/api/hospitals/:id', (req, res) => {
  const hospital = hospitals.find(h => h.id === req.params.id);
  if (!hospital) {
    return res.status(404).json({ error: '병원을 찾을 수 없습니다.' });
  }
  const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
  res.json({ hospital, doctors: hospitalDoctors });
});

// 4. Doctors with SEC-471 Bug
app.get('/api/doctors', (req, res) => {
  const { hospitalId, department, minExperience, search } = req.query;
  let results = [...doctors];

  if (hospitalId) {
    results = results.filter(d => d.hospitalId === hospitalId);
  }

  if (department && department !== 'all') {
    results = results.filter(d => d.department === department);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.hospitalName.toLowerCase().includes(q)
    );
  }

  // INTENTIONAL BACKEND BUG: site059-SEC-471
  // 배열의 filter 조건에서 0을 유효한 값으로 처리하지 못하는 오류:
  // 사용자가 minExperience=0(0년 이상/전체 신입 포함)을 명시적으로 전달했음에도
  // JavaScript의 if (minExperience) 조건문에서 0 또는 "0" 처리가 falsy(Number("0") === 0) 평가로 누락되어
  // 필터가 적용되지 않고 필터링 조건이 건너뛰어짐.
  if (minExperience && Number(minExperience) > 0) {
    results = results.filter(d => d.experience >= Number(minExperience));
  } else if (minExperience === '0' || minExperience === 0) {
    // Buggy execution: mistakenly ignored or filtered incorrectly due to falsy check
    // If minExperience is '0', the server treats it as falsy and does not apply the explicit >= 0 filter
  }

  res.json({ doctors: results });
});

app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: '의사 정보를 찾을 수 없습니다.' });
  }
  const hospital = hospitals.find(h => h.id === doctor.hospitalId);
  res.json({ doctor, hospital });
});

app.get('/api/doctors/:id/availability', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: '의사 정보를 찾을 수 없습니다.' });
  }

  // Generate availability for next 7 days
  const today = new Date();
  const availableDates = [];

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) { // Exclude Sundays
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      availableDates.push({
        date: dateStr,
        dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
        slots: standardTimeSlots.map(t => ({
          time: t,
          available: !['12:00', '12:30'].includes(t) && Math.random() > 0.25
        }))
      });
    }
  }

  res.json({ doctorId: doctor.id, availability: availableDates });
});

// 5. Appointments CRUD
app.get('/api/appointments', (req, res) => {
  res.json({ appointments });
});

app.get('/api/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: '예약 내역을 찾을 수 없습니다.' });
  }
  res.json({ appointment });
});

app.post('/api/appointments', (req, res) => {
  const { hospitalId, doctorId, date, time, patientName, patientPhone, symptoms } = req.body;
  if (!hospitalId || !doctorId || !date || !time || !patientName || !patientPhone) {
    return res.status(400).json({ error: '필수 예약 정보가 누락되었습니다.' });
  }

  const hospital = hospitals.find(h => h.id === hospitalId);
  const doctor = doctors.find(d => d.id === doctorId);

  const newAppointment = {
    id: `apt-${Date.now()}`,
    bookingNumber: `CB-${date.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    hospitalId,
    hospitalName: hospital ? hospital.name : 'CareBridge 협력의원',
    doctorId,
    doctorName: doctor ? doctor.name : '전문의',
    department: doctor ? doctor.department : 'internal',
    departmentName: doctor ? doctor.departmentName : '일반진료',
    date,
    time,
    patientName,
    patientPhone,
    symptoms: symptoms || '진료 상담',
    status: '예약 완료',
    createdAt: new Date().toISOString()
  };

  appointments.unshift(newAppointment);
  res.status(201).json({ appointment: newAppointment });
});

app.patch('/api/appointments/:id', (req, res) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: '예약 정보를 찾을 수 없습니다.' });
  }
  appointments[idx] = { ...appointments[idx], ...req.body };
  res.json({ appointment: appointments[idx] });
});

app.delete('/api/appointments/:id', (req, res) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: '예약 정보를 찾을 수 없습니다.' });
  }
  appointments[idx].status = '취소';
  res.json({ success: true, message: '예약이 정상적으로 취소되었습니다.', appointment: appointments[idx] });
});

// 6. Notices
app.get('/api/notices', (req, res) => {
  res.json({ notices });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[CareBridge] site059 hospital booking server listening on http://localhost:${PORT}`);
});
