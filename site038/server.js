import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9937;

app.use(cors());
app.use(express.json());

// Global Sequence & Transaction Counters
let requestSequenceCounter = 0;
let txCounters = {
  tag: 0,
  invite: 0,
  shipMemo: 0,
  refund: 0,
  suggest: 0,
  notification: 0,
  calendar: 0,
  report: 0,
  csv: 0,
  apiQuery: 0,
  generic: 0
};

function generateTxId(type) {
  txCounters[type] = (txCounters[type] || 0) + 1;
  const num = String(txCounters[type]).padStart(3, '0');
  switch (type) {
    case 'tag': return `TAG-TX-${num}`;
    case 'invite': return `INVITE-TX-${num}`;
    case 'shipMemo': return `SHIP-MEMO-TX-${num}`;
    case 'refund': return `REFUND-TX-${num}`;
    case 'suggest': return `SUGGEST-TX-${num}`;
    case 'notification': return `NOTIFICATION-TX-${num}`;
    case 'calendar': return `CALENDAR-TX-${num}`;
    case 'report': return `REPORT-TX-${num}`;
    case 'csv': return `CSV-TX-${num}`;
    case 'apiQuery': return `API-QUERY-TX-${num}`;
    default: return `TX-${num}`;
  }
}

// In-Memory Database
let users = [
  {
    id: 'user-001',
    name: '강지훈 (DailyFrame)',
    email: 'creator@example.com',
    role: 'Lead Creator',
    channelName: 'DailyFrame Studio',
    subscribers: '142K',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    plan: 'Creator Enterprise',
    joinedAt: '2025-01-10'
  },
  {
    id: 'user-002',
    name: '서유진 (StudioMango)',
    email: 'studio@example.com',
    role: 'Video Producer',
    channelName: 'Mango Tech Lab',
    subscribers: '89K',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    plan: 'Pro Team',
    joinedAt: '2025-02-15'
  },
  {
    id: 'user-003',
    name: '박민우 (Editor)',
    email: 'editor@example.com',
    role: 'Senior Video Editor',
    channelName: 'PixelRoom',
    subscribers: '45K',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    plan: 'Pro Team',
    joinedAt: '2025-03-01'
  }
];

let currentUser = { ...users[0] };

let creatorProfiles = [
  {
    id: 'creator-101',
    name: 'DailyFrame',
    category: 'Vlog & Lifestyle',
    mainPlatform: 'YouTube',
    subscribers: 142000,
    monthlyViews: 890000,
    activeProjects: 8,
    bio: '서울의 감각적인 카페와 여행 브이로그를 제작하는 영상 크리에이터입니다.'
  },
  {
    id: 'creator-102',
    name: 'StudioMango',
    category: 'Tech & Gadgets',
    mainPlatform: 'YouTube / Substack',
    subscribers: 89000,
    monthlyViews: 450000,
    activeProjects: 4,
    bio: '데스크 셋업, 생산성 도구, 카메라 장비 심층 리뷰 채널입니다.'
  }
];

let contents = [
  {
    id: 'content-201',
    title: 'Seoul Cafe Vlog: 성수동 감성 카페 투어 & 루틴',
    platform: 'YouTube',
    category: 'Vlog',
    status: 'published',
    views: '48.2K',
    likes: '3.4K',
    revenue: '₩420,000',
    publishDate: '2026-04-10',
    tags: ['vlog', 'seoul', 'cafe', 'lifestyle'],
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'content-202',
    title: 'Weekend Travel Guide: 강릉 1박 2일 힐링 코스 완벽 가이드',
    platform: 'YouTube',
    category: 'Travel',
    status: 'published',
    views: '92.5K',
    likes: '7.8K',
    revenue: '₩890,000',
    publishDate: '2026-04-05',
    tags: ['travel', 'gangneung', 'healing'],
    thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'content-203',
    title: 'Minimal Desk Setup 2026: 개발자와 영상편집자를 위한 셋업',
    platform: 'YouTube',
    category: 'Tech',
    status: 'published',
    views: '124.0K',
    likes: '11.2K',
    revenue: '₩1,250,000',
    publishDate: '2026-03-28',
    tags: ['desksetup', 'minimalism', 'productivity', 'apple'],
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'content-204',
    title: 'Camera Review: 4K 시네마틱 브이로그 종결 카메라 비교',
    platform: 'YouTube',
    category: 'Tech',
    status: 'editing',
    views: '-',
    likes: '-',
    revenue: '-',
    publishDate: '2026-05-01 (예정)',
    tags: ['camera', 'sony', 'cinematic'],
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'content-205',
    title: 'Creator Workflow: 1인 크리에이터 콘텐츠 기획 및 자동화 가이드',
    platform: 'Newsletter',
    category: 'Business',
    status: 'published',
    views: '18.4K',
    likes: '1.9K',
    revenue: '₩180,000',
    publishDate: '2026-04-12',
    tags: ['newsletter', 'workflow', 'creator economy'],
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'content-206',
    title: 'Summer Trip Diary: 제주도 숨은 명소 필름 사진 아카이브',
    platform: 'Blog',
    category: 'Travel',
    status: 'draft',
    views: '-',
    likes: '-',
    revenue: '-',
    publishDate: '2026-05-15 (예정)',
    tags: ['jeju', 'film', 'photo'],
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  }
];

