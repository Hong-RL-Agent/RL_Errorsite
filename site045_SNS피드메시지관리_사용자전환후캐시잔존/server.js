import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5045;

app.use(cors());
app.use(express.json());

// Feed Database (Minimum 20 items)
let allPosts = [
  { id: "post-01", author: "김철수", category: "여행", content: "제주도 함덕 해변에서 바라본 일몰 풍경입니다. 바다 색깔이 너무 이쁘네요.", likes: 18, commentsCount: 2, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop" },
  { id: "post-02", author: "박영희", category: "일상", content: "오늘 아침 정갈하게 차려먹은 수제 브런치 플레이트 ☕🍳", likes: 25, commentsCount: 1, image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop" },
  { id: "post-03", author: "이민우", category: "코딩", content: "React 19 메이저 업데이트 릴리즈 분석 중! 서스펜스 기능이 더욱 강력해졌습니다.", likes: 14, commentsCount: 3, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop" },
  { id: "post-04", author: "정다은", category: "카페", content: "연남동 골목길에 새로 오픈한 아기자기한 감성 카페 투어 🍰", likes: 30, commentsCount: 0, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop" },
  { id: "post-05", author: "홍길동", category: "반려동물", content: "우리 집 귀염둥이 먼치킨 고양이 '치즈'의 꾹꾹이 영상 포착 🐱🐾", likes: 42, commentsCount: 1, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop" },
  
  { id: "post-06", author: "김철수", category: "일상", content: "주말 등산 완료! 관악산 정상 연주대에서 들이마시는 시원한 공기", likes: 11, commentsCount: 0, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop" },
  { id: "post-07", author: "박영희", category: "여행", content: "오사카 도톤보리 글리코상 앞에서 한 컷. 맛있는 타코야키 흡입 직전!", likes: 35, commentsCount: 2, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop" },
  { id: "post-08", author: "이민우", category: "코딩", content: "Tailwind CSS 컴포넌트 라이브러리 직접 커스텀 제작 중. 코드가 깔끔해집니다.", likes: 9, commentsCount: 0, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop" },
  { id: "post-09", author: "정다은", category: "카페", content: "따끈한 소금빵과 시원한 아인슈페너의 환상 조합! 이 집 소금빵 잘하네요.", likes: 21, commentsCount: 1, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop" },
  { id: "post-10", author: "홍길동", category: "반려동물", content: "산책 나와서 신나게 잔디밭을 뛰어다니는 사모예드 뭉치 🐕💨", likes: 50, commentsCount: 4, image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop" },
  
  { id: "post-11", author: "김철수", category: "코딩", content: "오늘의 백엔드 에러 디버깅 완료. 레이스 컨디션 잡느라 3시간 소모했습니다.", likes: 16, commentsCount: 1, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop" },
  { id: "post-12", author: "박영희", category: "일상", content: "오랜만에 서점 나들이. 베스트셀러 소설 한 권 사들고 들어갑니다.", likes: 13, commentsCount: 0, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop" },
  { id: "post-13", author: "이민우", category: "여행", content: "강원도 양양 서피비치. 청량한 파도 소리를 들으니 가슴이 뻥 뚫리네요.", likes: 28, commentsCount: 0, image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop" },
  { id: "post-14", author: "정다은", category: "반려동물", content: "조용히 이불 덮고 꿀잠 자고 있는 웰시코기 발바닥 젤리 🐾💤", likes: 37, commentsCount: 1, image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop" },
  { id: "post-15", author: "홍길동", category: "카페", content: "망원동 티라미수 본점 방문! 달콤하고 부드러운 오리지널 컵 티라미수", likes: 19, commentsCount: 0, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop" },
  
  { id: "post-16", author: "김철수", category: "여행", content: "여수 밤바다 낭만포차에서 돌문어 삼합에 소주 한 잔 🐙🍶", likes: 24, commentsCount: 0, image: "https://images.unsplash.com/photo-1534008897815-407b3d2c6c73?w=600&auto=format&fit=crop" },
  { id: "post-17", author: "박영희", category: "코딩", content: "드디어 첫 개인 포트폴리오 웹사이트를 완성해 배포했습니다! 감격스럽네요.", likes: 45, commentsCount: 5, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop" },
  { id: "post-18", author: "이민우", category: "일상", content: "따끈한 어묵국물에 떡볶이 순대. 겨울철 3대 포장마차 진미 먹방", likes: 31, commentsCount: 0, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop" },
  { id: "post-19", author: "정다은", category: "반려동물", content: "창밖을 하염없이 내다보며 집사를 기다리는 푸들의 촉촉한 눈망울 🐕", likes: 29, commentsCount: 1, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop" },
  { id: "post-20", author: "홍길동", category: "카페", content: "직접 원두를 로스팅하는 동네 에스프레소 바. 쌉싸름한 에스프레소 쇼콜라 ☕", likes: 23, commentsCount: 0, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop" }
];

// Bookmark Saved items DB (User A and User B)
let userSaves = {
  "user-A": ["post-01", "post-03", "post-05"],
  "user-B": ["post-02", "post-09"]
};

// Comments Database
let comments = [
  { id: "comm-01", postId: "post-01", author: "박영희", text: "사진 정말 기가 막히게 찍으셨네요! 힐링하고 갑니다." },
  { id: "comm-02", postId: "post-01", author: "이민우", text: "어디 펜션 묵으셨는지 추천 가능할까요?" },
  { id: "comm-03", postId: "post-02", author: "김철수", text: "와 브런치 구성이 너무 이뻐요. 저도 먹고 싶네요." }
];

// Message Thread Chat history (Error 4 Target)
let messageThreads = {
  "room-A": [
    { id: "m1", sender: "김철수", text: "A대화방: 안녕하세요 철수입니다.", time: "오후 8:30" },
    { id: "m2", sender: "박영희", text: "A대화방: 반갑습니다 철수님!", time: "오후 8:32" }
  ],
  "room-B": [
    { id: "m3", sender: "김철수", text: "B대화방: 회의 자료 송부드렸습니다.", time: "오후 8:40" },
    { id: "m4", sender: "이민우", text: "B대화방: 확인했습니다. 검토 후 연락드릴게요.", time: "오후 8:41" }
  ]
};

// Social Notifications Feed (Error 6 Target)
let notifications = [
  { id: "not-01", fromUser: "박영희", type: "like", postId: "post-01", message: "박영희님이 회원님의 [제주도 일몰] 게시물을 좋아합니다." },
  { id: "not-02", fromUser: "이민우", type: "comment", postId: "post-01", message: "이민우님이 회원님의 [제주도 일몰] 게시물에 댓글을 남겼습니다." }
];

// API: Get Feed with Scroll Pagination (Error 2 pagination delays)
app.get('/api/posts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  let delay = 0;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 페이지 2 요청 처리에 2000ms(2초) 인위적 지연을 유도하고, 
  // 페이지 3은 300ms 만에 신속 리턴하도록 하여 클라이언트 응답 뒤집힘 경합을 유도합니다.
  if (page === 2) delay = 2000;
  if (page === 3) delay = 300;

  setTimeout(() => {
    const limit = 8;
    const start = (page - 1) * limit;
    const end = start + limit;
    const results = allPosts.slice(start, end);
    res.json({ page, results });
  }, delay);
});

// API: Save/Bookmark post
app.post('/api/posts/save', (req, res) => {
  const { userId, postId } = req.body;
  if (!userSaves[userId]) userSaves[userId] = [];
  if (!userSaves[userId].includes(postId)) {
    userSaves[userId].push(postId);
  }
  res.json({ success: true, saved: userSaves[userId] });
});

// API: Unsave/Remove bookmark post (Error 1 Stale cache modifies A instead of B)
app.post('/api/posts/unsave', (req, res) => {
  const { userId, postId } = req.body;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Cache
  // DESCRIPTION: 클라이언트가 전환 후에도 A의 캐시 정보를 들고 있으므로, 
  // B 로그인 상태에서 북마크 제거를 요청하면 여전히 userId='user-A' 파라미터가 유입되어 
  // A 유저의 저장 목록 데이터가 수정 및 삭제 처리됩니다.
  if (userSaves[userId]) {
    userSaves[userId] = userSaves[userId].filter(id => id !== postId);
  }
  console.log(`[DB SAVE] Unsaved post ${postId} for user ${userId}. Current:`, userSaves[userId]);
  res.json({ success: true, saved: userSaves[userId] || [] });
});

// API: Get saved posts
app.get('/api/posts/saves/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(userSaves[userId] || []);
});

// API: Delete Post (Error 6 Orphan notification details)
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  
  // Delete the post record
  allPosts = allPosts.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 게시물을 삭제할 때 연관된 알림(notifications)이나 좋아요 테이블 데이터를 
  // 함께 전파 소거(Cascade Delete)하지 않고 내버려둡니다. 이 때문에 알림 피드에 
  // 파괴된 게시물 링크가 떠다니게 되며 클릭 시 템플릿 undefined 에러가 발생합니다.
  console.log(`[DB POST] Post ${id} deleted, but notification details pointing to it are kept!`);
  res.json({ success: true });
});

// API: Get Comments
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// API: Edit Comment (Error 3 Comment edit race 3s delay)
app.put('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { text, postId, author } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 댓글 수정 처리 시 디비 쓰기 작업에 3000ms(3초) 강제 딜레이를 유도합니다.
  // 사용자가 댓글 수정 즉시 삭제를 누르면 삭제(0.1초)가 먼저 돌고 3초 뒤에 수정이 완료되어,
  // 소멸된 레코드가 신규 인서트로 부활(Recreate)하는 데이터 롤백 현상이 연출됩니다.
  setTimeout(() => {
    const comm = comments.find(c => c.id === id);
    if (comm) {
      comm.text = text;
      console.log(`[DB COMMENT] Comment ${id} updated to: ${text}`);
    } else {
      // Recreate deleted comment
      comments.push({
        id,
        postId: postId || "post-01",
        author: author || "김철수",
        text
      });
      console.log(`[DB COMMENT RACE] Comment ${id} resurrected with text: ${text}`);
    }
  }, 3000);

  res.json({ success: true });
});

// API: Delete Comment (Error 3 deletes in 0.1s)
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    comments = comments.filter(c => c.id !== id);
    console.log(`[DB COMMENT] Comment ${id} deleted (0.1s)`);
  }, 100);
  res.json({ success: true });
});

// API: Blocked User Profile (Error 5 Information Leak)
app.get('/api/users/:id/profile', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 차단된 사용자 프로필(/api/users/user-blocked/profile) 요청 시 
  // HTTP 403 Forbidden 상태 코드를 보내어 비공개 처리하는 척하면서도,
  // 응답 본문 JSON 구조체에 해당 차단 인원의 총 글 개수(postCount) 및 
  // 최종 활동 감시 시간(lastActive) 등의 민감 파라미터를 그대로 노출하여 전송합니다.
  if (id === 'user-blocked') {
    return res.status(403).json({
      error: "차단 관계 설정으로 인해 열람이 금지된 사용자 프로필입니다.",
      postCount: 142,
      lastActive: "2026-07-13 20:45:00 (온라인)"
    });
  }

  res.json({ id, name: "일반 사용자", followerCount: 45 });
});

// API: Get Notifications
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// API: Send Message
app.post('/api/messages', (req, res) => {
  const { room, text, sender } = req.body;
  if (!messageThreads[room]) messageThreads[room] = [];
  
  const newMsg = {
    id: `m-${Date.now()}`,
    sender,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  messageThreads[room].push(newMsg);
  console.log(`[DB MESSAGES] Msg added to room ${room}:`, newMsg);
  res.json(newMsg);
});

// API: Get Messages for Room
app.get('/api/messages/:room', (req, res) => {
  const { room } = req.params;
  res.json(messageThreads[room] || []);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  allPosts = [
    { id: "post-01", author: "김철수", category: "여행", content: "제주도 함덕 해변에서 바라본 일몰 풍경입니다. 바다 색깔이 너무 이쁘네요.", likes: 18, commentsCount: 2, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop" },
    { id: "post-02", author: "박영희", category: "일상", content: "오늘 아침 정갈하게 차려먹은 수제 브런치 플레이트 ☕🍳", likes: 25, commentsCount: 1, image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop" },
    { id: "post-03", author: "이민우", category: "코딩", content: "React 19 메이저 업데이트 릴리즈 분석 중! 서스펜스 기능이 더욱 강력해졌습니다.", likes: 14, commentsCount: 3, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop" },
    { id: "post-04", author: "정다은", category: "카페", content: "연남동 골목길에 새로 오픈한 아기자기한 감성 카페 투어 🍰", likes: 30, commentsCount: 0, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop" },
    { id: "post-05", author: "홍길동", category: "반려동물", content: "우리 집 귀염둥이 먼치킨 고양이 '치즈'의 꾹꾹이 영상 포착 🐱🐾", likes: 42, commentsCount: 1, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop" },
    { id: "post-06", author: "김철수", category: "일상", content: "주말 등산 완료! 관악산 정상 연주대에서 들이마시는 시원한 공기", likes: 11, commentsCount: 0, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop" },
    { id: "post-07", author: "박영희", category: "여행", content: "오사카 도톤보리 글리코상 앞에서 한 컷. 맛있는 타코야키 흡입 직전!", likes: 35, commentsCount: 2, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop" },
    { id: "post-08", author: "이민우", category: "코딩", content: "Tailwind CSS 컴포넌트 라이브러리 직접 커스텀 제작 중. 코드가 깔끔해집니다.", likes: 9, commentsCount: 0, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop" },
    { id: "post-09", author: "정다은", category: "카페", content: "따끈한 소금빵과 시원한 아인슈페너의 환상 조합! 이 집 소금빵 잘하네요.", likes: 21, commentsCount: 1, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop" },
    { id: "post-10", author: "홍길동", category: "반려동물", content: "산책 나와서 신나게 잔디밭을 뛰어다니는 사모예드 뭉치 🐕💨", likes: 50, commentsCount: 4, image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop" },
    { id: "post-11", author: "김철수", category: "코딩", content: "오늘의 백엔드 에러 디버깅 완료. 레이스 컨디션 잡느라 3시간 소모했습니다.", likes: 16, commentsCount: 1, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop" },
    { id: "post-12", author: "박영희", category: "일상", content: "오랜만에 서점 나들이. 베스트셀러 소설 한 권 사들고 들어갑니다.", likes: 13, commentsCount: 0, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop" },
    { id: "post-13", author: "이민우", category: "여행", content: "강원도 양양 서피비치. 청량한 파도 소리를 들으니 가슴이 뻥 뚫리네요.", likes: 28, commentsCount: 0, image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop" },
    { id: "post-14", author: "정다은", category: "반려동물", content: "조용히 이불 덮고 꿀잠 자고 있는 웰시코기 발바닥 젤리 🐾💤", likes: 37, commentsCount: 1, image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop" },
    { id: "post-15", author: "홍길동", category: "카페", content: "망원동 티라미수 본점 방문! 달콤하고 부드러운 오리지널 컵 티라미수", likes: 19, commentsCount: 0, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop" },
    { id: "post-16", author: "김철수", category: "여행", content: "여수 밤바다 낭만포차에서 돌문어 삼합에 소주 한 잔 🐙🍶", likes: 24, commentsCount: 0, image: "https://images.unsplash.com/photo-1534008897815-407b3d2c6c73?w=600&auto=format&fit=crop" },
    { id: "post-17", author: "박영희", category: "코딩", content: "드디어 첫 개인 포트폴리오 웹사이트를 완성해 배포했습니다! 감격스럽네요.", likes: 45, commentsCount: 5, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop" },
    { id: "post-18", author: "이민우", category: "일상", content: "따끈한 어묵국물에 떡볶이 순대. 겨울철 3대 포장마차 진미 먹방", likes: 31, commentsCount: 0, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop" },
    { id: "post-19", author: "정다은", category: "반려동물", content: "창밖을 하염없이 내다보며 집사를 기다리는 푸들의 촉촉한 눈망울 🐕", likes: 29, commentsCount: 1, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop" },
    { id: "post-20", author: "홍길동", category: "카페", content: "직접 원두를 로스팅하는 동네 에스프레소 바. 쌉싸름한 에스프레소 쇼콜라 ☕", likes: 23, commentsCount: 0, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop" }
  ];
  userSaves = {
    "user-A": ["post-01", "post-03", "post-05"],
    "user-B": ["post-02", "post-09"]
  };
  comments = [
    { id: "comm-01", postId: "post-01", author: "박영희", text: "사진 정말 기가 막히게 찍으셨네요! 힐링하고 갑니다." },
    { id: "comm-02", postId: "post-01", author: "이민우", text: "어디 펜션 묵으셨는지 추천 가능할까요?" },
    { id: "comm-03", postId: "post-02", author: "김철수", text: "와 브런치 구성이 너무 이뻐요. 저도 먹고 싶네요." }
  ];
  messageThreads = {
    "room-A": [
      { id: "m1", sender: "김철수", text: "A대화방: 안녕하세요 철수입니다.", time: "오후 8:30" },
      { id: "m2", sender: "박영희", text: "A대화방: 반갑습니다 철수님!", time: "오후 8:32" }
    ],
    "room-B": [
      { id: "m3", sender: "김철수", text: "B대화방: 회의 자료 송부드렸습니다.", time: "오후 8:40" },
      { id: "m4", sender: "이민우", text: "B대화방: 확인했습니다. 검토 후 연락드릴게요.", time: "오후 8:41" }
    ]
  };
  notifications = [
    { id: "not-01", fromUser: "박영희", type: "like", postId: "post-01", message: "박영희님이 회원님의 [제주도 일몰] 게시물을 좋아합니다." },
    { id: "not-02", fromUser: "이민우", type: "comment", postId: "post-01", message: "이민우님이 회원님의 [제주도 일몰] 게시물에 댓글을 남겼습니다." }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[CircleUp Backend] Express server running on http://localhost:${PORT}`);
});
