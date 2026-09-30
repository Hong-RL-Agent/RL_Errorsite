import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9954;

app.use(cors());
app.use(express.json());

// Serve static dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Mock In-Memory Database (40+ Events, 15+ Venues, 50+ Schedules)
// ----------------------------------------------------

const categories = [
  { id: 'cat-all', name: '전체', icon: '🎟️' },
  { id: 'cat-musical', name: '뮤지컬', icon: '🎭' },
  { id: 'cat-play', name: '연극', icon: '🎬' },
  { id: 'cat-concert', name: '콘서트', icon: '🎤' },
  { id: 'cat-classic', name: '클래식', icon: '🎻' },
  { id: 'cat-exhibit', name: '전시', icon: '🎨' },
  { id: 'cat-festival', name: '페스티벌', icon: '🎪' },
  { id: 'cat-film', name: '영화제', icon: '🎞️' },
  { id: 'cat-family', name: '가족 공연', icon: '👨‍👩‍👧' },
  { id: 'cat-kids', name: '아동 공연', icon: '🎈' }
];

const samplePosters = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80'
];

const venues = [
  { id: 'v-01', name: '샤롯데씨어터', region: '서울', address: '서울 송파구 올림픽로 240', capacity: 1241, facilities: '주차장, 카페, 물품보관소, 오페라글라스 대여', description: '국내 최초의 뮤지컬 전용 극장' },
  { id: 'v-02', name: '예술의전당 오페라극장', region: '서울', address: '서울 서초구 남부순환로 2406', capacity: 2283, facilities: '지하주차장, 레스토랑, 카페, 수유실', description: '대한민국 대표 복합 문화예술 공간' },
  { id: 'v-03', name: '세종문화회관 대극장', region: '서울', address: '서울 종로구 세종대로 175', capacity: 3022, facilities: '주차장, 수유실, 장애인 편의시설, 기념품샵', description: '도심 속 대규모 문화예술 랜드마크' },
  { id: 'v-04', name: '블루스퀘어 신한카드홀', region: '서울', address: '서울 용산구 이태원로 294', capacity: 1766, facilities: '지하철 직결, 카페, 북파크, 드레스룸', description: '한남동 중심의 최첨단 전문 공연장' },
  { id: 'v-05', name: '국립극장 해오름극장', region: '서울', address: '서울 중구 장충단로 59', capacity: 1221, facilities: '셔틀버스, 야외광장, 레스토랑', description: '남산 자락의 유서 깊은 국립 예술의 전당' },
  { id: 'v-06', name: 'LG아트센터 서울 LG SIGNATURE 홀', region: '서울', address: '서울 강서구 마곡중앙로 136', capacity: 1335, facilities: '안도 타다오 건축, 파인다이닝, 테라스 카페', description: '마곡 서울식물원 옆 세계적 수준의 아트센터' },
  { id: 'v-07', name: '대학로 TOM(티오엠) 1관', region: '서울', address: '서울 종로구 대학로8가길 85', capacity: 335, facilities: '로비, 티켓부스, 대기실', description: '대학로 인기 창작 뮤지컬 및 연극 전용관' },
  { id: 'v-08', name: '올림픽공원 KSPO DOME', region: '서울', address: '서울 송파구 올림픽로 424', capacity: 14594, facilities: '대규모 주차장, 광장 푸드트럭, 인근 지하철역', description: '초대형 K-POP 및 글로벌 아티스트 콘서트 성지' },
  { id: 'v-09', name: '롯데콘서트홀', region: '서울', address: '서울 송파구 올림픽로 300 롯데월드몰 8층', capacity: 2036, facilities: '파이프오르간, 빈야드 스타일 객석, 라운지', description: '클래식 전용 어쿠스틱 콘서트홀' },
  { id: 'v-10', name: 'DDP(동대문디자인플라자) 배움터', region: '서울', address: '서울 중구 을지로 281', capacity: 800, facilities: '디자인샵, 카페, 전시관, 수유실', description: '글로벌 현대미술과 블록버스터 전시관' },
  { id: 'v-11', name: '성남아트센터 오페라하우스', region: '경기', address: '경기 성남시 분당구 성남대로 808', capacity: 1804, facilities: '야외공연장, 전시장, 무료 셔틀', description: '경기 남부 최대 규모의 종합 공연예술센터' },
  { id: 'v-12', name: '드림씨어터', region: '부산', address: '부산 남구 전포대로 133', capacity: 1727, facilities: '부산국제금융센터 연결, 전용 주차장', description: '부산 경남 최초의 초대형 뮤지컬 전용극장' },
  { id: 'v-13', name: '대구오페라하우스', region: '대구', address: '대구 북구 호암로 15', capacity: 1490, facilities: '오페라 전시실, 분수광장, 레스토랑', description: '대구국제오페라축제의 메인 무대' },
  { id: 'v-14', name: '고양아람누리 아람극장', region: '경기', address: '경기 고양시 일산동구 중앙로 1286', capacity: 1449, facilities: '미술관, 도서관, 야외카페', description: '일산 호수공원 인근의 복합 문화공간' },
  { id: 'v-15', name: '국립현대미술관 서울관', region: '서울', address: '서울 종로구 삼청로 30', capacity: 1000, facilities: '미술도서관, 야외마당, 디지털아카이브', description: '경복궁 옆 현대 미술과 미디어아트의 중심' }
];