let teamMembers = [
  { id: 'member-401', name: '강지훈', email: 'creator@example.com', role: 'Owner & Director', permissions: 'Full Access', avatar: users[0].avatar, status: 'Active' },
  { id: 'member-402', name: '서유진', email: 'studio@example.com', role: 'Video Editor', permissions: 'Editor', avatar: users[1].avatar, status: 'Active' },
  { id: 'member-403', name: '박민우', email: 'editor@example.com', role: 'Motion Designer', permissions: 'Contributor', avatar: users[2].avatar, status: 'Active' }
];

let invitations = [
  { id: 'invitation-501', email: 'sound.engineer@example.com', message: '사운드 믹싱 및 마스터링 협업을 위해 초대합니다.', role: 'Audio Specialist', status: 'Pending', sentAt: '2026-04-10' },
  { id: 'invitation-502', email: 'thumbnail.art@example.com', message: '유튜브 썸네일 디자인 제작 파트너 초대', role: 'Designer', status: 'Pending', sentAt: '2026-04-12' }
];

let shipments = [
  { id: 'shipment-601', recipient: '김하늘', item: 'DailyFrame 2026 리미티드 텀블러 & 스티커팩', address: '서울시 강남구 테헤란로 152', trackingNo: 'CJ-9921-8841', status: '배송중', memo: '부재 시 경비실에 맡겨주세요.' },
  { id: 'shipment-602', recipient: '이준서', item: '미니멀 데스크 장패드 (스웨이드 에디션)', address: '부산시 해운대구 마린시티2로 33', trackingNo: 'CJ-7721-4431', status: '배송준비', memo: '배송 전 연락 부탁드립니다.' },
  { id: 'shipment-603', recipient: '박지민', item: '크리에이터 워크플로우 가이드북 (양장본)', address: '대전시 유성구 대학로 99', trackingNo: 'CJ-3312-9902', status: '배송완료', memo: '문 앞에 놓아주세요.' }
];

let refunds = [
  { id: 'refund-701', orderId: 'order-701', customerName: '정우성', item: '데일리프레임 시그니처 후드티 L', amount: 59000, reason: '사이즈가 예상보다 큽니다.', status: '처리완료', requestedAt: '2026-04-08' },
  { id: 'refund-702', orderId: 'order-702', customerName: '최수진', item: '데스크 셋업 메탈 펜홀더', amount: 28000, reason: '상품이 설명과 다릅니다.', status: '검토중', requestedAt: '2026-04-11' }
];

let suggestions = [
  { id: 'suggestion-1101', keyword: '여행 브이로그', category: 'Travel', searchCount: 1420, addedAt: '2026-04-01' },
  { id: 'suggestion-1102', keyword: '데스크 셋업 룸투어', category: 'Tech', searchCount: 2890, addedAt: '2026-04-05' },
  { id: 'suggestion-1103', keyword: '유튜브 음향 마이크 추천', category: 'Audio', searchCount: 980, addedAt: '2026-04-09' }
];

let notifications = [
  { id: 'notification-801', title: '새로운 영상 [Seoul Cafe Vlog]에 댓글 50개가 달렸습니다.', type: 'comment', read: false, time: '10분 전' },
  { id: 'notification-802', title: '이번 달 채널 구독자가 140,000명을 돌파했습니다! 🎉', type: 'milestone', read: false, time: '2시간 전' },
  { id: 'notification-803', title: '굿즈 주문 배송 3건이 정상 출고되었습니다.', type: 'shipping', read: true, time: '1일 전' }
];

