import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5031;

app.use(cors());
app.use(express.json());

// Auctions Database (14 items)
let auctions = [
  { id: "auction-01", title: "아이폰 14 프로 256GB 스페이스블랙", category: "전자제품", basePrice: 600000, currentBid: 680000, bidsCount: 4, seller: "홍길동", desc: "사용기간 6개월 내외, 외관 기스 전혀 없는 특A급 아이폰입니다. 풀박스 보유." },
  { id: "auction-02", title: "레트로 오디오 턴테이블 LP 플레이어", category: "도서/음반", basePrice: 80000, currentBid: 120000, bidsCount: 6, seller: "이영희", desc: "레트로 스타일 인테리어에 딱 맞는 LP 플레이어입니다. 블루투스 아웃풋 기능 탑재." },
  { id: "auction-03", title: "플레이스테이션 5 디스크 에디션", category: "전자제품", basePrice: 300000, currentBid: 320000, bidsCount: 2, seller: "김철수", desc: "정식 발매판 PS5 디스크형입니다. 패드 1개 포함이며 오염 및 기스 없습니다." },
  { id: "auction-04", title: "나이키 에어 조던 1 레트로 하이 시카고", category: "패션/의류", basePrice: 150000, currentBid: 280000, bidsCount: 9, seller: "김민재", desc: "시카고 컬러링 레트로 모델 270 사이즈입니다. 실착 3회 미만 보관만 해두었습니다." },
  { id: "auction-05", title: "빈티지 롤렉스 서브마리너 1990 데이트", category: "패션/잡화", basePrice: 8000000, currentBid: 9200000, bidsCount: 15, seller: "명품수집가", desc: "1990년 오리지널 빈티지 롤렉스입니다. 연식 대비 무브먼트 보존 및 오버홀 완료." }, // Error 5 target
  { id: "auction-06", title: "MTB 산악자전거 트렉 820", category: "스포츠/레저", basePrice: 200000, currentBid: 210000, bidsCount: 1, seller: "라이더Park", desc: "동네 마실용으로만 타던 튼튼한 알루미늄 프레임 생활형 자전거입니다." },
  { id: "auction-07", title: "캠핑용 미니 FHD 스마트 빔프로젝터", category: "전자제품", basePrice: 120000, currentBid: 145000, bidsCount: 3, seller: "캠퍼김", desc: "안드로이드 OS 자체 탑재되어 유튜브, 넷플릭스 단독 재생 가능한 빔프로젝터입니다." },
  { id: "auction-08", title: "샤넬 클래식 미디엄 플랩백 램스킨 블랙", category: "패션/잡화", basePrice: 4000000, currentBid: 4500000, bidsCount: 8, seller: "럭셔리파인더", desc: "롯데백화점 본점 구매 영수증 동봉. 은장 체인 모델이며 램스킨 특유의 미세 생활감 존재." },
  { id: "auction-09", title: "다이슨 에어랩 멀티 스타일러 컴플리트", category: "뷰티/미용", basePrice: 350000, currentBid: 380000, bidsCount: 4, seller: "뷰티퀸", desc: "모든 노즐 배럴 구성품 풀박스 그대로 드립니다. 실사용 빈도가 적어 양도합니다." },
  { id: "auction-10", title: "마블 어벤져스 아이언맨 마크85 핫토이 피규어", category: "완구/취미", basePrice: 250000, currentBid: 310000, bidsCount: 7, seller: "피규어덕후", desc: "장식장에만 비치해 두던 제품입니다. LED 정상 발광 확인 완료했습니다." },
  { id: "auction-11", title: "1인용 고급 북유럽 원목 흔들의자", category: "가구/인테리어", basePrice: 50000, currentBid: 65000, bidsCount: 3, seller: "퍼니처맨", desc: "거실에서 안락하게 휴식을 취하기 적합한 단풍나무 원목 직조 의자입니다." },
  { id: "auction-12", title: "애플 맥북 프로 14 M2 Pro 512GB 실버", category: "전자제품", basePrice: 1400000, currentBid: 1450000, bidsCount: 2, seller: "애플매니아", desc: "맥북 배터리 효율 94%, 사이클 60회 미만입니다. 어댑터와 충전 케이블 동봉." },
  { id: "auction-13", title: "파타고니아 레트로 X 후리스 재킷 L", category: "패션/의류", basePrice: 90000, currentBid: 110000, bidsCount: 5, seller: "하이커짱", desc: "국내 공식 수입사 정품 패치 후리스입니다. 보풀 거의 없고 따뜻합니다." },
  { id: "auction-14", title: "프랑스 보르도 샤토 무통 로칠드 2015 와인", category: "식품/주류", basePrice: 180000, currentBid: 240000, bidsCount: 11, seller: "소믈리에", desc: "와인 셀러 내부 보관 중인 2015년 빈티지 명품 프랑스 와인 미개봉 정품입니다." }
];

// Bid History Database
let bids = [
  { id: "bid-101", auctionId: "auction-01", bidder: "김지훈", amount: 620000, date: "3시간 전" },
  { id: "bid-102", auctionId: "auction-01", bidder: "이민수", amount: 650000, date: "2시간 전" },
  { id: "bid-103", auctionId: "auction-01", bidder: "김지훈", amount: 680000, date: "1시간 전" },
  
  { id: "bid-104", auctionId: "auction-05", bidder: "시계덕후", amount: 8200000, date: "5시간 전" },
  { id: "bid-105", auctionId: "auction-05", bidder: "VIP골드", amount: 8700000, date: "4시간 전" },
  { id: "bid-106", auctionId: "auction-05", bidder: "시계덕후", amount: 9200000, date: "2시간 전" }
];