let events = [
  { id: 'evt-101', title: '뮤지컬 〈오페라의 유령〉 한국어 공연', category: '뮤지컬', venueId: 'v-01', venueName: '샤롯데씨어터', startDate: '2026-09-01', endDate: '2026-11-30', ageLimit: '8세 이상', runtime: '150분', cast: '조승우, 전동석, 손지수, 송은혜', rating: 4.9, reviewCount: 248, status: '공연중', poster: samplePosters[0], description: '앤드루 로이드 웨버의 불후의 명작! 웅장한 샹들리에와 파리 오페라 하우스 지하 미궁에서 펼쳐지는 영원한 러브스토리.' },
  { id: 'evt-102', title: '뮤지컬 〈지킬 앤 하이드〉 20주년 기념', category: '뮤지컬', venueId: 'v-04', venueName: '블루스퀘어 신한카드홀', startDate: '2026-10-01', endDate: '2026-12-31', ageLimit: '14세 이상', runtime: '170분', cast: '홍광호, 박은태, 윤공주, 아이비', rating: 4.9, reviewCount: 310, status: '예매중', poster: samplePosters[1], description: '지금 이 순간! 인간의 이중성을 날카롭게 파고드는 파워풀한 넘버와 역대급 캐스팅의 전설적인 무대.' },
  { id: 'evt-103', title: '연극 〈아트 (ART)〉', category: '연극', venueId: 'v-07', venueName: '대학로 TOM(티오엠) 1관', startDate: '2026-09-15', endDate: '2026-11-15', ageLimit: '12세 이상', runtime: '100분', cast: '이순재, 백일섭, 노주현', rating: 4.8, reviewCount: 142, status: '공연중', poster: samplePosters[2], description: '하얀 캔버스 그림 한 점으로 시작된 세 남자의 오랜 우정과 솔직담백한 인간관계 블랙 코미디.' },
  { id: 'evt-104', title: '조성진 피아노 리사이틀 2026', category: '클래식', venueId: 'v-02', venueName: '예술의전당 오페라극장', startDate: '2026-10-18', endDate: '2026-10-18', ageLimit: '8세 이상', runtime: '110분', cast: '조성진(Piano)', rating: 5.0, reviewCount: 520, status: '예매중', poster: samplePosters[3], description: '쇼팽 콩쿠르 우승자 피아니스트 조성진이 선보이는 라벨, 드뷔시, 브람스의 완벽한 건반 미학.' },
  { id: 'evt-105', title: '2026 서울 재즈 페스티벌 (SJF)', category: '페스티벌', venueId: 'v-08', venueName: '올림픽공원 KSPO DOME', startDate: '2026-10-24', endDate: '2026-10-26', ageLimit: '전체 관람가', runtime: '480분', cast: '해외 헤드라이너 12팀, 국내 재즈 아티스트 20팀', rating: 4.9, reviewCount: 415, status: '예매중', poster: samplePosters[5], description: '가을 햇살 아래 푸른 잔디밭에서 펼쳐지는 아시아 최대 규모의 도심형 재즈 & 팝 뮤직 페스티벌.' },
  { id: 'evt-106', title: '모네 & 르누아르: 빛의 인상주의 특별전', category: '전시', venueId: 'v-10', venueName: 'DDP(동대문디자인플라자) 배움터', startDate: '2026-09-10', endDate: '2026-12-20', ageLimit: '전체 관람가', runtime: '자유 관람', cast: '프랑스 오르세 미술관 소장 원작 80점', rating: 4.7, reviewCount: 198, status: '전시중', poster: samplePosters[4], description: '파리 오르세 미술관 공식 소장품 원작으로 만나는 프랑스 인상주의 거장들의 찬란한 빛과 색채.' },
  { id: 'evt-107', title: '뮤지컬 〈레미제라블〉 월드투어', category: '뮤지컬', venueId: 'v-03', venueName: '세종문화회관 대극장', startDate: '2026-11-01', endDate: '2027-01-15', ageLimit: '8세 이상', runtime: '180분', cast: '웨스트엔드 오리지널 브로드웨이 캐스트', rating: 4.9, reviewCount: 290, status: '예매중', poster: samplePosters[0], description: '빅토르 위고의 대하소설을 무대로 옮긴 세계 4대 뮤지컬의 정수. 민중의 노래가 울려 퍼진다.' },
  { id: 'evt-108', title: '베를린 필하모닉 오케스트라 내한공연', category: '클래식', venueId: 'v-09', venueName: '롯데콘서트홀', startDate: '2026-10-29', endDate: '2026-10-30', ageLimit: '8세 이상', runtime: '120분', cast: '키릴 페트렌코(지휘), 베를린 필하모닉', rating: 5.0, reviewCount: 380, status: '예매중', poster: samplePosters[3], description: '세계 최고 교향악단 베를린 필하모닉이 선사하는 말러 교향곡 5번의 웅장한 울림.' },
  { id: 'evt-109', title: '가족 뮤지컬 〈알라딘과 마법램프〉', category: '가족 공연', venueId: 'v-11', venueName: '성남아트센터 오페라하우스', startDate: '2026-10-03', endDate: '2026-10-09', ageLimit: '36개월 이상', runtime: '70분', cast: '극단 가족무대 전문 연기자단', rating: 4.8, reviewCount: 110, status: '예매중', poster: samplePosters[7], description: '화려한 플라잉 양탄자 효과와 신나는 마법 판타지가 펼쳐지는 온 가족 힐링 뮤지컬.' },
  { id: 'evt-110', title: '어린이 과학 상상 매직쇼 〈사이언스 매직〉', category: '아동 공연', venueId: 'v-14', venueName: '고양아람누리 아람극장', startDate: '2026-09-27', endDate: '2026-10-15', ageLimit: '24개월 이상', runtime: '60분', cast: '마술사 박지훈, 사이언스팀', rating: 4.7, reviewCount: 85, status: '공연중', poster: samplePosters[7], description: '액체질소와 대형 공기대포 등 신기한 과학 실험과 일루전 마술이 결합된 에듀테인먼트 쇼.' },
  { id: 'evt-111', title: '제31회 부산국제영화제 (BIFF) 특별상영전', category: '영화제', venueId: 'v-12', venueName: '드림씨어터', startDate: '2026-10-07', endDate: '2026-10-16', ageLimit: '15세 이상', runtime: '120분', cast: '국내외 초청 감독 및 주연 배우 무대인사', rating: 4.8, reviewCount: 175, status: '예매중', poster: samplePosters[6], description: '아시아 영화의 중심! 칸, 베니스 수상작 및 올해 가장 주목받는 월드 프리미어 독립영화 상영.' },
  { id: 'evt-112', title: '국립현대미술관 올해의 작가상 2026', category: '전시', venueId: 'v-15', venueName: '국립현대미술관 서울관', startDate: '2026-09-01', endDate: '2027-01-30', ageLimit: '전체 관람가', runtime: '자유 관람', cast: '후보 작가 4인 특별 설치/미디어 프로젝트', rating: 4.6, reviewCount: 94, status: '전시중', poster: samplePosters[4], description: '한국 현대미술의 최전선에서 동시대 사회적 담론을 제시하는 권위 있는 대표 미술전.' },
  { id: 'evt-113', title: '뮤지컬 〈헤드윅〉 (HEDWIG)', category: '뮤지컬', venueId: 'v-04', venueName: '블루스퀘어 신한카드홀', startDate: '2026-10-15', endDate: '2026-12-15', ageLimit: '15세 이상', runtime: '135분', cast: '조정석, 유연석, 전동석, 제이민', rating: 4.9, reviewCount: 410, status: '예매중', poster: samplePosters[1], description: '동독 출신 트랜스젠더 록 가수 헤드윅의 상처와 사랑을 그린 폭발적인 라이브 록 뮤지컬.' },
  { id: 'evt-114', title: '연극 〈늘근도둑이야기〉', category: '연극', venueId: 'v-07', venueName: '대학로 TOM(티오엠) 1관', startDate: '2026-09-01', endDate: '2026-10-31', ageLimit: '12세 이상', runtime: '100분', cast: '박철민, 노진원, 태항호', rating: 4.7, reviewCount: 160, status: '공연중', poster: samplePosters[2], description: '대통령 취임 특사로 풀려난 두 늙은 도둑이 미술관 금고를 털려다 벌어지는 유쾌한 시사 풍자극.' },
  { id: 'evt-115', title: 'IU(아이유) 2026 월드투어 서울 앙코르', category: '콘서트', venueId: 'v-08', venueName: '올림픽공원 KSPO DOME', startDate: '2026-10-31', endDate: '2026-11-02', ageLimit: '8세 이상', runtime: '190분', cast: '아이유(IU)', rating: 5.0, reviewCount: 890, status: '예매중', poster: samplePosters[5], description: '믿고 듣는 독보적 음색 퀸 아이유의 역대급 히트곡과 웅장한 오케스트라 라이브 앙코르 콘서트.' },
  { id: 'evt-116', title: '대구국제오페라축제 〈라 트라비아타〉', category: '클래식', venueId: 'v-13', venueName: '대구오페라하우스', startDate: '2026-10-22', endDate: '2026-10-25', ageLimit: '8세 이상', runtime: '140분', cast: '이탈리아 베로나 오페라단 초청 주역', rating: 4.8, reviewCount: 130, status: '예매중', poster: samplePosters[3], description: '베르디의 가장 사랑받는 걸작 오페라! 비올레타의 비극적인 사랑과 축배의 노래.' },
  { id: 'evt-117', title: '뮤지컬 〈시카고〉 (CHICAGO)', category: '뮤지컬', venueId: 'v-06', venueName: 'LG아트센터 서울 LG SIGNATURE 홀', startDate: '2026-10-05', endDate: '2026-12-05', ageLimit: '14세 이상', runtime: '145분', cast: '최정원, 아이비, 티파니 영, 박건형', rating: 4.9, reviewCount: 320, status: '예매중', poster: samplePosters[0], description: '관능의 재즈와 밥 파시의 전설적인 안무! 1920년대 시카고 쿡카운티 교도소를 배경으로 한 걸작.' },
  { id: 'evt-118', title: '국립무용단 〈묵향〉', category: '가족 공연', venueId: 'v-05', venueName: '국립극장 해오름극장', startDate: '2026-10-10', endDate: '2026-10-14', ageLimit: '8세 이상', runtime: '70분', cast: '국립무용단 주역 무용수단', rating: 4.9, reviewCount: 145, status: '예매중', poster: samplePosters[6], description: '사군자의 고아한 품격을 한 폭의 수묵화처럼 무대 위에 피워낸 한국 전통 춤의 현대적 미학.' },
  { id: 'evt-119', title: '반 고흐 몰입형 미디어아트전 〈별이 빛나는 밤〉', category: '전시', venueId: 'v-10', venueName: 'DDP(동대문디자인플라자) 배움터', startDate: '2026-08-20', endDate: '2026-11-30', ageLimit: '전체 관람가', runtime: '자유 관람', cast: '빈센트 반 고흐 미디어 프로젝트팀', rating: 4.8, reviewCount: 280, status: '전시중', poster: samplePosters[4], description: '360도 초대형 프로젝션 맵핑과 클래식 서라운드 사운드로 재탄생한 반 고흐의 명화 속 산책.' },
  { id: 'evt-120', title: '어린이 클래식 음악동화 〈피터와 늑대〉', category: '아동 공연', venueId: 'v-02', venueName: '예술의전당 오페라극장', startDate: '2026-09-30', endDate: '2026-10-06', ageLimit: '36개월 이상', runtime: '60분', cast: '서울시향 앙상블, 나레이션 배한성', rating: 4.8, reviewCount: 92, status: '공연중', poster: samplePosters[7], description: '악기마다 살아 숨 쉬는 동물 캐릭터! 프로코피예프의 명곡을 재미있는 동화 구연으로 만나요.' },
  // Additional 20 items to reach 40+ events
  { id: 'evt-121', title: '뮤지컬 〈킹키부츠〉 10주년', category: '뮤지컬', venueId: 'v-04', venueName: '블루스퀘어 신한카드홀', startDate: '2026-09-05', endDate: '2026-11-20', ageLimit: '8세 이상', runtime: '155분', cast: '이석훈, 김성규, 강홍석, 최재림', rating: 4.9, reviewCount: 360, status: '공연중', poster: samplePosters[1], description: '폐업 위기의 구두공장을 살려낸 화려한 80cm 킹키부츠와 롤라의 환상적인 쇼!' },
  { id: 'evt-122', title: '연극 〈옥탑방고양이〉 15주년 기념', category: '연극', venueId: 'v-07', venueName: '대학로 TOM(티오엠) 1관', startDate: '2026-09-01', endDate: '2026-12-31', ageLimit: '12세 이상', runtime: '100분', cast: '대학로 드림팀 캐스트', rating: 4.7, reviewCount: 195, status: '공연중', poster: samplePosters[2], description: '이중계약으로 한 옥탑방에 모이게 된 두 청춘 남녀의 두근두근 로맨틱 코미디.' },
  { id: 'evt-123', title: '데이식스 (DAY6) 가을 콘서트 〈The Present〉', category: '콘서트', venueId: 'v-08', venueName: '올림픽공원 KSPO DOME', startDate: '2026-11-14', endDate: '2026-11-16', ageLimit: '8세 이상', runtime: '160분', cast: 'DAY6(성진, Young K, 원필, 도운)', rating: 5.0, reviewCount: 650, status: '예매중', poster: samplePosters[5], description: '청춘을 노래하는 K-POP 밴드 DAY6가 들려주는 떼창의 향연과 감성 폭발 밴드 사운드.' },
  { id: 'evt-124', title: '정명훈 & 원 코리아 오케스트라 특별연주회', category: '클래식', venueId: 'v-02', venueName: '예술의전당 오페라극장', startDate: '2026-10-12', endDate: '2026-10-12', ageLimit: '8세 이상', runtime: '110분', cast: '정명훈(지휘)', rating: 4.9, reviewCount: 210, status: '예매중', poster: samplePosters[3], description: '마에스트로 정명훈의 지휘봉 아래 펼쳐지는 베토벤 교향곡 9번 〈합창〉의 전율.' },
  { id: 'evt-125', title: '현대 사진의 거장전: 앙리 카르티에 브레송', category: '전시', venueId: 'v-15', venueName: '국립현대미술관 서울관', startDate: '2026-09-15', endDate: '2026-12-31', ageLimit: '전체 관람가', runtime: '자유 관람', cast: '결정적 순간 오리지널 빈티지 프린트 120점', rating: 4.8, reviewCount: 135, status: '전시중', poster: samplePosters[4], description: '찰나의 순간을 영원으로 기록한 20세기 포토저널리즘의 아버지 앙리 카르티에 브레송 회고전.' },
  { id: 'evt-126', title: '뮤지컬 〈프랑켄슈타인〉 10주년 기념공연', category: '뮤지컬', venueId: 'v-04', venueName: '블루스퀘어 신한카드홀', startDate: '2026-10-20', endDate: '2027-01-10', ageLimit: '14세 이상', runtime: '175분', cast: '유준상, 신성록, 규현, 박은태, 카이', rating: 4.9, reviewCount: 480, status: '예매중', poster: samplePosters[0], description: '신이 되려 했던 인간과 인간을 동경했던 피조물. 압도적인 무대 스케일의 K-뮤지컬 대작.' },
  { id: 'evt-127', title: '연극 〈리어왕〉 (King Lear)', category: '연극', venueId: 'v-06', venueName: 'LG아트센터 서울 LG SIGNATURE 홀', startDate: '2026-10-08', endDate: '2026-10-25', ageLimit: '14세 이상', runtime: '180분', cast: '이순재 대배우 주연 단독 무대', rating: 4.9, reviewCount: 230, status: '예매중', poster: samplePosters[2], description: '셰익스피어 4대 비극의 최고봉. 늙은 왕의 광기와 배신, 비극적 인간 본성의 대서사시.' },
  { id: 'evt-128', title: '2026 월드 DJ 페스티벌 (World DJ Festival)', category: '페스티벌', venueId: 'v-08', venueName: '올림픽공원 KSPO DOME', startDate: '2026-11-07', endDate: '2026-11-08', ageLimit: '19세 이상', runtime: '600분', cast: '세계 TOP 100 DJ 라인업', rating: 4.8, reviewCount: 310, status: '예매중', poster: samplePosters[5], description: '대한민국을 뜨겁게 달굴 일렉트로닉 댄스 뮤직의 정점! 레이저 쇼와 메가 스테이지.' },
  { id: 'evt-129', title: '국제 애니메이션 영화제 인 서울 (BIAF IN SEOUL)', category: '영화제', venueId: 'v-10', venueName: 'DDP(동대문디자인플라자) 배움터', startDate: '2026-10-17', endDate: '2026-10-21', ageLimit: '전체 관람가', runtime: '90분', cast: '아카데미 노미네이트 애니메이션 감독전', rating: 4.7, reviewCount: 88, status: '예매중', poster: samplePosters[6], description: '전 세계 최신 단편 & 장편 애니메이션을 한자리에서 만나는 환상적인 영상 축제.' },
  { id: 'evt-130', title: '가족 마술극 〈스노우맨 매직 파크〉', category: '가족 공연', venueId: 'v-11', venueName: '성남아트센터 오페라하우스', startDate: '2026-11-20', endDate: '2026-11-29', ageLimit: '24개월 이상', runtime: '65분', cast: '환상 일루전 팀', rating: 4.8, reviewCount: 79, status: '예매중', poster: samplePosters[7], description: '객석에 눈이 내리는 신기한 특수효과와 눈사람 친구들의 따뜻한 모험.' },
  { id: 'evt-131', title: '뮤지컬 〈위키드〉 오리지널 내한', category: '뮤지컬', venueId: 'v-01', venueName: '샤롯데씨어터', startDate: '2026-11-10', endDate: '2027-02-15', ageLimit: '8세 이상', runtime: '165분', cast: '브로드웨이 오리지널 투어팀', rating: 5.0, reviewCount: 520, status: '예매중', poster: samplePosters[0], description: '오즈의 마법사 숨겨진 이야기! 초록 마녀 엘파바와 글린다의 우정과 Defying Gravity.' },
  { id: 'evt-132', title: '빈 소년 합창단 신년음악회', category: '클래식', venueId: 'v-09', venueName: '롯데콘서트홀', startDate: '2026-12-24', endDate: '2026-12-25', ageLimit: '5세 이상', runtime: '95분', cast: '빈 소년 합창단 (슈베르트 코어)', rating: 4.9, reviewCount: 295, status: '예매중', poster: samplePosters[3], description: '520년 전통 천상의 목소리가 전하는 크리스마스 캐롤과 아름다운 오스트리아 왈츠.' },
  { id: 'evt-133', title: '성시경 2026 가을 발라드 콘서트', category: '콘서트', venueId: 'v-08', venueName: '올림픽공원 KSPO DOME', startDate: '2026-10-23', endDate: '2026-10-25', ageLimit: '8세 이상', runtime: '180분', cast: '성시경', rating: 4.9, reviewCount: 460, status: '예매중', poster: samplePosters[5], description: '성발라의 감미로운 목소리로 듣는 가을밤 낭만 이야기. 전석 매진 신화의 발라드 콘서트.' },
  { id: 'evt-134', title: '앙상블 디토 10주년 리유니언 콘서트', category: '클래식', venueId: 'v-02', venueName: '예술의전당 오페라극장', startDate: '2026-11-05', endDate: '2026-11-05', ageLimit: '8세 이상', runtime: '100분', cast: '리처드 용재 오닐, 스테판 피 재키브, 지용', rating: 4.9, reviewCount: 185, status: '예매중', poster: samplePosters[3], description: '클래식계의 아이돌 앙상블 디토의 눈부신 귀환! 브람스 피아노 4중주의 열정.' },
  { id: 'evt-135', title: '어린이 국악 뮤지컬 〈쿵덕쿵 호랑이〉', category: '아동 공연', venueId: 'v-05', venueName: '국립극장 해오름극장', startDate: '2026-10-01', endDate: '2026-10-09', ageLimit: '36개월 이상', runtime: '55분', cast: '국립국악관현악단', rating: 4.8, reviewCount: 68, status: '공연중', poster: samplePosters[7], description: '신명 나는 사물놀이 장단과 장구 소리로 배우는 전래동화 호랑이와 곶감.' },
  { id: 'evt-136', title: '살바도르 달리 & 초현실주의 특별전', category: '전시', venueId: 'v-10', venueName: 'DDP(동대문디자인플라자) 배움터', startDate: '2026-09-01', endDate: '2026-11-15', ageLimit: '전체 관람가', runtime: '자유 관람', cast: '스페인 달리 재단 공식 소장 회화/조각 100점', rating: 4.7, reviewCount: 190, status: '전시중', poster: samplePosters[4], description: '흘러내리는 시계와 무의식의 세계! 초현실주의 거장 살바도르 달리의 몽환적 예술 세계.' },
  { id: 'evt-137', title: '연극 〈라이어 1탄〉 (원조 국민 코미디)', category: '연극', venueId: 'v-07', venueName: '대학로 TOM(티오엠) 1관', startDate: '2026-09-01', endDate: '2026-12-31', ageLimit: '12세 이상', runtime: '100분', cast: '극단 파파프로덕션', rating: 4.8, reviewCount: 270, status: '공연중', poster: samplePosters[2], description: '쉿! 거짓말이 거짓말을 낳는 기막힌 반전과 쉴 새 없이 터지는 웃음 폭탄.' },
  { id: 'evt-138', title: '월드 시네마 필름 페스티벌 2026', category: '영화제', venueId: 'v-03', venueName: '세종문화회관 대극장', startDate: '2026-11-20', endDate: '2026-11-25', ageLimit: '12세 이상', runtime: '110분', cast: '영화음악 오케스트라 실황 연주', rating: 4.8, reviewCount: 150, status: '예매중', poster: samplePosters[6], description: '라라랜드, 인터스텔라, 시네마 천국 영화음악을 풀 오케스트라 라이브로 감상하는 시네 콘서트.' },
  { id: 'evt-139', title: '뮤지컬 〈몬테크리스토〉 All-Star', category: '뮤지컬', venueId: 'v-06', venueName: 'LG아트센터 서울 LG SIGNATURE 홀', startDate: '2026-11-25', endDate: '2027-02-10', ageLimit: '8세 이상', runtime: '160분', cast: '이규형, 서인국, 고은성, 선민, 이지혜', rating: 4.9, reviewCount: 340, status: '예매중', poster: samplePosters[0], description: '정의는 갖는 자의 것, 사랑은 주는 자의 것! 짜릿한 통쾌함을 선사하는 복수와 용서의 대서사시.' },
  { id: 'evt-140', title: '가족 서커스 판타지 〈태양의 서커스: 쿠자〉', category: '가족 공연', venueId: 'v-08', venueName: '올림픽공원 KSPO DOME', startDate: '2026-11-10', endDate: '2026-12-25', ageLimit: '전체 관람가', runtime: '130분', cast: '실크 드 솔레이유 오리지널 아티스트 50인', rating: 5.0, reviewCount: 780, status: '예매중', poster: samplePosters[5], description: '중력을 거스르는 인간 승리의 곡예와 화려한 광대극! 전 세계 1억 명이 극찬한 명불허전 서커스.' }
];

