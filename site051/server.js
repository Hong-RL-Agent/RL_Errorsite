import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9950;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-Memory Database
let users = [
  {
    id: 1,
    name: "김민지",
    email: "minji@triplog.kr",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "카메라 들고 떠나는 감성 여행 크리에이터 📸",
    logCount: 8,
    likeCount: 340
  },
  {
    id: 2,
    name: "이주원",
    email: "juwon@triplog.kr",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "뚜벅이 배낭여행과 숨은 로컬 맛집 탐방가 🎒",
    logCount: 6,
    likeCount: 215
  },
  {
    id: 3,
    name: "박서준",
    email: "seojun@triplog.kr",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "주말마다 전국 방방곡곡 캠핑 & 차박 로드트립 ⛺",
    logCount: 5,
    likeCount: 190
  }
];

let currentUser = users[0];

// 30+ Mock Travel Logs for Infinite Scroll Testing
const destinations = ["제주", "부산", "강릉", "경주", "여수", "오사카", "도쿄", "후쿠오카", "다낭", "방콕", "파리", "스위스"];
const sampleImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&auto=format&fit=crop&q=80"
];

let travelLogs = [
  {
    id: 101,
    title: "제주도 3박 4일 감성 힐링 여행",
    destination: "제주",
    authorId: 1,
    authorName: "김민지",
    authorAvatar: users[0].avatar,
    startDate: "2026-09-20",
    endDate: "2026-09-23",
    tags: ["제주", "가족여행", "오션뷰", "카페투어"],
    likes: 124,
    commentCount: 18,
    status: "public",
    image: sampleImages[0],
    description: "푸른 에메랄드빛 협재 바다와 바람 부는 성산일출봉, 돌담길 예쁜 애월 카페를 천천히 걸었던 3박 4일간의 따뜻한 기록입니다.",
    itinerary: [
      { day: 1, place: "제주국제공항", time: "09:30", note: "렌터카 수령 및 출발" },
      { day: 1, place: "애월 한담해변 산책로", time: "11:30", note: "투명 카약 체험 및 오션뷰 카페" },
      { day: 1, place: "협재해수욕장", time: "15:00", note: "비양도 배경 노을 감상" },
      { day: 2, place: "성산일출봉", time: "06:00", note: "일출 등반" },
      { day: 2, place: "우도 성산포항", time: "10:30", note: "땅콩아이스크림 & 전기차 투어" },
      { day: 3, place: "사려니숲길", time: "14:00", note: "삼나무 숲 피톤치드 힐링" }
    ],
    createdAt: "2026-09-23 18:00"
  },
  {
    id: 102,
    title: "오사카 & 교토 4박 5일 벚꽃 미식 기행",
    destination: "오사카",
    authorId: 2,
    authorName: "이주원",
    authorAvatar: users[1].avatar,
    startDate: "2026-09-15",
    endDate: "2026-09-19",
    tags: ["오사카", "교토", "라멘투어", "벚꽃", "자유여행"],
    likes: 98,
    commentCount: 12,
    status: "public",
    image: sampleImages[1],
    description: "도톤보리의 화려한 야경과 타코야키, 그리고 교토 아라시야마 대나무숲의 고즈넉함을 만끽하고 돌아왔습니다.",
    itinerary: [
      { day: 1, place: "간사이 국제공항", time: "11:00", note: "난바행 라피트 탑승" },
      { day: 1, place: "도톤보리 글리코상", time: "14:00", note: "이치란 라멘 & 타코야키" },
      { day: 2, place: "교토 후시미이나리 신사", time: "09:00", note: "붉은 토리이 터널 걷기" },
      { day: 2, place: "아라시야마 치쿠린", time: "14:00", note: "대나무숲 & 응커피(% Arabica)" },
      { day: 3, place: "유니버설 스튜디오 재팬", time: "08:30", note: "슈퍼 닌텐도 월드 & 해리포터" }
    ],
    createdAt: "2026-09-20 11:30"
  },
  {
    id: 103,
    title: "부산 해운대 & 영도 흰여울마을 주말 로드트립",
    destination: "부산",
    authorId: 3,
    authorName: "박서준",
    authorAvatar: users[2].avatar,
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    tags: ["부산", "해운대", "흰여울문화마을", "돼지국밥", "캠핑"],
    likes: 85,
    commentCount: 9,
    status: "public",
    image: sampleImages[2],
    description: "부산 바다열차를 타고 청사포를 지나 영도의 절벽 위 흰여울마을까지, 푸른 파도와 함께한 감성 충전 여행기.",
    itinerary: [
      { day: 1, place: "부산역", time: "10:00", note: "본전돼지국밥 점심" },
      { day: 1, place: "블루라인파크 해변열차", time: "13:30", note: "미포 -> 청사포 스카이캡슐" },
      { day: 2, place: "영도 흰여울문화마을", time: "11:00", note: "절벽 해안산책로 & 포토존 카페" },
      { day: 2, place: "광안리 해수욕장", time: "19:00", note: "광안대교 드론 라이트쇼" }
    ],
    createdAt: "2026-09-14 16:40"
  },
  {
    id: 104,
    title: "강릉 안목해변 커피거리 & 정동진 바다열차",
    destination: "강릉",
    authorId: 1,
    authorName: "김민지",
    authorAvatar: users[0].avatar,
    startDate: "2026-09-05",
    endDate: "2026-09-07",
    tags: ["강릉", "커피", "동해바다", "정동진"],
    likes: 76,
    commentCount: 8,
    status: "public",
    // INTENTIONAL BACKEND BUG: site051-SEC-434
    // Broken image path to test image-fallback behavior
    image: "/mock-images/invalid-gangneung-404.jpg",
    description: "은은한 원두 향이 가득한 안목해변을 바라보며 시원한 바닷바람과 초당 순두부 젤라또를 즐긴 강릉 2박 3일.",
    itinerary: [
      { day: 1, place: "강릉역", time: "11:00", note: "KTX 도착" },
      { day: 1, place: "안목해변 커피거리", time: "13:00", note: "핸드드립 & 바다 뷰 감상" },
      { day: 2, place: "초당 순두부마을", time: "10:00", note: "짬뽕순두부 & 순두부젤라또" }
    ],
    createdAt: "2026-09-08 15:20"
  },
  {
    id: 105,
    title: "다낭 & 호이안 3박 5일 올인클루시브 힐링 휴양",
    destination: "다낭",
    authorId: 2,
    authorName: "이주원",
    authorAvatar: users[1].avatar,
    startDate: "2026-08-28",
    endDate: "2026-09-01",
    tags: ["다낭", "호이안", "야시장", "마사지", "리조트"],
    likes: 110,
    commentCount: 15,
    status: "public",
    image: sampleImages[3],
    description: "미케비치의 고운 모래사장과 호이안 올드타운의 형형색색 풍등 야경, 1일 1스파를 누린 최고의 휴가.",
    itinerary: [
      { day: 1, place: "다낭 국제공항", time: "22:00", note: "리조트 체크인" },
      { day: 2, place: "바나힐 골든브릿지", time: "09:00", note: "케이블카 & 신의 손 포토존" },
      { day: 3, place: "호이안 올드타운", time: "16:00", note: "투본강 소원배 띄우기 & 야시장" }
    ],
    createdAt: "2026-09-02 14:10"
  },
  {
    id: 106,
    title: "경주 황리단길 & 동궁과 월지 달빛 야경 투어",
    destination: "경주",
    authorId: 3,
    authorName: "박서준",
    authorAvatar: users[2].avatar,
    startDate: "2026-08-20",
    endDate: "2026-08-22",
    tags: ["경주", "역사투어", "황리단길", "야경", "한옥"],
    likes: 65,
    commentCount: 6,
    status: "public",
    image: sampleImages[4],
    description: "신라 천년의 숨결이 깃든 첨성대와 밤이 되면 황홀하게 물드는 동궁과 월지의 물그림자 야경 투어.",
    itinerary: [
      { day: 1, place: "황리단길", time: "12:00", note: "십원빵 & 한옥 감성 카페" },
      { day: 1, place: "동궁과 월지(안압지)", time: "20:00", note: "호수에 비친 신라의 밤 야경" },
      { day: 2, place: "불국사 & 석굴암", time: "10:00", note: "토함산 문화유산 탐방" }
    ],
    createdAt: "2026-08-24 10:00"
  }
];

