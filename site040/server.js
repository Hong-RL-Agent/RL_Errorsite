import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9939;

app.use(cors());
app.use(express.json());

// Async Request Tracker
let requestSequenceCounter = 0;
const pendingRequests = new Map();

function trackAsyncRequest(endpoint, userId = 'user-001', payload = {}) {
  requestSequenceCounter++;
  const requestId = `req-${String(requestSequenceCounter).padStart(3, '0')}`;
  const record = {
    request_id: requestId,
    endpoint,
    status: 'pending',
    started_at: Date.now(),
    user_id: userId,
    payload
  };
  pendingRequests.set(requestId, record);
  return record;
}

// ----------------------------------------------------
// Mock In-Memory Database
// ----------------------------------------------------
let users = [
  {
    id: 'user-001',
    name: '한도현',
    email: 'student@example.com',
    role: '정규 수강생',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '010-3842-9912',
    address: '서울특별시 강남구 테헤란로 152, 강남타워 14층',
    bio: '프론트엔드 엔지니어링 및 풀스택 웹 개발을 공부하고 있는 주니어 개발자입니다.',
    enrolledCourses: 3,
    completedCourses: 1,
    learningHours: 42,
    joinedAt: '2025-01-10'
  },
  {
    id: 'user-002',
    name: '정유진',
    email: 'learner@example.com',
    role: '취업준비생',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '010-8812-3456',
    address: '경기도 성남시 분당구 판교역로 235',
    bio: '데이터 시각화와 파이썬 기반 통계 분석 커리어를 준비 중입니다.',
    enrolledCourses: 2,
    completedCourses: 0,
    learningHours: 18,
    joinedAt: '2025-02-15'
  },
  {
    id: 'user-003',
    name: '강민혁',
    email: 'member@example.com',
    role: '직장인 수강생',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '010-4491-0129',
    address: '서울특별시 송파구 올림픽로 300',
    bio: 'UX/UI 디자인 시스템과 Figma 인터랙션 실무를 익히고 있습니다.',
    enrolledCourses: 4,
    completedCourses: 2,
    learningHours: 65,
    joinedAt: '2025-03-01'
  }
];

let currentUser = { ...users[0] };

let categories = [
  { id: 'programming', name: '프로그래밍 & 웹개발', icon: 'Code2', count: 48 },
  { id: 'data', name: '데이터 분석 & AI', icon: 'Database', count: 32 },
  { id: 'design', name: 'UX/UI 디자인', icon: 'Palette', count: 26 },
  { id: 'language', name: '비즈니스 외국어', icon: 'Globe2', count: 19 },
  { id: 'certificate', name: '국가공인 자격증', icon: 'Award', count: 24 },
  { id: 'career', name: '취업 & 실무 포트폴리오', icon: 'Briefcase', count: 35 }
];

