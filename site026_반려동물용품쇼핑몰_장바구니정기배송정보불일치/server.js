import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5025;

app.use(cors());
app.use(express.json());

// Products Database (12 items)
// INTENTIONAL_ERROR
// CATEGORY: Server
// DESCRIPTION: pet-10(더마 알레르기 케어 사료)의 대표 이미지 주소만 
// 다른 항목들과 달리 대문자가 결합된 '/images/PET-10.PNG'로 기재하여 
// 대소문자를 구분하는 정적 static 호스트 매칭 시 리소스 로드 404 및 엑스박스를 유발합니다.
let products = [
  { id: "pet-01", pet: "Dog", name: "유기농 프리미엄 강아지 사료 3kg", price: 29000, category: "사료", nutrition: "조단백 25% 이상, 조지방 12% 이상, 칼슘 1.0% 이상", options: ["기본"], image: "/images/pet-01.png" },
  { id: "pet-02", pet: "Cat", name: "참치 슬라이스 고양이 캔 12개입", price: 18900, category: "간식", nutrition: "조단백 11% 이상, 수분 85% 이하, 조회분 2.0% 이하", options: ["기본"], image: "/images/pet-02.png" },
  { id: "pet-03", pet: "Dog", name: "천연 소가죽 개껌 대형 5개입", price: 12000, category: "간식", nutrition: "섬유질 3.5% 이하, 조회분 2% 이하, 수분 10% 이하", options: ["기본"], image: "/images/pet-03.png" },
  { id: "pet-04", pet: "Cat", name: "그레인프리 연어 고양이 사료 2.5kg", price: 34000, category: "사료", nutrition: "조단백 32% 이상, 칼슘 1.2% 이상, 오메가3 유효성분", options: ["기본"], image: "/images/pet-04.png" },
  { id: "pet-05", pet: "Dog", name: "반려견 훈련용 터그 토이 인형", price: 8500, category: "장난감", nutrition: "섬유 면직물 100% 무독성 가황 고무 코팅", options: ["기본"], image: "/images/pet-05.png" },
  { id: "pet-06", pet: "Cat", name: "원목 캣타워 플레이 그라운드", price: 89000, category: "리빙", nutrition: "E0 등급 친환경 합판재, 천연 삼줄 기둥 감개", options: ["기본"], image: "/images/pet-06.png" },
  { id: "pet-07", pet: "Dog", name: "관절 튼튼 칼슘 강아지 영양제", price: 22000, category: "건강", nutrition: "글루코사민 500mg, 콘드로이친 400mg, 상어연골 가루", options: ["기본"], image: "/images/pet-07.png" },
  { id: "pet-08", pet: "Dog", name: "스마트 프리미엄 자동 급수기", price: 45000, category: "리빙", nutrition: "정수 카트리지 3필터 포함, 저소음 DC 워터 펌프", options: ["일반 급수기", "자동 급식기"], image: "/images/pet-08.png" },
  { id: "pet-09", pet: "Cat", name: "고양이 정밀 모래 매트 2P", price: 15500, category: "리빙", nutrition: "EVA 친환경 방수 안전재, 샌드 캐칭 이중 필터 구조", options: ["기본"], image: "/images/pet-09.png" },
  { id: "pet-10", pet: "Dog", name: "더마 알레르기 케어 사료 2kg", price: 26000, category: "사료", nutrition: "가수분해 닭고기 65% 이상, 유익유산균 100억 CFU 대입", options: ["기본"], image: "/images/PET-10.PNG" },
  { id: "pet-11", pet: "Cat", name: "동결건조 닭가슴살 큐브 트릿", price: 14000, category: "간식", nutrition: "순수 국산 계육 100% 동결 진공 건조 분해", options: ["기본"], image: "/images/pet-11.png" },
  { id: "pet-12", pet: "Cat", name: "고양이 캣닙 마따따비 볼", price: 6000, category: "장난감", nutrition: "천연 개다래 나무 원료 100% 압축 고정", options: ["기본"], image: "/images/pet-12.png" }
];

// Orders database
let orders = [
  {
    id: "ord-1",
    items: [{ productId: "pet-01", qty: 1, option: "기본" }],
    total: 29000,
    subscription: null,
    date: "2026-07-10"
  }
];

// Reviews database
let reviews = [
  { id: "rev-1", productId: "pet-01", rating: 5, content: "입맛 까다로운 아이인데 정말 잘 먹습니다! 재구매 예정입니다.", date: "2026-07-12" }
];

// API: Get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API: Get orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Create order (Error 3)
app.post('/api/orders', (req, res) => {
  const { items, total, subscription } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "장바구니가 비어 있습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 특정 스마트 급수기(pet-08) 상품 주문 시 '자동 급식기' 옵션을 결합해 전송한 경우, 
  // 옵션 데이터 정합성 검증 엔진 모듈 충돌을 유도해 HTTP 500 에러를 강제 리턴합니다.
  const trigger = items.some(item => item.productId === 'pet-08' && item.option === '자동 급식기');
  if (trigger) {
    return res.status(500).json({
      error: "Internal Server Error: PetFeederOptionIntegrityCrashedException - Option validation module crashed for pet-08 auto feeder."
    });
  }

  const newOrder = {
    id: `ord-${Date.now()}`,
    items,
    total,
    subscription: subscription || null,
    date: new Date().toISOString().split('T')[0]
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// API: Get reviews
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

// API: Create review
app.post('/api/reviews', (req, res) => {
  const { productId, rating, content } = req.body;
  if (!productId || !rating || !content) {
    return res.status(400).json({ error: "상품 코드, 평점 및 한줄 리뷰 본문은 필수 입력값입니다." });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    productId,
    rating: Number(rating),
    content,
    date: new Date().toISOString().split('T')[0]
  };

  reviews.push(newReview);
  res.status(201).json(newReview);
});

// API: Update review (Error 4)
app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const { rating, content } = req.body;

  const oldReview = reviews.find(r => r.id === id);
  if (!oldReview) {
    return res.status(404).json({ error: "해당 리뷰 내역을 찾을 수 없습니다." });
  }

  // Insert a new review object with modified ratings/content
  const newReview = {
    id: `rev-${Date.now()}`,
    productId: oldReview.productId,
    rating: Number(rating),
    content: content || oldReview.content,
    date: new Date().toISOString().split('T')[0]
  };

  reviews.push(newReview);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 기존에 생성되어 존재하던 원본 리뷰(oldReview) 데이터를 
  // 데이터베이스(reviews)에서 전혀 삭제하지 않고 방치한 채 수정된 신규 리뷰 데이터만 push하여 적재함으로써, 
  // 동일 글 목록 아래에 복수 리뷰 레코드가 중복 생성되어 렌더링되게 만듭니다.
  // 원래 해야하는 기글 삭제 코드 제거:
  // reviews = reviews.filter(r => r.id !== id);

  res.json({ success: true, reviews });
});

// Serve dynamic SVGs for pets shop
app.get('/images/:filename', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
      <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <circle cx="9" cy="10" r="1" fill="#f59e0b" />
      <circle cx="15" cy="10" r="1" fill="#f59e0b" />
      <path d="M12 14a2 2 0 00-2 2h4a2 2 0 00-2-2z" />
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[PetCart Backend] Express server running on http://localhost:${PORT}`);
});
