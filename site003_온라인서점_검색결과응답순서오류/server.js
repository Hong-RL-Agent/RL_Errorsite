import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

// Inlined SVG Book Covers (Data URIs) for offline premium editorial aesthetic
const coverArt1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%23f4efe6"/><rect x="15" y="15" width="170" height="250" fill="none" stroke="%231c1917" stroke-width="1.5"/><text x="100" y="80" font-family="'Playfair Display', serif" font-size="14" font-weight="bold" fill="%231c1917" text-anchor="middle">THE HISTORY</text><text x="100" y="105" font-family="'Playfair Display', serif" font-size="18" font-weight="bold" fill="%231c1917" text-anchor="middle">OF DESIGN</text><line x1="40" y1="130" x2="160" y2="130" stroke="%23c2410c" stroke-width="2"/><text x="100" y="220" font-size="11" fill="%2378716c" text-anchor="middle">MICHAEL JOSEPH</text></svg>`;
const coverArt2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%231c1917"/><rect x="15" y="15" width="170" height="250" fill="none" stroke="%23e7e5e4" stroke-width="1"/><text x="100" y="70" font-size="10" fill="%23a8a29e" text-anchor="middle">EDITORIAL DESIGN</text><text x="100" y="110" font-size="22" font-weight="900" fill="%23f97316" text-anchor="middle">LAYOUT</text><text x="100" y="140" font-size="14" font-weight="bold" fill="%23e7e5e4" text-anchor="middle">Grid &amp; Hierarchy</text><text x="100" y="230" font-size="10" fill="%23a8a29e" text-anchor="middle">PARK YOUNG SHIN</text></svg>`;
const coverArt3 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%23ea580c"/><rect x="15" y="15" width="170" height="250" fill="none" stroke="%23ffedd5" stroke-width="1.5"/><circle cx="100" cy="140" r="45" fill="%231c1917"/><text x="100" y="70" font-size="15" font-weight="bold" fill="%23ffedd5" text-anchor="middle">BAUHAUS</text><text x="100" y="230" font-size="10" fill="%23ffedd5" text-anchor="middle">WALTER GROPIUS</text></svg>`;
const coverArt4 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%231e3a8a"/><rect x="15" y="15" width="170" height="250" fill="none" stroke="%23dbeafe" stroke-width="1"/><path d="M50,80 Q100,200 150,80" stroke="%23ecc94b" stroke-width="3" fill="none"/><text x="100" y="140" font-size="15" font-weight="bold" fill="%23dbeafe" text-anchor="middle">NARRATIVE LOOP</text><text x="100" y="230" font-size="10" fill="%2393c5fd" text-anchor="middle">LEE TAE YOUNG</text></svg>`;
const coverArt5 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%23f5f5f4"/><text x="100" y="80" font-size="36" font-weight="900" fill="%231c1917" text-anchor="middle">T</text><text x="100" y="120" font-size="36" font-weight="900" fill="%231c1917" text-anchor="middle">Y</text><text x="100" y="160" font-size="36" font-weight="900" fill="%231c1917" text-anchor="middle">P</text><text x="100" y="200" font-size="36" font-weight="900" fill="%231c1917" text-anchor="middle">O</text><text x="100" y="240" font-size="11" fill="%2378716c" text-anchor="middle">EMIL RUDER</text></svg>`;
const coverArt6 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%2344403c"/><text x="100" y="70" font-size="12" fill="%23d6d3d1" text-anchor="middle">PHILOSOPHY</text><text x="100" y="120" font-size="20" font-weight="bold" fill="%23f5f5f4" text-anchor="middle">THE STUDY</text><line x1="50" y1="140" x2="150" y2="140" stroke="%23a8a29e" stroke-width="1"/><text x="100" y="230" font-size="11" fill="%23a8a29e" text-anchor="middle">HAN SUN WOO</text></svg>`;
const coverArt7 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%231e293b"/><path d="M30,30 L170,250 M170,30 L30,250" stroke="%2338bdf8" stroke-width="1.5"/><text x="100" y="80" font-size="14" font-weight="bold" fill="%23f8fafc" text-anchor="middle">SUSTAINABLE</text><text x="100" y="105" font-size="14" font-weight="bold" fill="%23f8fafc" text-anchor="middle">TYPOGRAPHY</text><text x="100" y="220" font-size="11" fill="%2394a3b8" text-anchor="middle">AHN SANG SOO</text></svg>`;
const coverArt8 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="%230f172a"/><circle cx="100" cy="140" r="60" fill="none" stroke="%23f87171" stroke-width="2"/><text x="100" y="70" font-size="12" fill="%23cbd5e1" text-anchor="middle">WORLD LITERATURE</text><text x="100" y="145" font-size="16" font-weight="bold" fill="%23f8fafc" text-anchor="middle">LECTURES</text><text x="100" y="230" font-size="10" fill="%2394a3b8" text-anchor="middle">VLADIMIR NABOKOV</text></svg>`;

// Local Books Database
let books = [
  { id: "book-01", name: "디자인의 역사", category: "디자인/예술", price: 22000, stock: 5, rating: 4.8, author: "마이클 조셉", image: coverArt1 },
  { id: "book-02", name: "편집 디자인 레이아웃", category: "디자인/예술", price: 28000, stock: 3, rating: 4.9, author: "박영신", image: coverArt2 },
  { id: "book-03", name: "바우하우스와 모더니즘", category: "디자인/예술", price: 19000, stock: 8, rating: 4.7, author: "발터 그로피우스", image: coverArt3 },
  { id: "book-04", name: "문학의 서사적 루프", category: "소설/시", price: 15000, stock: 10, rating: 4.5, author: "이태영", image: coverArt4 },
  { id: "book-05", name: "타이포그래피 교과서", category: "디자인/예술", price: 32000, stock: 4, rating: 4.9, author: "에밀 루더", image: coverArt5 },
  { id: "book-06", name: "철학자의 서재", category: "인문/사회", price: 18000, stock: 6, rating: 4.6, author: "한선우", image: coverArt6 },
  { id: "book-07", name: "지속 가능한 타이포그래피", category: "디자인/예술", price: 24000, stock: 2, rating: 4.8, author: "안상수", image: coverArt7 },
  { id: "book-08", name: "세계 문학 강의", category: "인문/사회", price: 21000, stock: 7, rating: 4.7, author: "블라디미르 나보코프", image: coverArt8 }
];

// In-Memory Orders Database
let orders = [];

// API: Get all books
app.get('/api/books', (req, res) => {
  const { search } = req.query;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 도서 검색어(search)에 '#' 문자가 포함되어 요청이 들어올 경우,
  // 프론트엔드가 대기하는 정상 books 배열 구조가 아닌 비정상적인 데이터 구조를 의도적으로 반환해
  // 프론트엔드 파싱 예외(Map/Filter 호출 실패) 및 렌더링 깨짐을 유발합니다.
  if (search && search.includes('#')) {
    return res.json({
      status: "error",
      resultCode: 999,
      details: {
        message: "Malformed search query containing prohibited hashtag character symbol.",
        invalidQuery: search
      }
    });
  }

  if (search) {
    const filtered = books.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
    return res.json(filtered);
  }

  res.json(books);
});

// API: Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Create an order
app.post('/api/orders', (req, res) => {
  const { items, userName, address, totalPrice } = req.body;

  if (!items || items.length === 0 || !userName || !address) {
    return res.status(400).json({ error: "필수 주문 항목 정보가 누락되었습니다." });
  }

  // Check stock availability
  for (const item of items) {
    const book = books.find(b => b.id === item.id);
    if (!book) {
      return res.status(404).json({ error: `도서를 찾을 수 없습니다: ${item.name}` });
    }
    if (book.stock < item.quantity) {
      return res.status(400).json({ error: `도서의 재고가 부족합니다: ${book.name} (남은 재고: ${book.stock})` });
    }
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 주문 내역을 저장(orders.push)하지만, 해당 주문으로 구입한 도서의 
  // 실제 재고 필드(books[i].stock)를 차감하는 데이터베이스 연산 처리를 누락하여, 
  // 주문 완료 후에도 모든 책의 재고가 차감되지 않고 원본 그대로 유지되는 데이터 일관성 오류를 유발합니다.
  /*
  items.forEach(item => {
    const book = books.find(b => b.id === item.id);
    if (book) {
      book.stock -= item.quantity;
    }
  });
  */

  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    items,
    userName,
    address,
    totalPrice,
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// API: Get Order details
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: "주문을 찾을 수 없습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Infrastructure
  // DESCRIPTION: 주문 상세 정보 조회 시에만 환경변수 'ORDER_API_BASE'에 정의된 외부 주소와의 
  // 연동을 시도합니다. 개발 인프라 환경변수(ORDER_API_BASE)가 시스템에 선언되어 있지 않아 
  // 'undefined/api/order-vault/...' 주소로 fetch를 시도하게 하여 500 인프라 구성 예외를 발생시킵니다.
  const orderApiBase = process.env.ORDER_API_BASE; // undefined
  
  if (!orderApiBase) {
    return res.status(500).json({
      error: "Infrastructure Configuration Error: ORDER_API_BASE environment variable is not defined in system context.",
      attemptedEndpoint: `${orderApiBase}/api/order-vault/${id}`
    });
  }

  res.json(order);
});

// Start server
app.listen(PORT, () => {
  console.log(`[PageLoop Backend] Express server running on http://localhost:${PORT}`);
});