let courses = [
  {
    id: 'course-101',
    title: 'React & Next.js 프론트엔드 실무 마스터클래스',
    instructor: '김민준 테크 리드 (카카오 출신)',
    category: 'programming',
    difficulty: '중급',
    duration: '28시간 (총 64강)',
    price: 189000,
    discountRate: 20,
    finalPrice: 151200,
    rating: 4.9,
    reviewCount: 342,
    studentCount: 1420,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
    description: 'React 18의 최신 훅과 상태 관리, Next.js App Router 기반의 고성능 풀스택 웹 애플리케이션을 완성도 있게 구축하는 실무 완성 코스입니다.',
    curriculum: ['1. 모던 React 핵심 아키텍처', '2. Zustand & React Query 상태 동기화', '3. Next.js 14 App Router 마스터', '4. 대규모 SaaS 프로덕션 배포']
  },
  {
    id: 'course-102',
    title: '파이썬으로 시작하는 실무 데이터 분석 & 머신러닝',
    instructor: '박수진 데이터 사이언티스트',
    category: 'data',
    difficulty: '입문',
    duration: '24시간 (총 52강)',
    price: 165000,
    discountRate: 15,
    finalPrice: 140250,
    rating: 4.8,
    reviewCount: 218,
    studentCount: 980,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    description: 'Pandas, NumPy, Matplotlib, Scikit-learn을 활용하여 실제 비즈니스 데이터를 정제하고 가치 있는 인사이트와 예측 모델을 도출합니다.',
    curriculum: ['1. 파이썬 기초 및 데이터 핸들링', '2. EDA 및 시각화 대시보드', '3. 머신러닝 분류/회귀 알고리즘', '4. 실제 이커머스 매출 예측 프로젝트']
  },
  {
    id: 'course-103',
    title: 'Figma 디자인 시스템 구축과 고도화 UX/UI 디자인',
    instructor: '이지호 프로덕트 디자이너',
    category: 'design',
    difficulty: '중급',
    duration: '20시간 (총 45강)',
    price: 175000,
    discountRate: 10,
    finalPrice: 157500,
    rating: 4.9,
    reviewCount: 189,
    studentCount: 860,
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    description: '컴포넌트 변수, 오토레이아웃, 토큰 기반 디자인 시스템을 체계적으로 설계하고 개발팀과 완벽하게 협업하는 프로덕트 디자인 가이드입니다.',
    curriculum: ['1. Figma 오토레이아웃 심화', '2. 디자인 토큰 및 변수 시스템', '3. 대규모 반응형 컴포넌트 라이브러리', '4. 핸드오프 및 프로토타이핑']
  },
  {
    id: 'course-104',
    title: '비전공자를 위한 SQL 기초부터 코딩테스트 대비',
    instructor: '최재혁 백엔드 엔지니어',
    category: 'programming',
    difficulty: '입문',
    duration: '16시간 (총 38강)',
    price: 120000,
    discountRate: 25,
    finalPrice: 90000,
    rating: 4.7,
    reviewCount: 310,
    studentCount: 1650,
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    description: 'MySQL과 PostgreSQL 쿼리 문법, 복잡한 JOIN과 윈도우 함수, 프로그래머스 SQL 코딩테스트 고득점 완벽 대비.',
    curriculum: ['1. RDBMS 기본 및 SELECT 문법', '2. 다중 JOIN 및 서브쿼리 활용', '3. 집계 및 윈도우 함수 실습', '4. 코딩테스트 빈출 기출문제 50제']
  },
  {
    id: 'course-105',
    title: 'CS 전공 지식 면접 정복: 컴퓨터구조 & 네트워크',
    instructor: '정우진 소프트웨어 아키텍트',
    category: 'career',
    difficulty: '고급',
    duration: '22시간 (총 48강)',
    price: 150000,
    discountRate: 0,
    finalPrice: 150000,
    rating: 4.9,
    reviewCount: 145,
    studentCount: 720,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    description: '네카라쿠배 IT 대기업 기술 면접 단골 질문인 TCP/IP, HTTP/3, 가상 메모리, 프로세스/스레드 동기화를 그림과 애니메이션으로 완벽 이해.',
    curriculum: ['1. 컴퓨터 하드웨어 및 CPU 구조', '2. 운영체제 메모리 관리 및 동기화', '3. 네트워크 프로토콜 스택 심층 분석', '4. 기출 기술면접 모의 인터뷰']
  },
  {
    id: 'course-106',
    title: '코어 자바스크립트 & 딥다이브 심화 프로그래밍',
    instructor: '김민준 테크 리드',
    category: 'programming',
    difficulty: '고급',
    duration: '26시간 (총 60강)',
    price: 198000,
    discountRate: 20,
    finalPrice: 158400,
    rating: 4.8,
    reviewCount: 260,
    studentCount: 1100,
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=80',
    description: '실행 컨텍스트, 클로저, 프로토타입, 이벤트 루프, 비동기 Promise 내부 메커니즘을 파헤치는 자바스크립트 코어 심화 강좌입니다.',
    curriculum: ['1. V8 엔진과 자바스크립트 런타임', '2. 실행 컨텍스트와 스코프 체인', '3. 프로토타입과 객체 지향', '4. 마이크로태스크 큐와 이벤트 루프']
  },
  {
    id: 'course-107',
    title: '신입 개발자를 위한 합격 포트폴리오 & 이력서 첨삭',
    instructor: '서지현 IT 테크 리크루터',
    category: 'career',
    difficulty: '입문',
    duration: '14시간 (총 30강)',
    price: 110000,
    discountRate: 15,
    finalPrice: 93500,
    rating: 4.9,
    reviewCount: 420,
    studentCount: 2100,
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
    description: '서류 통과율 80% 이상의 노션 및 깃허브 포트폴리오 템플릿과 트러블슈팅 작성법, 실제 합격 사례 분석.',
    curriculum: ['1. 채용담당자의 시선을 사로잡는 이력서', '2. 문제 해결 중심 프로젝트 기술서', '3. 깃허브 Readme 아키텍처 다이어그램', '4. 1:1 라이브 포트폴리오 피드백']
  },
  {
    id: 'course-108',
    title: 'IT 기술 직무 인터뷰 롤플레잉 & 인성 면접 가이드',
    instructor: '서지현 IT 테크 리크루터',
    category: 'career',
    difficulty: '중급',
    duration: '12시간 (총 25강)',
    price: 99000,
    discountRate: 10,
    finalPrice: 89100,
    rating: 4.7,
    reviewCount: 156,
    studentCount: 650,
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    description: '스타 기법 기반 경험 정리, 역량 면접과 컬처핏 인터뷰에서 압도적인 호감을 얻는 답변 구조화 연습.',
    curriculum: ['1. STAR 기법 기반 경험 구조화', '2. 실패 극복 및 팀 협업 질문 대비', '3. 컬처핏 면접 역질문 전략', '4. 모의 인터뷰 실전 시뮬레이션']
  }
];