let calendarEvents = [
  { id: 'calendar-901', title: 'YouTube 영상 업로드 (Cafe Vlog)', date: '2026-04-20', type: 'upload', creator: '강지훈' },
  { id: 'calendar-902', title: '스폰서 광고 영상 1차 기획안 제출', date: '2026-04-24', type: 'meeting', creator: '서유진' },
  { id: 'calendar-903', title: '구독자 150K 기념 라이브 스트리밍', date: '2026-05-05', type: 'live', creator: 'DailyFrame Team' }
];

let reports = [
  { id: 'report-1001', period: '2026년 3월', platform: 'YouTube', totalViews: '428,500', watchTimeHours: '24,300', estimatedRevenue: '₩3,850,000', subscriberGrowth: '+8,400' },
  { id: 'report-1002', period: '2026년 2월', platform: 'YouTube', totalViews: '389,000', watchTimeHours: '21,900', estimatedRevenue: '₩3,420,000', subscriberGrowth: '+7,100' },
  { id: 'report-1003', period: '2026년 1월', platform: 'YouTube', totalViews: '350,200', watchTimeHours: '19,500', estimatedRevenue: '₩2,980,000', subscriberGrowth: '+6,200' }
];

let importedCsvData = [
  { id: 'import-1201', fileName: 'youtube-analytics-q1.csv', rows: 120, status: 'Success', importedAt: '2026-04-01 11:20' },
  { id: 'import-1202', fileName: 'merchandise-orders-march.csv', rows: 85, status: 'Success', importedAt: '2026-04-05 16:40' }
];

let queryHistory = [
  { id: 'query-1301', query: 'GET /api/content?platform=youtube', status: '200 OK', responseTime: '18ms', executedAt: '2026-04-10 14:20' },
  { id: 'query-1302', query: 'GET /api/reports?period=last-30-days', status: '200 OK', responseTime: '24ms', executedAt: '2026-04-12 09:15' }
];

let transactions = [
  {
    request_sequence: 1,
    idempotency_key: 'INIT-CREATORFLOW-KEY-001',
    transaction_id: 'TX-INIT-001',
    type: 'system',
    actionName: 'CreatorFlow 플랫폼 초기화 및 채널 데이터 로드',
    user_id: 'user-001',
    status: 'completed',
    request_payload: { action: 'init' },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

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
// General & Health Check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site038'
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    user: currentUser,
    stats: {
      totalSubscribers: '142K',
      monthlyViews: '890.5K',
      totalRevenue: '₩4,850,000',
      activeProjects: contents.length,
      pendingShipments: shipments.filter(s => s.status !== '배송완료').length
    },
    recentContents: contents.slice(0, 3),
    upcomingEvents: calendarEvents.slice(0, 2),
    recentNotifications: notifications.slice(0, 3),
    recentTransactions: transactions.slice(0, 5)
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const found = users.find(u => u.email === email) || users[0];
  currentUser = { ...found };
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: `user-${String(users.length + 1).padStart(3, '0')}`,
    name: name || '신규 크리에이터',
    email: email || `creator${Date.now()}@example.com`,
    role: 'Creator',
    channelName: `${name || 'New'} Studio`,
    subscribers: '0',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    plan: 'Pro Team',
    joinedAt: new Date().toISOString().substring(0, 10)
  };
  users.push(newUser);
  currentUser = { ...newUser };
  res.status(201).json({ success: true, user: newUser });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/creator/profile', (req, res) => {
  res.json(currentUser);
});

app.put('/api/creator/profile', (req, res) => {
  const { channelName, name } = req.body;
  if (channelName) currentUser.channelName = channelName;
  if (name) currentUser.name = name;
  res.json(currentUser);
});

// ----------------------------------------------------
// 1. Content Tags API (SEC-351 / site038-bug01)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug01 / SEC-351
// Idempotency key is not enforced for tag creation requests.
// Repeating tag post with the same idempotency_key creates distinct TAG-TX-xxx transactions.
app.get('/api/content', (req, res) => {
  res.json(contents);
});

app.get('/api/content/:contentId', (req, res) => {
  const item = contents.find(c => c.id === req.params.contentId);
  if (!item) return res.status(404).json({ error: 'Content not found' });
  res.json(item);
});

