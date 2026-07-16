import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5035;

app.use(cors());
app.use(express.json());

// Books Database (15 items)
let books = [
  { id: "book-01", title: "달러구트 꿈 백화점", author: "이미예", genre: "판타지", cover: "/images/book-01.png", pagesCount: 280, summary: "잠들어야만 입장할 수 있는 상점가, 온갖 꿈을 사고파는 사람들의 따뜻하고 몽환적인 이야기." },
  { id: "book-02", title: "불편한 편의점", author: "김호연", genre: "소설", cover: "/images/book-02.png", pagesCount: 300, summary: "서울 청파동 골목의 작은 편의점을 무대로 이웃들의 희로애락을 유쾌하고 감동적으로 그린 소설." },
  { id: "book-03", title: "모순", author: "양귀자", genre: "소설", cover: "/images/book-03.png", pagesCount: 250, summary: "인생의 모순과 사랑, 결혼에 대한 예리하고 깊이 있는 성찰을 담은 한국 문학의 스테디셀러." },
  { id: "book-04", title: "사피엔스", author: "유발 하라리", genre: "역사/인문", cover: "/images/book-04.png", pagesCount: 520, summary: "변방의 유인원에서 지구의 지배자가 된 인류 역사의 거대한 흐름과 문명을 종횡무진 탐색한 명작." },
  { id: "book-05", title: "돈의 속성", author: "김승호", genre: "경제/경영", cover: "/images/book-05.png", pagesCount: 320, summary: "맨손에서 시작해 글로벌 외식 그룹을 일군 저자가 말하는 돈의 성질과 투자에 대한 통찰." },
  { id: "book-06", title: "세이노의 가르침", author: "세이노", genre: "자기계발", cover: "/images/book-06.png", pagesCount: 680, summary: "순자산 수천억 원대 자산가가 전하는 피와 살이 되는 매서운 인생 조언과 자기혁명 처방전." },
  { id: "book-07", title: "미움받을 용기", author: "기시미 이치로", genre: "심리/철학", cover: "/images/book-07.png", pagesCount: 290, summary: "아들러 심리학을 대화체 형식으로 풀어내며 자유롭고 행복한 삶을 개척하는 지혜를 나눕니다." },
  { id: "book-08", title: "역행자", author: "자청", genre: "자기계발", cover: "/images/book-08.png", pagesCount: 310, summary: "돈, 시간, 운명으로부터 완전한 자유를 얻는 7단계 인생 공략집과 경제적 자유 매뉴얼." },
  { id: "book-09", title: "총 균 쇠", author: "재레드 다이아몬드", genre: "역사/인문", cover: "/images/book-09.png", pagesCount: 650, summary: "왜 어떤 민족들은 다른 민족들의 지배자가 되었는가? 인류 문명의 불평등 기원을 탐구한 저서." },
  { id: "book-10", title: "트렌드 코리아 2026", author: "김난도", genre: "경제/경영", cover: "/images/book-10.png", pagesCount: 340, summary: "다가오는 새해의 주요 기술적 변화 및 소비 트렌드 키워드를 정밀하게 분석 진단한 경제서." },
  
  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: book-11 도서 데이터의 표지 이미지 확장자를 고의로 손상된 '.pngeee'로 설정하여 
  // 브라우저 렌더링 시 이미지가 완전히 깨져서 출력되게 조작합니다.
  { id: "book-11", title: "데미안 (Demian)", author: "헤르만 헤세", genre: "소설", cover: "/images/book-11.pngeee", pagesCount: 220, summary: "알에서 깨어나 세상을 향해 나아가려는 소년 싱클레어의 자아 성찰과 성장을 그린 불후의 고전." },
  
  { id: "book-12", title: "인간 실격", author: "다자이 오사무", genre: "소설", cover: "/images/book-12.png", pagesCount: 160, summary: "순수한 영혼을 가진 한 남자가 위선적인 사회에서 파멸해가는 과정을 적나라하게 그린 고전." },
  { id: "book-13", title: "코스모스", author: "칼 세이건", genre: "과학", cover: "/images/book-13.png", pagesCount: 600, summary: "우주의 탄생과 인류 문명의 진화, 미지의 광활한 세계를 서정적인 필체로 노래한 대서사시." },
  { id: "book-14", title: "도둑맞은 집중력", author: "요한 하리", genre: "사회/교양", cover: "/images/book-14.png", pagesCount: 360, summary: "우리의 집중력을 빼앗아 가는 현대 사회 구조적 요인과 이를 회복하기 위한 심층 추적 보고서." },
  { id: "book-15", title: "부의 추월차선", author: "엠제이 드마코", genre: "경제/경영", cover: "/images/book-15.png", pagesCount: 400, summary: "젊은 나이에 부자가 되어 조기 은퇴를 이룩하는 속도의 과학과 추월차선 법칙의 경제 통찰." }
];

// User Bookshelf (IDs)
let myLibrary = ["book-01", "book-02", "book-04"];

// Highlights Database
let highlights = [
  { id: "hl-1", bookId: "book-01", page: 12, text: "꿈을 산다는 것은 결국 내일을 향한 희망을 품는 일이다.", date: "1일 전" },
  { id: "hl-2", bookId: "book-02", page: 45, text: "불편함이 때로는 사람들을 끈끈하게 이어주는 징검다리가 된다.", date: "3일 전" }
];