let reviews = [
  { id: 'rev-01', eventId: 'evt-101', nickname: '뮤지컬러버', rating: 5, content: '조승우 배우님의 압도적인 성량과 연기력에 소름이 돋았습니다. 샹들리에 추락 씬은 평생 잊지 못할 명장면입니다.', createdAt: '2026-09-20' },
  { id: 'rev-02', eventId: 'evt-101', nickname: '샤롯데단골', rating: 5, content: '샤롯데씨어터 음향이 정말 좋아서 오케스트라 반주와 배우들 하모니가 완벽했습니다.', createdAt: '2026-09-22' },
  { id: 'rev-03', eventId: 'evt-102', nickname: '지금이순간', rating: 5, content: '홍광호 지킬의 넘버 소화력은 감히 인간의 영역이 아닙니다. 인터미션 때 박수가 끊이지 않았어요.', createdAt: '2026-09-24' },
  { id: 'rev-04', eventId: 'evt-103', nickname: '대학로산책', rating: 4, content: '배우들의 티키타카 대사 호흡이 너무 찰져서 러닝타임 내내 배꼽 잡고 웃었습니다.', createdAt: '2026-09-18' },
  { id: 'rev-05', eventId: 'evt-104', nickname: '피아노포르테', rating: 5, content: '조성진의 터치는 한 음 한 음이 보석처럼 빛납니다. 앙코르 3곡까지 최고의 밤이었습니다.', createdAt: '2026-09-15' },
  { id: 'rev-06', eventId: 'evt-105', nickname: '재즈매니아', rating: 5, content: '선선한 가을 바람 맞으며 잔디밭에서 맥주와 함께 즐기는 서재페는 진리입니다!', createdAt: '2026-09-21' },
  { id: 'rev-07', eventId: 'evt-106', nickname: '아트큐레이터', rating: 4, content: '오르세 미술관 소장 원작들이라 붓 터치의 생생한 질감이 그대로 느껴져서 감격스러웠습니다.', createdAt: '2026-09-23' },
  { id: 'rev-08', eventId: 'evt-115', nickname: '유애나10기', rating: 5, content: '아이유 라이브 음색은 음원을 씹어먹는 수준입니다. 3시간 30분 동안 꽉 채운 힐링 콘서트 최고예요.', createdAt: '2026-09-25' }
];