app.post('/api/content', (req, res) => {
  const { title, platform = 'YouTube', category = 'Vlog' } = req.body;
  const newContent = {
    id: `content-${contents.length + 201}`,
    title: title || '신규 기획 콘텐츠',
    platform,
    category,
    status: 'draft',
    views: '-',
    likes: '-',
    revenue: '-',
    publishDate: new Date().toISOString().substring(0, 10),
    tags: ['new', platform.toLowerCase()],
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80'
  };
  contents.unshift(newContent);
  res.status(201).json(newContent);
});

app.get('/api/content/:contentId/tags', (req, res) => {
  const item = contents.find(c => c.id === req.params.contentId);
  res.json(item ? item.tags : []);
});

app.post('/api/content/:contentId/tags', (req, res) => {
  const { contentId } = req.params;
  const { tag, idempotency_key } = req.body;

  const item = contents.find(c => c.id === contentId);
  if (item && tag) {
    item.tags.push(tag);
  }

  const transaction_id = generateTxId('tag');
  const tx = recordTransaction({
    type: 'tag',
    actionName: `콘텐츠 태그 추가: [${item ? item.title : contentId}] (#${tag})`,
    idempotency_key,
    transaction_id,
    payload: { contentId, tag }
  });

  res.status(201).json({
    success: true,
    bugId: 'site038-bug01',
    secId: 'SEC-351',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    tag,
    content: item
  });
});

// ----------------------------------------------------
// 2. Team Invitations API (SEC-352 / site038-bug02)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug02 / SEC-352
// Idempotency key is not enforced for team invitation messages.
// Duplicate requests with the same key generate multiple distinct INVITE-TX-xxx transactions.
app.get('/api/team', (req, res) => {
  res.json(teamMembers);
});

app.get('/api/team/invitations', (req, res) => {
  res.json(invitations);
});

app.post('/api/team/invitations', (req, res) => {
  const { email, message, role = 'Editor', idempotency_key } = req.body;

  const newInvite = {
    id: `invitation-${String(invitations.length + 501)}`,
    email: email || 'collaborator@example.com',
    message: message || 'CreatorFlow 프로젝트에 초대합니다.',
    role,
    status: 'Pending',
    sentAt: new Date().toISOString().substring(0, 10)
  };

  invitations.unshift(newInvite);

  const transaction_id = generateTxId('invite');
  const tx = recordTransaction({
    type: 'invite',
    actionName: `팀원 초대 메시지 전송: [${email}]`,
    idempotency_key,
    transaction_id,
    payload: { email, message, role }
  });

  res.status(201).json({
    success: true,
    bugId: 'site038-bug02',
    secId: 'SEC-352',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    invitation: newInvite
  });
});

// ----------------------------------------------------
// 3. Shipping Memo API (SEC-353 / site038-bug03)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug03 / SEC-353
// Idempotency key is not enforced when saving shipping memos.
// Duplicate requests with the same key create multiple SHIP-MEMO-TX-xxx transactions.
app.get('/api/shipping', (req, res) => {
  res.json(shipments);
});

app.get('/api/shipping/:shipmentId', (req, res) => {
  const s = shipments.find(item => item.id === req.params.shipmentId);
  if (!s) return res.status(404).json({ error: 'Shipment not found' });
  res.json(s);
});

app.post('/api/shipping/:shipmentId/memo', (req, res) => {
  const { shipmentId } = req.params;
  const { memo, idempotency_key } = req.body;

  const ship = shipments.find(s => s.id === shipmentId);
  if (ship && memo !== undefined) {
    ship.memo = memo;
  }

  const transaction_id = generateTxId('shipMemo');
  const tx = recordTransaction({
    type: 'shipMemo',
    actionName: `굿즈 배송 메모 저장: [${ship ? ship.recipient : shipmentId}]`,
    idempotency_key,
    transaction_id,
    payload: { shipmentId, memo }
  });

  res.json({
    success: true,
    bugId: 'site038-bug03',
    secId: 'SEC-353',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    shipment: ship
  });
});

// ----------------------------------------------------
// 4. Refunds Reason API (SEC-354 / site038-bug04)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug04 / SEC-354
// Idempotency key is not enforced for refund reason submission.
// Duplicate requests with the same key create multiple REFUND-TX-xxx transactions.
app.get('/api/refunds', (req, res) => {
  res.json(refunds);
});