// Memos Database
let memos = [
  { id: "memo-1", bookId: "book-01", page: 12, text: "달러구트의 대사 중 가장 마음에 와닿는 문장. 메모해두고 매일 읽자.", date: "1일 전" },
  { id: "memo-2", bookId: "book-04", page: 152, text: "인지 혁명 파트 요약: 가상의 신화를 공유함으로써 대규모 협력이 가능해졌다는 가설.", date: "5일 전" }
];

// Active Subscription
let currentSubscription = { planName: "Free Trial", active: true, durationMonths: 1 };

// API: Get books
app.get('/api/books', (req, res) => {
  res.json(books);
});

// API: Get My Library list
app.get('/api/library', (req, res) => {
  const libraryBooks = books.filter(b => myLibrary.includes(b.id));
  res.json(libraryBooks);
});

// API: Add to Library
app.post('/api/library', (req, res) => {
  const { bookId } = req.body;
  if (!bookId) return res.status(400).json({ error: "도서 ID가 없습니다." });
  
  if (!myLibrary.includes(bookId)) {
    myLibrary.push(bookId);
  }
  res.json({ success: true, myLibrary });
});

// API: Get highlights for a book
app.get('/api/highlights', (req, res) => {
  res.json(highlights);
});

// API: Add highlight
app.post('/api/highlights', (req, res) => {
  const { bookId, page, text } = req.body;
  if (!bookId || !text) return res.status(400).json({ error: "필수 입력값 누락" });

  const newHl = {
    id: `hl-${Date.now()}`,
    bookId,
    page: Number(page) || 1,
    text,
    date: "방금 전"
  };
  highlights.push(newHl);
  res.status(201).json(newHl);
});

// API: Get memos
app.get('/api/memos', (req, res) => {
  res.json(memos);
});

// API: Save/Update memo (Error 2)
app.post('/api/memos/:id', (req, res) => {
  const { id } = req.params;
  const { text, bookId, page } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 메모 수정 시 기존의 메모 레코드를 갱신(UPDATE)해주는 대신 
  // 강제로 새로운 메모 객체를 생성해 푸시(INSERT)함으로써 중복 데이터가 무한 생성되는 에러를 만듭니다.
  // 원래 복원 덮어쓰기 로직 고의 스킵:
  // const memoIdx = memos.findIndex(m => m.id === id);
  // if (memoIdx !== -1) { memos[memoIdx].text = text; return res.json(...) }

  const newMemo = {
    id: `memo-${Date.now()}`,
    bookId,
    page: Number(page) || 1,
    text,
    date: "방금 전 수정됨"
  };
  memos.push(newMemo);

  res.json({ success: true, memos });
});

// API: Add new memo
app.post('/api/memos', (req, res) => {
  const { bookId, page, text } = req.body;
  const newMemo = {
    id: `memo-${Date.now()}`,
    bookId,
    page: Number(page) || 1,
    text,
    date: "방금 전"
  };
  memos.push(newMemo);
  res.status(201).json(newMemo);
});

// API: Subscribe (Error 4)
app.post('/api/subscription', (req, res) => {
  const { planName, durationMonths } = req.body;

  if (!planName || !durationMonths) {
    return res.status(400).json({ error: "구독 정보가 불충분합니다." });
  }

  const duration = Number(durationMonths);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 구독 요금제가 premium이면서 결제 약정 개월수가 12개월(1년)인 경우, 
  // 연간 결제 분배 처리 모듈의 무한 루프 락을 흉내내어 HTTP 500 에러를 리턴합니다.
  if (planName === 'premium' && duration === 12) {
    return res.status(500).json({
      error: "Internal Server Error: SubscriptionGatewayTimeoutException - Annual premium pricing plan calculation mismatch on server node."
    });
  }

  currentSubscription = {
    planName,
    active: true,
    durationMonths: duration
  };

  res.json({ success: true, subscription: currentSubscription });
});

app.get('/api/subscription', (req, res) => {
  res.json(currentSubscription);
});

// Generate cover SVG generator except for invalid extensions
app.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Handled broken image target (Error 5)
  if (filename.endsWith('.pngeee')) {
    return res.status(404).send('Not Found');
  }

  res.setHeader('Content-Type', 'image/svg+xml');

  const indexStr = filename.replace('book-', '').replace('.png', '');
  const color = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e', '#06b6d4'][Number(indexStr) - 1] || '#4b5563';

  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
      <rect width="80" height="120" rx="4" fill="${color}"/>
      <rect x="5" y="5" width="70" height="110" rx="2" fill="none" stroke="#fff" stroke-width="1" opacity="0.3"/>
      <text x="40" y="50" font-family="sans-serif" font-size="6" fill="#fff" text-anchor="middle" font-weight="bold">READ CLOUD</text>
      <text x="40" y="80" font-family="sans-serif" font-size="8" fill="#fff" text-anchor="middle" font-weight="bold">Book ${indexStr}</text>
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[ReadCloud Backend] Express server running on http://localhost:${PORT}`);
});