let enrollments = [
  {
    id: 'enrollment-201',
    courseId: 'course-101',
    courseTitle: 'React & Next.js 프론트엔드 실무 마스터클래스',
    progressRate: 68,
    lastLesson: '섹션 4. React Query 서버 상태 캐싱과 낙관적 업데이트',
    enrolledAt: '2026-08-15',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'enrollment-202',
    courseId: 'course-102',
    courseTitle: '파이썬으로 시작하는 실무 데이터 분석 & 머신러닝',
    progressRate: 35,
    lastLesson: '섹션 2. Pandas 고급 데이터프레임 조작법',
    enrolledAt: '2026-09-01',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'enrollment-203',
    courseId: 'course-104',
    courseTitle: '비전공자를 위한 SQL 기초부터 코딩테스트 대비',
    progressRate: 100,
    lastLesson: '수강 완료 (수료증 발급 완료)',
    enrolledAt: '2026-07-20',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80'
  }
];

let coupons = [
  { id: 'coupon-301', code: 'CLASS10', title: '신규 가입 10% 웰컴 할인 쿠폰', discountType: 'rate', discountValue: 10, minAmount: 50000, validUntil: '2026-10-31' },
  { id: 'coupon-302', code: 'DEV30000', title: '개발 직무 특별 3만원 할인권', discountType: 'amount', discountValue: 30000, minAmount: 100000, validUntil: '2026-10-15' },
  { id: 'coupon-303', code: 'VIPPASS', title: '얼리버드 15% 추가 할인 쿠폰', discountType: 'rate', discountValue: 15, minAmount: 70000, validUntil: '2026-11-30' }
];

let files = [
  {
    id: 'file-501',
    name: 'react_state_cheatsheet.pdf',
    size: '3.8 MB',
    uploadedAt: '2026-09-22 14:10',
    description: 'React 상태 관리 패턴 요약 치트시트 및 아키텍처 다이어그램',
    url: 'https://example.com/files/react_state_cheatsheet.pdf'
  },
  {
    id: 'file-502',
    name: 'sql_interview_50_questions.pdf',
    size: '2.4 MB',
    uploadedAt: '2026-09-18 10:30',
    description: '대기업 코딩테스트 SQL 빈출 문제 풀이 해설집',
    url: 'https://example.com/files/sql_interview_50.pdf'
  },
  {
    id: 'file-503',
    name: 'figma_design_system_template.fig',
    size: '12.5 MB',
    uploadedAt: '2026-09-12 16:45',
    description: 'Figma 디자인 시스템 스타터 킷 템플릿 파일',
    url: 'https://example.com/files/figma_template.fig'
  }
];