// Seller notifications log
let notifications = [
  { id: "not-01", text: "귀하의 '아이폰 14 프로' 경매에 김지훈 님이 680,000원을 입찰했습니다.", time: "1시간 전" },
  { id: "not-02", text: "신규 관심 등록: '빈티지 롤렉스 서브마리너'가 3명의 위시리스트에 담겼습니다.", time: "2시간 전" }
];

// API: Get auctions
app.get('/api/auctions', (req, res) => {
  res.json(auctions);
});

// API: Post auction (selling item registration)
app.post('/api/auctions', (req, res) => {
  const { title, category, basePrice, desc, seller } = req.body;

  if (!title || !category || !basePrice) {
    return res.status(400).json({ error: "경매 등록 필수 파라미터가 누락되었습니다." });
  }

  const newAuc = {
    id: `auction-${Date.now()}`,
    title,
    category,
    basePrice: Number(basePrice),
    currentBid: Number(basePrice),
    bidsCount: 0,
    seller: seller || "나의 상점",
    desc: desc || "상세 설명이 등록되지 않았습니다."
  };

  auctions.unshift(newAuc);
  res.status(201).json(newAuc);
});

// API: Get bid history for a specific auction
app.get('/api/auctions/:id/bids', (req, res) => {
  const { id } = req.params;
  const history = bids.filter(b => b.auctionId === id);
  res.json(history);
});

// API: Post new bid (Error 2)
app.post('/api/auctions/:id/bid', (req, res) => {
  const { id } = req.params;
  const { amount, bidder } = req.body;

  const item = auctions.find(a => a.id === id);
  if (!item) {
    return res.status(404).json({ error: "존재하지 않는 경매 상품입니다." });
  }

  const bidAmount = Number(amount);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 입찰 입력 금액이 현재의 최고가(currentBid)와 정확히 일치하는 경우, 
  // 거절 경고(400) 대신 백엔드 스레드 레이스 컨디션 트래싱 예외를 모사해 HTTP 500 에러를 전송합니다.
  if (bidAmount === item.currentBid) {
    return res.status(500).json({
      error: "Internal Server Error: ClassCastException - Highest bid value collision on auction instance synchronization lock."
    });
  }

  if (bidAmount <= item.currentBid) {
    return res.status(400).json({ error: "현재 최고 입찰가보다 큰 금액으로만 입찰 등록할 수 있습니다." });
  }

  // Save new bid
  const newBid = {
    id: `bid-${Date.now()}`,
    auctionId: id,
    bidder: bidder || "익명 입찰자",
    amount: bidAmount,
    date: "방금 전"
  };

  bids.unshift(newBid);

  // Update auction prices
  item.currentBid = bidAmount;
  item.bidsCount += 1;

  // Add notification
  notifications.unshift({
    id: `not-${Date.now()}`,
    text: `'${item.title}' 경매에 ${newBid.bidder} 님이 ${bidAmount.toLocaleString()}원을 새롭게 입찰했습니다.`,
    time: "방금 전"
  });

  res.status(201).json({ success: true, item, newBid });
});

// API: Cancel Bid (Error 3)
app.post('/api/bids/:id/cancel', (req, res) => {
  const { id } = req.params;

  const bidIdx = bids.findIndex(b => b.id === id);
  if (bidIdx === -1) {
    return res.status(404).json({ error: "취소할 입찰 내역을 찾을 수 없습니다." });
  }

  const targetBid = bids[bidIdx];
  
  // Remove bid record
  bids = bids.filter(b => b.id !== id);

  // Decrement bidsCount for the item
  const item = auctions.find(a => a.id === targetBid.auctionId);
  if (item) {
    item.bidsCount = Math.max(0, item.bidsCount - 1);
    
    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 입찰 기록 리스트(bids)에서는 행을 삭제하지만, 
    // 경매 상품 정보(auctions)에 기재되어 있는 최고가(currentBid) 항목은 취소 이전의 
    // 직전 최고 입찰 액수로 원상 복구(Rollback)하지 않고 그대로 둔 채 입찰 갯수만 깎는 버그를 유발합니다.
    // 원래 수행되어야 하는 이전 금액 추적 복구 로직 고의 생략:
    // const remainBids = bids.filter(b => b.auctionId === targetBid.auctionId);
    // const priorMax = remainBids.length > 0 ? Math.max(...remainBids.map(b => b.amount)) : item.basePrice;
    // item.currentBid = priorMax;
  }

  res.json({ success: true, bids });
});

// API: Get notifications
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// Mock SVG Images
app.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  res.setHeader('Content-Type', 'image/svg+xml');

  // Generate generic color theme based on file name index
  const indexStr = filename.replace('rent-', '').replace('.png', '');
  const color = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4', '#14b8a6', '#4b5563'][Number(indexStr) - 1] || '#475569';

  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
      <rect width="100" height="60" rx="4" fill="${color}"/>
      <g stroke="#fff" stroke-width="1.5" fill="none" opacity="0.3">
        <circle cx="50" cy="30" r="15" />
        <line x1="30" y1="30" x2="70" y2="30" />
      </g>
      <text x="50" y="34" font-family="sans-serif" font-size="8" fill="#fff" text-anchor="middle" font-weight="bold">Item ${indexStr}</text>
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[BidSquare Backend] Express server running on http://localhost:${PORT}`);
});
