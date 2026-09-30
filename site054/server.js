import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9953;

app.use(cors());
app.use(express.json());

// Serve static dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Mock In-Memory Database (50+ Books, 10 Categories)
// ----------------------------------------------------

const categories = [
  { id: 'cat-all', name: '전체', icon: '📚' },
  { id: 'cat-novel', name: '소설', icon: '📖' },
  { id: 'cat-self', name: '자기계발', icon: '💡' },
  { id: 'cat-economy', name: '경제/경영', icon: '📈' },
  { id: 'cat-it', name: 'IT', icon: '💻' },
  { id: 'cat-history', name: '역사', icon: '🏛️' },
  { id: 'cat-science', name: '과학', icon: '🔬' },
  { id: 'cat-humanities', name: '인문', icon: '📜' },
  { id: 'cat-travel', name: '여행', icon: '✈️' },
  { id: 'cat-cooking', name: '요리', icon: '🍳' },
  { id: 'cat-kids', name: '어린이', icon: '🎈' }
];

const sampleCovers = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e3edd8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'
];

let books = [
  { id: 'b-101', title: '불편한 편의점 (1, 2권 합본)', author: '김호연', publisher: '나무옆의자', publishedAt: '2023-04-10', isbn: '9791161571188', category: '소설', type: '전자책', description: '서울역 노숙자 출신 독고가 청파동 골목 모퉁이 편의점의 야간 알바를 맡으며 펼쳐지는 따뜻한 힐링 드라마.', pages: 80, cover: sampleCovers[0], rating: 4.8, reviewCount: 142, available: true, totalCopies: 5 },
  { id: 'b-102', title: '클린 코드 (Clean Code)', author: '로버트 C. 마틴', publisher: '인사이트', publishedAt: '2022-09-01', isbn: '9788966260959', category: 'IT', type: '전자책', description: '애자일 소프트웨어 장인 정신과 읽기 쉽고 유지보수하기 좋은 코드를 작성하는 핵심 원칙.', pages: 120, cover: sampleCovers[1], rating: 4.9, reviewCount: 98, available: true, totalCopies: 3 },
  { id: 'b-103', title: '역행자 확장판', author: '자청', publisher: '웅진지식하우스', publishedAt: '2023-05-20', isbn: '9788901272580', category: '자기계발', type: '종이책', description: '돈, 시간, 운명으로부터 완전한 자유를 얻는 7단계 인생 공략법.', pages: 360, cover: sampleCovers[2], rating: 4.6, reviewCount: 75, available: false, totalCopies: 4 },
  { id: 'b-104', title: '트렌드 코리아 2026', author: '김난도 외', publisher: '미래의창', publishedAt: '2025-10-15', isbn: '9788959897255', category: '경제/경영', type: '전자책', description: '급변하는 대한민국 소비 트렌드와 디지털 라이프스타일 전망.', pages: 90, cover: sampleCovers[3], rating: 4.5, reviewCount: 62, available: true, totalCopies: 6 },
  { id: 'b-105', title: '코스모스 (Cosmos 특별판)', author: '칼 세이건', publisher: '사이언스북스', publishedAt: '2021-01-20', isbn: '9788983711892', category: '과학', type: '종이책', description: '우주의 광대함과 인류 문명의 기원을 탐구하는 과학 교양서의 불멸의 고전.', pages: 540, cover: sampleCovers[4], rating: 4.9, reviewCount: 180, available: true, totalCopies: 2 },
  { id: 'b-106', title: '사피엔스: 유인원에서 사이보그까지', author: '유발 하라리', publisher: '김영사', publishedAt: '2020-03-15', isbn: '9788934972464', category: '역사', type: '전자책', description: '변방의 유인원이 어떻게 지구의 지배자가 되었는지 인류 역사의 거대한 궤적을 짚다.', pages: 100, cover: sampleCovers[5], rating: 4.8, reviewCount: 130, available: true, totalCopies: 5 },
  { id: 'b-107', title: '마흔에 읽는 쇼펜하우어', author: '강용수', publisher: '유노북스', publishedAt: '2023-09-07', isbn: '9791192300818', category: '인문', type: '전자책', description: '인생의 중반, 고통과 불안 속에서 나 자신을 긍정하는 철학적 통찰.', pages: 85, cover: sampleCovers[6], rating: 4.7, reviewCount: 88, available: true, totalCopies: 4 },
  { id: 'b-108', title: '파친코 1, 2권 세트', author: '이민진', publisher: '인플루엔셜', publishedAt: '2022-07-27', isbn: '9791168340526', category: '소설', type: '종이책', description: '일제강점기부터 1980년대까지 4대에 걸친 자이니치 가족의 강인한 생존 연대기.', pages: 420, cover: sampleCovers[7], rating: 4.9, reviewCount: 165, available: false, totalCopies: 3 },
  { id: 'b-109', title: '리팩터링 2판: 코드 구조 개선', author: '마틴 파울러', publisher: '한빛미디어', publishedAt: '2022-04-01', isbn: '9791162242742', category: 'IT', type: '전자책', description: '소프트웨어의 기능을 유지하면서 가독성과 성능을 극대화하는 실전 테크닉.', pages: 110, cover: sampleCovers[1], rating: 4.9, reviewCount: 54, available: true, totalCopies: 4 },
  { id: 'b-110', title: '원씽 (The One Thing)', author: '게리 켈러', publisher: '비즈니스북스', publishedAt: '2021-08-10', isbn: '9788998046378', category: '자기계발', type: '전자책', description: '복잡한 세상을 이기는 단 하나의 단순하고 강력한 몰입 원칙.', pages: 75, cover: sampleCovers[2], rating: 4.7, reviewCount: 92, available: true, totalCopies: 5 },
  { id: 'b-111', title: '머니 트렌드 2026', author: '정채진 외', publisher: '부키', publishedAt: '2025-11-01', isbn: '9788960519800', category: '경제/경영', type: '전자책', description: '금리, 환율, 부동산, 주식 시장의 거대한 흐름을 읽는 자산관리 가이드.', pages: 95, cover: sampleCovers[3], rating: 4.4, reviewCount: 41, available: true, totalCopies: 3 },
  { id: 'b-112', title: '어린 왕자 (초판본 디자인 에디션)', author: '생텍쥐페리', publisher: '열린책들', publishedAt: '2020-05-10', isbn: '9788932917245', category: '어린이', type: '전자책', description: '사막에 불시착한 조종사와 장미를 사랑한 어린 왕자의 영원한 동화.', pages: 60, cover: sampleCovers[0], rating: 4.9, reviewCount: 210, available: true, totalCopies: 8 },
  { id: 'b-113', title: '모던 자바스크립트 Deep Dive', author: '이웅모', publisher: '위키북스', publishedAt: '2022-10-01', isbn: '9791158392239', category: 'IT', type: '전자책', description: '자바스크립트의 기본 개념과 동작 원리를 완벽하게 파헤치는 필독서.', pages: 150, cover: sampleCovers[1], rating: 4.9, reviewCount: 115, available: true, totalCopies: 4 },
  { id: 'b-114', title: '달러구트 꿈 백화점 1, 2', author: '이미예', publisher: '팩토리나인', publishedAt: '2021-12-05', isbn: '9791165341909', category: '소설', type: '전자책', description: '잠들어야만 입장할 수 있는 신비로운 마을의 꿈 백화점에서 일어나는 감동 이야기.', pages: 80, cover: sampleCovers[0], rating: 4.8, reviewCount: 155, available: true, totalCopies: 6 },
  { id: 'b-115', title: '지리의 힘 (Prisoners of Geography)', author: '팀 마샬', publisher: '사이', publishedAt: '2021-03-20', isbn: '9791185799308', category: '역사', type: '종이책', description: '지리적 요건이 세계 각국의 역사와 정치, 패권을 어떻게 결정지었는가.', pages: 380, cover: sampleCovers[5], rating: 4.7, reviewCount: 78, available: true, totalCopies: 3 },
  { id: 'b-116', title: '침묵의 봄 (Silent Spring)', author: '레이첼 카슨', publisher: '에코리브르', publishedAt: '2020-04-15', isbn: '9788990048042', category: '과학', type: '전자책', description: '환경운동의 불씨를 지핀 현대 생태학의 기념비적인 명저.', pages: 90, cover: sampleCovers[4], rating: 4.8, reviewCount: 65, available: true, totalCopies: 5 },
  { id: 'b-117', title: '총, 균, 쇠 (Guns, Germs, and Steel)', author: '재레드 다이아몬드', publisher: '문학사상', publishedAt: '2022-01-10', isbn: '9788970127248', category: '역사', type: '종이책', description: '무기와 병원균, 금속이 문명의 불평등과 인류의 진화를 어떻게 이끌었는가.', pages: 750, cover: sampleCovers[5], rating: 4.9, reviewCount: 220, available: false, totalCopies: 2 },
  { id: 'b-118', title: '백종원의 집밥 메뉴 55', author: '백종원', publisher: '서울문화사', publishedAt: '2021-06-12', isbn: '9788926396483', category: '요리', type: '전자책', description: '누구나 냉장고 속 재료로 뚝딱 만들 수 있는 만능 집밥 레시피북.', pages: 70, cover: sampleCovers[6], rating: 4.6, reviewCount: 53, available: true, totalCopies: 4 },
  { id: 'b-119', title: '리얼 런던 & 파리 여행백과', author: '여행연구소', publisher: '한빛라이프', publishedAt: '2025-02-18', isbn: '9791188007421', category: '여행', type: '전자책', description: '유럽 2대 수도를 완벽하게 정복하는 최신 명소, 맛집, 교통 팁 완벽 수록.', pages: 85, cover: sampleCovers[7], rating: 4.5, reviewCount: 38, available: true, totalCopies: 5 },
  { id: 'b-120', title: '세이노의 가르침 (피보다 진하게 살아라)', author: '세이노', publisher: '데이원', publishedAt: '2023-03-02', isbn: '9791168473690', category: '자기계발', type: '종이책', description: '자수성가 사업가 세이노가 전하는 인생과 돈, 일에 관한 냉철한 통찰.', pages: 730, cover: sampleCovers[2], rating: 4.8, reviewCount: 190, available: true, totalCopies: 5 },
  // Additional Books for 50+ volume catalogue
  { id: 'b-121', title: 'React 18 & Next.js 완벽 가이드', author: '김개발', publisher: '길벗', publishedAt: '2025-08-01', isbn: '9791165219901', category: 'IT', type: '전자책', description: '서버 컴포넌트와 최신 앱 라우터 패턴을 기반으로 제작하는 엔터프라이즈 리액트 웹 개발.', pages: 120, cover: sampleCovers[1], rating: 4.9, reviewCount: 47, available: true, totalCopies: 4 },
  { id: 'b-122', title: '도시와 영혼: 건축 인문학 산책', author: '유현준', publisher: '을유문화사', publishedAt: '2023-11-20', isbn: '9788932474523', category: '인문', type: '전자책', description: '공간이 인간의 생각과 삶을 어떻게 바꾸는지 탐색하는 감각적인 건축 에세이.', pages: 95, cover: sampleCovers[6], rating: 4.7, reviewCount: 68, available: true, totalCopies: 3 },
  { id: 'b-123', title: '인플레이션에서 살아남기', author: '오건영', publisher: '페이지2북스', publishedAt: '2024-02-15', isbn: '9791190977821', category: '경제/경영', type: '전자책', description: '거시경제의 흐름과 금리 변화에 대처하는 현명한 투자 전략.', pages: 100, cover: sampleCovers[3], rating: 4.8, reviewCount: 84, available: true, totalCopies: 5 },
  { id: 'b-124', title: '마당을 나온 암탉', author: '황선미', publisher: '사계절', publishedAt: '2020-08-10', isbn: '9788971968710', category: '어린이', type: '전자책', description: '꿈을 찾아 양계장을 탈출한 잎싹의 감동적인 모성과 자유의 여정.', pages: 65, cover: sampleCovers[0], rating: 4.9, reviewCount: 140, available: true, totalCopies: 6 },
  { id: 'b-125', title: '이기적 유전자 (40주년 기념판)', author: '리처드 도킨스', publisher: '을유문화사', publishedAt: '2021-09-01', isbn: '9788932473908', category: '과학', type: '종이책', description: '진화의 주체는 유전자이며 인간은 유전자의 생존 기계라는 혁신적 패러다임.', pages: 560, cover: sampleCovers[4], rating: 4.8, reviewCount: 160, available: true, totalCopies: 3 },
  { id: 'b-126', title: '아주 작은 습관의 힘 (Atomic Habits)', author: '제임스 클리어', publisher: '비즈니스북스', publishedAt: '2022-03-10', isbn: '9788998046897', category: '자기계발', type: '전자책', description: '하루 1%의 미세한 변화가 만드는 놀라운 인생의 복리 효과.', pages: 85, cover: sampleCovers[2], rating: 4.9, reviewCount: 230, available: true, totalCopies: 7 },
  { id: 'b-127', title: '도쿄 골목 산책 노트', author: '이지은', publisher: '시공사', publishedAt: '2024-09-12', isbn: '9788952794215', category: '여행', type: '전자책', description: '시모키타자와부터 야네센까지 아기자기한 도쿄의 숨은 골목길 이야기.', pages: 75, cover: sampleCovers[7], rating: 4.6, reviewCount: 29, available: true, totalCopies: 4 },
  { id: 'b-128', title: '이탈리아 가정식 파스타의 정석', author: '파브리', publisher: '중앙북스', publishedAt: '2023-08-25', isbn: '9788927814238', category: '요리', type: '전자책', description: '미슐랭 셰프가 알려주는 정통 생면과 소스의 황금 배합 레시피.', pages: 80, cover: sampleCovers[6], rating: 4.7, reviewCount: 45, available: true, totalCopies: 3 },
  { id: 'b-129', title: '조선왕조실록 오백년', author: '이덕일', publisher: '다산초당', publishedAt: '2021-11-15', isbn: '9788963704251', category: '역사', type: '종이책', description: '태조 이성계부터 순종까지 파란만장했던 조선 왕실의 기록과 야사.', pages: 480, cover: sampleCovers[5], rating: 4.7, reviewCount: 82, available: true, totalCopies: 2 },
  { id: 'b-130', title: '프로그래머의 뇌 (The Programmer\'s Brain)', author: '펠리너 헤르만스', publisher: '제이펍', publishedAt: '2023-01-10', isbn: '9791192469737', category: 'IT', type: '전자책', description: '인지 과학으로 풀어낸 훌륭한 코딩 습관과 빠른 코드 해독 능력 훈련법.', pages: 95, cover: sampleCovers[1], rating: 4.8, reviewCount: 52, available: true, totalCopies: 4 },
  { id: 'b-131', title: '쇼코의 미소', author: '최은영', publisher: '문학동네', publishedAt: '2020-02-14', isbn: '9788954641630', category: '소설', type: '전자책', description: '사람과 사람 사이의 온기와 서늘함을 담담하게 포착한 젊은 작가상 수상작.', pages: 75, cover: sampleCovers[0], rating: 4.8, reviewCount: 110, available: true, totalCopies: 5 },
  { id: 'b-132', title: '돈의 심리학 (The Psychology of Money)', author: '모건 하우절', publisher: '인플루엔셜', publishedAt: '2022-05-18', isbn: '9791168340151', category: '경제/경영', type: '전자책', description: '부자가 되는 것보다 부자로 남는 것이 더 어려운 이유와 부의 법칙.', pages: 90, cover: sampleCovers[3], rating: 4.8, reviewCount: 175, available: true, totalCopies: 6 },
  { id: 'b-133', title: '양자역학이란 무엇인가', author: '짐 알칼릴리', publisher: '승산', publishedAt: '2022-07-01', isbn: '9788961390828', category: '과학', type: '종이책', description: '미시 세계의 불가사의한 법칙과 현대 물리학의 최전선을 알기 쉽게 설명.', pages: 310, cover: sampleCovers[4], rating: 4.6, reviewCount: 39, available: true, totalCopies: 3 },
  { id: 'b-134', title: '생각에 관한 생각 (Thinking, Fast and Slow)', author: '대니얼 카너먼', publisher: '김영사', publishedAt: '2021-04-20', isbn: '9788934981145', category: '인문', type: '전자책', description: '노벨경제학상 수상자가 밝혀낸 인간 뇌의 직관과 논리의 메커니즘.', pages: 130, cover: sampleCovers[6], rating: 4.8, reviewCount: 140, available: true, totalCopies: 4 },
  { id: 'b-135', title: '지구 끝의 온실', author: '김초엽', publisher: '자이언트북스', publishedAt: '2022-08-30', isbn: '9791191824001', category: '소설', type: '전자책', description: '더스트로 멸망한 세상 속에서 인류를 구원한 비밀스러운 온실 식물 이야기.', pages: 85, cover: sampleCovers[0], rating: 4.9, reviewCount: 185, available: true, totalCopies: 5 },
  { id: 'b-136', title: '파이썬 머신러닝 완벽 가이드', author: '권철민', publisher: '위키북스', publishedAt: '2024-03-01', isbn: '9791158394202', category: 'IT', type: '전자책', description: '사이킷런, 판다스, XGBoost 등을 활용한 실무 머신러닝 데이터 분석 실습.', pages: 140, cover: sampleCovers[1], rating: 4.8, reviewCount: 61, available: true, totalCopies: 3 },
  { id: 'b-137', title: '혼자 공부하는 컴퓨터 구조 + 운영체제', author: '강민철', publisher: '한빛미디어', publishedAt: '2023-08-16', isbn: '9791162243091', category: 'IT', type: '전자책', description: '전공자가 아니어도 쉽게 이해할 수 있는 핵심 CS 지식 기초 총정리.', pages: 115, cover: sampleCovers[1], rating: 4.9, reviewCount: 95, available: true, totalCopies: 5 },
  { id: 'b-138', title: '총균쇠 그 이후: 문명의 붕괴', author: '재레드 다이아몬드', publisher: '김영사', publishedAt: '2020-10-05', isbn: '9788934978824', category: '역사', type: '종이책', description: '과거 번영했던 위대한 문명들은 왜 생태학적 재난 앞에 무너졌는가.', pages: 620, cover: sampleCovers[5], rating: 4.7, reviewCount: 58, available: true, totalCopies: 2 },
  { id: 'b-139', title: '어린이 과학 형사대 CSI 1', author: '고희정', publisher: '가나출판사', publishedAt: '2021-05-12', isbn: '9788957365021', category: '어린이', type: '종이책', description: '사건 현장 속 과학 원리를 이용해 미스터리를 해결하는 어린이 추리 탐정 동화.', pages: 180, cover: sampleCovers[0], rating: 4.8, reviewCount: 77, available: true, totalCopies: 4 },
  { id: 'b-140', title: '홈카페 바리스타 핸드북', author: '커피마스터', publisher: '디자인이음', publishedAt: '2023-04-05', isbn: '9791188614530', category: '요리', type: '전자책', description: '원두 선별부터 핸드드립, 에스프레소 추출과 라떼 아트까지 마스터하는 홈카페 실전서.', pages: 75, cover: sampleCovers[6], rating: 4.6, reviewCount: 34, available: true, totalCopies: 4 },
  { id: 'b-141', title: '스위스 기차 힐링 여행', author: '박유진', publisher: '중앙아트', publishedAt: '2024-05-20', isbn: '9788927815129', category: '여행', type: '전자책', description: '만년설 알프스와 에메랄드빛 호수를 가로지르는 스위스 파노라마 열차 여행기.', pages: 80, cover: sampleCovers[7], rating: 4.7, reviewCount: 42, available: true, totalCopies: 5 },
  { id: 'b-142', title: '데미안 (Demian)', author: '헤르만 헤세', publisher: '민음사', publishedAt: '2021-02-10', isbn: '9788937460449', category: '소설', type: '전자책', description: '새는 알에서 나오기 위해 투쟁한다. 싱클레어의 자아 발견과 영혼의 성장기.', pages: 70, cover: sampleCovers[0], rating: 4.9, reviewCount: 240, available: true, totalCopies: 6 },
  { id: 'b-143', title: '인간관계론 (How to Win Friends)', author: '데일 카네기', publisher: '현대지성', publishedAt: '2021-07-15', isbn: '9791139700343', category: '자기계발', type: '전자책', description: '친구를 얻고 사람을 설득하는 백년의 불변 지혜와 소통 법칙.', pages: 85, cover: sampleCovers[2], rating: 4.8, reviewCount: 188, available: true, totalCopies: 5 },
  { id: 'b-144', title: '침묵을 삼킨 아이', author: '엘리자베스', publisher: '북폴리오', publishedAt: '2023-03-12', isbn: '9788937834521', category: '소설', type: '종이책', description: '사라진 기억과 비밀의 저택을 둘러싼 숨막히는 심리 서스펜스.', pages: 390, cover: sampleCovers[0], rating: 4.6, reviewCount: 51, available: true, totalCopies: 3 },
  { id: 'b-145', title: '쿠버네티스 인 액션 (Kubernetes in Action)', author: '마르코 루크샤', publisher: '에이콘', publishedAt: '2023-10-01', isbn: '9791161757827', category: 'IT', type: '전자책', description: '컨테이너 오케스트레이션과 대규모 클라우드 인프라 배포 실전 가이드.', pages: 130, cover: sampleCovers[1], rating: 4.8, reviewCount: 43, available: true, totalCopies: 4 },
  { id: 'b-146', title: '난중일기: 충무공의 기록', author: '이순신', publisher: '창비', publishedAt: '2020-04-28', isbn: '9788936461249', category: '역사', type: '전자책', description: '7년간의 임진왜란 전쟁터에서 기록한 이순신 장군의 고뇌와 불패의 리더십.', pages: 90, cover: sampleCovers[5], rating: 4.9, reviewCount: 125, available: true, totalCopies: 5 },
  { id: 'b-147', title: '세상의 모든 식물들', author: '베르너', publisher: '시공주니어', publishedAt: '2022-06-18', isbn: '9788952789129', category: '어린이', type: '종이책', description: '꽃과 나무의 흥미로운 생태와 비밀을 아름다운 일러스트로 풀어낸 어린이 식물도감.', pages: 160, cover: sampleCovers[0], rating: 4.8, reviewCount: 64, available: true, totalCopies: 4 },
  { id: 'b-148', title: '세상에서 가장 쉬운 본초강목 약선 요리', author: '이선생', publisher: '동녘', publishedAt: '2023-09-14', isbn: '9788972979124', category: '요리', type: '전자책', description: '사계절 제철 보약이 되는 한방 약선 국물과 건강 식단 비법.', pages: 70, cover: sampleCovers[6], rating: 4.5, reviewCount: 31, available: true, totalCopies: 4 },
  { id: 'b-149', title: '스페인 산티아고 순례길 걷기', author: '한순례', publisher: '바람', publishedAt: '2024-04-10', isbn: '9791191024510', category: '여행', type: '전자책', description: '800km 까미노 데 산티아고 길 위에서 비워내고 채운 40일간의 순례 일기.', pages: 80, cover: sampleCovers[7], rating: 4.7, reviewCount: 49, available: true, totalCopies: 5 },
  { id: 'b-150', title: '엔드 오브 타임 (Until the End of Time)', author: '브라이언 그린', publisher: '와이즈베리', publishedAt: '2021-12-15', isbn: '9791189995805', category: '과학', type: '전자책', description: '빅뱅에서 우주의 종말까지, 시간과 엔트로피와 의식의 기원을 묻다.', pages: 105, cover: sampleCovers[4], rating: 4.8, reviewCount: 68, available: true, totalCopies: 4 }
];