let chatRooms = [
  {
    id: 'chat-601',
    partnerName: '김민준 강사님',
    partnerRole: 'React 마스터클래스 튜터',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: '네, 질문해주신 낙관적 업데이트 로직은 onSuccess 핸들러에서 롤백 처리하시면 됩니다!',
    lastTime: '14:20',
    unread: 0
  },
  {
    id: 'chat-602',
    partnerName: 'ClassBridge 학습 서포트',
    partnerRole: '수강 및 결제 상담',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    lastMessage: '환불 및 수강권 연장 안내 도와드렸습니다. 추가 문의사항이 있으신가요?',
    lastTime: '어제',
    unread: 1
  }
];

let chatMessages = [
  {
    id: 'msg-1',
    roomId: 'chat-601',
    sender: 'user-001',
    senderName: '한도현',
    text: '강사님, React Query에서 useMutation 실행 시 캐시 무효화 타이밍 관련 질문이 있습니다.',
    time: '14:15'
  },
  {
    id: 'msg-2',
    roomId: 'chat-601',
    sender: 'instructor',
    senderName: '김민준 강사님',
    text: '네, 질문해주신 낙관적 업데이트 로직은 onSuccess 핸들러에서 롤백 처리하시면 됩니다!',
    time: '14:20'
  }
];

let notices = [
  {
    id: 'notice-701',
    title: '2026년 10월 시스템 정기 점검 및 서버 최적화 작업 안내',
    category: '시스템 공지',
    author: 'ClassBridge 운영팀',
    date: '2026-09-25',
    read: false,
    content: '보다 안정적인 강의 스트리밍 서비스를 제공하기 위해 10월 3일(토) 새벽 02:00~06:00 정기 점검이 진행될 예정입니다.'
  },
  {
    id: 'notice-702',
    title: '신규 AI & LLM 파인튜닝 실무 트랙 강의 오픈 기념 20% 얼리버드',
    category: '이벤트/오픈',
    author: '교육기획팀',
    date: '2026-09-20',
    read: true,
    content: '현업 AI 엔지니어가 직접 진행하는 실전 LLM 파인튜닝 & LangChain 코스가 신규 론칭되었습니다.'
  },
  {
    id: 'notice-703',
    title: '수강 완료 인증서 발급 및 링크드인 연동 기능 업데이트',
    category: '기능 업데이트',
    author: '플랫폼 개발팀',
    date: '2026-09-15',
    read: true,
    content: '이제 강의 100% 진도 달성 시 PDF 인증서 다운로드 및 링크드인 프로필 원클릭 공유가 지원됩니다.'
  }
];

let reviews = [
  {
    id: 'review-801',
    courseId: 'course-101',
    userName: '한도현',
    rating: 5,
    title: '실무에서 바로 쓰는 실전 압축 강의!',
    content: '단순한 문법 설명이 아니라 실제 대규모 서비스 아키텍처 관점에서 설명해주셔서 많은 도움이 되었습니다.',
    createdAt: '2026-09-24'
  },
  {
    id: 'review-802',
    courseId: 'course-101',
    userName: '정유진',
    rating: 5,
    title: 'Next.js 14 라우팅 이해가 쏙쏙 됩니다',
    content: '공식 문서만으로 이해하기 어려웠던 서버 컴포넌트와 클라이언트 컴포넌트 분리 원칙을 명쾌하게 짚어주셨어요.',
    createdAt: '2026-09-21'
  },
  {
    id: 'review-803',
    courseId: 'course-102',
    userName: '강민혁',
    rating: 5,
    title: '비전공자도 쉽게 따라할 수 있는 파이썬 데이터 분석',
    content: '실제 캐글 데이터셋으로 실습하면서 시각화 그래프를 직접 그려보니 분석에 재미가 붙었습니다.',
    createdAt: '2026-09-19'
  }
];