// Generate additional logs up to 30 items for infinite scroll testing
for (let i = 107; i <= 135; i++) {
  const dest = destinations[i % destinations.length];
  const userObj = users[i % users.length];
  const isBroken = (i === 108 || i === 115 || i === 122); // some broken images for SEC-434

  travelLogs.push({
    id: i,
    title: `${dest}에서 보낸 ${3 + (i % 3)}박 ${(i % 3) + 4}일의 특별한 순간`,
    destination: dest,
    authorId: userObj.id,
    authorName: userObj.name,
    authorAvatar: userObj.avatar,
    startDate: `2026-08-${(i % 25) + 1}`,
    endDate: `2026-08-${(i % 25) + 4}`,
    tags: [dest, "여행", "휴가", "추천코스"],
    likes: 20 + (i * 3) % 80,
    commentCount: (i * 2) % 15,
    status: "public",
    image: isBroken ? `/mock-images/invalid-img-${i}.jpg` : sampleImages[i % sampleImages.length],
    description: `${dest}의 숨겨진 명소와 맛집을 찾아 떠난 감각적인 여행 일지입니다.`,
    itinerary: [
      { day: 1, place: `${dest} 중심가`, time: "10:00", note: "도착 및 체크인" },
      { day: 1, place: `${dest} 대표 관광지`, time: "14:00", note: "투어 및 사진 촬영" },
      { day: 2, place: `${dest} 로컬 야시장`, time: "19:00", note: "길거리 음식 먹방" }
    ],
    createdAt: `2026-08-${(i % 25) + 1} 12:00`
  });
}