let loans = [
  { id: 'loan-01', bookId: 'b-101', bookTitle: '불편한 편의점 (1, 2권 합본)', cover: sampleCovers[0], userId: 'user-me', loanedAt: '2026-09-20', dueAt: '2026-10-04', extensionCount: 2, maxExtensions: 2, status: '대여 중', currentPage: 34, totalPages: 80 },
  { id: 'loan-02', bookId: 'b-102', bookTitle: '클린 코드 (Clean Code)', cover: sampleCovers[1], userId: 'user-me', loanedAt: '2026-09-22', dueAt: '2026-10-06', extensionCount: 1, maxExtensions: 2, status: '대여 중', currentPage: 58, totalPages: 120 },
  { id: 'loan-03', bookId: 'b-104', bookTitle: '트렌드 코리아 2026', cover: sampleCovers[3], userId: 'user-me', loanedAt: '2026-09-15', dueAt: '2026-09-29', extensionCount: 0, maxExtensions: 2, status: '대여 중', currentPage: 12, totalPages: 90 },
  { id: 'loan-04', bookId: 'b-106', bookTitle: '사피엔스: 유인원에서 사이보그까지', cover: sampleCovers[5], userId: 'user-me', loanedAt: '2026-09-10', dueAt: '2026-09-24', extensionCount: 0, maxExtensions: 2, status: '연체', currentPage: 88, totalPages: 100 },
  { id: 'loan-05', bookId: 'b-107', bookTitle: '마흔에 읽는 쇼펜하우어', cover: sampleCovers[6], userId: 'user-me', loanedAt: '2026-08-25', dueAt: '2026-09-08', extensionCount: 2, maxExtensions: 2, status: '반납 완료', currentPage: 85, totalPages: 85 },
  { id: 'loan-06', bookId: 'b-110', bookTitle: '원씽 (The One Thing)', cover: sampleCovers[2], userId: 'user-me', loanedAt: '2026-08-10', dueAt: '2026-08-24', extensionCount: 1, maxExtensions: 2, status: '반납 완료', currentPage: 75, totalPages: 75 },
  { id: 'loan-07', bookId: 'b-112', bookTitle: '어린 왕자 (초판본 디자인 에디션)', cover: sampleCovers[0], userId: 'user-me', loanedAt: '2026-09-24', dueAt: '2026-10-08', extensionCount: 0, maxExtensions: 2, status: '대여 중', currentPage: 5, totalPages: 60 },
  { id: 'loan-08', bookId: 'b-113', bookTitle: '모던 자바스크립트 Deep Dive', cover: sampleCovers[1], userId: 'user-me', loanedAt: '2026-09-18', dueAt: '2026-10-02', extensionCount: 1, maxExtensions: 2, status: '대여 중', currentPage: 110, totalPages: 150 },
  { id: 'loan-09', bookId: 'b-114', bookTitle: '달러구트 꿈 백화점 1, 2', cover: sampleCovers[0], userId: 'user-me', loanedAt: '2026-09-12', dueAt: '2026-09-26', extensionCount: 2, maxExtensions: 2, status: '대여 중', currentPage: 40, totalPages: 80 },
  { id: 'loan-10', bookId: 'b-116', bookTitle: '침묵의 봄 (Silent Spring)', cover: sampleCovers[4], userId: 'user-me', loanedAt: '2026-08-01', dueAt: '2026-08-15', extensionCount: 1, maxExtensions: 2, status: '반납 완료', currentPage: 90, totalPages: 90 },
  { id: 'loan-11', bookId: 'b-118', bookTitle: '백종원의 집밥 메뉴 55', cover: sampleCovers[6], userId: 'user-me', loanedAt: '2026-08-15', dueAt: '2026-08-29', extensionCount: 0, maxExtensions: 2, status: '반납 완료', currentPage: 70, totalPages: 70 },
  { id: 'loan-12', bookId: 'b-121', bookTitle: 'React 18 & Next.js 완벽 가이드', cover: sampleCovers[1], userId: 'user-me', loanedAt: '2026-09-25', dueAt: '2026-10-09', extensionCount: 0, maxExtensions: 2, status: '대여 중', currentPage: 15, totalPages: 120 },
  { id: 'loan-13', bookId: 'b-123', bookTitle: '인플레이션에서 살아남기', cover: sampleCovers[3], userId: 'user-me', loanedAt: '2026-09-21', dueAt: '2026-10-05', extensionCount: 1, maxExtensions: 2, status: '대여 중', currentPage: 48, totalPages: 100 },
  { id: 'loan-14', bookId: 'b-126', bookTitle: '아주 작은 습관의 힘 (Atomic Habits)', cover: sampleCovers[2], userId: 'user-me', loanedAt: '2026-07-20', dueAt: '2026-08-03', extensionCount: 2, maxExtensions: 2, status: '반납 완료', currentPage: 85, totalPages: 85 },
  { id: 'loan-15', bookId: 'b-135', bookTitle: '지구 끝의 온실', cover: sampleCovers[0], userId: 'user-me', loanedAt: '2026-09-19', dueAt: '2026-10-03', extensionCount: 0, maxExtensions: 2, status: '대여 중', currentPage: 22, totalPages: 85 }
];