let favorites = ['evt-101', 'evt-102', 'evt-104', 'evt-105', 'evt-115', 'evt-126'];

// Generate 50+ Schedules with Seat maps
let schedules = [];
let seatDatastore = {};

events.forEach(evt => {
  ['2026-10-10', '2026-10-11', '2026-10-12'].forEach((date, dIdx) => {
    ['14:00', '19:00'].forEach((time, tIdx) => {
      const schId = `sch-${evt.id}-${dIdx}-${tIdx}`;
      schedules.push({
        id: schId,
        eventId: evt.id,
        eventTitle: evt.title,
        venueName: evt.venueName,
        date,
        time,
        availableSeats: 32,
        totalSeats: 40
      });

      // Generate Seats (Rows A, B, C, D / Numbers 1 to 10)
      const seatList = [];
      ['A', 'B', 'C', 'D'].forEach(row => {
        for (let num = 1; num <= 10; num++) {
          // INTENTIONAL BACKEND BUG: site055-SEC-451 setup
          // Internal canonical ID is stored as `A01`, `A02` (padded) or `A1` based on parity
          const paddedNum = num < 10 ? `0${num}` : `${num}`;
          const seatId = `${row}${paddedNum}`; // e.g. A01, A02 ... A10
          seatList.push({
            id: seatId,
            displayCode: `${row}${num}`, // A1, A2 ... A10
            row,
            number: num,
            grade: row === 'A' ? 'VIP' : row === 'B' ? 'R' : 'S',
            price: row === 'A' ? 150000 : row === 'B' ? 120000 : 90000,
            status: (num === 4 || num === 5) ? 'sold' : 'available'
          });
        }
      });
      seatDatastore[schId] = seatList;
    });
  });
});

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
    service: 'CulturePick',
    site: 'site055'
  });
});

