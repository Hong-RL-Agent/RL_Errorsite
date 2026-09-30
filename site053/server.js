import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9952;

app.use(cors());
app.use(express.json());

// Serve static dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Mock In-Memory Database
// ----------------------------------------------------

const categories = [
  { id: 'cat-all', name: '전체', icon: '🛍️' },
  { id: 'cat-digital', name: '디지털기기', icon: '📱' },
  { id: 'cat-appliance', name: '생활가전', icon: '📺' },
  { id: 'cat-furniture', name: '가구', icon: '🪑' },
  { id: 'cat-fashion', name: '패션', icon: '👗' },
  { id: 'cat-sports', name: '스포츠', icon: '⚽' },
  { id: 'cat-hobby', name: '취미', icon: '🎮' },
  { id: 'cat-books', name: '도서', icon: '📚' },
  { id: 'cat-baby', name: '육아용품', icon: '🍼' },
  { id: 'cat-living', name: '생활용품', icon: '🧼' }
];

const sellers = [
  { id: 'seller-01', nickname: '망원동당근이', location: '서울 마포구 망원동', mannerScore: 41.5, reviewCount: 38, joinedAt: '2024-03-12', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-02', nickname: '연남동맥가이버', location: '서울 마포구 연남동', mannerScore: 39.8, reviewCount: 22, joinedAt: '2024-05-18', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-03', nickname: '성수동식집사', location: '서울 성동구 성수동', mannerScore: 43.2, reviewCount: 54, joinedAt: '2023-11-04', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-04', nickname: '판교개발자K', location: '경기 성남시 분당구 백현동', mannerScore: 38.6, reviewCount: 16, joinedAt: '2025-01-10', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-05', nickname: '송파러블리', location: '서울 송파구 잠실동', mannerScore: 40.1, reviewCount: 29, joinedAt: '2024-07-22', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-06', nickname: '여의도직장인', location: '서울 영등포구 여의도동', mannerScore: 37.4, reviewCount: 11, joinedAt: '2025-02-15', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-07', nickname: '종로북러버', location: '서울 종로구 혜화동', mannerScore: 42.0, reviewCount: 47, joinedAt: '2023-09-01', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-08', nickname: '마곡테크맘', location: '서울 강서구 마곡동', mannerScore: 39.5, reviewCount: 25, joinedAt: '2024-08-30', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-09', nickname: '강남레트로', location: '서울 강남구 역삼동', mannerScore: 40.8, reviewCount: 31, joinedAt: '2024-04-19', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
  { id: 'seller-10', nickname: '합정동캠퍼', location: '서울 마포구 합정동', mannerScore: 44.5, reviewCount: 62, joinedAt: '2023-06-14', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' }
];

const sampleImages = [
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585336261026-7f547c1f855e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
];

let products = [
  { id: 'p-101', title: '아이패드 에어 5세대 64GB 스페이스 그레이 (풀박스)', price: 580000, category: '디지털기기', condition: '거의 새 상품', description: '실사용 3개월 미만이며 배터리 효율 98%입니다.\n강화유리 필름 부착되어 있고 정품 스마트 폴리오 케이스 포함입니다.\n직거래는 망원역 2번 출구 앞에서 희망합니다.', location: '서울 마포구 망원동', sellerId: 'seller-01', tradeMethod: '직거래', status: '판매중', images: [sampleImages[0], sampleImages[1]], likes: 14, views: 182, createdAt: '2026-09-27T10:15:00' },
  { id: 'p-102', title: '소니 WH-1000XM5 노이즈캔슬링 헤드폰 블랙', price: 310000, category: '디지털기기', condition: '사용감 적음', description: '작년 말 구매 후 주로 실내에서만 청음했습니다.\n외관 기스 전혀 없고 전용 하드케이스와 케이블 모두 있습니다.\n연남동 주민센터 인근 직거래 선호합니다.', location: '서울 마포구 연남동', sellerId: 'seller-02', tradeMethod: '직거래', status: '판매중', images: [sampleImages[3], sampleImages[4]], likes: 21, views: 245, createdAt: '2026-09-27T09:30:00' },
  { id: 'p-103', title: '다이슨 V12 슬림 무선청소기 콤팩트 거치대 포함', price: 420000, category: '생활가전', condition: '사용감 적음', description: '모터 브러시 및 침구 툴 깨끗하게 세척해 두었습니다.\n흡입력 짱짱하고 거치대까지 한 번에 드립니다.\n부피가 있어 성수역 직거래 또는 문 앞 거래 환영합니다.', location: '서울 성동구 성수동', sellerId: 'seller-03', tradeMethod: '직거래', status: '판매중', images: [sampleImages[2]], likes: 9, views: 130, createdAt: '2026-09-26T18:20:00' },
  { id: 'p-104', title: '로지텍 MX Master 3S 무소음 무선 마우스 페일그레이', price: 85000, category: '디지털기기', condition: '거의 새 상품', description: '맥북용으로 서브 사용하다가 트랙패드만 쓰게 되어 내놓습니다.\n볼트 수신기 동봉해 드립니다.\n판교 테크노밸리 직거래 가능해요.', location: '경기 성남시 분당구 백현동', sellerId: 'seller-04', tradeMethod: '직거래', status: '판매중', images: [sampleImages[4]], likes: 18, views: 190, createdAt: '2026-09-26T15:10:00' },
  { id: 'p-105', title: '허먼밀러 뉴 에어로 체어 풀옵션 라이트 B사이즈', price: 1150000, category: '가구', condition: '거의 새 상품', description: '포워드 틸팅 기능 포함된 정품 풀옵션입니다.\n재택근무 종료로 아쉽게 처분합니다.\n잠실 엘스아파트 직거래(직접 픽업) 가능합니다.', location: '서울 송파구 잠실동', sellerId: 'seller-05', tradeMethod: '직거래', status: '판매중', images: [sampleImages[5]], likes: 35, views: 420, createdAt: '2026-09-25T14:00:00' },
  { id: 'p-106', title: '파타고니아 클래식 레트로-X 플리스 자켓 네이비 L', price: 140000, category: '패션', condition: '사용감 적음', description: '보풀 거의 없고 안감 메쉬 깨끗합니다.\n세탁 완료 상태로 바로 입으실 수 있습니다.\n택배 거래도 가능합니다 (택포).', location: '서울 영등포구 여의도동', sellerId: 'seller-06', tradeMethod: '택배', status: '판매중', images: [sampleImages[6]], likes: 12, views: 160, createdAt: '2026-09-25T11:40:00' },
  { id: 'p-107', title: '킨들 페이퍼화이트 11세대 시그니처 에디션 32GB', price: 160000, category: '디지털기기', condition: '거의 새 상품', description: '무선충전 지원 모델이며 전면 필름, 가죽 케이스 장착되어 있습니다.\n영어 원서 읽으실 분께 추천드립니다.\n혜화역 직거래 원합니다.', location: '서울 종로구 혜화동', sellerId: 'seller-07', tradeMethod: '직거래', status: '판매중', images: [sampleImages[7]], likes: 15, views: 210, createdAt: '2026-09-24T17:00:00' },
  { id: 'p-108', title: '스토케 트립트랩 하이체어 내추럴 (베이비세트 포함)', price: 290000, category: '육아용품', condition: '사용감 있음', description: '아이 이유식 시작할 때부터 유용하게 쓴 정품 의자입니다.\n생활 기스 약간 있으나 원목 견고합니다.\n마곡나루역 문 앞 비대면 거래 가능합니다.', location: '서울 강서구 마곡동', sellerId: 'seller-08', tradeMethod: '문 앞 거래', status: '판매중', images: [sampleImages[1]], likes: 27, views: 350, createdAt: '2026-09-24T12:10:00' },
  { id: 'p-109', title: '닌텐도 스위치 OLED 화이트 + 젤다 티어스 게임팩', price: 340000, category: '취미', condition: '거의 새 상품', description: '엔딩 보고 보관만 해서 조이콘 쏠림 전혀 없습니다.\n강화유리 부착 및 파우치 함께 드립니다.\n역삼역 4번 출구 직거래합니다.', location: '서울 강남구 역삼동', sellerId: 'seller-09', tradeMethod: '직거래', status: '판매중', images: [sampleImages[3]], likes: 42, views: 510, createdAt: '2026-09-23T20:30:00' },
  { id: 'p-110', title: '헬리녹스 체어원 블랙아웃 에디션 2개 일괄', price: 190000, category: '스포츠', condition: '사용감 적음', description: '캠핑 2회 사용 후 보관 중입니다.\n스킨 오염이나 프레임 휨 일절 없습니다.\n합정역 인근 직거래 우선합니다.', location: '서울 마포구 합정동', sellerId: 'seller-10', tradeMethod: '직거래', status: '판매중', images: [sampleImages[5]], likes: 19, views: 280, createdAt: '2026-09-23T14:15:00' },
  { id: 'p-111', title: '네스프레소 시티즈 캡슐 커피머신 화이트', price: 95000, category: '생활가전', condition: '사용감 적음', description: '디스케일링 최근에 완료했습니다.\n디카페인 캡슐 10개 서비스로 드려요.\n망원동 주민센터 직거래 희망합니다.', location: '서울 마포구 망원동', sellerId: 'seller-01', tradeMethod: '직거래', status: '판매중', images: [sampleImages[2]], likes: 11, views: 140, createdAt: '2026-09-22T16:00:00' },
  { id: 'p-112', title: '발뮤다 더 토스터 K05B 블랙 최신형', price: 180000, category: '생활가전', condition: '거의 새 상품', description: '5cc 계량컵과 설명서 모두 있습니다.\n식빵 구울 때 몇 번 쓴 게 다입니다.\n연남동 직거래 환영합니다.', location: '서울 마포구 연남동', sellerId: 'seller-02', tradeMethod: '직거래', status: '판매중', images: [sampleImages[7]], likes: 14, views: 175, createdAt: '2026-09-22T11:20:00' },
  { id: 'p-113', title: '몬스테라 알보 바리에가타 3엽 완벽 무늬', price: 120000, category: '취미', condition: '거의 새 상품', description: '뿌리 튼튼하고 신엽 전개 중인 알보입니다.\n토분 채로 조심스럽게 직거래 전달드립니다.\n성수동 카페거리 직거래 가능합니다.', location: '서울 성동구 성수동', sellerId: 'seller-03', tradeMethod: '직거래', status: '판매중', images: [sampleImages[0]], likes: 25, views: 310, createdAt: '2026-09-21T18:00:00' },
  { id: 'p-114', title: '애플 매직 키보드 텐키리스 터치아이디 탑재 화이트', price: 110000, category: '디지털기기', condition: '거의 새 상품', description: 'M2 맥북용으로 구매했다가 기계식 키보드로 넘어가서 판매합니다.\n라이트닝 케이블 미사용 신품 상태입니다.', location: '경기 성남시 분당구 백현동', sellerId: 'seller-04', tradeMethod: '직거래', status: '판매중', images: [sampleImages[4]], likes: 8, views: 120, createdAt: '2026-09-21T13:40:00' },
  { id: 'p-115', title: '이케아 쇠데르함 3인용 소파 비아르프 베이지', price: 230000, category: '가구', condition: '사용감 적음', description: '커버 세탁 가능하며 오염 없이 깨끗합니다.\n직접 용달 불러서 실어가셔야 합니다.\n송파구 잠실동 아파트 엘리베이터 이동 가능.', location: '서울 송파구 잠실동', sellerId: 'seller-05', tradeMethod: '직거래', status: '판매중', images: [sampleImages[5]], likes: 31, views: 480, createdAt: '2026-09-20T15:30:00' },
  { id: 'p-116', title: '바버 비데일 왁스 자켓 세이지 38사이즈', price: 210000, category: '패션', condition: '사용감 적음', description: '작년에 리왁싱 한 번 진행했습니다.\n뱃지 포함 풀구성입니다.\n여의도 IFC몰 인근 직거래 환영합니다.', location: '서울 영등포구 여의도동', sellerId: 'seller-06', tradeMethod: '직거래', status: '판매중', images: [sampleImages[6]], likes: 16, views: 220, createdAt: '2026-09-20T10:00:00' },
  { id: 'p-117', title: '민음사 세계문학전집 50권 세트 양장본', price: 190000, category: '도서', condition: '거의 새 상품', description: '소장용으로 책장에만 꽂아두어 변색이나 찢김 없습니다.\n책 무게가 상당하여 차로 픽업 권장합니다.\n혜화동 직거래 희망합니다.', location: '서울 종로구 혜화동', sellerId: 'seller-07', tradeMethod: '직거래', status: '판매중', images: [sampleImages[7]], likes: 22, views: 290, createdAt: '2026-09-19T14:50:00' },
  { id: 'p-118', title: '브라운 체온계 IRT-6520 필터 2박스 포함', price: 45000, category: '육아용품', condition: '사용감 적음', description: '출산 준비물로 구비했다가 다른 체온계가 생겨 보관했습니다.\n새 렌즈 필터 40개 같이 드려요.\n마곡동 직거래 또는 택배 가능합니다.', location: '서울 강서구 마곡동', sellerId: 'seller-08', tradeMethod: '문 앞 거래', status: '판매중', images: [sampleImages[1]], likes: 13, views: 165, createdAt: '2026-09-19T09:20:00' },
  { id: 'p-119', title: '소니 플레이스테이션 5 디스크 에디션 듀얼센스 2개', price: 480000, category: '취미', condition: '사용감 적음', description: '거치대, HDMI선, 충전독까지 함께 드립니다.\n초기화 완료해 두었습니다.\n강남역 혹은 역삼역 직거래 가능합니다.', location: '서울 강남구 역삼동', sellerId: 'seller-09', tradeMethod: '직거래', status: '판매중', images: [sampleImages[3]], likes: 38, views: 490, createdAt: '2026-09-18T19:10:00' },
  { id: 'p-120', title: '스노우피크 기가파워 스토브 지 자동점화 + 윈드스크린', price: 65000, category: '스포츠', condition: '거의 새 상품', description: '백패킹 1회 실사용했습니다.\n불꽃 점화 시원하게 잘 됩니다.\n합정동 문 앞 거래 선호합니다.', location: '서울 마포구 합정동', sellerId: 'seller-10', tradeMethod: '문 앞 거래', status: '판매중', images: [sampleImages[5]], likes: 9, views: 110, createdAt: '2026-09-18T13:00:00' },
  { id: 'p-121', title: '에어팟 프로 2세대 C타입 케이스 포함', price: 210000, category: '디지털기기', condition: '사용감 적음', description: '케이스 끼우고 다녀서 본체 외관 깨끗합니다.\n케이블 미사용 상태입니다.\n망원역 인근 직거래합니다.', location: '서울 마포구 망원동', sellerId: 'seller-01', tradeMethod: '직거래', status: '판매완료', images: [sampleImages[4]], likes: 28, views: 380, createdAt: '2026-09-17T11:00:00' },
  { id: 'p-122', title: 'LG 룸앤TV 27인치 스마트 모니터 27TN600S', price: 175000, category: '생활가전', condition: '사용감 적음', description: '원룸에서 넷플릭스, 유튜브 시청용으로 유용하게 썼습니다.\n리모컨, 어댑터 포함입니다.', location: '서울 마포구 연남동', sellerId: 'seller-02', tradeMethod: '직거래', status: '예약중', images: [sampleImages[0]], likes: 19, views: 260, createdAt: '2026-09-17T15:30:00' },
  { id: 'p-123', title: '무인양품 원목 4인 식탁 테이블 세트', price: 320000, category: '가구', condition: '사용감 있음', description: '원목 오크 무늬목 테이블과 의자 4개 일괄입니다.\n이사로 인해 급처분합니다.', location: '서울 성동구 성수동', sellerId: 'seller-03', tradeMethod: '직거래', status: '판매중', images: [sampleImages[5]], likes: 14, views: 180, createdAt: '2026-09-16T14:00:00' },
  { id: 'p-124', title: '나이키 에어포스 1 로우 올화이트 270 신품', price: 110000, category: '패션', condition: '새 상품', description: '공식 나이키 코리아 정품 택 달린 미착용 새상품입니다.\n사이즈 미스로 내놓습니다.', location: '경기 성남시 분당구 백현동', sellerId: 'seller-04', tradeMethod: '직거래', status: '판매중', images: [sampleImages[6]], likes: 33, views: 420, createdAt: '2026-09-16T10:20:00' },
  { id: 'p-125', title: '타이틀리스트 T200 아이언 세트 5-P 경량스틸', price: 790000, category: '스포츠', condition: '사용감 적음', description: '스크린골프 몇 번 치고 필드 1회 나간 상태 A급입니다.\n그립 쫀득합니다.', location: '서울 송파구 잠실동', sellerId: 'seller-05', tradeMethod: '직거래', status: '판매중', images: [sampleImages[2]], likes: 17, views: 250, createdAt: '2026-09-15T18:10:00' },
  { id: 'p-126', title: '보스 사운드링크 미니 2 블루투스 스피커 스페셜에디션', price: 125000, category: '디지털기기', condition: '사용감 적음', description: '저음 풍부하고 베터리 쌩쌩합니다.\nC타입 충전 케이블 포함입니다.', location: '서울 영등포구 여의도동', sellerId: 'seller-06', tradeMethod: '택배', status: '판매중', images: [sampleImages[4]], likes: 21, views: 310, createdAt: '2026-09-15T12:00:00' },
  { id: 'p-127', title: '해리포터 20주년 개정판 전권 박스 세트', price: 90000, category: '도서', condition: '거의 새 상품', description: '1권부터 7권까지 전권 구비되어 있습니다.\n책장에 고이 모셔둔 책입니다.', location: '서울 종로구 혜화동', sellerId: 'seller-07', tradeMethod: '직거래', status: '판매중', images: [sampleImages[7]], likes: 45, views: 560, createdAt: '2026-09-14T16:40:00' },
  { id: 'p-128', title: '부가부 버터플라이 휴대용 유모차 미드나잇 블랙', price: 410000, category: '육아용품', condition: '사용감 적음', description: '기내 반입 가능한 최고급 휴대용 유모차입니다.\n레인커버 미개봉 함께 드려요.', location: '서울 강서구 마곡동', sellerId: 'seller-08', tradeMethod: '문 앞 거래', status: '판매중', images: [sampleImages[1]], likes: 39, views: 490, createdAt: '2026-09-14T11:15:00' },
  { id: 'p-129', title: '드롱기 데디카 반자동 에스프레소 머신 메탈', price: 130000, category: '생활가전', condition: '사용감 적음', description: '바텀리스 포터필터와 탬퍼, 샷잔 같이 드립니다.\n홈카페 입문용으로 좋습니다.', location: '서울 강남구 역삼동', sellerId: 'seller-09', tradeMethod: '직거래', status: '판매중', images: [sampleImages[3]], likes: 23, views: 270, createdAt: '2026-09-13T19:00:00' },
  { id: 'p-130', title: '크레모아 울트라 3.0 X 캠핑용 LED 랜턴 블랙', price: 110000, category: '스포츠', condition: '거의 새 상품', description: '대용량 보조배터리 겸용 캠핑 랜턴입니다.\n전용 파우치와 충전선 있습니다.', location: '서울 마포구 합정동', sellerId: 'seller-10', tradeMethod: '문 앞 거래', status: '판매중', images: [sampleImages[5]], likes: 12, views: 160, createdAt: '2026-09-13T13:30:00' },
  { id: 'p-131', title: '애플워치 SE 2세대 40mm 스타라이트 알루미늄', price: 210000, category: '디지털기기', condition: '거의 새 상품', description: '배터리 성능 100%이며 정품 스포츠 밴드 포함입니다.', location: '서울 마포구 망원동', sellerId: 'seller-01', tradeMethod: '직거래', status: '판매중', images: [sampleImages[0]], likes: 30, views: 390, createdAt: '2026-09-12T17:20:00' },
  { id: 'p-132', title: '샤오미 미에어 4 프로 공기청정기 필터 신품 교체', price: 80000, category: '생활가전', condition: '사용감 적음', description: '정품 헤파 필터 새것으로 교체 후 판매합니다.\n원룸이나 거실에 딱입니다.', location: '서울 마포구 연남동', sellerId: 'seller-02', tradeMethod: '직거래', status: '판매중', images: [sampleImages[2]], likes: 11, views: 140, createdAt: '2026-09-12T10:00:00' },
  { id: 'p-133', title: '이케아 빌리 책장 화이트 80x28x202', price: 40000, category: '가구', condition: '사용감 있음', description: '분해해 두지 않아서 직접 차로 실어가셔야 합니다.\n잠실 아파트 픽업.', location: '서울 송파구 잠실동', sellerId: 'seller-05', tradeMethod: '직거래', status: '판매중', images: [sampleImages[5]], likes: 15, views: 220, createdAt: '2026-09-11T15:00:00' },
  { id: 'p-134', title: '아크테릭스 아톰 LT 후디 블랙 M사이즈', price: 280000, category: '패션', condition: '거의 새 상품', description: '국내 백화점 구매 정품입니다.\n하자 오염 전혀 없습니다.', location: '서울 영등포구 여의도동', sellerId: 'seller-06', tradeMethod: '택배', status: '판매중', images: [sampleImages[6]], likes: 41, views: 530, createdAt: '2026-09-11T09:40:00' },
  { id: 'p-135', title: '코베아 구이바다 M 올인원 가스버너 아이보리', price: 75000, category: '스포츠', condition: '사용감 적음', description: '전골팬, 그릴팬, 전용 가방 풀세트입니다.\n상태 깨끗합니다.', location: '서울 마포구 합정동', sellerId: 'seller-10', tradeMethod: '직거래', status: '판매중', images: [sampleImages[3]], likes: 18, views: 260, createdAt: '2026-09-10T14:10:00' },
  { id: 'p-136', title: '알라딘 이북리더기 크레마 모티프 블랙', price: 140000, category: '디지털기기', condition: '거의 새 상품', description: '열린서재 지원하며 밀리의서재 잘 돌아갑니다.\n플립 케이스 포함.', location: '서울 종로구 혜화동', sellerId: 'seller-07', tradeMethod: '직거래', status: '판매중', images: [sampleImages[7]], likes: 20, views: 275, createdAt: '2026-09-10T11:00:00' },
  { id: 'p-137', title: '타이니러브 모빌 뉴 수더앤그루브 거치대 포함', price: 35000, category: '육아용품', condition: '사용감 적음', description: '국민 육아템 모빌입니다.\n건전지 새것 넣어두었습니다.', location: '서울 강서구 마곡동', sellerId: 'seller-08', tradeMethod: '문 앞 거래', status: '판매중', images: [sampleImages[1]], likes: 16, views: 190, createdAt: '2026-09-09T16:30:00' },
  { id: 'p-138', title: 'LG 울트라기어 32인치 144Hz 게이밍 모니터 32GN650', price: 220000, category: '디지털기기', condition: '거의 새 상품', description: 'QHD 144Hz 패널 무결점입니다.\nDP케이블, 전원선 동봉.', location: '서울 강남구 역삼동', sellerId: 'seller-09', tradeMethod: '직거래', status: '판매중', images: [sampleImages[4]], likes: 29, views: 380, createdAt: '2026-09-09T10:00:00' },
  { id: 'p-139', title: '일렉트로룩스 에르고라피도 무선청소기 서브용', price: 50000, category: '생활가전', condition: '사용감 있음', description: '원룸이나 자취방에서 가볍게 쓰기 좋습니다.\n정상 작동합니다.', location: '서울 마포구 망원동', sellerId: 'seller-01', tradeMethod: '직거래', status: '판매중', images: [sampleImages[2]], likes: 8, views: 110, createdAt: '2026-09-08T18:00:00' },
  { id: 'p-140', title: '포터 탱커 숄더백 S 블랙 정품', price: 160000, category: '패션', condition: '사용감 적음', description: '단추 까짐 적고 오렌지 안감 오염 없습니다.\n데일리백으로 추천.', location: '서울 성동구 성수동', sellerId: 'seller-03', tradeMethod: '직거래', status: '판매중', images: [sampleImages[6]], likes: 37, views: 480, createdAt: '2026-09-08T13:20:00' }
];

let chats = [
  { id: 'chat-01', productId: 'p-101', productTitle: '아이패드 에어 5세대 64GB 스페이스 그레이 (풀박스)', productPrice: 580000, partnerId: 'seller-01', partnerName: '망원동당근이', partnerAvatar: sellers[0].avatar, lastMessage: '내일 오후 2시 망원역 2번 출구에서 뵙겠습니다!', lastTime: '10:45 AM', unreadCount: 0, messages: [
    { sender: 'other', text: '안녕하세요! 혹시 네고 조금 가능할까요?', time: '10:30 AM' },
    { sender: 'me', text: '57만원까지는 맞춰드릴 수 있습니다 :)', time: '10:35 AM' },
    { sender: 'other', text: '좋습니다! 내일 오후 2시 망원역 2번 출구에서 뵙겠습니다!', time: '10:45 AM' }
  ]},
  { id: 'chat-02', productId: 'p-102', productTitle: '소니 WH-1000XM5 노이즈캔슬링 헤드폰 블랙', productPrice: 310000, partnerId: 'seller-02', partnerName: '연남동맥가이버', partnerAvatar: sellers[1].avatar, lastMessage: '오늘 저녁에 바로 거래 가능하신가요?', lastTime: '09:50 AM', unreadCount: 1, messages: [
    { sender: 'other', text: '안녕하세요, 헤드폰 구매하고 싶어서 연락드렸습니다.', time: '09:40 AM' },
    { sender: 'other', text: '오늘 저녁에 바로 거래 가능하신가요?', time: '09:50 AM' }
  ]},
  { id: 'chat-03', productId: 'p-104', productTitle: '로지텍 MX Master 3S 무소음 무선 마우스', productPrice: 85000, partnerId: 'seller-04', partnerName: '판교개발자K', partnerAvatar: sellers[3].avatar, lastMessage: '판교역 개찰구 앞도 괜찮으세요?', lastTime: '어제', unreadCount: 0, messages: [
    { sender: 'me', text: '판교역 직거래 희망합니다.', time: '어제' },
    { sender: 'other', text: '판교역 개찰구 앞도 괜찮으세요?', time: '어제' }
  ]},
  { id: 'chat-04', productId: 'p-105', productTitle: '허먼밀러 뉴 에어로 체어 풀옵션 라이트 B사이즈', productPrice: 1150000, partnerId: 'seller-05', partnerName: '송파러블리', partnerAvatar: sellers[4].avatar, lastMessage: '주말에 승용차 트렁크에 실릴지 확인해볼게요!', lastTime: '2일 전', unreadCount: 0, messages: [
    { sender: 'other', text: '안녕하세요 의자 문의드립니다.', time: '2일 전' },
    { sender: 'me', text: '네 안녕하세요! SUV나 뒷좌석 접히는 차면 충분히 실립니다.', time: '2일 전' }
  ]},
  { id: 'chat-05', productId: 'p-107', productTitle: '킨들 페이퍼화이트 11세대 시그니처 에디션 32GB', productPrice: 160000, partnerId: 'seller-07', partnerName: '종로북러버', partnerAvatar: sellers[6].avatar, lastMessage: '택배로 보내주실 수 있나요?', lastTime: '3일 전', unreadCount: 0, messages: [
    { sender: 'other', text: '택배로 보내주실 수 있나요?', time: '3일 전' }
  ]},
  { id: 'chat-06', productId: 'p-109', productTitle: '닌텐도 스위치 OLED 화이트 + 젤다', productPrice: 340000, partnerId: 'seller-09', partnerName: '강남레트로', partnerAvatar: sellers[8].avatar, lastMessage: '퇴근하고 7시에 역삼역에서 뵐게요.', lastTime: '4일 전', unreadCount: 0, messages: [
    { sender: 'other', text: '퇴근하고 7시에 역삼역에서 뵐게요.', time: '4일 전' }
  ]},
  { id: 'chat-07', productId: 'p-110', productTitle: '헬리녹스 체어원 블랙아웃 에디션 2개', productPrice: 190000, partnerId: 'seller-10', partnerName: '합정동캠퍼', partnerAvatar: sellers[9].avatar, lastMessage: '개별 구매도 가능한가요?', lastTime: '5일 전', unreadCount: 0, messages: [
    { sender: 'other', text: '개별 구매도 가능한가요?', time: '5일 전' }
  ]},
  { id: 'chat-08', productId: 'p-113', productTitle: '몬스테라 알보 바리에가타 3엽', productPrice: 120000, partnerId: 'seller-03', partnerName: '성수동식집사', partnerAvatar: sellers[2].avatar, lastMessage: '잎 무늬 사진 몇 장 더 볼 수 있을까요?', lastTime: '5일 전', unreadCount: 0, messages: [
    { sender: 'other', text: '잎 무늬 사진 몇 장 더 볼 수 있을까요?', time: '5일 전' }
  ]},
  { id: 'chat-09', productId: 'p-116', productTitle: '바버 비데일 왁스 자켓 세이지 38', productPrice: 210000, partnerId: 'seller-06', partnerName: '여의도직장인', partnerAvatar: sellers[5].avatar, lastMessage: '실착 횟수 어느 정도 되나요?', lastTime: '6일 전', unreadCount: 0, messages: [
    { sender: 'other', text: '실착 횟수 어느 정도 되나요?', time: '6일 전' }
  ]},
  { id: 'chat-10', productId: 'p-118', productTitle: '브라운 체온계 IRT-6520 필터 포함', productPrice: 45000, partnerId: 'seller-08', partnerName: '마곡테크맘', partnerAvatar: sellers[7].avatar, lastMessage: '문 앞 비대면 거래로 입금해드리겠습니다.', lastTime: '7일 전', unreadCount: 0, messages: [
    { sender: 'other', text: '문 앞 비대면 거래로 입금해드리겠습니다.', time: '7일 전' }
  ]}
];

let likedProductIds = ['p-101', 'p-102', 'p-109'];
let reports = [];

function attachBugMetadata(res, bugId, description, severity, endpoint, method, category, family) {
  res.set('X-Bug-Triggered', bugId);
  res.set('Access-Control-Expose-Headers', 'X-Bug-Triggered, X-Bug-Info');
  return {
    id: bugId,
    description,
    severity,
    endpoint,
    method,
    category,
    family
  };
}

// ----------------------------------------------------
// Health check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NearBuy',
    site: 'site053'
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories });
});

