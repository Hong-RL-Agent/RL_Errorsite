import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9935;

app.use(cors());
app.use(express.json());

// Global Sequence & Transaction ID Counters
let requestSequenceCounter = 0;
let txCounters = {
  search: 0,
  bio: 0,
  inquiry: 0,
  product: 0,
  file: 0,
  comment: 0,
  resnote: 0,
  cart: 0,
  pay: 0,
  filter: 0,
  generic: 0
};

function generateTxId(type) {
  txCounters[type] = (txCounters[type] || 0) + 1;
  const num = String(txCounters[type]).padStart(3, '0');
  switch (type) {
    case 'search': return `SEARCH-TX-${num}`;
    case 'bio': return `BIO-TX-${num}`;
    case 'inquiry': return `INQ-TX-${num}`;
    case 'product': return `PRODUCT-TX-${num}`;
    case 'file': return `FILE-TX-${num}`;
    case 'comment': return `COMMENT-TX-${num}`;
    case 'resnote': return `RESNOTE-TX-${num}`;
    case 'cart': return `CART-TX-${num}`;
    case 'pay': return `PAY-TX-${num}`;
    case 'filter': return `FILTER-TX-${num}`;
    default: return `TX-${num}`;
  }
}

// In-Memory Database
const users = [
  {
    id: 'user-001',
    name: '김민준',
    email: 'minjun.kim@worknest.io',
    role: 'Product Lead',
    department: 'Product Strategy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: '디지털 제품 기획 및 팀 협업 플랫폼 최적화 리드',
    status: 'online',
    joinedAt: '2025-01-10'
  },
  {
    id: 'user-002',
    name: '이서연',
    email: 'seoyeon.lee@worknest.io',
    role: 'Lead Designer',
    department: 'Design System',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: '사용자 중심의 직관적인 협업 도구 UX 설계자',
    status: 'busy',
    joinedAt: '2025-02-01'
  },
  {
    id: 'user-003',
    name: '박도현',
    email: 'dohyun.park@worknest.io',
    role: 'Senior Engineer',
    department: 'Core Platform',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: '대규모 분산 시스템 아키텍처 및 클라우드 인프라 엔지니어',
    status: 'online',
    joinedAt: '2025-01-15'
  },
  {
    id: 'user-004',
    name: '최유진',
    email: 'yujin.choi@worknest.io',
    role: 'Operations Specialist',
    department: 'Customer Success',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    bio: '고객 만족 및 워크스페이스 온보딩 가이드 담당',
    status: 'away',
    joinedAt: '2025-03-01'
  }
];

let currentUser = { ...users[0] };

const workspaces = [
  { id: 'ws-001', name: 'Global Enterprise HQ', slug: 'global-hq', plan: 'Enterprise Workspace', membersCount: 42, activeProjects: 12 },
  { id: 'ws-002', name: 'Product Innovation Lab', slug: 'product-lab', plan: 'Team Pro', membersCount: 16, activeProjects: 6 },
  { id: 'ws-003', name: 'Marketing Growth Studio', slug: 'marketing-ops', plan: 'Business Starter', membersCount: 8, activeProjects: 4 }
];

let projects = [
  {
    id: 'project-101',
    name: 'Website Redesign',
    description: 'WorkNest 차세대 브랜드 아이덴티티 및 웹 플랫폼 전면 개편',
    status: 'active',
    priority: 'high',
    owner: '김민준',
    progress: 78,
    dueDate: '2026-05-15',
    category: 'Design & Dev',
    team: ['user-001', 'user-002', 'user-003'],
    commentsCount: 3
  },
  {
    id: 'project-102',
    name: 'Mobile App Launch',
    description: 'iOS / Android 네이티브 협업 클라이언트 1.0 릴리즈',
    status: 'active',
    priority: 'high',
    owner: '박도현',
    progress: 92,
    dueDate: '2026-04-30',
    category: 'Mobile',
    team: ['user-003', 'user-001'],
    commentsCount: 2
  },
  {
    id: 'project-103',
    name: 'Marketing Automation',
    description: '리드 관리 및 사용자 온보딩 자동화 CRM 파이프라인 구축',
    status: 'planning',
    priority: 'medium',
    owner: '최유진',
    progress: 45,
    dueDate: '2026-06-10',
    category: 'Marketing',
    team: ['user-004', 'user-002'],
    commentsCount: 1
  },
  {
    id: 'project-104',
    name: 'Internal Dashboard',
    description: '팀 성과 지표 및 실시간 리소스 모니터링 대시보드 개발',
    status: 'completed',
    priority: 'low',
    owner: '김민준',
    progress: 100,
    dueDate: '2026-03-20',
    category: 'Internal Tool',
    team: ['user-001', 'user-003', 'user-004'],
    commentsCount: 4
  }
];