let reviews = [
  { id: 'rev-01', bookId: 'b-101', userId: 'user-1', authorName: '김민수', rating: 5, content: '퇴근길에 읽으면서 정말 많은 위로와 감동을 받았습니다. 강력 추천합니다!', createdAt: '2026-09-20' },
  { id: 'rev-02', bookId: 'b-101', userId: 'user-2', authorName: '이지영', rating: 4, content: '독고 씨의 따뜻한 시선과 편의점 이웃들의 사연이 가슴을 울리네요.', createdAt: '2026-09-22' },
  { id: 'rev-03', bookId: 'b-101', userId: 'user-3', authorName: '박현우', rating: 5, content: '1권 보고 2권까지 쉼 없이 단숨에 읽어내려갔습니다.', createdAt: '2026-09-25' },
  { id: 'rev-04', bookId: 'b-102', userId: 'user-4', authorName: '최개발', rating: 5, content: '주니어 개발자 시절부터 지금까지 제 코딩 가치관을 만들어준 최고의 책입니다.', createdAt: '2026-09-15' },
  { id: 'rev-05', bookId: 'b-102', userId: 'user-5', authorName: '정코드', rating: 5, content: '리팩터링과 네이밍의 중요성을 깨닫게 해주는 소프트웨어의 바이블.', createdAt: '2026-09-18' },
  { id: 'rev-06', bookId: 'b-103', userId: 'user-6', authorName: '강성공', rating: 4, content: '실천 의지를 자극하는 내용이 많아 자기계발에 큰 동기부여가 되었습니다.', createdAt: '2026-09-10' },
  { id: 'rev-07', bookId: 'b-104', userId: 'user-7', authorName: '한미래', rating: 5, content: '내년도 마케팅과 비즈니스 기획을 세울 때 꼭 참고해야 할 필독서입니다.', createdAt: '2026-09-21' },
  { id: 'rev-08', bookId: 'b-105', userId: 'user-8', authorName: '윤우주', rating: 5, content: '칼 세이건의 문체는 과학 서적이 아니라 위대한 시를 읽는 듯합니다.', createdAt: '2026-09-05' },
  { id: 'rev-09', bookId: 'b-106', userId: 'user-9', authorName: '오역사', rating: 5, content: '인간이라는 종의 탄생과 진화를 완전히 새로운 시각으로 조망할 수 있었습니다.', createdAt: '2026-09-12' },
  { id: 'rev-10', bookId: 'b-107', userId: 'user-10', authorName: '서철학', rating: 4, content: '쇼펜하우어의 철학이 인생의 중반에 왜 필요한지 명쾌하게 짚어줍니다.', createdAt: '2026-09-14' },
  { id: 'rev-11', bookId: 'b-113', userId: 'user-11', authorName: '임자바', rating: 5, content: '자바스크립트 엔진과 실행 컨텍스트 이해에 이만한 책이 없습니다.', createdAt: '2026-09-16' },
  { id: 'rev-12', bookId: 'b-114', userId: 'user-12', authorName: '조꿈', rating: 5, content: '잠들기 전 읽으면 마음이 몽글몽글해지고 좋은 꿈을 꿀 것 같아요.', createdAt: '2026-09-19' },
  { id: 'rev-13', bookId: 'b-121', userId: 'user-13', authorName: '신리액트', rating: 5, content: '최신 React 18 서버 컴포넌트 실습 예제가 매우 실용적입니다.', createdAt: '2026-09-26' },
  { id: 'rev-14', bookId: 'b-126', userId: 'user-14', authorName: '류루틴', rating: 5, content: '매일 2분 규칙을 실천하면서 나쁜 습관을 끊고 아침 운동을 시작했습니다.', createdAt: '2026-09-08' },
  { id: 'rev-15', bookId: 'b-135', userId: 'user-15', authorName: '배SF', rating: 5, content: '더스트 세계관과 식물학적 상상력이 환상적으로 어우러진 수작입니다.', createdAt: '2026-09-23' }
];