// ----------------------------------------------------
// Health Check Endpoint (Required)
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site040'
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    user: currentUser,
    categories,
    featuredCourses: courses.slice(0, 4),
    enrollments,
    notices: notices.slice(0, 3)
  });
});

// ----------------------------------------------------
// 1. Login API (SEC-371 / site040-bug01)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug01 / SEC-371
// Async login request remains pending without meaningful UI feedback
// or a cancellation path.
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const track = trackAsyncRequest('/api/auth/login', currentUser.id, { email });

  const found = users.find(u => u.email === email);
  if (found) {
    currentUser = { ...found };
  }

  res.json({
    success: true,
    bugId: 'site040-bug01',
    secId: 'SEC-371',
    request_id: track.request_id,
    user: currentUser,
    token: 'mock-jwt-token-site040'
  });
});

// ----------------------------------------------------
// 2. Register API (SEC-372 / site040-bug02)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug02 / SEC-372
// Async registration request remains pending without clear feedback
// or a cancellation path.
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, address, bio } = req.body;
  const track = trackAsyncRequest('/api/auth/register', currentUser.id, { name, email });

  const newUser = {
    id: `user-${String(users.length + 101)}`,
    name: name || '신규 수강생',
    email: email || `user${Date.now()}@example.com`,
    role: '정규 수강생',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: phone || '010-1234-5678',
    address: address || '서울특별시 마포구',
    bio: bio || '새롭게 수강을 시작한 학습자입니다.',
    enrolledCourses: 0,
    completedCourses: 0,
    learningHours: 0,
    joinedAt: new Date().toISOString().substring(0, 10)
  };

  users.push(newUser);
  currentUser = { ...newUser };

  res.status(201).json({
    success: true,
    bugId: 'site040-bug02',
    secId: 'SEC-372',
    request_id: track.request_id,
    user: newUser
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ----------------------------------------------------
// 3. Address Update API (SEC-373 / site040-bug03)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug03 / SEC-373
// Async address update request remains pending without UI feedback
// or a cancellation path.
app.get('/api/profile', (req, res) => {
  res.json(currentUser);
});

app.put('/api/profile', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json({ success: true, user: currentUser });
});

app.post('/api/profile/address', (req, res) => {
  const { address } = req.body;
  const track = trackAsyncRequest('/api/profile/address', currentUser.id, { address });

  if (address) {
    currentUser.address = address;
  }

  res.json({
    success: true,
    bugId: 'site040-bug03',
    secId: 'SEC-373',
    request_id: track.request_id,
    address: currentUser.address,
    user: currentUser
  });
});

app.put('/api/profile/address', (req, res) => {
  const { address } = req.body;
  const track = trackAsyncRequest('/api/profile/address', currentUser.id, { address });

  if (address) {
    currentUser.address = address;
  }

  res.json({
    success: true,
    bugId: 'site040-bug03',
    secId: 'SEC-373',
    request_id: track.request_id,
    address: currentUser.address,
    user: currentUser
  });
});

// ----------------------------------------------------
// 4. Coupon Apply API (SEC-374 / site040-bug04)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug04 / SEC-374
// Async coupon application request remains pending without feedback
// or a cancellation path.
app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

app.post('/api/coupons/apply', (req, res) => {
  const { code, coursePrice = 189000 } = req.body;
  const track = trackAsyncRequest('/api/coupons/apply', currentUser.id, { code, coursePrice });

  const found = coupons.find(c => c.code.toLowerCase() === String(code).toLowerCase());
  let discountAmount = 0;

  if (found) {
    if (found.discountType === 'rate') {
      discountAmount = Math.floor(coursePrice * (found.discountValue / 100));
    } else {
      discountAmount = found.discountValue;
    }
  }

  res.json({
    success: true,
    bugId: 'site040-bug04',
    secId: 'SEC-374',
    request_id: track.request_id,
    valid: Boolean(found),
    coupon: found || null,
    discountAmount,
    finalPrice: Math.max(0, coursePrice - discountAmount),
    message: found ? `쿠폰 [${found.title}]이 적용되었습니다.` : '유효하지 않은 쿠폰 코드입니다.'
  });
});

// ----------------------------------------------------
// 5. Course List Sort (SEC-375 / site040-bug05) &
// 6. Course Pagination (SEC-376 / site040-bug06)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug05 / SEC-375 (Sort Parameter Async No Feedback)
// site040-bug06 / SEC-376 (Pagination Async No Feedback)
app.get('/api/courses', (req, res) => {
  const { sort = 'popular', page = 1, limit = 4, category = 'all', q = '' } = req.query;

  let bugId = null;
  let secId = null;

  if (req.query.sort) {
    bugId = 'site040-bug05';
    secId = 'SEC-375';
    trackAsyncRequest('/api/courses?sort=' + sort, currentUser.id, req.query);
  }
  if (req.query.page && Number(page) > 1) {
    bugId = 'site040-bug06';
    secId = 'SEC-376';
    trackAsyncRequest('/api/courses?page=' + page, currentUser.id, req.query);
  }

  let filtered = [...courses];

  if (category && category !== 'all') {
    filtered = filtered.filter(c => c.category === category);
  }
  if (q) {
    filtered = filtered.filter(c => c.title.toLowerCase().includes(String(q).toLowerCase()) || c.instructor.includes(String(q)));
  }

  if (sort === 'popular') {
    filtered.sort((a, b) => b.studentCount - a.studentCount);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'price-low') {
    filtered.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.finalPrice - a.finalPrice);
  }

  const pageNum = Number(page) || 1;
  const pageLimit = Number(limit) || 4;
  const startIndex = (pageNum - 1) * pageLimit;
  const paginated = filtered.slice(startIndex, startIndex + pageLimit);

  res.json({
    success: true,
    bugId: bugId || 'site040-bug05',
    secId: secId || 'SEC-375',
    request_id: `req-${String(++requestSequenceCounter).padStart(3, '0')}`,
    courses: paginated,
    total: filtered.length,
    page: pageNum,
    totalPages: Math.ceil(filtered.length / pageLimit)
  });
});