// ----------------------------------------------------
// Categories
// ----------------------------------------------------
app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories });
});

// ----------------------------------------------------
// Events Catalog API
// ----------------------------------------------------
app.get('/api/events', (req, res) => {
  const { category, region, search, sort, status } = req.query;
  let result = [...events];

  if (category && category !== '전체') {
    result = result.filter(e => e.category === category);
  }

  if (region && region !== '전체') {
    const venueMatches = venues.filter(v => v.region === region).map(v => v.id);
    result = result.filter(e => venueMatches.includes(e.venueId));
  }

  if (status && status !== '전체') {
    result = result.filter(e => e.status === status);
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    result = result.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.venueName.toLowerCase().includes(q) ||
      e.cast.toLowerCase().includes(q)
    );
  }

  if (sort === 'popular') {
    result.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }

  res.json({
    success: true,
    total: result.length,
    events: result
  });
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: '공연을 찾을 수 없습니다.' });
  }
  const venue = venues.find(v => v.id === event.venueId);
  const eventReviews = reviews.filter(r => r.eventId === event.id);

  res.json({
    success: true,
    event,
    venue,
    reviews: eventReviews
  });
});

app.get('/api/events/:id/reviews', (req, res) => {
  const eventReviews = reviews.filter(r => r.eventId === req.params.id);
  res.json({ success: true, reviews: eventReviews });
});

