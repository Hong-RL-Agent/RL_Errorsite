import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5004;

app.use(cors());
app.use(express.json());

// Inlined SVGs for used electronics devices
const phoneSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect x="15" y="10" width="70" height="100" rx="10" fill="%231e1b4b"/><rect x="20" y="18" width="60" height="74" rx="4" fill="%23cbd5e1"/><circle cx="50" cy="100" r="5" fill="%2394a3b8"/><path d="M40,14 H60" stroke="%2394a3b8" stroke-width="2"/></svg>`;
const laptopSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><rect x="25" y="20" width="70" height="48" rx="4" fill="%23475569"/><rect x="30" y="24" width="60" height="36" fill="%230f172a"/><path d="M10" y1="68" x2="110" y2="68" stroke="%2394a3b8" stroke-width="4"/><path d="M15,68 L105,68 L100,76 L20,76 Z" fill="%2364748b"/></svg>`;
const tabletSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect x="10" y="10" width="80" height="100" rx="8" fill="%230f172a"/><rect x="15" y="15" width="70" height="85" rx="3" fill="%23e2e8f0"/><circle cx="50" cy="105" r="4" fill="%23cbd5e1"/></svg>`;

// Local Products Database
let products = [
  { id: "prod-101", name: "iPhone 13 Pro", category: "스마트폰", price: 750000, condition: 92, grade: "A", details: "화면 미세 생활 기스 있으며 잔상이나 배터리 이상 없습니다.", image: phoneSvg },
  { id: "prod-102", name: "Galaxy S22 Ultra", category: "스마트폰", price: 680000, condition: 88, grade: "B", details: "측면 베젤 찍힘 2곳 있으나 액정 깨짐 없고 기능 작동 완벽합니다.", image: phoneSvg },
  { id: "prod-103", name: "MacBook Pro M1 14", category: "노트북", price: 1450000, condition: 97, grade: "S", details: "배터리 효율 92%, 액정 및 하판에 필름 부착해서 사용하여 매우 깨끗합니다.", image: laptopSvg },
  { id: "prod-104", name: "iPad Air 5세대 Wi-Fi", category: "태블릿", price: 580000, condition: 91, grade: "A", details: "필기용으로 실내에서만 사용해 상태 A급입니다. 케이스 같이 드립니다.", image: tabletSvg },
  { id: "prod-105", name: "LG Gram 16인치", category: "노트북", price: 950000, condition: 93, grade: "A", details: "인강 및 사무용으로 주로 썼으며 포맷 및 윈도우 정품 설치 완료되었습니다.", image: laptopSvg }
];

// Wishlist Database (찜 목록)
let wishlist = [
  { id: "wish-001", productId: "prod-101" },
  { id: "wish-002", productId: "prod-103" }
];

// Inquiries Database (문의 내역)
let inquiries = [];

// In-Memory Uploaded Images dictionary
let uploadedImages = {
  "initial-iphone.png": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><rect width='100' height='120' rx='10' fill='%236366f1'/></svg>"
};

// API: Get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API: Create product (Error 2)
app.post('/api/products', (req, res) => {
  const { name, category, price, condition, grade, details, image } = req.body;

  if (!name || !category || price === undefined || !condition || !grade) {
    return res.status(400).json({ error: "필수 상품 등록 정보가 입력되지 않았습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 중고기기 등록 시 가격(price) 유효성 검사 부분에서 음수 값(< 0)만 에러를 유발하고, 
  // 0원인 경우는 무료 분배 등의 예외적 목적에 대한 별도 차단이나 알림 없이 그대로 데이터베이스에 등록되도록 통과시킵니다.
  if (price < 0) {
    return res.status(400).json({ error: "상품 가격은 음수일 수 없습니다." });
  }

  const newProduct = {
    id: `prod-${Math.floor(106 + Math.random() * 800)}`,
    name,
    category,
    price: Number(price),
    condition: Number(condition),
    grade,
    details: details || "상세 정보 없음",
    image: image || phoneSvg
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// API: Delete product (Error 3)
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "삭제할 상품을 찾을 수 없습니다." });
  }

  // Remove the product
  products.splice(index, 1);

  // INTENTIONAL_ERROR
  // CATEGORY: Database (Cascade Delete)
  // DESCRIPTION: 상품 정보를 삭제(products.splice)하지만, 해당 상품 아이디를 담고 있는 
  // 찜목록 데이터베이스(wishlist 배열)에서 해당 상품에 연계된 참조 행들을 삭제(연쇄 삭제)하는 
  // 데이터 모델 정합성 관리를 누락합니다. 이에 따라 찜목록에 껍데기만 남은 무덤 데이터(빈 카드)가 생성됩니다.
  /*
  wishlist = wishlist.filter(w => w.productId !== id); // <-- 의도적으로 미수행하여 고아 레코드 유지
  */

  res.json({ success: true, message: "상품이 삭제되었습니다." });
});

// API: Wishlist CRUD
app.get('/api/wishlist', (req, res) => {
  res.json(wishlist);
});

app.post('/api/wishlist', (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId가 누락되었습니다." });

  // Check duplicate
  const exist = wishlist.some(w => w.productId === productId);
  if (exist) return res.status(400).json({ error: "이미 찜한 상품입니다." });

  const newItem = {
    id: `wish-${Math.floor(100 + Math.random() * 900)}`,
    productId
  };
  wishlist.push(newItem);
  res.status(201).json(newItem);
});

app.delete('/api/wishlist/:id', (req, res) => {
  const { id } = req.params;
  wishlist = wishlist.filter(w => w.id !== id);
  res.json({ success: true });
});

// API: Inquiry (Error 5)
app.post('/api/inquiries', (req, res) => {
  const { productId, productName, content, contact } = req.body;

  if (!productId || !content || !contact) {
    return res.status(400).json({ error: "필수 문의 요건이 비어 있습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network (API Gateway / Service Unavailable)
  // DESCRIPTION: 구매자 문의 전송 시 본문(content)에 '교환'이라는 단어가 포함되어 있을 경우,
  // 프론트엔드에 게이트웨이 일시 장애 혹은 차단을 시뮬레이션하기 위해 HTTP 503 Service Unavailable 상태 코드를 반환합니다.
  if (content && content.includes('교환')) {
    return res.status(503).json({ 
      error: "Service Unavailable: Trade/exchange inquiry routing is temporarily suspended on this gateway." 
    });
  }

  const newInquiry = {
    id: `inq-${Date.now()}`,
    productId,
    productName,
    content,
    contact,
    createdAt: new Date().toISOString()
  };

  inquiries.push(newInquiry);
  res.status(201).json({ success: true, inquiry: newInquiry });
});

// API: Mock Image Upload (Error 4)
app.post('/api/upload', (req, res) => {
  const { filename, fileData } = req.body;

  if (!filename) return res.status(400).json({ error: "파일명이 존재하지 않습니다." });

  // Save successful
  uploadedImages[filename] = fileData || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><rect width='100' height='120' rx='10' fill='%236366f1'/></svg>";

  // Return raw filename path with spaces intact
  const imageUrl = `/uploads/${filename}`;
  res.json({ success: true, url: imageUrl });
});

// API: Image Serve (Error 4 serving failure)
app.get('/uploads/:filename', (req, res) => {
  // Express decodes req.params.filename automatically, e.g. "iphone 13 pro.jpg"
  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: 공백이 들어간 업로드 파일을 서빙할 때, 디코딩이 완료된 req.params.filename 대신
  // URL 인코딩 문자열(%20)이 포함된 원본 URL(req.originalUrl) 경로를 직접 추출하여 매칭을 매핑합니다.
  // 메모리 상에는 공백("iphone 13 pro.jpg")으로 키가 기록되어 있어 인코딩된 키("iphone%2013%20pro.jpg")와
  // 불일치가 일어나 이미지를 로드하지 못하고 404 Not Found를 출력하게 만듭니다.
  const originalUrl = req.originalUrl;
  const requestFilename = originalUrl.replace('/uploads/', ''); // 예: "iphone%2013%20pro.jpg"

  if (uploadedImages[requestFilename]) {
    const data = uploadedImages[requestFilename];
    // Simple mock output
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(data);
  }

  res.status(404).send("Image Not Found due to server URL decoding mismatch");
});

app.listen(PORT, () => {
  console.log(`[Reboot Market Backend] Express server running on http://localhost:${PORT}`);
});