let wishlists = ['b-101', 'b-102', 'b-105', 'b-108', 'b-113', 'b-117', 'b-121', 'b-126', 'b-135', 'b-142'];

// Helper to attach bug metadata
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
    service: 'BookNest',
    site: 'site054'
  });
});

// ----------------------------------------------------
// Categories
// ----------------------------------------------------
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories
  });
});

// ----------------------------------------------------
// Books Catalog API (SEC-450: empty query transition bug)
// ----------------------------------------------------
let lastNonEmptyQuery = '';

app.get('/api/books', (req, res) => {
  const { category, type, search, sort, available } = req.query;
  let result = [...books];

  let bugTriggered = null;

  // INTENTIONAL BACKEND BUG: site054-SEC-450
  // When a non-empty search query is sent, store it.
  // When the client subsequently sends search="" (or explicit empty string query param),
  // instead of resetting to the full catalog, retain the previous filtered search result!
  if (req.query.hasOwnProperty('search')) {
    if (search && search.trim() !== '') {
      lastNonEmptyQuery = search.trim();
      const q = lastNonEmptyQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    } else if (search === '' && lastNonEmptyQuery) {
      // INTENTIONAL BACKEND BUG: site054-SEC-450
      // Empty query string fails to transition back to full list; returns previous search query filter!
      const q = lastNonEmptyQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );

      bugTriggered = attachBugMetadata(
        res,
        'SEC-450',
        '검색어를 완전히 삭제했으나 이전 검색 결과가 초기 전체 목록으로 복원되지 않는 검색 상태 유지 오류',
        'medium',
        '/api/books',
        'GET',
        'Search State',
        'empty-query-transition'
      );
    }
  }

  // Category filter
  if (category && category !== '전체') {
    result = result.filter(b => b.category === category);
  }

  // Type filter
  if (type && type !== '전체') {
    result = result.filter(b => b.type === type);
  }

  // Available filter
  if (available === 'true') {
    result = result.filter(b => b.available);
  }

  // Sorting
  if (sort === 'popular') {
    result.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    result.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  res.json({
    success: true,
    total: result.length,
    books: result,
    ...(bugTriggered ? { _bug: bugTriggered } : {})
  });
});

