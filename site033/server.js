import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9932;

app.use(cors());
app.use(express.json());

// In-memory Database
let users = [
  { id: 'usr-001', name: '김지현', email: 'jihyun.kim@tableloop.kr', role: 'customer', region: '경기/양평', points: 4500, createdAt: '2026-01-10T09:00:00Z' },
  { id: 'usr-002', name: '박민우', email: 'minwoo.park@tableloop.kr', role: 'customer', region: '강원/홍천', points: 1200, createdAt: '2026-01-15T11:30:00Z' },
  { id: 'usr-003', name: '이도훈 (햇살농원)', email: 'sunshine.farm@tableloop.kr', role: 'farmer', region: '충남/논산', points: 28000, createdAt: '2026-01-05T08:00:00Z' },
  { id: 'usr-004', name: '정소연 (초록뜰농장)', email: 'green.garden@tableloop.kr', role: 'farmer', region: '전남/나주', points: 19500, createdAt: '2026-01-08T10:15:00Z' },
  { id: 'usr-005', name: '최준혁', email: 'moderator@tableloop.kr', role: 'moderator', region: '서울/송파', points: 8000, createdAt: '2026-01-01T09:00:00Z' },
  { id: 'usr-006', name: '시스템 관리자', email: 'admin@tableloop.kr', role: 'admin', region: '서울/강남', points: 99999, createdAt: '2026-01-01T00:00:00Z' }
];

let currentUser = users[0]; // Default logged-in user