let products = [
  {
    id: 'product-101',
    name: 'Business Starter',
    code: 'PROD-STARTER',
    price: 29000,
    interval: '월',
    description: '최대 10인 팀을 위한 핵심 협업 도구 및 50GB 클라우드 스토리지',
    features: ['무제한 프로젝트', '최대 10인 멤버', '기본 화상회의 40분', '50GB 스토리지', '이메일 고객지원'],
    popular: false,
    badge: '스타트업 추천'
  },
  {
    id: 'product-102',
    name: 'Team Pro',
    code: 'PROD-PRO',
    price: 59000,
    interval: '월',
    description: '성장하는 기업을 위한 고급 권한 관리, 자동화 워크플로우 및 무제한 스토리지',
    features: ['무제한 멤버 & 게스트', '고급 역할 권한 제어', '무제한 화상 회의 & 녹화', '1TB 안전 스토리지', '우선 기술 지원', '커스텀 워크플로우'],
    popular: true,
    badge: '가장 인기'
  },
  {
    id: 'product-103',
    name: 'Enterprise Workspace',
    code: 'PROD-ENTERPRISE',
    price: 149000,
    interval: '월',
    description: '대규모 조직을 위한 전용 클러스터, SSO/SAML 보안 및 24/7 전담 매니저',
    features: ['전용 프라이빗 클라우드', 'SSO/SAML 2.0 연동', '감사 로그 & 컴플라이언스', '무제한 스토리지', '24/7 SLA 전담 매니저', '맞춤형 온프레미스 연동'],
    popular: false,
    badge: '대기업/기관'
  }
];

let files = [
  {
    id: 'file-201',
    name: 'Project_Specification_v2.pdf',
    size: '4.8 MB',
    type: 'pdf',
    uploader: '김민준',
    description: 'WorkNest 플랫폼 2.0 전체 기술 및 기능 명세서',
    uploadedAt: '2026-03-15 14:30',
    downloads: 34
  },
  {
    id: 'file-202',
    name: 'Design_System_Tokens_2026.fig',
    size: '18.2 MB',
    type: 'figma',
    uploader: '이서연',
    description: 'Figma 디자인 시스템 토큰, 컴포넌트 라이브러리 및 에셋 모음',
    uploadedAt: '2026-03-18 10:15',
    downloads: 52
  },
  {
    id: 'file-203',
    name: 'Architecture_Cloud_Diagram.png',
    size: '2.1 MB',
    type: 'image',
    uploader: '박도현',
    description: 'AWS 분산 클러스터 인프라 아키텍처 다이어그램',
    uploadedAt: '2026-03-22 16:45',
    downloads: 19
  }
];

let reservations = [
  {
    id: 'reservation-301',
    roomName: '메인 컨퍼런스 룸 A (12인실)',
    type: '회의실',
    date: '2026-04-10',
    time: '14:00 - 16:00',
    organizer: '김민준',
    purpose: 'Q2 스프린트 킥오프 및 제품 로드맵 회의',
    note: '화상 회의 장비 및 빔 프로젝터 사전 점검 완료',
    status: 'confirmed'
  },
  {
    id: 'reservation-302',
    roomName: '크리에이티브 스튜디오 B (8인실)',
    type: '회의실',
    date: '2026-04-12',
    time: '10:30 - 12:00',
    organizer: '이서연',
    purpose: '신규 UI/UX 프로토타입 디자인 리뷰',
    note: '화이트보드 마커 및 디스플레이 준비 요망',
    status: 'confirmed'
  },
  {
    id: 'reservation-303',
    roomName: '포커스 부스 2호 (1인실)',
    type: '포커스룸',
    date: '2026-04-15',
    time: '15:00 - 16:00',
    organizer: '박도현',
    purpose: '외부 협력사 인프라 아키텍처 화상 미팅',
    note: '노이즈 캔슬링 부스 이용',
    status: 'confirmed'
  }
];