// Book Detail
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: '도서를 찾을 수 없습니다.' });
  }

  const bookReviews = reviews.filter(r => r.bookId === book.id);
  res.json({
    success: true,
    book,
    reviews: bookReviews
  });
});

// Book Reviews List
app.get('/api/books/:id/reviews', (req, res) => {
  const bookReviews = reviews.filter(r => r.bookId === req.params.id);
  res.json({
    success: true,
    reviews: bookReviews
  });
});

// Create Review (SEC-447 & SEC-449)
app.post('/api/books/:id/reviews', (req, res) => {
  const bookId = req.params.id;
  const { rating, content, authorName = '도서관이용자' } = req.body;

  let bugTriggered = null;

  // INTENTIONAL BACKEND BUG: site054-SEC-447
  // When rating is 0 or falsy, `rating || 5` coerces rating 0 into default 5 stars!
  let savedRating;
  if (rating === 0 || rating === '0' || !rating) {
    // INTENTIONAL BACKEND BUG: site054-SEC-447
    savedRating = rating || 5;

    bugTriggered = attachBugMetadata(
      res,
      'SEC-447',
      '리뷰 별점 0점(미선택) 입력 시 기본값 강제 할당(rating || 5) 로직에 의해 5점으로 왜곡 저장되는 오류',
      'medium',
      `/api/books/${bookId}/reviews`,
      'POST',
      'Form Validation',
      'default-value-coercion'
    );
  } else {
    savedRating = parseInt(rating, 10);
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    bookId,
    userId: 'user-me',
    authorName,
    rating: savedRating,
    content: content || '유익하게 잘 읽었습니다.',
    createdAt: new Date().toISOString().split('T')[0]
  };

  reviews.unshift(newReview);

  // Update book review stats
  const book = books.find(b => b.id === bookId);
  if (book) {
    book.reviewCount = (book.reviewCount || 0) + 1;
  }

  res.status(201).json({
    success: true,
    review: newReview,
    ...(bugTriggered ? { _bug: bugTriggered } : {})
  });
});