let farmers = [
  { id: 'farm-001', name: '햇살 유기농 농원', ownerId: 'usr-003', region: '충남/논산', description: '30년 전통의 볏짚 발효 무농약 딸기 및 제철 채소 재배 전문', specialty: '친환경 딸기, 유기농 쌈채소', rating: 4.9, image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80', isFavorite: true },
  { id: 'farm-002', name: '초록뜰 자연농장', ownerId: 'usr-004', region: '전남/나주', description: '나주 영산강 유역의 비옥한 토양에서 자라는 배와 뿌리채소', specialty: '나주 신고배, 유기농 당근, 비트', rating: 4.8, image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80', isFavorite: false },
  { id: 'farm-003', name: '강원 솔향기 버섯골', ownerId: 'usr-007', region: '강원/평창', description: '해발 700m 청정 고랭지 참나무 표고버섯 및 상황버섯', specialty: '생표고, 건목이버섯', rating: 4.95, image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80', isFavorite: true },
  { id: 'farm-004', name: '제주 청귤 바람목장', ownerId: 'usr-008', region: '제주/서귀포', description: '제주 한라산 중산간 청정 햇살을 듬뿍 머금은 친환경 감귤 & 요거트', specialty: '제주 유기농 청귤, 수제 그릭요거트', rating: 4.85, image: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=400&q=80', isFavorite: false },
  { id: 'farm-005', name: '양평 물안개 채소원', ownerId: 'usr-009', region: '경기/양평', description: '북한강 맑은 물과 유기질 비료로 키운 신선한 유럽 샐러드 채소', specialty: '버터헤드, 카이피라, 루꼴라', rating: 4.75, image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80', isFavorite: false },
  { id: 'farm-006', name: '상주 곶감과 꿀벌마을', ownerId: 'usr-010', region: '경북/상주', description: '천연 벌꿀과 자연건조 전통 곶감 및 유기농 감식초', specialty: '상주 반건시, 자연산 아카시아꿀', rating: 4.9, image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=400&q=80', isFavorite: true },
  { id: 'farm-007', name: '지리산 고산 산나물원', ownerId: 'usr-011', region: '전북/남원', description: '지리산 뱀사골 청정 야생 취나물과 곤드레, 명이나물 절임', specialty: '생곤드레, 명이나물 장아찌', rating: 4.88, image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=400&q=80', isFavorite: false },
  { id: 'farm-008', name: '해남 바다향 전통장가', ownerId: 'usr-012', region: '전남/해남', description: '전통 옹기에서 3년간 자연 숙성한 재래식 된장, 고추장, 간장', specialty: '3년 숙성 전통된장, 보리막장', rating: 4.92, image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80', isFavorite: false }
];

let products = [
  { id: 'prod-001', farmerId: 'farm-001', name: '무농약 새벽수확 샐러드 쌈채소 박스 (500g)', category: '채소', region: '충남/논산', description: '당일 새벽에 갓 수확한 아삭하고 신선한 로메인, 적근대, 치커리 모듬', price: 14500, stock: 1, unit: '1박스', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80', rating: 4.9, reviewCount: 42, isSubscriptionAvailable: true },
  { id: 'prod-002', farmerId: 'farm-001', name: '설향 고당도 생딸기 (1kg 대과)', category: '과일', region: '충남/논산', description: '꿀벌 자연수정으로 당도 13Brix 이상의 프리미엄 제철 딸기', price: 23000, stock: 2, unit: '1kg', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80', rating: 4.95, reviewCount: 88, isSubscriptionAvailable: true },
  { id: 'prod-003', farmerId: 'farm-002', name: '나주 맑은햇살 꿀당근 & 자색비트 세트', category: '채소', region: '전남/나주', description: '껍질째 갈아마셔도 달콤하고 향긋한 유기농 당근과 비트', price: 12000, stock: 1, unit: '2kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80', rating: 4.7, reviewCount: 19, isSubscriptionAvailable: true },
  { id: 'prod-004', farmerId: 'farm-003', name: '평창 참나무 생표고버섯 (특품 1kg)', category: '채소', region: '강원/평창', description: '해발 700m 고랭지에서 솔향을 머금고 자란 육질 쫄깃한 표고버섯', price: 18500, stock: 15, unit: '1kg', image: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=400&q=80', rating: 4.88, reviewCount: 31, isSubscriptionAvailable: false },
  { id: 'prod-005', farmerId: 'farm-004', name: '제주 청정목장 무가당 수제 그릭요거트 (450g)', category: '유제품', region: '제주/서귀포', description: '단백질 가득 꾸덕한 식감의 당일 착유 유기농 원유 요거트', price: 9800, stock: 24, unit: '450g', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80', rating: 4.85, reviewCount: 54, isSubscriptionAvailable: true },
  { id: 'prod-006', farmerId: 'farm-005', name: '유러피안 프리미엄 샐러드 채소 (버터헤드+카이피라)', category: '채소', region: '경기/양평', description: '수경재배 무농약 인증 부드럽고 달콤한 샐러드 전용 채소팩', price: 11000, stock: 0, unit: '400g', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80', rating: 4.8, reviewCount: 22, isSubscriptionAvailable: true },
  { id: 'prod-007', farmerId: 'farm-006', name: '상주 전통방식 자연건조 쫄깃 반건시 (20과)', category: '가공 식품', region: '경북/상주', description: '겉은 쫄깃 속은 달콤한 꿀잼이 가득한 상주 곶감 선물세트', price: 29000, stock: 18, unit: '1박스', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80', rating: 4.94, reviewCount: 65, isSubscriptionAvailable: false },
  { id: 'prod-008', farmerId: 'farm-007', name: '지리산 봄향기 생곤드레 & 취나물 밀키트', category: '제철 식재료', region: '전북/남원', description: '지리산 고산지대 봄나물과 양념간장 세트, 솥밥용 완벽 구성', price: 16000, stock: 12, unit: '2인분', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', rating: 4.9, reviewCount: 27, isSubscriptionAvailable: true },
  { id: 'prod-009', farmerId: 'farm-008', name: '해남 3년 옹기숙성 전통 재래된장 (1kg)', category: '수제 식품', region: '전남/해남', description: '100% 국산 대두와 신안 천일염으로 빚은 깊고 구수한 전통 된장', price: 22000, stock: 30, unit: '1kg', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', rating: 4.96, reviewCount: 74, isSubscriptionAvailable: false },
  { id: 'prod-010', farmerId: 'farm-004', name: '제주 유기농 풋귤청 (수제 착즙 500ml)', category: '수제 식품', region: '제주/서귀포', description: '비타민C 가득 상큼한 제주 풋귤과 비정제 원당의 완벽한 조화', price: 13500, stock: 16, unit: '500ml', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80', rating: 4.78, reviewCount: 39, isSubscriptionAvailable: false }
];

let cart = [
  { id: 'cart-001', userId: 'usr-001', productId: 'prod-001', quantity: 1, addedAt: '2026-03-20T10:00:00Z' },
  { id: 'cart-002', userId: 'usr-001', productId: 'prod-005', quantity: 2, addedAt: '2026-03-21T14:20:00Z' }
];

let subscriptions = [
  { id: 'sub-001', userId: 'usr-001', productId: 'prod-001', status: 'active', cycle: 'weekly', quantity: 1, nextBillingDate: '2026-04-01', nextShipmentDate: '2026-04-02', addressId: 'addr-001', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'sub-002', userId: 'usr-001', productId: 'prod-002', status: 'paused', cycle: 'biweekly', quantity: 1, nextBillingDate: '2026-04-10', nextShipmentDate: '2026-04-11', addressId: 'addr-001', createdAt: '2026-02-15T11:00:00Z' },
  { id: 'sub-003', userId: 'usr-001', productId: 'prod-005', status: 'cancelled', cycle: 'weekly', quantity: 2, nextBillingDate: '-', nextShipmentDate: '-', addressId: 'addr-001', createdAt: '2026-01-20T15:00:00Z' },
  { id: 'sub-004', userId: 'usr-002', productId: 'prod-003', status: 'active', cycle: 'monthly', quantity: 1, nextBillingDate: '2026-04-05', nextShipmentDate: '2026-04-06', addressId: 'addr-003', createdAt: '2026-02-10T08:30:00Z' },
  { id: 'sub-005', userId: 'usr-002', productId: 'prod-001', status: 'cancelled', cycle: 'weekly', quantity: 1, nextBillingDate: '-', nextShipmentDate: '-', addressId: 'addr-003', createdAt: '2026-01-05T10:00:00Z' }
];

let shipments = [
  { id: 'shp-001', subscriptionId: 'sub-001', userId: 'usr-001', productId: 'prod-001', scheduledDate: '2026-03-25', status: 'delivered', trackingNumber: 'TL-8829-1001', createdAt: '2026-03-24T08:00:00Z' },
  { id: 'shp-002', subscriptionId: 'sub-001', userId: 'usr-001', productId: 'prod-001', scheduledDate: '2026-04-02', status: 'preparing', trackingNumber: 'TL-8829-1002', createdAt: '2026-03-28T09:00:00Z' }
];

let addresses = [
  { id: 'addr-001', userId: 'usr-001', recipient: '김지현', phone: '010-3847-2910', address: '경기도 양평군 양평읍 중앙로 124', detailAddress: '302동 1104호 (그린빌라)', postalCode: '12563', isDefault: true },
  { id: 'addr-002', userId: 'usr-001', recipient: '김지현(회사)', phone: '010-3847-2910', address: '서울특별시 서초구 반포대로 45', detailAddress: '8층 디자인랩실', postalCode: '06584', isDefault: false },
  { id: 'addr-003', userId: 'usr-002', recipient: '박민우', phone: '010-9281-7462', address: '강원도 홍천군 홍천읍 희망리 88', detailAddress: '솔바람타운 101동 402호', postalCode: '25120', isDefault: true },
  { id: 'addr-004', userId: 'usr-003', recipient: '이도훈', phone: '010-5542-1983', address: '충청남도 논산시 연무읍 마산리 45', detailAddress: '햇살농원 관리사무소', postalCode: '33012', isDefault: true }
];

let orders = [
  { id: 'ord-1001', userId: 'usr-001', items: [{ productId: 'prod-001', name: '무농약 새벽수확 샐러드 쌈채소 박스', quantity: 1, price: 14500 }], totalAmount: 14500, usedPoints: 1000, finalAmount: 13500, addressId: 'addr-001', status: 'delivered', createdAt: '2026-03-10T14:30:00Z' },
  { id: 'ord-1002', userId: 'usr-001', items: [{ productId: 'prod-007', name: '상주 전통방식 자연건조 쫄깃 반건시', quantity: 1, price: 29000 }], totalAmount: 29000, usedPoints: 0, finalAmount: 29000, addressId: 'addr-001', status: 'shipped', createdAt: '2026-03-22T09:15:00Z' },
  { id: 'ord-1003', userId: 'usr-002', items: [{ productId: 'prod-004', name: '평창 참나무 생표고버섯', quantity: 2, price: 18500 }], totalAmount: 37000, usedPoints: 500, finalAmount: 36500, addressId: 'addr-003', status: 'delivered', createdAt: '2026-03-15T16:45:00Z' }
];

let pointHistory = [
  { id: 'pt-001', userId: 'usr-001', type: 'earn', amount: 3000, balanceAfter: 3000, reason: '신규 회원가입 축하 웰컴 포인트', orderId: null, createdAt: '2026-01-10T09:00:00Z' },
  { id: 'pt-002', userId: 'usr-001', type: 'earn', amount: 2500, balanceAfter: 5500, reason: '봄맞이 제철 채소 구독 이벤트 적립', orderId: null, createdAt: '2026-02-01T10:00:00Z' },
  { id: 'pt-003', userId: 'usr-001', type: 'redeem', amount: -1000, balanceAfter: 4500, reason: '주문 ord-1001 결제 시 포인트 사용', orderId: 'ord-1001', createdAt: '2026-03-10T14:30:00Z' }
];

let processedRedemptions = new Set(); // For point idempotency tracking

let reviews = [
  { id: 'rev-001', userId: 'usr-001', productId: 'prod-001', orderId: 'ord-1001', rating: 5, content: '쌈채소가 정말 아삭하고 싱싱해요! 다음 주에도 또 구독할 예정입니다.', createdAt: '2026-03-12T11:20:00Z' },
  { id: 'rev-002', userId: 'usr-002', productId: 'prod-004', orderId: 'ord-1003', rating: 5, content: '표고버섯 향이 진하고 쫄깃해서 찌개와 볶음에 최고네요.', createdAt: '2026-03-18T15:10:00Z' }
];

let posts = [
  { id: 'post-001', userId: 'usr-001', authorName: '김지현', category: '레시피', title: '봄나물 솥밥과 달래간장 황금레시피 공유해요 🌱', content: '지리산 생곤드레와 햇살 쌀로 솥밥을 지어봤어요. 뜸 들일 때 들기름 한 바퀴 둘러주면 고소한 향이 온 집안에 가득합니다!', likes: 28, commentsCount: 5, createdAt: '2026-03-24T18:00:00Z' },
  { id: 'post-002', userId: 'usr-003', authorName: '햇살농원 이도훈', category: '농가소식', title: '논산 햇살농원 설향딸기 막바지 수확 현장입니다 🍓', content: '올해 꿀벌 자연수정이 아주 잘 되어 마지막 수확분까지 당도가 13Brix 이상 올라왔습니다. 정성껏 포장하여 보내드립니다.', likes: 45, commentsCount: 8, createdAt: '2026-03-23T09:30:00Z' },
  { id: 'post-003', userId: 'usr-004', authorName: '초록뜰 정소연', category: '파머스팁', title: '뿌리채소 싱싱하게 오래 보관하는 꿀팁 🥕', content: '흙당근과 비트는 신문지나 키친타월에 감싸서 밀폐용기나 지퍼백에 넣어 김치냉장고에 보관하면 한 달 넘게 수분을 유지할 수 있어요.', likes: 32, commentsCount: 3, createdAt: '2026-03-20T14:15:00Z' }
];

// ==========================================
// 1. Health Endpoint
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site033',
    service: 'TableLoop Local Food Subscription & Community Platform'
  });
});

// ==========================================
// 2. Auth Endpoints
// ==========================================
app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, data: currentUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email) || users[0];
  currentUser = user;
  res.json({ success: true, message: '로그인되었습니다.', data: currentUser });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, region } = req.body;
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name || '신규 사용자',
    email: email || `user_${Date.now()}@tableloop.kr`,
    role: 'customer',
    region: region || '서울/종로',
    points: 3000,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  currentUser = newUser;
  res.json({ success: true, message: '회원가입이 완료되었습니다.', data: newUser });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: '로그아웃되었습니다.' });
});

// Switch user for testing
app.post('/api/auth/switch', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    currentUser = user;
    res.json({ success: true, data: currentUser });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// ==========================================
// 3. Farmers & Products
// ==========================================
app.get('/api/farmers', (req, res) => {
  res.json({ success: true, data: farmers });
});

app.get('/api/farmers/:farmerId', (req, res) => {
  const farm = farmers.find(f => f.id === req.params.farmerId);
  if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
  const farmProducts = products.filter(p => p.farmerId === farm.id);
  res.json({ success: true, data: { ...farm, products: farmProducts } });
});

app.post('/api/farmers/:farmerId/favorite', (req, res) => {
  const farm = farmers.find(f => f.id === req.params.farmerId);
  if (farm) farm.isFavorite = true;
  res.json({ success: true, message: '관심 농가로 등록되었습니다.', data: farm });
});

app.delete('/api/farmers/:farmerId/favorite', (req, res) => {
  const farm = farmers.find(f => f.id === req.params.farmerId);
  if (farm) farm.isFavorite = false;
  res.json({ success: true, message: '관심 농가가 해제되었습니다.', data: farm });
});

app.get('/api/products', (req, res) => {
  const { category, region, search } = req.query;
  let filtered = [...products];
  if (category && category !== '전체') filtered = filtered.filter(p => p.category === category);
  if (region && region !== '전체') filtered = filtered.filter(p => p.region.includes(region));
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  res.json({ success: true, data: filtered });
});

app.get('/api/products/:productId', (req, res) => {
  const product = products.find(p => p.id === req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const farm = farmers.find(f => f.id === product.farmerId);
  const prodReviews = reviews.filter(r => r.productId === product.id);
  res.json({ success: true, data: { ...product, farm, reviews: prodReviews } });
});

// ==========================================
// 4. Cart Endpoints
// ==========================================
app.get('/api/cart', (req, res) => {
  const userCart = cart.filter(c => c.userId === currentUser.id).map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  });
  res.json({ success: true, data: userCart });
});

app.post('/api/cart/items', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const existing = cart.find(c => c.userId === currentUser.id && c.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    res.json({ success: true, message: '장바구니 수량이 증가했습니다.', data: existing });
  } else {
    const newItem = {
      id: `cart-${Date.now()}`,
      userId: currentUser.id,
      productId,
      quantity,
      addedAt: new Date().toISOString()
    };
    cart.push(newItem);
    res.json({ success: true, message: '장바구니에 상품을 담았습니다.', data: newItem });
  }
});

// INTENTIONAL BACKEND BUG: site033-bug02 (SEC-332)
// Cart quantity validation and final inventory validation are intentionally inconsistent.
// The cart item quantity upper bound is not checked against real stock, allowing arbitrary quantities.
app.patch('/api/cart/items/:itemId', (req, res) => {
  const { quantity } = req.body;
  const item = cart.find(c => c.id === req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

  // Bug: No stock check. User can set quantity = 999 even if product stock is only 1.
  item.quantity = Number(quantity) || 1;

  const product = products.find(p => p.id === item.productId);
  res.json({
    success: true,
    message: '장바구니 수량이 수정되었습니다.',
    data: { ...item, product, note: '수량이 반영되었습니다.' }
  });
});

app.delete('/api/cart/items/:itemId', (req, res) => {
  cart = cart.filter(c => c.id !== req.params.itemId);
  res.json({ success: true, message: '장바구니 상품이 삭제되었습니다.' });
});

app.delete('/api/cart', (req, res) => {
  cart = cart.filter(c => c.userId !== currentUser.id);
  res.json({ success: true, message: '장바구니가 비워졌습니다.' });
});

// ==========================================
// 5. Orders & Inventory Management
// ==========================================
app.get('/api/orders', (req, res) => {
  const userOrders = orders.filter(o => o.userId === currentUser.id);
  res.json({ success: true, data: userOrders });
});

app.get('/api/orders/:orderId', (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

// INTENTIONAL BACKEND BUG: site033-bug01 (SEC-331) & site033-bug05 (SEC-335) & site033-bug06 (SEC-336)
// Inventory check and deduction are intentionally non-atomic.
// Point balance and order amount validation are intentionally incomplete.
// Duplicate point redemption requests are not fully deduplicated.
app.post('/api/orders', async (req, res) => {
  const { items, usedPoints = 0, addressId, redemptionId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: '주문할 상품이 없습니다.' });
  }

  // Calculate totals
  let totalAmount = 0;
  const orderItems = [];

  for (const it of items) {
    const prod = products.find(p => p.id === it.productId);
    if (!prod) continue;

    // SEC-331 Race condition flaw: Check stock before async delay, deduct without transaction lock
    if (prod.stock < 1 && it.quantity > 0) {
      // Intentionally bypassed or relaxed in concurrent race
    }

    const itemPrice = prod.price * it.quantity;
    totalAmount += itemPrice;
    orderItems.push({
      productId: prod.id,
      name: prod.name,
      quantity: it.quantity,
      price: prod.price
    });
  }

  // SEC-335 Flaw: Used points can exceed user's current point balance and total amount
  const pointsToDeduct = Number(usedPoints) || 0;
  currentUser.points -= pointsToDeduct; // Points balance can become negative

  // Record point transaction
  if (pointsToDeduct > 0) {
    pointHistory.unshift({
      id: `pt-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      userId: currentUser.id,
      type: 'redeem',
      amount: -pointsToDeduct,
      balanceAfter: currentUser.points,
      reason: `주문 결제 포인트 차감`,
      orderId: `ord-${Date.now()}`,
      createdAt: new Date().toISOString()
    });
  }

  // Async delay to simulate non-atomic race condition gap (SEC-331)
  await new Promise(resolve => setTimeout(resolve, 50));

  // Non-atomic stock deduction (can result in negative stock)
  for (const it of items) {
    const prod = products.find(p => p.id === it.productId);
    if (prod) {
      prod.stock -= it.quantity; // Non-atomic, can drop below 0
    }
  }

  const finalAmount = Math.max(0, totalAmount - pointsToDeduct);
  const newOrder = {
    id: `ord-${Date.now()}`,
    userId: currentUser.id,
    items: orderItems,
    totalAmount,
    usedPoints: pointsToDeduct,
    finalAmount,
    addressId: addressId || (addresses[0] ? addresses[0].id : 'addr-001'),
    status: 'paid',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  res.json({
    success: true,
    message: '주문 및 결제가 성공적으로 완료되었습니다.',
    data: newOrder
  });
});

app.post('/api/orders/:orderId/cancel', (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = 'cancelled';
  res.json({ success: true, message: '주문이 취소되었습니다.', data: order });
});

// ==========================================
// 6. Subscriptions Endpoints (SEC-333 & SEC-334)
// ==========================================
app.get('/api/subscriptions', (req, res) => {
  const userSubs = subscriptions.filter(s => s.userId === currentUser.id).map(sub => {
    const product = products.find(p => p.id === sub.productId);
    return { ...sub, product };
  });
  res.json({ success: true, data: userSubs });
});

app.get('/api/subscriptions/:subscriptionId', (req, res) => {
  const sub = subscriptions.find(s => s.id === req.params.subscriptionId);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
  const product = products.find(p => p.id === sub.productId);
  const subShipments = shipments.filter(s => s.subscriptionId === sub.id);
  res.json({ success: true, data: { ...sub, product, shipments: subShipments } });
});

app.post('/api/subscriptions', (req, res) => {
  const { productId, cycle = 'weekly', quantity = 1, addressId } = req.body;
  const newSub = {
    id: `sub-${Date.now()}`,
    userId: currentUser.id,
    productId,
    status: 'active',
    cycle,
    quantity,
    nextBillingDate: '2026-04-10',
    nextShipmentDate: '2026-04-11',
    addressId: addressId || 'addr-001',
    createdAt: new Date().toISOString()
  };
  subscriptions.unshift(newSub);
  res.json({ success: true, message: '정기 구독이 신청되었습니다.', data: newSub });
});

app.post('/api/subscriptions/:subscriptionId/pause', (req, res) => {
  const sub = subscriptions.find(s => s.id === req.params.subscriptionId);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
  sub.status = 'paused';
  res.json({ success: true, message: '구독이 일시정지되었습니다.', data: sub });
});

// INTENTIONAL BACKEND BUG: site033-bug03 (SEC-333)
// Subscription state transitions do not fully validate the current state.
// Resuming a cancelled subscription directly sets status to active.
app.post('/api/subscriptions/:subscriptionId/resume', (req, res) => {
  const sub = subscriptions.find(s => s.id === req.params.subscriptionId);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  // Bug: No check if sub.status === 'cancelled'. Overrides cancelled to active.
  sub.status = 'active';
  sub.nextBillingDate = '2026-04-05';
  sub.nextShipmentDate = '2026-04-06';

  res.json({ success: true, message: '구독이 성공적으로 재개되었습니다.', data: sub });
});

app.post('/api/subscriptions/:subscriptionId/cancel', (req, res) => {
  const sub = subscriptions.find(s => s.id === req.params.subscriptionId);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
  sub.status = 'cancelled';
  sub.nextBillingDate = '-';
  sub.nextShipmentDate = '-';
  res.json({ success: true, message: '구독이 해지되었습니다.', data: sub });
});

// INTENTIONAL BACKEND BUG: site033-bug04 (SEC-334)
// Shipment creation does not consistently reject cancelled subscriptions.
// New shipment records can be created even for cancelled subscriptions.
app.post('/api/subscriptions/:subscriptionId/shipments', (req, res) => {
  const sub = subscriptions.find(s => s.id === req.params.subscriptionId);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

  // Bug: Generates shipment regardless of sub.status === 'cancelled'
  const newShipment = {
    id: `shp-${Date.now()}`,
    subscriptionId: sub.id,
    userId: sub.userId,
    productId: sub.productId,
    scheduledDate: req.body.scheduledDate || '2026-04-08',
    status: 'preparing',
    trackingNumber: `TL-NEW-${Math.floor(Math.random()*9000 + 1000)}`,
    createdAt: new Date().toISOString()
  };

  shipments.unshift(newShipment);
  res.json({
    success: true,
    message: '새로운 구독 배송이 생성되었습니다.',
    data: newShipment
  });
});

app.post('/api/subscription-shipments/process', (req, res) => {
  // Batch processing endpoint that also creates shipments for cancelled subscriptions (SEC-334)
  const processed = [];
  for (const sub of subscriptions) {
    // Intentionally no status === 'active' check
    const shp = {
      id: `shp-proc-${Date.now()}-${Math.floor(Math.random()*100)}`,
      subscriptionId: sub.id,
      userId: sub.userId,
      productId: sub.productId,
      scheduledDate: '2026-04-12',
      status: 'preparing',
      trackingNumber: `TL-BATCH-${Math.floor(Math.random()*9000 + 1000)}`,
      createdAt: new Date().toISOString()
    };
    shipments.unshift(shp);
    processed.push(shp);
  }
  res.json({ success: true, message: '정기 구독 배송 일괄 처리가 완료되었습니다.', data: processed });
});

// ==========================================
// 7. Addresses (SEC-337 & SEC-338)
// ==========================================
app.get('/api/addresses', (req, res) => {
  const userAddresses = addresses.filter(a => a.userId === currentUser.id);
  res.json({ success: true, data: userAddresses });
});

app.post('/api/addresses', (req, res) => {
  const { recipient, phone, address, detailAddress, postalCode, isDefault = false } = req.body;
  const newAddr = {
    id: `addr-${Date.now()}`,
    userId: currentUser.id,
    recipient: recipient || currentUser.name,
    phone: phone || '010-0000-0000',
    address: address || '서울특별시 종로구 세종대로 1',
    detailAddress: detailAddress || '',
    postalCode: postalCode || '03186',
    isDefault: !!isDefault
  };

  if (isDefault) {
    // standard flow
    addresses.filter(a => a.userId === currentUser.id).forEach(a => a.isDefault = false);
  }

  addresses.push(newAddr);
  res.json({ success: true, message: '배송지가 추가되었습니다.', data: newAddr });
});

// INTENTIONAL BACKEND BUG: site033-bug07 (SEC-337)
// Delivery address ownership is intentionally not verified in every mutation path.
// User A can update or delete User B's address.
app.patch('/api/addresses/:addressId', (req, res) => {
  const addr = addresses.find(a => a.id === req.params.addressId);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

  // Bug: No ownership verification (addr.userId === currentUser.id missing)
  const { recipient, phone, address, detailAddress, postalCode, isDefault } = req.body;
  if (recipient !== undefined) addr.recipient = recipient;
  if (phone !== undefined) addr.phone = phone;
  if (address !== undefined) addr.address = address;
  if (detailAddress !== undefined) addr.detailAddress = detailAddress;
  if (postalCode !== undefined) addr.postalCode = postalCode;
  if (isDefault !== undefined) addr.isDefault = !!isDefault;

  res.json({ success: true, message: '배송지 정보가 수정되었습니다.', data: addr });
});

app.delete('/api/addresses/:addressId', (req, res) => {
  const index = addresses.findIndex(a => a.id === req.params.addressId);
  if (index === -1) return res.status(404).json({ success: false, message: 'Address not found' });

  // Bug: No ownership check (SEC-337)
  const deleted = addresses.splice(index, 1)[0];
  res.json({ success: true, message: '배송지가 삭제되었습니다.', data: deleted });
});

// INTENTIONAL BACKEND BUG: site033-bug08 (SEC-338)
// Default address uniqueness is intentionally not enforced in all update paths.
// Setting an address to default does not reset other addresses' isDefault to false.
app.post('/api/addresses/:addressId/set-default', (req, res) => {
  const addr = addresses.find(a => a.id === req.params.addressId);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

  // Bug: Does not un-default other addresses of the user
  addr.isDefault = true;

  res.json({
    success: true,
    message: '기본 배송지로 설정되었습니다.',
    data: addr
  });
});

// ==========================================
// 8. Points Endpoints (SEC-336)
// ==========================================
app.get('/api/points/balance', (req, res) => {
  res.json({ success: true, data: { points: currentUser.points, userId: currentUser.id } });
});

app.get('/api/points/history', (req, res) => {
  const history = pointHistory.filter(p => p.userId === currentUser.id);
  res.json({ success: true, data: history });
});

// INTENTIONAL BACKEND BUG: site033-bug06 (SEC-336)
// Duplicate point redemption requests are not fully deduplicated.
app.post('/api/points/redeem', (req, res) => {
  const { amount, reason, redemptionId } = req.body;
  const deductAmount = Number(amount) || 0;

  // Bug: Does not check if redemptionId was already processed
  currentUser.points -= deductAmount;

  const newHistory = {
    id: `pt-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: currentUser.id,
    type: 'redeem',
    amount: -deductAmount,
    balanceAfter: currentUser.points,
    reason: reason || '포인트 차감/사용',
    redemptionId: redemptionId || `red-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  pointHistory.unshift(newHistory);
  res.json({ success: true, message: '포인트가 사용되었습니다.', data: newHistory });
});

app.post('/api/points/earn', (req, res) => {
  const { amount, reason } = req.body;
  const earnAmount = Number(amount) || 500;
  currentUser.points += earnAmount;

  const newHistory = {
    id: `pt-${Date.now()}`,
    userId: currentUser.id,
    type: 'earn',
    amount: earnAmount,
    balanceAfter: currentUser.points,
    reason: reason || '커뮤니티 활동 및 리뷰 작성 리워드 적립',
    createdAt: new Date().toISOString()
  };

  pointHistory.unshift(newHistory);
  res.json({ success: true, message: '포인트가 적립되었습니다.', data: newHistory });
});

// ==========================================
// 9. Reviews Endpoints (SEC-339 & SEC-340)
// ==========================================
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: reviews });
});

// INTENTIONAL BACKEND BUG: site033-bug09 (SEC-339) & site033-bug10 (SEC-340)
// Review eligibility does not fully verify completed purchase history.
// Duplicate review prevention is intentionally incomplete.
app.post('/api/products/:productId/reviews', (req, res) => {
  const { rating = 5, content, orderId } = req.body;
  const product = products.find(p => p.id === req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Bug 1 (SEC-339): No check if currentUser actually purchased and received this product.
  // Bug 2 (SEC-340): No duplicate review check if user already wrote a review for this product/order.

  const newRev = {
    id: `rev-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: currentUser.id,
    productId: product.id,
    orderId: orderId || `mock-ord-${Date.now()}`,
    rating: Number(rating) || 5,
    content: content || '신선하고 맛있어요! 추천합니다.',
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newRev);
  product.reviewCount = (product.reviewCount || 0) + 1;

  res.json({
    success: true,
    message: '리뷰가 등록되었습니다. 500P가 적립되었습니다.',
    data: newRev
  });
});

app.post('/api/reviews', (req, res) => {
  const { productId, rating, content, orderId } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const newRev = {
    id: `rev-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: currentUser.id,
    productId: product.id,
    orderId: orderId || `mock-ord-${Date.now()}`,
    rating: Number(rating) || 5,
    content: content || '정말 훌륭한 로컬 식재료입니다.',
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newRev);
  res.json({ success: true, message: '리뷰가 저장되었습니다.', data: newRev });
});

app.delete('/api/reviews/:reviewId', (req, res) => {
  reviews = reviews.filter(r => r.id !== req.params.reviewId);
  res.json({ success: true, message: '리뷰가 삭제되었습니다.' });
});

// ==========================================
// 10. Community Posts
// ==========================================
app.get('/api/community/posts', (req, res) => {
  const { category } = req.query;
  let filtered = [...posts];
  if (category && category !== '전체') filtered = filtered.filter(p => p.category === category);
  res.json({ success: true, data: filtered });
});

app.get('/api/community/posts/:postId', (req, res) => {
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
});

app.post('/api/community/posts', (req, res) => {
  const { title, content, category = '자유게시판' } = req.body;
  const newPost = {
    id: `post-${Date.now()}`,
    userId: currentUser.id,
    authorName: currentUser.name,
    category,
    title: title || '새로운 식탁 이야기',
    content: content || '',
    likes: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString()
  };
  posts.unshift(newPost);
  res.json({ success: true, message: '게시글이 등록되었습니다.', data: newPost });
});

app.post('/api/community/posts/:postId/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.postId);
  if (post) post.likes += 1;
  res.json({ success: true, data: post });
});

// ==========================================
// Serve Static Frontend Bundle
// ==========================================
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌿 TableLoop Platform Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