// Create Review (SEC-453: Whitespace only validation bug)
app.post('/api/events/:id/reviews', (req, res) => {
  const eventId = req.params.id;
  const { rating, content, nickname = '문화시민' } = req.body;

  let bugTriggered = null;

  // INTENTIONAL BACKEND BUG: site055-SEC-453
  // When content contains only spaces (`"   "`), the server does not call `.trim()`,
  // allowing a blank review to be accepted and saved as valid!
  const isOnlyWhitespace = typeof content === 'string' && content.length > 0 && content.trim().length === 0;

  if (isOnlyWhitespace) {
    // INTENTIONAL BACKEND BUG: site055-SEC-453
    bugTriggered = attachBugMetadata(
      res,
      'SEC-453',
      '공연 후기 작성 시 공백 문자열만 입력했으나 trim 검증 누락으로 공백 후기가 정상 저장되는 오류',
      'medium',
      `/api/events/${eventId}/reviews`,
      'POST',
      'Input Validation',
      'whitespace-validation'
    );
  } else if (!content || content.trim().length === 0) {
    return res.status(400).json({ success: false, message: '후기 내용을 입력해주세요.' });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    eventId,
    nickname,
    rating: parseInt(rating, 10) || 5,
    content: content || '',
    createdAt: new Date().toISOString().split('T')[0]
  };

  reviews.unshift(newReview);

  res.status(201).json({
    success: true,
    review: newReview,
    ...(bugTriggered ? { _bug: bugTriggered } : {})
  });
});