app.get('/api/courses/:courseId', (req, res) => {
  const c = courses.find(item => item.id === req.params.courseId);
  if (!c) return res.status(404).json({ error: 'Course not found' });
  res.json(c);
});

// ----------------------------------------------------
// 7. Learning Materials Filename API (SEC-377 / site040-bug07)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug07 / SEC-377
// Async learning material filename validation/save remains pending without feedback
// or a cancellation path.
app.get('/api/files', (req, res) => {
  res.json(files);
});

app.post('/api/files/name', (req, res) => {
  const { fileName = '', description = '' } = req.body;
  const track = trackAsyncRequest('/api/files/name', currentUser.id, { fileName, description });

  const exists = files.some(f => f.name.toLowerCase() === fileName.toLowerCase());
  const newFile = {
    id: `file-${String(files.length + 501)}`,
    name: fileName || 'untitled_material.pdf',
    size: '2.1 MB',
    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    description: description || '학습 보조 강의 자료',
    url: 'https://example.com/files/' + encodeURIComponent(fileName)
  };

  files.unshift(newFile);

  res.json({
    success: true,
    bugId: 'site040-bug07',
    secId: 'SEC-377',
    request_id: track.request_id,
    valid: !exists,
    file: newFile,
    message: exists ? '동일한 파일명이 이미 존재합니다.' : '파일명 검증 완료 및 등록 성공'
  });
});

// ----------------------------------------------------
// 8. Chat Messages API (SEC-378 / site040-bug08)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug08 / SEC-378
// Async chat message sending remains pending without status feedback
// or a cancellation path.
app.get('/api/chat/rooms', (req, res) => {
  res.json(chatRooms);
});

app.get('/api/chat', (req, res) => {
  res.json({ rooms: chatRooms, messages: chatMessages });
});