// ----------------------------------------------------
// Loans API (SEC-446: max extension counter calculation bug)
// ----------------------------------------------------
app.get('/api/loans', (req, res) => {
  res.json({
    success: true,
    loans
  });
});

app.post('/api/loans', (req, res) => {
  const { bookId } = req.body;
  const book = books.find(b => b.id === bookId);
  if (!book) {
    return res.status(404).json({ success: false, message: '도서를 찾을 수 없습니다.' });
  }

  const now = new Date();
  const due = new Date();
  due.setDate(now.getDate() + 14);

  const newLoan = {
    id: `loan-${Date.now()}`,
    bookId: book.id,
    bookTitle: book.title,
    cover: book.cover,
    userId: 'user-me',
    loanedAt: now.toISOString().split('T')[0],
    dueAt: due.toISOString().split('T')[0],
    extensionCount: 0,
    maxExtensions: 2,
    status: '대여 중',
    currentPage: 1,
    totalPages: book.pages || 80
  };

  loans.unshift(newLoan);
  res.status(201).json({
    success: true,
    loan: newLoan
  });
});

app.get('/api/loans/:id', (req, res) => {
  const loan = loans.find(l => l.id === req.params.id);
  if (!loan) {
    return res.status(404).json({ success: false, message: '대여 정보를 찾을 수 없습니다.' });
  }
  res.json({ success: true, loan });
});