// ----------------------------------------------------
// Schedules & Seats API (SEC-451: Row/Number identifier coercion mismatch)
// ----------------------------------------------------
app.get('/api/events/:id/schedules', (req, res) => {
  const eventSchedules = schedules.filter(s => s.eventId === req.params.id);
  res.json({ success: true, schedules: eventSchedules });
});

app.get('/api/schedules/:id/seats', (req, res) => {
  const schId = req.params.id;
  const seats = seatDatastore[schId] || [];

  res.json({
    success: true,
    scheduleId: schId,
    seats
  });
});

// Select Seat (SEC-451)
app.post('/api/schedules/:id/seats/select', (req, res) => {
  const schId = req.params.id;
  const { seatId } = req.body; // e.g. "A1" vs "A01"
  const seats = seatDatastore[schId] || [];

  let bugTriggered = null;

  // INTENTIONAL BACKEND BUG: site055-SEC-451
  // If client submits unpadded "A1" (number 1), but datastore holds "A01",
  // direct string comparison fails unless normalized!
  const targetSeat = seats.find(s => s.id === seatId || s.displayCode === seatId);

  if (seatId && (seatId === 'A1' || seatId === 'A01' || seatId.match(/^[A-D]1$/))) {
    // INTENTIONAL BACKEND BUG: site055-SEC-451
    bugTriggered = attachBugMetadata(
      res,
      'SEC-451',
      '좌석 식별자의 row와 number 결합 시 선행 0 패딩 정규화 불일치로 동일 좌석이 다른 ID(A1 vs A01)로 처리되는 오류',
      'medium',
      `/api/schedules/${schId}/seats/select`,
      'POST',
      'Data Normalization',
      'identifier-coercion'
    );
  }

  if (!targetSeat) {
    return res.status(404).json({
      success: false,
      message: `좌석 [${seatId}]을(를) 찾을 수 없습니다. (식별자 정규화 불일치)`,
      ...(bugTriggered ? { _bug: bugTriggered } : {})
    });
  }

  targetSeat.status = targetSeat.status === 'selected' ? 'available' : 'selected';

  res.json({
    success: true,
    seat: targetSeat,
    message: `좌석 ${targetSeat.displayCode} (${targetSeat.grade}석) 선택 상태가 변경되었습니다.`,
    ...(bugTriggered ? { _bug: bugTriggered } : {})
  });
});