let comments = [
  {
    id: 'comment-001',
    projectId: 'project-101',
    author: '이서연',
    authorAvatar: users[1].avatar,
    content: '피그마 컴포넌트 토큰 정리 완료되었습니다. 확인 부탁드려요!',
    createdAt: '2026-03-24 11:20'
  },
  {
    id: 'comment-002',
    projectId: 'project-101',
    author: '김민준',
    authorAvatar: users[0].avatar,
    content: '확인했습니다. 반응형 브레이크포인트 검토 후 스프린트에 반영하겠습니다.',
    createdAt: '2026-03-24 13:45'
  },
  {
    id: 'comment-003',
    projectId: 'project-102',
    author: '박도현',
    authorAvatar: users[2].avatar,
    content: 'iOS 빌드 테스트 정상 완료되었습니다. 테스트플라이트 배포 준비 중입니다.',
    createdAt: '2026-03-25 09:10'
  }
];

let inquiries = [
  {
    id: 'INQ-001',
    userId: 'user-001',
    userName: '김민준',
    subject: 'Enterprise Workspace 플랜 연간 결제 할인 문의',
    message: '연간 구독으로 전환 시 제공되는 볼륨 디스카운트 정책 및 청구서 발행 절차가 궁금합니다.',
    category: 'Billing',
    status: 'answered',
    createdAt: '2026-03-20 15:30',
    answer: '안녕하세요 고객님, 연간 결제 시 20% 특별 할인이 적용되며 세금계산서 발행이 가능합니다.'
  },
  {
    id: 'INQ-002',
    userId: 'user-002',
    userName: '이서연',
    subject: '워크스페이스 SSO 연동 지원 범위 질문',
    message: 'Google Workspace 및 Okta SAML 2.0 연동 가이드 문서를 요청드립니다.',
    category: 'Technical',
    status: 'in_progress',
    createdAt: '2026-03-23 11:10',
    answer: null
  }
];

let cartItems = [
  {
    id: 'cart-item-1',
    productId: 'product-102',
    name: 'Team Pro',
    price: 59000,
    quantity: 1,
    interval: '월'
  }
];

let orders = [
  {
    id: 'order-501',
    userId: 'user-001',
    items: [{ productId: 'product-102', name: 'Team Pro', price: 59000, quantity: 1 }],
    totalAmount: 59000,
    paymentMethod: 'card',
    status: 'completed',
    createdAt: '2026-03-01 10:00:00'
  },
  {
    id: 'order-502',
    userId: 'user-001',
    items: [{ productId: 'product-101', name: 'Business Starter', price: 29000, quantity: 2 }],
    totalAmount: 58000,
    paymentMethod: 'card',
    status: 'completed',
    createdAt: '2026-03-15 14:20:00'
  }
];

let payments = [
  {
    id: 'pay-001',
    orderId: 'order-501',
    transaction_id: 'PAY-TX-000',
    amount: 59000,
    paymentMethod: 'card',
    status: 'success',
    createdAt: '2026-03-01 10:00:05'
  },
  {
    id: 'pay-002',
    orderId: 'order-502',
    transaction_id: 'PAY-TX-000b',
    amount: 58000,
    paymentMethod: 'card',
    status: 'success',
    createdAt: '2026-03-15 14:20:05'
  }
];

// All generated transactions (for PPO observation and Activity UI)
let transactions = [
  {
    request_sequence: 1,
    idempotency_key: 'INIT-TX-KEY-001',
    transaction_id: 'TX-INIT-001',
    type: 'system',
    actionName: '시스템 초기화 및 워크스페이스 로드',
    user_id: 'user-001',
    status: 'completed',
    request_payload: { action: 'init' },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Helper to record transaction
function recordTransaction({ type, actionName, idempotency_key, transaction_id, payload, userId = currentUser.id }) {
  requestSequenceCounter++;
  const record = {
    request_sequence: requestSequenceCounter,
    idempotency_key: idempotency_key || `AUTO-KEY-${Date.now()}`,
    transaction_id: transaction_id,
    type: type,
    actionName: actionName || type,
    user_id: userId,
    status: 'completed',
    request_payload: payload || {},
    created_at: new Date().toISOString()
  };
  transactions.unshift(record);
  return record;
}

// ----------------------------------------------------
// General & Health Check APIs
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site036'
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    workspace: workspaces[0],
    stats: {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalMembers: users.length,
      totalFiles: files.length,
      totalReservations: reservations.length,
      cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    },
    recentProjects: projects.slice(0, 3),
    recentFiles: files.slice(0, 3),
    upcomingReservations: reservations.slice(0, 2),
    recentActivities: transactions.slice(0, 6)
  });
});

