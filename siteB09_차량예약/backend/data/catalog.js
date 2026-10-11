// 가상의 테스트 카탈로그 (실제 렌터카/브랜드와 무관)

const CITY_DEPOTS = [
  ['서울', ['서울역점', '강남점', '김포공항점', '잠실점', '홍대점']],
  ['부산', ['부산역점', '김해공항점', '해운대점', '서면점', '센텀점']],
  ['제주', ['제주공항점', '서귀포점', '중문점', '함덕점', '애월점']],
  ['인천', ['인천공항T1점', '인천공항T2점', '송도점', '부평점', '청라점']],
  ['대구', ['동대구역점', '대구공항점', '수성점', '칠곡점', '성서점']],
  ['강릉', ['강릉역점', '강릉시내점', '속초점', '양양공항점', '평창점']],
];

// 차종 정의
const CATEGORIES = [
  { key: 'mini', name: '경차', seats: [4], price: [35000, 45000], fuels: ['gasoline'], color: '#f59e0b', models: ['Spark Mini', 'Pico', 'Ray Go', 'Moa', 'Tiny Z'] },
  { key: 'compact', name: '소형', seats: [5], price: [45000, 60000], fuels: ['gasoline', 'hybrid'], color: '#14b8a6', models: ['Aria', 'Bolt S', 'Cielo', 'Dune 1.4', 'Elan', 'Fino', 'Gaia'] },
  { key: 'midsize', name: '중형', seats: [5], price: [65000, 90000], fuels: ['gasoline', 'diesel', 'hybrid'], color: '#3b82f6', models: ['Altos', 'Brio 2.0', 'Corvo', 'Delta Sedan', 'Eon', 'Flare', 'Gran Tour', 'Helio'] },
  { key: 'suv', name: 'SUV', seats: [5, 7], price: [85000, 130000], fuels: ['diesel', 'gasoline', 'hybrid'], color: '#10b981', models: ['Terra', 'Ridge', 'Summit', 'Trail X', 'Vista', 'Wander', 'Yukon Lite', 'Zeno', 'Atlas'] },
  { key: 'van', name: '승합', seats: [9, 11], price: [110000, 160000], fuels: ['diesel'], color: '#8b5cf6', models: ['Carry Van', 'Grand Cabin', 'Liner', 'Voyager', 'Stage 12'] },
  { key: 'premium', name: '프리미엄', seats: [5], price: [150000, 240000], fuels: ['gasoline', 'hybrid'], color: '#334155', models: ['Regent', 'Sovereign', 'Duke', 'Imperial', 'Noble', 'Octavia Prime'] },
  { key: 'ev', name: '전기차', seats: [5], price: [95000, 150000], fuels: ['electric'], color: '#06b6d4', models: ['Volt City', 'Ampere', 'Zap 5', 'Ion Drive', 'Nova EV'] },
];

const MAKES = ['Hanra', 'Daeyoung', 'Kovex', 'Lumen', 'Tarvo', 'Nexa', 'Orlo', 'Verta'];
const FUEL_LABEL = { gasoline: '가솔린', diesel: '디젤', hybrid: '하이브리드', electric: '전기' };

// 보험(protection) 6종 + 부가 옵션(addon) 14종
const EXTRAS = [
  ['BASIC', 'protection', '기본 보험', '대인·대물 기본 보장 (모든 예약에 포함)', 0, 'day', 0, 1],
  ['CDW_PLUS', 'protection', '차량손해 면책 플러스', '자기부담금을 최대 30만원까지 줄여 줍니다', 12000, 'day', 1, 0],
  ['FULL_COVER', 'protection', '완전 자차 커버', '자기부담금 0원, 사고 시 전액 보장', 21000, 'day', 0, 0],
  ['GLASS_TIRE', 'protection', '유리·타이어 보장', '유리·타이어 파손 시 보장', 6000, 'day', 0, 0],
  ['ROADSIDE', 'protection', '긴급출동 서비스', '배터리 방전·타이어 교체·견인 지원', 5000, 'day', 0, 0],
  ['PERSONAL_ACC', 'protection', '탑승자 상해 보장', '동승자 상해 추가 보장', 7000, 'day', 0, 0],
  ['NAVI', 'addon', '내비게이션', '실시간 교통정보 내비게이션', 8000, 'day', 0, 0],
  ['CHILD_SEAT', 'addon', '유아용 카시트', '0~4세용 카시트', 7000, 'day', 0, 0],
  ['JUNIOR_SEAT', 'addon', '주니어 카시트', '4~8세용 카시트', 6000, 'day', 0, 0],
  ['BOOSTER', 'addon', '부스터 시트', '8세 이상 어린이용', 4000, 'day', 0, 0],
  ['EXTRA_DRIVER', 'addon', '추가 운전자', '운전자 1명 추가 등록', 10000, 'day', 0, 0],
  ['WIFI', 'addon', '와이파이 에그', '무제한 데이터 포켓 와이파이', 5500, 'day', 0, 0],
  ['SNOW_CHAIN', 'addon', '스노체인', '겨울철 눈길용 체인', 12000, 'once', 0, 0],
  ['ROOF_BOX', 'addon', '루프박스', '여행용 대용량 루프박스', 15000, 'day', 0, 0],
  ['HIPASS', 'addon', '하이패스 단말기', '고속도로 통행료 자동 결제 단말기', 3000, 'once', 0, 0],
  ['PHONE_HOLDER', 'addon', '휴대폰 거치대', '대시보드 거치대', 1500, 'once', 0, 0],
  ['ICE_BOX', 'addon', '아이스박스', '30L 대용량 아이스박스', 4000, 'once', 0, 0],
  ['CAMP_SET', 'addon', '캠핑 의자 세트', '접이식 캠핑 의자 4개', 9000, 'once', 0, 0],
  ['BIKE_CARRIER', 'addon', '자전거 캐리어', '자전거 2대 적재용', 11000, 'day', 0, 0],
  ['DASHCAM_SD', 'addon', '블랙박스 영상 저장', '주행 영상 저장 서비스', 3500, 'once', 0, 0],
];

const SEASONS = [
  ['여름 성수기', '2026-08-01', '2026-08-31', 1.2],
  ['일반 시즌', '2026-09-01', '2026-10-31', 1.0],
  ['가을 비수기', '2026-11-01', '2026-11-30', 0.9],
  ['연말연시 성수기', '2026-12-01', '2027-01-31', 1.3],
];

const FIRST = ['민준', '서연', '지호', '하은', '도윤', '수아', '예준', '지우', '시우', '채원'];
const LAST = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
const MAINT_KINDS = ['정기 점검', '엔진오일 교환', '타이어 교체', '세차 및 실내 소독', '브레이크 점검', '배터리 점검'];
const ACTIVITY_ACTIONS = ['search', 'quote', 'booking_create', 'booking_update', 'booking_cancel', 'pickup', 'return'];

module.exports = { CITY_DEPOTS, CATEGORIES, MAKES, FUEL_LABEL, EXTRAS, SEASONS, FIRST, LAST, MAINT_KINDS, ACTIVITY_ACTIONS };