// ----------------------------------------------------
// Venues API
// ----------------------------------------------------
app.get('/api/venues', (req, res) => {
  res.json({ success: true, venues });
});

app.get('/api/venues/:id', (req, res) => {
  const venue = venues.find(v => v.id === req.params.id);
  if (!venue) {
    return res.status(404).json({ success: false, message: '공연장을 찾을 수 없습니다.' });
  }
  const venueEvents = events.filter(e => e.venueId === venue.id);
  res.json({ success: true, venue, events: venueEvents });
});

// ----------------------------------------------------
// Recommendations & Favorites & MyPage
// ----------------------------------------------------
app.get('/api/recommendations', (req, res) => {
  const hotEvents = events.slice(0, 6);
  const featuredVenues = venues.slice(0, 4);
  res.json({ success: true, hotEvents, featuredVenues });
});

app.post('/api/events/:id/favorite', (req, res) => {
  const { id } = req.params;
  if (!favorites.includes(id)) {
    favorites.push(id);
  }
  res.json({ success: true, favorites });
});

app.delete('/api/events/:id/favorite', (req, res) => {
  const { id } = req.params;
  favorites = favorites.filter(f => f !== id);
  res.json({ success: true, favorites });
});

app.get('/api/mypage', (req, res) => {
  const myFavEvents = events.filter(e => favorites.includes(e.id));
  res.json({
    success: true,
    user: {
      name: '김컬처',
      membershipGrade: '골드 컬처 마니아',
      points: 4500,
      totalWatched: 18,
      favoriteGenre: '뮤지컬 & 클래식'
    },
    favorites: myFavEvents,
    recentBookings: [
      { id: 'bk-01', eventTitle: '뮤지컬 〈오페라의 유령〉 한국어 공연', venueName: '샤롯데씨어터', date: '2026-10-10 14:00', seat: 'VIP석 A05', status: '예매완료' },
      { id: 'bk-02', eventTitle: '조성진 피아노 리사이틀 2026', venueName: '예술의전당 오페라극장', date: '2026-10-18 19:00', seat: 'R석 B08', status: '관람예정' }
    ]
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[CulturePick] site055 ticketing server listening on port ${PORT}`);
});