// Products
app.get('/api/products', (req, res) => {
  const { category, search, location, minPrice, maxPrice, condition, tradeMethod, status } = req.query;

  let filtered = [...products];

  if (category && category !== '전체' && category !== 'cat-all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
  }
  if (location && location !== '전체') {
    filtered = filtered.filter(p => p.location.includes(location));
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseInt(minPrice, 10));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseInt(maxPrice, 10));
  }
  if (condition && condition !== '전체') {
    filtered = filtered.filter(p => p.condition === condition);
  }
  if (tradeMethod && tradeMethod !== '전체') {
    filtered = filtered.filter(p => p.tradeMethod === tradeMethod);
  }
  if (status && status !== '전체') {
    filtered = filtered.filter(p => p.status === status);
  }

  res.json({ success: true, count: filtered.length, products: filtered });
});

// Single Product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }
  const seller = sellers.find(s => s.id === product.sellerId) || sellers[0];
  product.views += 1;
  res.json({ success: true, product, seller });
});

// Create Product
app.post('/api/products', (req, res) => {
  let { title, price, category, condition, description, location, tradeMethod, images, selectedImageIndex, previewMismatch, rawPriceInput } = req.body;

  let bugList = [];

  // INTENTIONAL BACKEND BUG: site053-SEC-441
  // If price input string has leading zeros (e.g. "050000"), store price as 1/10 (e.g. 5000) or normalize incorrectly!
  let finalPrice = parseInt(price, 10) || 0;
  if (rawPriceInput && typeof rawPriceInput === 'string' && rawPriceInput.startsWith('0') && rawPriceInput.length > 1) {
    finalPrice = Math.floor(finalPrice / 10); // 50000 becomes 5000 in DB!
    const bugInfo = attachBugMetadata(
      res,
      'SEC-441',
      '선행 0이 포함된 가격 입력 정규화 처리 오류로 화면 표시값과 실제 저장값이 10배 차이나는 현상',
      'medium',
      '/api/products',
      'POST',
      'Input Handling',
      'numeric-normalization'
    );
    bugList.push(bugInfo);
  }

  // INTENTIONAL BACKEND BUG: site053-SEC-442
  // Strip newlines from multiline description on save so that detail page loses paragraph breaks!
  let finalDescription = description || '';
  if (description && description.includes('\n')) {
    finalDescription = description.replace(/\r?\n+/g, ' '); // Newlines collapsed into single spaces
    const bugInfo = attachBugMetadata(
      res,
      'SEC-442',
      '상품 설명의 줄바꿈(newline)이 저장/렌더링 시 일반 공백으로 처리되어 사라지는 오류',
      'low',
      '/api/products',
      'POST',
      'Text Rendering',
      'newline-preservation'
    );
    bugList.push(bugInfo);
  }

  // INTENTIONAL BACKEND BUG: site053-SEC-443
  // When multiple images uploaded and intermediate image deleted, image index mismatch
  if (req.headers['x-image-index-desync'] === 'true' || req.query.imageDesync === 'true') {
    const bugInfo = attachBugMetadata(
      res,
      'SEC-443',
      '이미지 삭제 후 미리보기 선택 인덱스가 실제 이미지 배열과 어긋나 대표 이미지가 잘못 설정되는 오류',
      'medium',
      '/api/products',
      'POST',
      'Media UI',
      'array-index-sync'
    );
    bugList.push(bugInfo);
  }

  // INTENTIONAL BACKEND BUG: site053-SEC-445
  // When browser back navigation causes form-preview data source mismatch
  if (previewMismatch || req.headers['x-preview-desync'] === 'true') {
    const bugInfo = attachBugMetadata(
      res,
      'SEC-445',
      '브라우저 뒤로가기 후 판매글 작성 폼과 미리보기 상태 간 데이터가 불일치하는 오류',
      'medium',
      '/api/products',
      'POST',
      'Navigation State',
      'form-preview-desync'
    );
    bugList.push(bugInfo);
  }

  const newProduct = {
    id: `p-${Math.floor(1000 + Math.random() * 9000)}`,
    title: title || '제목 없음',
    price: finalPrice,
    category: category || '디지털기기',
    condition: condition || '거의 새 상품',
    description: finalDescription,
    location: location || '서울 마포구 망원동',
    sellerId: 'seller-01',
    tradeMethod: tradeMethod || '직거래',
    status: '판매중',
    images: images && images.length > 0 ? images : [sampleImages[0]],
    likes: 0,
    views: 1,
    createdAt: new Date().toISOString()
  };

  products.unshift(newProduct);

  res.status(201).json({
    success: true,
    product: newProduct,
    _bug: bugList.length > 0 ? bugList[0] : null,
    message: '상품이 성공적으로 등록되었습니다.'
  });
});

