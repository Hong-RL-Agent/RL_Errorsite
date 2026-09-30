import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9941;

app.use(cors());
app.use(express.json());

// In-Memory Database State
const db = {
  users: [
    {
      id: 'user-101',
      name: '이수민',
      email: 'sumin.fit@example.com',
      membership: 'FitFlow 프리미엄 VIP',
      phone: '010-4821-7734',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      credits: 450000,
      joinedDate: '2025-01-15'
    }
  ],
  instructors: [
    { id: 'inst-01', name: '김서연', specialization: '빈야사 & 힐링 요가', experience: '8년 경력', rating: 4.9, reviewsCount: 142, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { id: 'inst-02', name: '박지훈', specialization: '파워 바디빌딩 & 체형 교정 PT', experience: '10년 경력', rating: 5.0, reviewsCount: 210, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'inst-03', name: '이하늘', specialization: '클래식 필라테스 & 리포머', experience: '6년 경력', rating: 4.8, reviewsCount: 98, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { id: 'inst-04', name: '정민지', specialization: '고강도 스피닝 & 유산소 버닝', experience: '5년 경력', rating: 4.9, reviewsCount: 165, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'inst-05', name: '최유진', specialization: '크로스핏 레벨2 & 케틀벨', experience: '7년 경력', rating: 4.9, reviewsCount: 120, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
    { id: 'inst-06', name: '강현우', specialization: '기능성 트레이닝 & 재활 PT', experience: '9년 경력', rating: 4.8, reviewsCount: 88, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'inst-07', name: '윤서아', specialization: '마인드풀니스 & 싱잉볼 명상', experience: '7년 경력', rating: 5.0, reviewsCount: 75, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
    { id: 'inst-08', name: '오세훈', specialization: '코어 강화 & 하체 밸런스', experience: '6년 경력', rating: 4.7, reviewsCount: 64, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' }
  ],
  classes: [
    { id: 'class-01', title: '모닝 선라이즈 빈야사 요가', category: 'yoga', instructor: '김서연', location: '강남 스튜디오 A', price: 35000, capacity: 12, remainingSeats: 1, rating: 4.9, duration: '60분', schedule: '월/수/금 07:00', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80', description: '하루의 에너지를 깨우는 활력 넘치는 모닝 요가 플로우 클래스입니다.' },
    { id: 'class-02', title: '1:1 맞춤형 체형 교정 PT', category: 'pt', instructor: '박지훈', location: '역삼 프리미엄 웰니스짐', price: 85000, capacity: 1, remainingSeats: 1, rating: 5.0, duration: '50분', schedule: '화/목 19:00', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80', description: '골반 불균형, 라운드숄더 개선 및 근력 증진을 위한 1:1 맞춤 프로그램.' },
    { id: 'class-03', title: '체어 & 리포머 비기너 필라테스', category: 'pilates', instructor: '이하늘', location: '선릉 필라테스 라운지', price: 40000, capacity: 6, remainingSeats: 2, rating: 4.8, duration: '50분', schedule: '월/수 10:00', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80', description: '기구 필라테스의 기초 호흡과 코어 세팅을 집중적으로 배우는 입문 코스.' },
    { id: 'class-04', title: '칼로리 익스트림 스피닝 러쉬', category: 'spinning', instructor: '정민지', location: '신논현 다이나믹 스튜디오', price: 32000, capacity: 20, remainingSeats: 5, rating: 4.9, duration: '45분', schedule: '화/목 20:00', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500&auto=format&fit=crop&q=80', description: '신나는 비트와 인터벌 라이딩으로 최대 800kcal를 연소하는 파워 스피닝.' },
    { id: 'class-05', title: '크로스핏 부트캠프 & WOD', category: 'crossfit', instructor: '최유진', location: '삼성 박스 센터', price: 38000, capacity: 15, remainingSeats: 4, rating: 4.9, duration: '60분', schedule: '월/금 19:30', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80', description: '전신 심폐 지구력과 스트렝스를 극대화하는 매일 새로운 WOD 운동.' },
    { id: 'class-06', title: '심신 안정 싱잉볼 & 사운드 명상', category: 'meditation', instructor: '윤서아', location: '청담 마인드 스파', price: 45000, capacity: 8, remainingSeats: 3, rating: 5.0, duration: '70분', schedule: '토 14:00', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80', description: '싱잉볼의 파동과 호흡 가이드로 깊은 이완과 뇌파 안정을 돕는 힐링 테라피.' },
    { id: 'class-07', title: '근막 이완 폼롤러 스트레칭 플로우', category: 'yoga', instructor: '김서연', location: '강남 스튜디오 B', price: 30000, capacity: 10, remainingSeats: 6, rating: 4.8, duration: '50분', schedule: '수/일 11:00', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80', description: '뭉친 승모근과 하체 부종을 풀어주는 체계적인 근막 이완 테라피.' },
    { id: 'class-08', title: '파워 바벨 & 데드리프트 마스터', category: 'pt', instructor: '강현우', location: '역삼 웰니스짐 2관', price: 65000, capacity: 4, remainingSeats: 1, rating: 4.9, duration: '60분', schedule: '토 11:00', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80', description: '스쿼트, 벤치프레스, 데드리프트 3대 운동의 안전하고 완벽한 자세 교정.' },
    { id: 'class-09', title: '코어 버닝 캐딜락 필라테스', category: 'pilates', instructor: '이하늘', location: '선릉 필라테스 라운지', price: 42000, capacity: 6, remainingSeats: 3, rating: 4.7, duration: '50분', schedule: '화/목 14:00', image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500&auto=format&fit=crop&q=80', description: '캐딜락 스프링 저항을 활용해 복부와 둔근 코어를 단단하게 단련합니다.' },
    { id: 'class-10', title: '나이트 릴렉스 인 요가 & 힐링', category: 'yoga', instructor: '김서연', location: '강남 스튜디오 A', price: 33000, capacity: 14, remainingSeats: 8, rating: 4.9, duration: '60분', schedule: '목 21:00', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80', description: '긴 하루를 마감하고 숙면을 유도하는 편안한 야간 스트레칭 요가.' },
    { id: 'class-11', title: '케틀벨 기능성 코어 강화', category: 'crossfit', instructor: '오세훈', location: '삼성 박스 센터', price: 35000, capacity: 10, remainingSeats: 4, rating: 4.8, duration: '50분', schedule: '화/목 18:30', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80', description: '케틀벨 스윙과 터키시 겟업을 통한 폭발적인 전신 협응력 훈련.' },
    { id: 'class-12', title: '하체 힙업 & 슬림라인 필라테스', category: 'pilates', instructor: '이하늘', location: '선릉 필라테스 라운지', price: 39000, capacity: 8, remainingSeats: 2, rating: 4.9, duration: '50분', schedule: '토 13:00', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80', description: '둔근 활성화와 고관절 가동성을 높여 탄력 있는 하체 라인을 만듭니다.' },
    { id: 'class-13', title: '아침을 깨우는 인터벌 사이클링', category: 'spinning', instructor: '정민지', location: '신논현 다이나믹 스튜디오', price: 30000, capacity: 18, remainingSeats: 7, rating: 4.8, duration: '45분', schedule: '화/목 07:30', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500&auto=format&fit=crop&q=80', description: '아침 공복 유산소로 신진대사를 급상승시키는 파워풀 사이클링 세션.' },
    { id: 'class-14', title: '스트렝스 & 바디 쉐이핑 PT', category: 'pt', instructor: '박지훈', location: '역삼 웰니스짐', price: 80000, capacity: 1, remainingSeats: 1, rating: 5.0, duration: '50분', schedule: '월/수 18:00', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80', description: '체지방 감량과 탄탄한 근육 매스를 목표로 하는 고효율 1:1 세션.' },
    { id: 'class-15', title: '차크라 밸런싱 아로마 명상', category: 'meditation', instructor: '윤서아', location: '청담 마인드 스파', price: 48000, capacity: 6, remainingSeats: 2, rating: 4.9, duration: '60분', schedule: '일 15:00', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80', description: '천연 에센셜 오일의 향기와 함께 에너지 차크라를 정화하는 명상.' },
    { id: 'class-16', title: '파워 아쉬탕가 요가 프라이머리', category: 'yoga', instructor: '김서연', location: '강남 스튜디오 A', price: 36000, capacity: 10, remainingSeats: 3, rating: 4.9, duration: '75분', schedule: '토 09:30', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80', description: '역동적인 호흡과 빈야사로 온몸의 땀을 배출하는 정통 아쉬탕가 수련.' },
    { id: 'class-17', title: '재활 & 관절 가동성 모빌리티', category: 'pt', instructor: '강현우', location: '역삼 웰니스짐 2관', price: 70000, capacity: 2, remainingSeats: 1, rating: 4.8, duration: '50분', schedule: '목 17:00', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80', description: '만성 목/어깨 결림과 허리 통증을 예방하는 기능성 모빌리티 트레이닝.' },
    { id: 'class-18', title: '바레(Barre) 퓨전 피트니스', category: 'pilates', instructor: '이하늘', location: '선릉 필라테스 라운지', price: 38000, capacity: 10, remainingSeats: 5, rating: 4.8, duration: '55분', schedule: '수 19:00', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80', description: '발레 바와 필라테스, 유산소를 결합하여 섬세한 바디라인을 조각합니다.' },
    { id: 'class-19', title: '심폐 파워 인터벌 스피닝', category: 'spinning', instructor: '정민지', location: '신논현 다이나믹 스튜디오', price: 32000, capacity: 20, remainingSeats: 9, rating: 4.9, duration: '45분', schedule: '금 20:00', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500&auto=format&fit=crop&q=80', description: '신나는 EDM 음악과 함께하는 주말 맞이 칼로리 폭파 레이스.' },
    { id: 'class-20', title: '타바타 & 전신 컨디셔닝', category: 'crossfit', instructor: '최유진', location: '삼성 박스 센터', price: 34000, capacity: 12, remainingSeats: 4, rating: 4.7, duration: '50분', schedule: '수 20:30', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80', description: '20초 운동 10초 휴식의 극강 인터벌로 근지구력과 대사율을 최대로 끌어올립니다.' }
  ],
  products: [
    { id: 'prod-01', title: '프리미엄 친환경 TPE 8mm 요가매트', category: 'gear', currentPrice: 48000, oldPrice: 38000, stock: 1, rating: 4.9, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80', description: '미끄럼 방지 논슬립 텍스처와 뛰어난 쿠션감의 프리미엄 요가매트.' },
    { id: 'prod-02', title: '고밀도 EPP 딥티슈 폼롤러 90cm', category: 'gear', currentPrice: 28000, oldPrice: 24000, stock: 12, rating: 4.8, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80', description: '전신 근막 이완과 뭉친 근육을 부드럽게 마사지해주는 고밀도 폼롤러.' },
    { id: 'prod-03', title: '라텍스 루프 힙 밴드 5종 세트', category: 'accessory', currentPrice: 19000, oldPrice: 15000, stock: 25, rating: 4.9, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80', description: '단계별 강도 조절로 힙업 운동과 하체 단련에 필수적인 루프 밴드.' },
    { id: 'prod-04', title: '항균 극세사 스포츠 땀흡수 타월', category: 'accessory', currentPrice: 14000, oldPrice: 12000, stock: 40, rating: 4.7, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80', description: '빠른 건조와 냄새 억제 항균 가공이 완료된 스포츠 전용 타월.' },
    { id: 'prod-05', title: '트라이탄 BPA 프리 대용량 쉐이커 800ml', category: 'supplement', currentPrice: 16000, oldPrice: 13000, stock: 30, rating: 4.8, image: 'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=500&auto=format&fit=crop&q=80', description: '프로틴 뭉침 없는 블렌더 볼 포함 대용량 친환경 스포츠 보틀.' },
    { id: 'prod-06', title: '전문가용 인체공학 헬스 리프팅 스트랩', category: 'gear', currentPrice: 22000, oldPrice: 18000, stock: 18, rating: 5.0, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80', description: '고중량 데드리프트 및 랫풀다운 시 악력을 완벽하게 보조해주는 스트랩.' },
    { id: 'prod-07', title: '순수 WPI 분리유청단백질 초코맛 2kg', category: 'supplement', currentPrice: 75000, oldPrice: 65000, stock: 15, rating: 4.9, image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&auto=format&fit=crop&q=80', description: '유당 불내증 걱정 없는 최고 순도 프리미엄 WPI 프로틴 파우더.' },
    { id: 'prod-08', title: '필라테스 논슬립 토삭스 3켤레 팩', category: 'apparel', currentPrice: 21000, oldPrice: 17000, stock: 35, rating: 4.8, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80', description: '바닥 실리콘 그립으로 기구 필라테스와 요가 동작 시 밀림 방지.' },
    { id: 'prod-09', title: '에너지 부스팅 BCAA + 전해질 400g', category: 'supplement', currentPrice: 38000, oldPrice: 32000, stock: 20, rating: 4.7, image: 'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=500&auto=format&fit=crop&q=80', description: '운동 중 근손실 방지와 빠른 수분 재충전을 돕는 상큼한 레몬맛 BCAA.' },
    { id: 'prod-10', title: '무소음 실내 마사지볼 듀얼 릴리즈', category: 'gear', currentPrice: 15000, oldPrice: 12000, stock: 28, rating: 4.9, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80', description: '발바닥 족저근막과 척추 기립근 집중 지압용 고탄성 듀얼 땅콩볼.' },
    { id: 'prod-11', title: '컴프레션 기능성 남녀공용 무릎보호대', category: 'gear', currentPrice: 29000, oldPrice: 23000, stock: 22, rating: 4.9, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80', description: '스쿼트 및 런지 동작 시 슬개골을 안정적으로 지지하는 3D 압박 밴드.' },
    { id: 'prod-12', title: '천연 소이왁스 아로마 릴렉싱 캔들', category: 'wellness', currentPrice: 26000, oldPrice: 20000, stock: 14, rating: 5.0, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80', description: '라벤더와 시더우드의 편안한 향기로 명상과 수면에 도움을 주는 캔들.' }
  ],
  cart: [
    { id: 'cart-01', productId: 'prod-01', title: '프리미엄 친환경 TPE 8mm 요가매트', price: 48000, quantity: 3, stockAtAdd: 3, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80' }
  ],
  bookings: [
    {
      id: 'book-901',
      classId: 'class-01',
      classTitle: '모닝 선라이즈 빈야사 요가',
      instructor: '김서연',
      date: '2026-10-01',
      time: '07:00',
      location: '강남 스튜디오 A',
      price: 35000,
      status: 'confirmed',
      createdAt: '2026-09-20T10:00:00Z'
    },
    {
      id: 'book-902',
      classId: 'class-03',
      classTitle: '체어 & 리포머 비기너 필라테스',
      instructor: '이하늘',
      date: '2026-10-03',
      time: '10:00',
      location: '선릉 필라테스 라운지',
      price: 40000,
      status: 'confirmed',
      createdAt: '2026-09-22T14:30:00Z'
    }
  ],
  calendarEvents: [
    { id: 'evt-01', title: '모닝 선라이즈 빈야사 요가', date: '2026-10-01', time: '07:00', instructor: '김서연', status: 'confirmed' },
    { id: 'evt-02', title: '체어 & 리포머 필라테스', date: '2026-10-03', time: '10:00', instructor: '이하늘', status: 'confirmed' }
  ],
  reviews: [
    { id: 'rev-01', classId: 'class-01', author: '박하은', rating: 5, date: '2026-09-18', comment: '아침 일찍 요가하고 출근하니까 하루 종일 허리 통증도 없고 에너지가 넘치네요! 서연 쌤 최고!' },
    { id: 'rev-02', classId: 'class-02', author: '정우진', rating: 5, date: '2026-09-19', comment: '체형 분석부터 세밀하게 봐주시고 잘못된 스쿼트 자세를 바로잡아 주셔서 무릎이 안 아픕니다.' },
    { id: 'rev-03', classId: 'class-04', author: '김다솜', rating: 5, date: '2026-09-21', comment: '음악 선곡이 너무 신나고 칼로리 버닝 제대로 됩니다. 스트레스가 싹 날아가요!' }
  ],
  favorites: ['class-01', 'class-04', 'prod-01']
};

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      user: db.users[0],
      totalBookings: db.bookings.length,
      upcomingClasses: db.bookings.filter(b => b.status === 'confirmed'),
      popularClasses: db.classes.slice(0, 4),
      featuredProducts: db.products.slice(0, 4),
      instructors: db.instructors.slice(0, 4)
    }
  });
});

// 3. Classes API with SEC-393 (Pagination state inconsistency bug)
// INTENTIONAL BACKEND BUG: SEC-393
// Pagination-state inconsistency:
// When category/search filters are changed, the server allows/mixes old page queries (e.g. page=4 with category=pilates)
// without resetting to page 1 or bounds-checking against filtered results count.
app.get('/api/classes', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 6;
  const category = req.query.category || 'all';
  const sort = req.query.sort || 'popular';
  const search = (req.query.search || '').toLowerCase();

  let filtered = [...db.classes];

  if (category !== 'all') {
    filtered = filtered.filter(c => c.category === category);
  }

  if (search) {
    filtered = filtered.filter(c => c.title.toLowerCase().includes(search) || c.instructor.toLowerCase().includes(search));
  }

  if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  res.json({
    success: true,
    bugId: 'site042-bug03',
    secId: 'SEC-393',
    data: {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      category,
      sort
    }
  });
});

app.get('/api/classes/:id', (req, res) => {
  const target = db.classes.find(c => c.id === req.params.id);
  if (!target) return res.status(404).json({ success: false, message: '클래스를 찾을 수 없습니다.' });
  const reviews = db.reviews.filter(r => r.classId === target.id);
  res.json({ success: true, data: { ...target, reviews } });
});

// 4. Class Booking with SEC-391 (Double-booking race condition)
// INTENTIONAL BACKEND BUG: SEC-391
// Double-booking race condition.
// Availability check and booking creation are not handled atomically.
// When remainingSeats is 1, concurrent booking requests both pass availability check,
// creating multiple confirmed bookings exceeding class capacity.
app.post('/api/classes/:id/book', (req, res) => {
  const { date, time, userName, phone } = req.body;
  const targetClass = db.classes.find(c => c.id === req.params.id);

  if (!targetClass) {
    return res.status(404).json({ success: false, message: '해당 클래스가 존재하지 않습니다.' });
  }

  // Non-atomic check: if remainingSeats >= 1, allows creation without lock
  if (targetClass.remainingSeats <= 0) {
    return res.status(400).json({ success: false, message: '모든 좌석이 마감되었습니다.' });
  }

  // Simulate concurrent booking race: booking created first
  const newBooking = {
    id: `book-${Date.now().toString().slice(-4)}`,
    classId: targetClass.id,
    classTitle: targetClass.title,
    instructor: targetClass.instructor,
    date: date || '2026-10-05',
    time: time || '10:00',
    location: targetClass.location,
    price: targetClass.price,
    userName: userName || db.users[0].name,
    phone: phone || db.users[0].phone,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);

  // Remaining seats reduced (can drop to 0, while 2 bookings exist)
  if (targetClass.remainingSeats > 0) {
    targetClass.remainingSeats -= 1;
  }

  res.json({
    success: true,
    bugId: 'site042-bug01',
    secId: 'SEC-391',
    message: '수업 예약이 확정되었습니다.',
    booking: newBooking,
    remainingSeats: targetClass.remainingSeats,
    totalBookingsForClass: db.bookings.filter(b => b.classId === targetClass.id).length
  });
});

app.get('/api/bookings', (req, res) => {
  res.json({ success: true, data: db.bookings });
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
  booking.status = 'cancelled';

  const targetClass = db.classes.find(c => c.id === booking.classId);
  if (targetClass) {
    targetClass.remainingSeats = Math.min(targetClass.capacity, targetClass.remainingSeats + 1);
  }

  res.json({ success: true, message: '예약이 정상적으로 취소되었습니다.', booking });
});

// 5. Products API with SEC-392 (Stale price checkout)
// INTENTIONAL BACKEND BUG: SEC-392
// Stale price checkout bug:
// Client requests checkout with previously fetched price (oldPrice),
// and backend accepts requested client price without validating against currentServerPrice.
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: db.products });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  res.json({ success: true, data: product });
});

// 6. Cart and Stock API with SEC-395 (Cart quantity vs Stock consistency)
// INTENTIONAL BACKEND BUG: SEC-395
// Stock consistency bug:
// Checkout validates only cart existence, not verifying if current product stock is sufficient
// when stock dropped below cart quantity after adding to cart.
app.get('/api/cart', (req, res) => {
  res.json({ success: true, data: db.cart });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });

  const existing = db.cart.find(c => c.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    db.cart.push({
      id: `cart-${Date.now().toString().slice(-4)}`,
      productId: product.id,
      title: product.title,
      price: product.currentPrice,
      quantity,
      stockAtAdd: product.stock,
      image: product.image
    });
  }

  res.json({
    success: true,
    bugId: 'site042-bug05',
    secId: 'SEC-395',
    message: '장바구니에 추가되었습니다.',
    data: db.cart
  });
});

app.put('/api/cart/:id', (req, res) => {
  const item = db.cart.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: '항목을 찾을 수 없습니다.' });
  item.quantity = req.body.quantity;
  res.json({ success: true, data: db.cart });
});

app.delete('/api/cart/:id', (req, res) => {
  db.cart = db.cart.filter(c => c.id !== req.params.id);
  res.json({ success: true, data: db.cart });
});

// Checkout API (combines SEC-392 stale price and SEC-395 stock deficit)
app.post('/api/checkout', (req, res) => {
  const { productId, requestedPrice, quantity = 1, deliveryAddress, paymentMethod } = req.body;

  let chargedAmount = 0;
  let itemsBought = [];
  let triggeredBugs = [];

  if (productId) {
    const product = db.products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ success: false, message: '상품이 존재하지 않습니다.' });

    // SEC-392: Uses client requestedPrice if provided (stale price bug)
    if (requestedPrice && requestedPrice !== product.currentPrice) {
      chargedAmount = requestedPrice * quantity;
      triggeredBugs.push({ bugId: 'site042-bug02', secId: 'SEC-392', type: 'stale-price' });
    } else {
      chargedAmount = product.currentPrice * quantity;
    }

    // SEC-395: Stock deficit check omission
    if (quantity > product.stock) {
      triggeredBugs.push({ bugId: 'site042-bug05', secId: 'SEC-395', type: 'stock-deficit' });
    }

    product.stock = Math.max(0, product.stock - quantity);
    itemsBought.push({ title: product.title, quantity, price: chargedAmount / quantity });
  } else {
    // Checkout from cart
    db.cart.forEach(item => {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        if (item.quantity > prod.stock) {
          triggeredBugs.push({ bugId: 'site042-bug05', secId: 'SEC-395', type: 'stock-deficit' });
        }
        prod.stock = Math.max(0, prod.stock - item.quantity);
        chargedAmount += item.price * item.quantity;
        itemsBought.push({ title: prod.title, quantity: item.quantity, price: item.price });
      }
    });
    db.cart = [];
  }

  res.json({
    success: true,
    bugId: triggeredBugs[0]?.bugId || 'site042-bug02',
    secId: triggeredBugs[0]?.secId || 'SEC-392',
    triggeredBugs,
    message: '결제가 성공적으로 완료되었습니다.',
    order: {
      orderId: `ORD-${Date.now()}`,
      chargedAmount,
      items: itemsBought,
      deliveryAddress: deliveryAddress || '서울특별시 강남구 테헤란로 231',
      paymentMethod: paymentMethod || '신용카드/간편결제',
      paidAt: new Date().toISOString()
    }
  });
});

// 7. Calendar API with SEC-394 (Timezone midnight boundary bug)
// INTENTIONAL BACKEND BUG: SEC-394
// Timezone boundary shift bug:
// When bookings are made near midnight (00:00~00:30), UTC conversion shifts the recorded date back by 1 day (e.g. 2026-09-30 instead of 2026-10-01),
// creating date discrepancies in user's reservation history vs calendar.
app.get('/api/calendar', (req, res) => {
  res.json({
    success: true,
    bugId: 'site042-bug04',
    secId: 'SEC-394',
    data: db.calendarEvents
  });
});

app.post('/api/calendar', (req, res) => {
  const { title, date, time, instructor } = req.body;

  // Timezone boundary anomaly simulation for midnight timeslots (00:00 ~ 00:30)
  let recordedDate = date;
  if (time && (time.startsWith('00:') || time.startsWith('23:5'))) {
    // UTC offset shift: shifts date by -1 day in stored display
    const d = new Date(`${date}T${time}:00+09:00`);
    const utcDay = d.getUTCDate().toString().padStart(2, '0');
    const utcMonth = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    recordedDate = `${d.getUTCFullYear()}-${utcMonth}-${utcDay}`;
  }

  const newEvent = {
    id: `evt-${Date.now().toString().slice(-4)}`,
    title: title || '피트니스 트레이닝 세션',
    date: recordedDate,
    requestedDate: date,
    time: time || '00:30',
    instructor: instructor || '김서연',
    status: 'confirmed'
  };

  db.calendarEvents.push(newEvent);

  res.json({
    success: true,
    bugId: 'site042-bug04',
    secId: 'SEC-394',
    message: '일정이 캘린더에 등록되었습니다.',
    event: newEvent
  });
});

// 8. Instructors, Favorites, Reviews, Profile
app.get('/api/instructors', (req, res) => {
  res.json({ success: true, data: db.instructors });
});

app.get('/api/favorites', (req, res) => {
  res.json({ success: true, data: db.favorites });
});

app.post('/api/favorites', (req, res) => {
  const { id } = req.body;
  if (!db.favorites.includes(id)) {
    db.favorites.push(id);
  }
  res.json({ success: true, data: db.favorites });
});

app.delete('/api/favorites/:id', (req, res) => {
  db.favorites = db.favorites.filter(f => f !== req.params.id);
  res.json({ success: true, data: db.favorites });
});

app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: db.reviews });
});

app.post('/api/reviews', (req, res) => {
  const { classId, rating, comment } = req.body;
  const newReview = {
    id: `rev-${Date.now().toString().slice(-4)}`,
    classId: classId || 'class-01',
    author: db.users[0].name,
    rating: parseInt(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    comment: comment || '수업 구성이 알차고 아주 유익했습니다!'
  };
  db.reviews.unshift(newReview);
  res.json({ success: true, message: '리뷰가 등록되었습니다.', data: newReview });
});

// Authentication Mock
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, user: db.users[0], token: 'mock-fitflow-token-9941' });
});
app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: '회원가입이 완료되었습니다.', user: db.users[0] });
});
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: '로그아웃되었습니다.' });
});

// Static files for Production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[site042] FitFlow Server running on http://localhost:${PORT}`);
});