app.post('/api/chat/messages', (req, res) => {
  const { roomId = 'chat-601', text } = req.body;
  const track = trackAsyncRequest('/api/chat/messages', currentUser.id, { roomId, text });

  const newMsg = {
    id: `msg-${Date.now()}`,
    roomId,
    sender: currentUser.id,
    senderName: currentUser.name,
    text: text || '강의 관련 질문 드립니다.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  chatMessages.push(newMsg);

  res.status(201).json({
    success: true,
    bugId: 'site040-bug08',
    secId: 'SEC-378',
    request_id: track.request_id,
    message: newMsg
  });
});

// ----------------------------------------------------
// 9. Notices Read / Update (SEC-379 / site040-bug09)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug09 / SEC-379
// Async notice reading/update remains pending without UI feedback
// or a cancellation path.
app.get('/api/notices', (req, res) => {
  const track = trackAsyncRequest('/api/notices', currentUser.id);
  res.json(notices);
});

app.get('/api/notices/:noticeId', (req, res) => {
  const n = notices.find(item => item.id === req.params.noticeId);
  if (!n) return res.status(404).json({ error: 'Notice not found' });
  res.json(n);
});

app.post('/api/notices/read', (req, res) => {
  const { noticeId } = req.body;
  const track = trackAsyncRequest('/api/notices/read', currentUser.id, { noticeId });

  const n = notices.find(item => item.id === noticeId);
  if (n) {
    n.read = true;
  }

  res.json({
    success: true,
    bugId: 'site040-bug09',
    secId: 'SEC-379',
    request_id: track.request_id,
    notice: n
  });
});

// ----------------------------------------------------
// 10. Course Reviews API (SEC-380 / site040-bug10)
// ----------------------------------------------------
// INTENTIONAL AVAILABILITY BUG:
// site040-bug10 / SEC-380
// Async course review submission remains pending without user feedback
// or a cancellation path.
app.get('/api/courses/:courseId/reviews', (req, res) => {
  const filtered = reviews.filter(r => r.courseId === req.params.courseId);
  res.json(filtered);
});

app.post('/api/courses/:courseId/reviews', (req, res) => {
  const { courseId } = req.params;
  const { title, content, rating = 5 } = req.body;
  const track = trackAsyncRequest(`/api/courses/${courseId}/reviews`, currentUser.id, { courseId, title, content, rating });

  const newReview = {
    id: `review-${String(reviews.length + 801)}`,
    courseId,
    userName: currentUser.name,
    rating: Number(rating),
    title: title || '강의 수강 만족 후기',
    content: content || '정말 유익한 강의였습니다.',
    createdAt: new Date().toISOString().substring(0, 10)
  };

  reviews.unshift(newReview);

  res.status(201).json({
    success: true,
    bugId: 'site040-bug10',
    secId: 'SEC-380',
    request_id: track.request_id,
    review: newReview
  });
});

// Enrollments & Checkout
app.get('/api/enrollments', (req, res) => {
  res.json(enrollments);
});

app.post('/api/enrollments', (req, res) => {
  const { courseId } = req.body;
  const c = courses.find(item => item.id === courseId);
  const newEnroll = {
    id: `enrollment-${String(enrollments.length + 201)}`,
    courseId,
    courseTitle: c ? c.title : '온라인 코스',
    progressRate: 0,
    lastLesson: '섹션 1. 오리엔테이션 및 학습 로드맵',
    enrolledAt: new Date().toISOString().substring(0, 10),
    thumbnail: c ? c.thumbnail : 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'
  };
  enrollments.unshift(newEnroll);
  res.status(201).json({ success: true, enrollment: newEnroll });
});

app.post('/api/checkout/payment', (req, res) => {
  const { courseId, couponCode, paymentMethod } = req.body;
  res.json({
    success: true,
    orderId: `ORD-${Date.now()}`,
    status: '결제 완료 (수강 신청 완료)'
  });
});

// Serve frontend build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('ClassBridge backend running. Use Vite dev server for frontend development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[ClassBridge Server] Running on http://localhost:${PORT}`);
  console.log(`[Health Check] http://localhost:${PORT}/api/health`);
});