app.post('/api/refunds/reason', (req, res) => {
  const { orderId, reason, idempotency_key } = req.body;

  const newRefund = {
    id: `refund-${String(refunds.length + 701)}`,
    orderId: orderId || `order-${Date.now()}`,
    customerName: currentUser.name,
    item: '크리에이터 공식 굿즈 패키지',
    amount: 59000,
    reason: reason || '상품 사유 입력',
    status: '검토중',
    requestedAt: new Date().toISOString().substring(0, 10)
  };

  refunds.unshift(newRefund);

  const transaction_id = generateTxId('refund');
  const tx = recordTransaction({
    type: 'refund',
    actionName: `굿즈 환불 사유 제출: [주문: ${orderId}]`,
    idempotency_key,
    transaction_id,
    payload: { orderId, reason }
  });

  res.status(201).json({
    success: true,
    bugId: 'site038-bug04',
    secId: 'SEC-354',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    refund: newRefund
  });
});

// ----------------------------------------------------
// 5. Search Suggestions API (SEC-355 / site038-bug05)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug05 / SEC-355
// Idempotency key is not enforced for registering search suggestions.
// Repeated requests with the same key create duplicate SUGGEST-TX-xxx transactions.
app.get('/api/search/suggestions', (req, res) => {
  res.json(suggestions);
});

app.post('/api/search/suggestions', (req, res) => {
  const { keyword, category = 'General', idempotency_key } = req.body;

  const newSugg = {
    id: `suggestion-${String(suggestions.length + 1101)}`,
    keyword: keyword || '추천 키워드',
    category,
    searchCount: 1,
    addedAt: new Date().toISOString().substring(0, 10)
  };

  suggestions.unshift(newSugg);

  const transaction_id = generateTxId('suggest');
  const tx = recordTransaction({
    type: 'suggest',
    actionName: `검색 제안 키워드 등록: [${keyword}]`,
    idempotency_key,
    transaction_id,
    payload: { keyword, category }
  });

  res.status(201).json({
    success: true,
    bugId: 'site038-bug05',
    secId: 'SEC-355',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    suggestion: newSugg
  });
});

app.get('/api/search', (req, res) => {
  const { q = '' } = req.query;
  const filtered = contents.filter(c => c.title.toLowerCase().includes(String(q).toLowerCase()));
  res.json({ results: filtered, count: filtered.length });
});

// ----------------------------------------------------
// 6. Notifications Title API (SEC-356 / site038-bug06)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site036-bug06 / SEC-356
// Idempotency key is not enforced when creating/updating notification title.
// Duplicate requests with the same key create multiple NOTIFICATION-TX-xxx transactions.
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.get('/api/notifications/:notificationId', (req, res) => {
  const n = notifications.find(item => item.id === req.params.notificationId);
  if (!n) return res.status(404).json({ error: 'Notification not found' });
  res.json(n);
});

app.post('/api/notifications/title', (req, res) => {
  const { notificationId, title, idempotency_key } = req.body;

  const notif = notifications.find(n => n.id === notificationId);
  if (notif && title) {
    notif.title = title;
  }

  const transaction_id = generateTxId('notification');
  const tx = recordTransaction({
    type: 'notification',
    actionName: `알림 제목 수정: [${title || notificationId}]`,
    idempotency_key,
    transaction_id,
    payload: { notificationId, title }
  });

  res.json({
    success: true,
    bugId: 'site038-bug06',
    secId: 'SEC-356',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    notification: notif
  });
});

// ----------------------------------------------------
// 7. Calendar Events API (SEC-357 / site038-bug07)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug07 / SEC-357
// Idempotency key is not enforced for creating calendar events.
// Duplicate event requests with the same key create multiple CALENDAR-TX-xxx transactions.
app.get('/api/calendar/events', (req, res) => {
  res.json(calendarEvents);
});

app.post('/api/calendar/events', (req, res) => {
  const { title, date, type = 'upload', idempotency_key } = req.body;

  const newEvt = {
    id: `calendar-${String(calendarEvents.length + 901)}`,
    title: title || '새 콘텐츠 일정',
    date: date || new Date().toISOString().substring(0, 10),
    type,
    creator: currentUser.name
  };

  calendarEvents.push(newEvt);

  const transaction_id = generateTxId('calendar');
  const tx = recordTransaction({
    type: 'calendar',
    actionName: `캘린더 일정 생성: [${title}] (${date})`,
    idempotency_key,
    transaction_id,
    payload: { title, date, type }
  });

  res.status(201).json({
    success: true,
    bugId: 'site038-bug07',
    secId: 'SEC-357',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    event: newEvt
  });
});