let comments = [
  {
    id: 1,
    travelLogId: 101,
    authorId: 2,
    authorName: "이주원",
    content: "제주도 사진 색감이 너무 예쁘네요! 애월 카페 이름 여쭤봐도 될까요?",
    createdAt: "2026-09-23 19:30"
  },
  {
    id: 2,
    travelLogId: 101,
    authorId: 3,
    authorName: "박서준",
    content: "가족들과 함께 가기 딱 좋은 코스네요. 다음 달 제주 일정 짤 때 참고하겠습니다.",
    createdAt: "2026-09-23 20:15"
  },
  {
    id: 3,
    travelLogId: 102,
    authorId: 1,
    authorName: "김민지",
    content: "교토 벚꽃 터널 정말 감동적이죠! 저도 내년 봄에 꼭 다시 가고 싶어요.",
    createdAt: "2026-09-20 12:00"
  },
  {
    id: 4,
    travelLogId: 103,
    authorId: 1,
    authorName: "김민지",
    content: "흰여울마을 노을 카페 뷰가 정말 최고였어요!",
    createdAt: "2026-09-14 17:00"
  }
];

let likes = [
  { userId: 1, travelLogId: 101 },
  { userId: 1, travelLogId: 102 }
];

// Helper
const getRequestUser = (req) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    const found = users.find(u => u.id === parseInt(userId, 10));
    if (found) return found;
  }
  return currentUser;
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "triplog"
  });
});

// Profile APIs
app.get('/api/profile', (req, res) => {
  const user = getRequestUser(req);
  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/auth/login', (req, res) => {
  const { userId } = req.body;
  const found = users.find(u => u.id === parseInt(userId, 10));
  if (found) currentUser = found;
  res.json({ success: true, user: currentUser });
});