// Extend Loan (SEC-446)
app.post('/api/loans/:id/extend', (req, res) => {
  const loan = loans.find(l => l.id === req.params.id);
  if (!loan) {
    return res.status(404).json({ success: false, message: '대여 정보를 찾을 수 없습니다.' });
  }

  let bugTriggered = null;

  // INTENTIONAL BACKEND BUG: site054-SEC-446
  // Maximum allowed extension is 2 times.
  // But faulty check `extensionCount > 2` instead of `>= 2` permits extending a 3rd time (or more)!
  if (loan.extensionCount >= 2) {
    // INTENTIONAL BACKEND BUG: site054-SEC-446
    loan.extensionCount += 1;
    const curDue = new Date(loan.dueAt);
    curDue.setDate(curDue.getDate() + 7);
    loan.dueAt = curDue.toISOString().split('T')[0];

    bugTriggered = attachBugMetadata(
      res,
      'SEC-446',
      '대여 연장 한도(최대 2회)에 도달했으나 연장 횟수 검증 오류로 초과 연장이 비정상적으로 승인되는 오류',
      'medium',
      `/api/loans/${loan.id}/extend`,
      'POST',
      'Business Rule',
      'counter-calculation'
    );

    return res.json({
      success: true,
      loan,
      message: '대여 기간이 7일 연장되었습니다. (최대 한도 초과 연장 허용됨)',
      ...(bugTriggered ? { _bug: bugTriggered } : {})
    });
  }

  // Normal 1st or 2nd extension
  loan.extensionCount += 1;
  const curDue = new Date(loan.dueAt);
  curDue.setDate(curDue.getDate() + 7);
  loan.dueAt = curDue.toISOString().split('T')[0];

  res.json({
    success: true,
    loan,
    message: `대여 기간이 7일 연장되었습니다. (연장 횟수: ${loan.extensionCount}/${loan.maxExtensions})`
  });
});