app.get('/api/workspaces', (req, res) => {
  res.json(workspaces);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

// ----------------------------------------------------
// 1. Search API (SEC-331 / site036-bug01)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug01 / SEC-331
// Idempotency key is not enforced for search requests.
// Repeating search with the same idempotency_key creates distinct SEARCH-TX-xxx transactions.
app.post('/api/search', (req, res) => {
  const { query = '', filters = {}, idempotency_key } = req.body;
  const normalizedQuery = query.toLowerCase().trim();

  const matchedProjects = projects.filter(p => 
    p.name.toLowerCase().includes(normalizedQuery) ||
    p.description.toLowerCase().includes(normalizedQuery) ||
    p.owner.toLowerCase().includes(normalizedQuery)
  );

  const matchedFiles = files.filter(f => 
    f.name.toLowerCase().includes(normalizedQuery) ||
    f.description.toLowerCase().includes(normalizedQuery)
  );

  const matchedProducts = products.filter(pr => 
    pr.name.toLowerCase().includes(normalizedQuery) ||
    pr.description.toLowerCase().includes(normalizedQuery)
  );

  const transaction_id = generateTxId('search');
  
  const tx = recordTransaction({
    type: 'search',
    actionName: `통합 검색: "${query || '전체'}"`,
    idempotency_key,
    transaction_id,
    payload: { query, filters }
  });

  res.json({
    success: true,
    bugId: 'site036-bug01',
    secId: 'SEC-331',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    query,
    results: {
      projects: matchedProjects,
      files: matchedFiles,
      products: matchedProducts,
      totalCount: matchedProjects.length + matchedFiles.length + matchedProducts.length
    }
  });
});

// ----------------------------------------------------
// 2. Profile Bio API (SEC-332 / site036-bug02)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug02 / SEC-332
// Idempotency key is not enforced for profile bio updates.
// Duplicate requests with the same idempotency_key create new BIO-TX-xxx transactions.
app.get('/api/profile', (req, res) => {
  res.json(currentUser);
});

app.post('/api/profile/bio', (req, res) => {
  const { bio, idempotency_key } = req.body;
  if (bio !== undefined) {
    currentUser.bio = bio;
    const foundUser = users.find(u => u.id === currentUser.id);
    if (foundUser) foundUser.bio = bio;
  }

  const transaction_id = generateTxId('bio');
  const tx = recordTransaction({
    type: 'bio',
    actionName: '프로필 소개 수정',
    idempotency_key,
    transaction_id,
    payload: { bio }
  });

  res.json({
    success: true,
    bugId: 'site036-bug02',
    secId: 'SEC-332',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    profile: currentUser
  });
});

// ----------------------------------------------------
// 3. Support Inquiry API (SEC-333 / site036-bug03)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug03 / SEC-333
// Idempotency key is not enforced for support inquiries.
// Duplicate inquiry submissions with the same key create multiple distinct inquiry records & INQ-TX-xxx.
app.get('/api/support/inquiries', (req, res) => {
  res.json(inquiries);
});

app.post('/api/support/inquiries', (req, res) => {
  const { subject, message, category = 'General', idempotency_key } = req.body;

  const newInquiry = {
    id: `INQ-${String(inquiries.length + 1).padStart(3, '0')}`,
    userId: currentUser.id,
    userName: currentUser.name,
    subject: subject || '고객 문의',
    message: message || '',
    category,
    status: 'pending',
    createdAt: new Date().toISOString(),
    answer: null
  };

  inquiries.unshift(newInquiry);

  const transaction_id = generateTxId('inquiry');
  const tx = recordTransaction({
    type: 'inquiry',
    actionName: `고객 문의 접수: [${subject}]`,
    idempotency_key,
    transaction_id,
    payload: { subject, message, category }
  });

  res.status(201).json({
    success: true,
    bugId: 'site036-bug03',
    secId: 'SEC-333',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    inquiry: newInquiry
  });
});

// ----------------------------------------------------
// 4. Product Name API (SEC-334 / site036-bug04)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug04 / SEC-334
// Idempotency key is not enforced when updating product name.
// Multiple submissions with the same idempotency_key generate duplicate PRODUCT-TX-xxx audit transactions.
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { name, price, description, features } = req.body;
  const newProduct = {
    id: `product-${products.length + 101}`,
    name,
    code: `PROD-${Date.now()}`,
    price: Number(price) || 49000,
    interval: '월',
    description,
    features: features || ['기본 기능 지원'],
    popular: false,
    badge: '신규 상품'
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.post('/api/products/name', (req, res) => {
  const { productId, name, idempotency_key } = req.body;
  const product = products.find(p => p.id === productId);
  if (product && name) {
    product.name = name;
  }

  const transaction_id = generateTxId('product');
  const tx = recordTransaction({
    type: 'product',
    actionName: `상품명 변경: [${name || productId}]`,
    idempotency_key,
    transaction_id,
    payload: { productId, name }
  });

  res.json({
    success: true,
    bugId: 'site036-bug04',
    secId: 'SEC-334',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    product
  });
});

// ----------------------------------------------------
// 5. File Description API (SEC-335 / site036-bug05)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug05 / SEC-335
// Idempotency key is not enforced for file description updates.
// Duplicate requests with the same key create multiple FILE-TX-xxx transactions.
app.get('/api/files', (req, res) => {
  res.json(files);
});

app.post('/api/files', (req, res) => {
  const { name, size, type, description } = req.body;
  const newFile = {
    id: `file-${files.length + 201}`,
    name: name || 'Document.pdf',
    size: size || '1.2 MB',
    type: type || 'pdf',
    uploader: currentUser.name,
    description: description || '신규 업로드 파일',
    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    downloads: 0
  };
  files.unshift(newFile);
  res.status(201).json(newFile);
});

app.post('/api/files/description', (req, res) => {
  const { fileId, description, idempotency_key } = req.body;
  const file = files.find(f => f.id === fileId);
  if (file && description !== undefined) {
    file.description = description;
  }

  const transaction_id = generateTxId('file');
  const tx = recordTransaction({
    type: 'file',
    actionName: `파일 설명 변경: [${file ? file.name : fileId}]`,
    idempotency_key,
    transaction_id,
    payload: { fileId, description }
  });

  res.json({
    success: true,
    bugId: 'site036-bug05',
    secId: 'SEC-335',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    file
  });
});

// ----------------------------------------------------
// 6. Project Comments API (SEC-336 / site036-bug06)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug06 / SEC-336
// Idempotency key is not enforced for posting project comments.
// Repeated requests with the same idempotency_key create duplicate comment records & COMMENT-TX-xxx transactions.
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:projectId/comments', (req, res) => {
  const { projectId } = req.params;
  const filtered = comments.filter(c => c.projectId === projectId);
  res.json(filtered);
});

app.post('/api/projects/:projectId/comments', (req, res) => {
  const { projectId } = req.params;
  const { content, idempotency_key } = req.body;

  const newComment = {
    id: `comment-${String(comments.length + 1).padStart(3, '0')}`,
    projectId,
    author: currentUser.name,
    authorAvatar: currentUser.avatar,
    content: content || '',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  comments.push(newComment);

  const proj = projects.find(p => p.id === projectId);
  if (proj) {
    proj.commentsCount = (proj.commentsCount || 0) + 1;
  }

  const transaction_id = generateTxId('comment');
  const tx = recordTransaction({
    type: 'comment',
    actionName: `프로젝트 댓글 등록: [${proj ? proj.name : projectId}]`,
    idempotency_key,
    transaction_id,
    payload: { projectId, content }
  });

  res.status(201).json({
    success: true,
    bugId: 'site036-bug06',
    secId: 'SEC-336',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    comment: newComment
  });
});

// ----------------------------------------------------
// 7. Reservation Note API (SEC-337 / site036-bug07)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug07 / SEC-337
// Idempotency key is not enforced when saving reservation notes.
// Repeated requests with the same key create duplicate RESNOTE-TX-xxx transactions.
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.post('/api/reservations', (req, res) => {
  const { roomName, date, time, purpose, note } = req.body;
  const newRes = {
    id: `reservation-${reservations.length + 301}`,
    roomName: roomName || '메인 회의실',
    type: '회의실',
    date: date || '2026-04-20',
    time: time || '14:00 - 15:00',
    organizer: currentUser.name,
    purpose: purpose || '팀 업무 미팅',
    note: note || '',
    status: 'confirmed'
  };
  reservations.push(newRes);
  res.status(201).json(newRes);
});

app.post('/api/reservations/:reservationId/note', (req, res) => {
  const { reservationId } = req.params;
  const { note, idempotency_key } = req.body;

  const resItem = reservations.find(r => r.id === reservationId);
  if (resItem && note !== undefined) {
    resItem.note = note;
  }

  const transaction_id = generateTxId('resnote');
  const tx = recordTransaction({
    type: 'resnote',
    actionName: `예약 메모 저장: [${resItem ? resItem.roomName : reservationId}]`,
    idempotency_key,
    transaction_id,
    payload: { reservationId, note }
  });

  res.json({
    success: true,
    bugId: 'site036-bug07',
    secId: 'SEC-337',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    reservation: resItem
  });
});

// ----------------------------------------------------
// 8. Cart Items API (SEC-338 / site036-bug08)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug08 / SEC-338
// Idempotency key is not enforced for adding items to cart.
// Repeated requests with the same key increase item quantity and create distinct CART-TX-xxx transactions.
app.get('/api/cart', (req, res) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.json({
    items: cartItems,
    totalAmount,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  });
});

app.post('/api/cart/items', (req, res) => {
  const { productId, quantity = 1, idempotency_key } = req.body;
  const product = products.find(p => p.id === productId);

  let existing = cartItems.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += Number(quantity);
  } else if (product) {
    cartItems.push({
      id: `cart-item-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: Number(quantity),
      interval: product.interval
    });
  }

  const transaction_id = generateTxId('cart');
  const tx = recordTransaction({
    type: 'cart',
    actionName: `장바구니 담기: [${product ? product.name : productId}] (+${quantity})`,
    idempotency_key,
    transaction_id,
    payload: { productId, quantity }
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.status(201).json({
    success: true,
    bugId: 'site036-bug08',
    secId: 'SEC-338',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    cart: {
      items: cartItems,
      totalAmount,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  });
});

// ----------------------------------------------------
// 9. Payment API (SEC-339 / site036-bug09)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug09 / SEC-339
// Idempotency key is not checked on payment requests.
// Repeating payments with the same idempotency_key creates multiple distinct PAY-TX-xxx payment transactions.
app.get('/api/payments', (req, res) => {
  res.json(payments);
});

app.post('/api/payments', (req, res) => {
  const { orderId, amount, paymentMethod = 'card', idempotency_key } = req.body;

  const transaction_id = generateTxId('pay');

  const newPayment = {
    id: `pay-${String(payments.length + 1).padStart(3, '0')}`,
    orderId: orderId || `order-${Date.now()}`,
    transaction_id,
    amount: Number(amount) || 59000,
    paymentMethod,
    status: 'success',
    createdAt: new Date().toISOString()
  };

  payments.unshift(newPayment);

  const tx = recordTransaction({
    type: 'pay',
    actionName: `구독/서비스 결제: ₩${Number(amount || 59000).toLocaleString()}`,
    idempotency_key,
    transaction_id,
    payload: { orderId, amount, paymentMethod }
  });

  res.status(201).json({
    success: true,
    bugId: 'site036-bug09',
    secId: 'SEC-339',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    payment: newPayment
  });
});

// ----------------------------------------------------
// 10. Filter API (SEC-340 / site036-bug10)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug10 / SEC-340
// Idempotency key is not enforced for project filter search.
// Repeated filter requests with the same key generate distinct FILTER-TX-xxx transactions.
app.post('/api/projects/filter', (req, res) => {
  const { status, priority, owner, category, idempotency_key } = req.body;

  let filtered = [...projects];
  if (status && status !== 'all') {
    filtered = filtered.filter(p => p.status === status);
  }
  if (priority && priority !== 'all') {
    filtered = filtered.filter(p => p.priority === priority);
  }
  if (owner && owner !== 'all') {
    filtered = filtered.filter(p => p.owner.includes(owner));
  }
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  const transaction_id = generateTxId('filter');
  const tx = recordTransaction({
    type: 'filter',
    actionName: `프로젝트 필터링: [상태: ${status || '전체'}, 우선순위: ${priority || '전체'}]`,
    idempotency_key,
    transaction_id,
    payload: { status, priority, owner, category }
  });

  res.json({
    success: true,
    bugId: 'site036-bug10',
    secId: 'SEC-340',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    filters: { status, priority, owner, category },
    results: filtered,
    count: filtered.length
  });
});

// ----------------------------------------------------
// Transactions & Activity APIs (PPO observation endpoint)
// ----------------------------------------------------
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.get('/api/transactions/:transactionId', (req, res) => {
  const found = transactions.find(t => t.transaction_id === req.params.transactionId);
  if (!found) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(found);
});

// Serve frontend static build if available
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('WorkNest backend running. Use Vite dev server for frontend development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[WorkNest Server] Running on http://localhost:${PORT}`);
  console.log(`[Health Check] http://localhost:${PORT}/api/health`);
});