// Travel Logs APIs
// INTENTIONAL BACKEND BUG: site051-SEC-433 (Infinite Scroll Duplicate)
app.get('/api/travel-logs', (req, res) => {
  let { page = 1, limit = 6, destination, tag, search } = req.query;
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 6;

  let filtered = [...travelLogs];

  if (destination && destination !== 'all' && destination !== '전체') {
    filtered = filtered.filter(l => l.destination.includes(destination));
  }
  if (tag && tag !== 'all') {
    filtered = filtered.filter(l => l.tags && l.tags.includes(tag));
  }
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.destination.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      (l.tags && l.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;

  // INTENTIONAL BACKEND BUG: site051-SEC-433
  // When page >= 2 or during fast rapid scroll, offset overlaps with previous page items
  let offset = (page - 1) * limit;
  let isBug433 = false;

  if (page >= 2) {
    isBug433 = true;
    res.setHeader('X-Bug-Triggered', 'SEC-433');
    // Intentional bug: return overlapping page items (e.g. 2 items from previous page duplicated)
    offset = Math.max(0, (page - 1) * limit - 2);
  }

  const paginated = filtered.slice(offset, offset + limit);

  res.json({
    travelLogs: paginated,
    pagination: {
      currentPage: page,
      limit,
      total,
      hasMore: page < totalPages
    },
    ...(isBug433 ? {
      _bug: {
        id: "SEC-433",
        category: "list-rendering",
        family: "infinite-scroll-duplicate",
        message: "무한 스크롤 중복 데이터: 다음 페이지 로딩 시 이전 페이지의 항목이 중복 포함되어 목록에 렌더링됨"
      }
    } : {})
  });
});

// INTENTIONAL BACKEND BUG: site051-SEC-431 (Stale route state on back/forward)
app.get('/api/travel-logs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const log = travelLogs.find(l => l.id === id);
  if (!log) {
    return res.status(404).json({ error: "여행기를 찾을 수 없습니다." });
  }

  // Count actual comments for debugging
  const actualComments = comments.filter(c => c.travelLogId === id);

  res.setHeader('X-Bug-Triggered', 'SEC-431');
  res.json({
    travelLog: log,
    actualCommentCount: actualComments.length,
    _bug: {
      id: "SEC-431",
      category: "navigation",
      family: "stale-route-state",
      message: "상세 페이지 뒤로가기 시 이전 여행기의 상태 캐시가 즉시 초기화되지 않고 일시 잔존할 수 있음"
    }
  });
});

app.post('/api/travel-logs', (req, res) => {
  const user = getRequestUser(req);
  const { title, destination, startDate, endDate, tags, image, description, itinerary } = req.body;

  if (!title || !destination) {
    return res.status(400).json({ error: "제목과 여행지는 필수입니다." });
  }

  const newLog = {
    id: Date.now(),
    title,
    destination,
    authorId: user ? user.id : 1,
    authorName: user ? user.name : "김민지",
    authorAvatar: user ? user.avatar : users[0].avatar,
    startDate: startDate || "2026-10-01",
    endDate: endDate || "2026-10-04",
    tags: Array.isArray(tags) ? tags : ["여행"],
    likes: 0,
    commentCount: 0,
    status: "public",
    image: image || sampleImages[0],
    description: description || "새로운 여행 이야기입니다.",
    itinerary: Array.isArray(itinerary) ? itinerary : [],
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  travelLogs.unshift(newLog);
  res.status(201).json(newLog);
});

// INTENTIONAL BACKEND BUG: site051-SEC-435
// PATCH partial update overwrites non-provided fields with empty/defaults
app.patch('/api/travel-logs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const log = travelLogs.find(l => l.id === id);
  if (!log) {
    return res.status(404).json({ error: "여행기를 찾을 수 없습니다." });
  }

  // INTENTIONAL BACKEND BUG: site051-SEC-435
  // Instead of selectively updating only provided keys, unprovided fields get overwritten
  const provided = req.body;
  const isPartial = !('destination' in provided) || !('description' in provided) || !('tags' in provided);

  if (isPartial) {
    res.setHeader('X-Bug-Triggered', 'SEC-435');
    log.title = provided.title !== undefined ? provided.title : "";
    log.destination = provided.destination !== undefined ? provided.destination : ""; // Overwritten!
    log.description = provided.description !== undefined ? provided.description : ""; // Overwritten!
    if ('tags' in provided) log.tags = provided.tags;
  } else {
    Object.assign(log, provided);
  }

  res.json({
    success: true,
    travelLog: log,
    ...(isPartial ? {
      _bug: {
        id: "SEC-435",
        category: "update",
        family: "partial-update-overwrite",
        message: "PATCH 부분 수정 오류: 제목만 수정 요청했으나 전달되지 않은 필드(여행지, 설명)가 빈 값으로 덮어써짐"
      }
    } : {})
  });
});