// Return Loan
app.post('/api/loans/:id/return', (req, res) => {
  const loan = loans.find(l => l.id === req.params.id);
  if (!loan) {
    return res.status(404).json({ success: false, message: '대여 정보를 찾을 수 없습니다.' });
  }

  loan.status = '반납 완료';
  res.json({
    success: true,
    loan,
    message: '도서가 성공적으로 반납되었습니다.'
  });
});

// ----------------------------------------------------
// E-Book Reader API (SEC-448: Reader Upper Bound index-boundary bug)
// ----------------------------------------------------
app.get('/api/ebooks/:id/pages/:page', (req, res) => {
  const bookId = req.params.id;
  const pageNum = parseInt(req.params.page, 10);
  const book = books.find(b => b.id === bookId);

  const totalPages = book ? book.pages : 80;
  let bugTriggered = null;

  // INTENTIONAL BACKEND BUG: site054-SEC-448
  // When requested page > totalPages (e.g. 81 / 80), the server fails to clamp or reject,
  // returning page state 81 / 80 with blank/boundary overflow!
  if (pageNum > totalPages) {
    // INTENTIONAL BACKEND BUG: site054-SEC-448
    bugTriggered = attachBugMetadata(
      res,
      'SEC-448',
      '전자책 뷰어에서 마지막 페이지를 초과하는 페이지 번호(81/80) 요청 시 상한선 범위 검증 실패 오류',
      'medium',
      `/api/ebooks/${bookId}/pages/${pageNum}`,
      'GET',
      'Boundary Handling',
      'index-boundary'
    );

    return res.json({
      success: true,
      bookId,
      title: book ? book.title : '전자책',
      currentPage: pageNum,
      totalPages,
      content: `[범위 초과 페이지 ${pageNum}] 더 이상 읽을 수 있는 본문이 존재하지 않습니다.`,
      isOutOfBounds: true,
      ...(bugTriggered ? { _bug: bugTriggered } : {})
    });
  }

  // Normal Page Generation
  const chapters = [
    '제1장: 시작과 만남',
    '제2장: 골목길의 비밀',
    '제3장: 따뜻한 위로와 시선',
    '제4장: 다시 일어서는 용기',
    '제5장: 내일을 향한 발걸음'
  ];
  const chapterIdx = Math.min(chapters.length - 1, Math.floor((pageNum / totalPages) * chapters.length));

  res.json({
    success: true,
    bookId,
    title: book ? book.title : '전자책',
    currentPage: pageNum,
    totalPages,
    chapter: chapters[chapterIdx],
    content: `[${chapters[chapterIdx]}] (${pageNum}페이지)\n\n밤하늘에 수놓인 별빛처럼 책장을 넘길 때마다 마음속에 따뜻한 온기가 차오릅니다. 세상의 수많은 이야기 중 지금 이 순간 당신에게 닿은 이 문장들이 일상의 작은 쉼표와 든든한 위로가 되기를 바랍니다.\n\n지나온 시간의 발자국들이 모여 오늘의 우리를 만들었듯이, 책 속에 깃든 지혜와 사유는 더 넓은 세상을 바라보는 창이 되어줄 것입니다.`,
    isOutOfBounds: false
  });
});

// ----------------------------------------------------
// Wishlist API
// ----------------------------------------------------
app.get('/api/wishlist', (req, res) => {
  const wishBooks = books.filter(b => wishlists.includes(b.id));
  res.json({
    success: true,
    wishlist: wishBooks
  });
});

app.post('/api/wishlist/:bookId', (req, res) => {
  const { bookId } = req.params;
  if (!wishlists.includes(bookId)) {
    wishlists.push(bookId);
  }
  res.json({ success: true, wishlists });
});

app.delete('/api/wishlist/:bookId', (req, res) => {
  const { bookId } = req.params;
  wishlists = wishlists.filter(id => id !== bookId);
  res.json({ success: true, wishlists });
});

// ----------------------------------------------------
// User Profile
// ----------------------------------------------------
app.get('/api/profile', (req, res) => {
  const activeLoans = loans.filter(l => l.status === '대여 중');
  const returnedLoans = loans.filter(l => l.status === '반납 완료');
  const wishBooks = books.filter(b => wishlists.includes(b.id));

  res.json({
    success: true,
    user: {
      name: '이도서',
      membershipId: 'BN-2026-0953',
      grade: '열심 독서가 (VIP)',
      maxLoanLimit: 7,
      currentLoanCount: activeLoans.length,
      totalReadBooks: returnedLoans.length + 18,
      favoriteCategory: '소설 & IT'
    },
    activeLoans,
    returnedLoans,
    wishlist: wishBooks
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[BookNest] site054 library server listening on port ${PORT}`);
});