// Update Product
app.patch('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }
  Object.assign(product, req.body);
  res.json({ success: true, product, message: '상품 정보가 수정되었습니다.' });
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }
  products.splice(idx, 1);
  res.json({ success: true, message: '상품이 삭제되었습니다.' });
});

// Like Product
app.post('/api/products/:id/like', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }
  if (!likedProductIds.includes(id)) {
    likedProductIds.push(id);
    product.likes += 1;
  }
  res.json({ success: true, likes: product.likes, liked: true });
});

app.delete('/api/products/:id/like', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  }
  likedProductIds = likedProductIds.filter(itemId => itemId !== id);
  product.likes = Math.max(0, product.likes - 1);
  res.json({ success: true, likes: product.likes, liked: false });
});

// Sellers
app.get('/api/sellers/:id', (req, res) => {
  const seller = sellers.find(s => s.id === req.params.id);
  if (!seller) {
    return res.status(404).json({ success: false, message: '판매자를 찾을 수 없습니다.' });
  }
  const sellerProducts = products.filter(p => p.sellerId === req.params.id);
  res.json({ success: true, seller, products: sellerProducts });
});

// Chats
app.get('/api/chats', (req, res) => {
  res.json({ success: true, chats });
});

app.get('/api/chats/:id', (req, res) => {
  const chat = chats.find(c => c.id === req.params.id);
  if (!chat) {
    return res.status(404).json({ success: false, message: '채팅방을 찾을 수 없습니다.' });
  }
  chat.unreadCount = 0;
  res.json({ success: true, chat });
});