// ----------------------------------------------------
// 8. Reports Filter API (SEC-358 / site038-bug08)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug08 / SEC-358
// Idempotency key is not enforced for report filter submissions.
// Repeated filter requests with the same key generate distinct REPORT-TX-xxx transactions.
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.post('/api/reports/filter', (req, res) => {
  const { period = 'last-30-days', platform = 'youtube', metric = 'views', idempotency_key } = req.body;

  const transaction_id = generateTxId('report');
  const tx = recordTransaction({
    type: 'report',
    actionName: `성과 리포트 필터 적용: [기간: ${period}, 플랫폼: ${platform}, 지표: ${metric}]`,
    idempotency_key,
    transaction_id,
    payload: { period, platform, metric }
  });

  res.json({
    success: true,
    bugId: 'site038-bug08',
    secId: 'SEC-358',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    filters: { period, platform, metric },
    results: reports
  });
});

// ----------------------------------------------------
// 9. CSV Import API (SEC-359 / site038-bug09)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug09 / SEC-359
// Idempotency key is not checked on CSV data imports.
// Duplicate import requests with the same key create multiple CSV-TX-xxx transactions.
app.get('/api/import/history', (req, res) => {
  res.json(importedCsvData);
});

app.post('/api/import/csv', (req, res) => {
  const { fileName = 'content-metrics.csv', rows = 100, idempotency_key } = req.body;

  const newImport = {
    id: `import-${String(importedCsvData.length + 1201)}`,
    fileName,
    rows: Number(rows),
    status: 'Success',
    importedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  importedCsvData.unshift(newImport);

  const transaction_id = generateTxId('csv');
  const tx = recordTransaction({
    type: 'csv',
    actionName: `콘텐츠 데이터 CSV 업로드: [${fileName}] (${rows}행)`,
    idempotency_key,
    transaction_id,
    payload: { fileName, rows }
  });

  res.status(201).json({
    success: true,
    bugId: 'site038-bug09',
    secId: 'SEC-359',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    importRecord: newImport
  });
});

// ----------------------------------------------------
// 10. API Developer Query (SEC-360 / site038-bug10)
// ----------------------------------------------------
// INTENTIONAL BUSINESS LOGIC BUG:
// site038-bug10 / SEC-360
// Idempotency key is not enforced for developer API console queries.
// Repeated requests with the same key create distinct API-QUERY-TX-xxx transactions.
app.get('/api/developer/history', (req, res) => {
  res.json(queryHistory);
});

app.post('/api/developer/query', (req, res) => {
  const { query = 'GET /api/content', idempotency_key } = req.body;

  const newHistory = {
    id: `query-${String(queryHistory.length + 1301)}`,
    query,
    status: '200 OK',
    responseTime: `${Math.floor(Math.random() * 20) + 10}ms`,
    executedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  queryHistory.unshift(newHistory);

  const transaction_id = generateTxId('apiQuery');
  const tx = recordTransaction({
    type: 'apiQuery',
    actionName: `API Console 쿼리 실행: [${query}]`,
    idempotency_key,
    transaction_id,
    payload: { query }
  });

  res.json({
    success: true,
    bugId: 'site038-bug10',
    secId: 'SEC-360',
    transaction_id,
    replayed: false,
    request_sequence: tx.request_sequence,
    query,
    result: {
      status: 200,
      data: contents.slice(0, 2)
    }
  });
});

// ----------------------------------------------------
// Transactions & Activity APIs
// ----------------------------------------------------
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.get('/api/transactions/:transactionId', (req, res) => {
  const found = transactions.find(t => t.transaction_id === req.params.transactionId);
  if (!found) return res.status(404).json({ error: 'Transaction not found' });
  res.json(found);
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
      res.status(200).send('CreatorFlow backend running. Use Vite dev server for frontend development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[CreatorFlow Server] Running on http://localhost:${PORT}`);
  console.log(`[Health Check] http://localhost:${PORT}/api/health`);
});