app.delete('/api/travel-logs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = travelLogs.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: "여행기를 찾을 수 없습니다." });

  travelLogs.splice(idx, 1);
  comments = comments.filter(c => c.travelLogId !== id);
  res.json({ success: true, message: "여행기가 삭제되었습니다." });
});

// Comments APIs
app.get('/api/travel-logs/:id/comments', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const logComments = comments.filter(c => c.travelLogId === id);
  res.json(logComments);
});

// INTENTIONAL BACKEND BUG: site051-SEC-432
// 댓글은 정상 추가되나 travelLog.commentCount 집계값은 갱신하지 않아 불일치 발생
app.post('/api/travel-logs/:id/comments', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const log = travelLogs.find(l => l.id === id);
  if (!log) return res.status(404).json({ error: "여행기를 찾을 수 없습니다." });

  const user = getRequestUser(req);
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: "댓글 내용을 입력해주세요." });

  const newComment = {
    id: Date.now(),
    travelLogId: id,
    authorId: user ? user.id : 1,
    authorName: user ? user.name : "김민지",
    authorAvatar: user ? user.avatar : users[0].avatar,
    content: content.trim(),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  comments.push(newComment);

  // INTENTIONAL BACKEND BUG: site051-SEC-432
  // Do NOT increment log.commentCount! Keeps old count!
  const actualCount = comments.filter(c => c.travelLogId === id).length;
  res.setHeader('X-Bug-Triggered', 'SEC-432');

  res.status(201).json({
    comment: newComment,
    staleCommentCount: log.commentCount,
    actualCommentCount: actualCount,
    _bug: {
      id: "SEC-432",
      category: "synchronization",
      family: "aggregate-count-mismatch",
      message: `댓글 수 집계 동기화 오류: 댓글이 작성되어 실제 댓글은 ${actualCount}개이나 요약 정보(commentCount)는 ${log.commentCount}개로 유지됨`
    }
  });
});

app.delete('/api/comments/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = comments.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });

  const comment = comments[idx];
  const log = travelLogs.find(l => l.id === comment.travelLogId);
  comments.splice(idx, 1);
  if (log && log.commentCount > 0) log.commentCount -= 1;

  res.json({ success: true, message: "댓글이 삭제되었습니다." });
});

// Likes APIs
app.post('/api/travel-logs/:id/like', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const log = travelLogs.find(l => l.id === id);
  if (!log) return res.status(404).json({ error: "여행기를 찾을 수 없습니다." });

  log.likes += 1;
  res.json({ success: true, likes: log.likes });
});

app.delete('/api/travel-logs/:id/like', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const log = travelLogs.find(l => l.id === id);
  if (!log) return res.status(404).json({ error: "여행기를 찾을 수 없습니다." });

  log.likes = Math.max(0, log.likes - 1);
  res.json({ success: true, likes: log.likes });
});

// Static assets & SPA Fallback
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`TripLog (site051) server running on http://localhost:${PORT}`);
});