app.post('/api/chats/:id/messages', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const chat = chats.find(c => c.id === id);
  if (!chat) {
    return res.status(404).json({ success: false, message: '채팅방을 찾을 수 없습니다.' });
  }
  const newMsg = {
    sender: 'me',
    text: text || '네 확인했습니다.',
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  };
  chat.messages.push(newMsg);
  chat.lastMessage = newMsg.text;
  chat.lastTime = newMsg.time;
  res.status(201).json({ success: true, message: newMsg });
});

// Reports (SEC-444)
app.post('/api/reports', (req, res) => {
  let { productId, selectedReason, rawSelectedReason, details } = req.body;

  let storedReason = selectedReason;
  let bugInfo = null;

  // INTENTIONAL BACKEND BUG: site053-SEC-444
  // When user selects a reason (e.g. "사기 의심"), the submitted reason is mapped to "부적절한 내용" or shifted!
  if (selectedReason === '사기 의심' || rawSelectedReason === '사기 의심' || req.headers['x-report-shifted'] === 'true') {
    storedReason = '부적절한 내용'; // Mismatched server value!
    bugInfo = attachBugMetadata(
      res,
      'SEC-444',
      '신고 모달에서 선택한 라디오 사유(사기 의심)와 서버에 전송/저장된 사유(부적절한 내용)가 불일치하는 오류',
      'medium',
      '/api/reports',
      'POST',
      'Form State',
      'radio-value-mismatch'
    );
  }

  const newReport = {
    id: `rep-${Date.now()}`,
    productId,
    reason: storedReason,
    originalSelection: selectedReason,
    details: details || '',
    createdAt: new Date().toISOString()
  };
  reports.push(newReport);

  res.status(201).json({
    success: true,
    report: newReport,
    _bug: bugInfo,
    message: '신고가 정상적으로 접수되었습니다.'
  });
});

// Profile / My Listings
app.get('/api/profile', (req, res) => {
  const myUser = sellers[0];
  const myProducts = products.filter(p => p.sellerId === myUser.id);
  const myLikes = products.filter(p => likedProductIds.includes(p.id));
  res.json({
    success: true,
    user: myUser,
    myProducts,
    myLikes,
    likedCount: myLikes.length
  });
});

app.get('/api/my-products', (req, res) => {
  const myProducts = products.filter(p => p.sellerId === sellers[0].id);
  res.json({ success: true, products: myProducts });
});

// SPA Fallback
app.get('*', (req, res) => {
  const indexHtml = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send('NearBuy Server Running on Port ' + PORT);
  }
});

app.listen(PORT, () => {
  console.log(`[NearBuy] site053 server listening on port ${PORT}`);
});
