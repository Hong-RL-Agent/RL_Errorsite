import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9942;

app.use(cors());
app.use(express.json());

// In-Memory Database
const db = {
  user: {
    id: 'user-201',
    name: '김서연',
    email: 'seoyeon.roomly@example.com',
    grade: 'Roomly VIP 멤버',
    points: 12500,
    address: '서울특별시 서초구 반포대로 201, 래미안 파크 104동 1202호',
    phone: '010-9281-4821',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  categories: [
    { id: 'all', name: '전체 상품' },
    { id: 'sofa', name: '소파 & 거실' },
    { id: 'table', name: '식탁 & 테이블' },
    { id: 'chair', name: '의자 & 스툴' },
    { id: 'storage', name: '수납 & 선반' },
    { id: 'lighting', name: '조명 & 스탠드' },
    { id: 'fabric', name: '러그 & 패브릭' },
    { id: 'decor', name: '홈데코 & 오브제' }
  ],
  products: [
    { id: 'prod-101', name: '노르딕 모던 3인용 패브릭 소파', category: 'sofa', brand: 'Muuto Living', price: 890000, discountPrice: 720000, stock: 8, status: 'active', colors: ['오트밀 베이지', '포레스트 그린', '차콜'], rating: 4.9, reviewCount: 128, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80', description: '발수 코팅 프리미엄 패브릭과 고탄성 폼으로 포근한 착석감을 제공하는 북유럽 감성 소파.' },
    { id: 'prod-102', name: '내추럴 오크 원목 6인용 다이닝 식탁', category: 'table', brand: 'WoodCraft', price: 650000, discountPrice: 580000, stock: 5, status: 'active', colors: ['내추럴 오크', '월넛'], rating: 4.8, reviewCount: 94, image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80', description: '견고한 북미산 화이트 오크 원목 본연의 자연스러운 나뭇결이 살아있는 식탁.' },
    { id: 'prod-103', name: '소프트 부클레 라운지 암체어', category: 'chair', brand: 'Danish Design', price: 340000, discountPrice: 289000, stock: 12, status: 'active', colors: ['아이보리', '테라코타'], rating: 4.9, reviewCount: 76, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80', description: '트렌디한 부클레 원단과 곡선형 프레임으로 공간에 우아함을 더하는 1인용 체어.' },
    { id: 'prod-104', name: '미드센추리 플로어 아치 램프', category: 'lighting', brand: 'Lumina', price: 180000, discountPrice: 145000, stock: 20, status: 'active', colors: ['황동 골드', '매트 블랙'], rating: 4.7, reviewCount: 88, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', description: '감각적인 곡선 아치 라인과 따뜻한 3단계 조도 조절이 가능한 거실 스탠드.' },
    { id: 'prod-105', name: '미니멀 모듈 수납장 & 사이드보드', category: 'storage', brand: 'SystemForm', price: 420000, discountPrice: 360000, stock: 6, status: 'active', colors: ['버터 옐로우', '매트 화이트'], rating: 4.8, reviewCount: 65, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80', description: '다양한 조합이 가능한 모듈식 수납장으로 깔끔한 리빙룸 수납 완성.' },
    { id: 'prod-106', name: '워셔블 단모 먼지없는 사이잘룩 러그 (200x250)', category: 'fabric', brand: 'Hygge Home', price: 129000, discountPrice: 99000, stock: 25, status: 'active', colors: ['샌드 베이지', '애쉬 그레이'], rating: 4.9, reviewCount: 210, image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80', description: '물세탁 가능하며 사계절 쾌적하게 사용할 수 있는 친환경 사이잘룩 러그.' },
    { id: 'prod-107', name: '빈티지 원목 회전 북타워 책장', category: 'storage', brand: 'Classic Living', price: 290000, discountPrice: 245000, stock: 0, status: 'discontinued', colors: ['월넛'], rating: 4.6, reviewCount: 42, image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&auto=format&fit=crop&q=80', description: '[단종 상품] 좁은 공간에서도 360도 회전하여 책을 깔끔하게 수납할 수 있는 타워 책장.' },
    { id: 'prod-108', name: '세라믹 상판 템바보드 원형 커피테이블', category: 'table', brand: 'WoodCraft', price: 280000, discountPrice: 235000, stock: 10, status: 'active', colors: ['화이트 세라믹', '블랙 마블'], rating: 4.9, reviewCount: 83, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80', description: '스크래치와 열에 강한 이태리산 통세라믹 상판과 원목 템바보드 기둥.' },
    { id: 'prod-109', name: '플리츠 패브릭 단스탠드 무드등', category: 'lighting', brand: 'Lumina', price: 68000, discountPrice: 52000, stock: 35, rating: 4.8, reviewCount: 147, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80', description: '침실 협탁 위에 은은하고 감성적인 빛을 연출해주는 주름 갓 무드등.' },
    { id: 'prod-110', name: '비건 레더 인체공학 데스크 체어', category: 'chair', brand: 'SystemForm', price: 210000, discountPrice: 178000, stock: 14, status: 'active', colors: ['카멜 브라운', '웜 그레이'], rating: 4.8, reviewCount: 92, image: 'https://images.unsplash.com/photo-1580481077197-030f89d380e2?w=600&auto=format&fit=crop&q=80', description: '오랜 시간 작업해도 허리가 편안한 럼버서포트 내장 가죽 오피스 체어.' },
    { id: 'prod-111', name: '모듈형 패브릭 코너 카우치 소파', category: 'sofa', brand: 'Muuto Living', price: 1450000, discountPrice: 1290000, stock: 4, status: 'active', colors: ['소프트 아이보리'], rating: 5.0, reviewCount: 39, image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=80', description: '라이프스타일에 따라 자유롭게 레이아웃을 바꿀 수 있는 프리미엄 카우치 소파.' },
    { id: 'prod-112', name: '웨이브 비정형 전신 거울 180cm', category: 'decor', brand: 'Hygge Home', price: 165000, discountPrice: 138000, stock: 18, status: 'active', colors: ['벨벳 베이지', '실버 크롬'], rating: 4.9, reviewCount: 115, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80', description: 'SNS 감성 인테리어의 완성, 부드러운 웨이브 프레임 전신 거울.' }
  ],
  coupons: [
    { id: 'WELCOME10', name: '신규 가입 환영 10% 할인', type: 'percent', discount: 10, minOrder: 50000, stackable: false, status: 'available' },
    { id: 'FURNITURE20', name: '가구 전용 20,000원 즉시 할인', type: 'amount', discount: 20000, minOrder: 100000, stackable: false, status: 'available' },
    { id: 'FREESHIP', name: '가구 무료 배송 쿠폰 (30,000원)', type: 'amount', discount: 30000, minOrder: 50000, stackable: false, status: 'available' },
    { id: 'WEEKEND15', name: '주말 특별 15% 서프라이즈 쿠폰', type: 'percent', discount: 15, minOrder: 150000, stackable: false, status: 'available' }
  ],
  cart: [
    { id: 'cart-1', productId: 'prod-107', name: '빈티지 원목 회전 북타워 책장', price: 245000, quantity: 1, color: '월넛', image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&auto=format&fit=crop&q=80' }
  ],
  wishlist: [
    { id: 'wish-1', productId: 'prod-107', name: '빈티지 원목 회전 북타워 책장', price: 245000, status: 'active', image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&auto=format&fit=crop&q=80' },
    { id: 'wish-2', productId: 'prod-101', name: '노르딕 모던 3인용 패브릭 소파', price: 720000, status: 'active', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80' }
  ],
  orders: [
    {
      id: 'ORD-20261001-8841',
      items: [
        { productId: 'prod-103', name: '소프트 부클레 라운지 암체어', price: 289000, quantity: 1, color: '아이보리' }
      ],
      totalAmount: 289000,
      discountAmount: 20000,
      finalPayment: 269000,
      status: 'cancelled', // Order has been cancelled!
      shippingAddress: '서울특별시 서초구 반포대로 201, 래미안 파크 104동 1202호',
      createdAt: '2026-09-22T10:30:00Z',
      history: [
        { status: 'confirmed', timestamp: '2026-09-22T10:30:00Z', memo: '주문 결제가 완료되었습니다.' },
        { status: 'cancelled', timestamp: '2026-09-22T14:10:00Z', memo: '고객 요청으로 주문이 정상 취소되었습니다.' }
      ]
    },
    {
      id: 'ORD-20260918-1029',
      items: [
        { productId: 'prod-104', name: '미드센추리 플로어 아치 램프', price: 145000, quantity: 1, color: '황동 골드' }
      ],
      totalAmount: 145000,
      discountAmount: 0,
      finalPayment: 145000,
      status: 'delivered', // Delivered order
      shippingAddress: '서울특별시 서초구 반포대로 201',
      createdAt: '2026-09-18T15:00:00Z',
      history: [
        { status: 'confirmed', timestamp: '2026-09-18T15:00:00Z' },
        { status: 'shipped', timestamp: '2026-09-19T09:00:00Z' },
        { status: 'delivered', timestamp: '2026-09-21T16:00:00Z' }
      ]
    }
  ],
  reviews: [
    { id: 'rev-01', productId: 'prod-104', author: '김서연', rating: 5, date: '2026-09-22', content: '거실 분위기가 조명 하나로 호텔 라운지처럼 바뀌었어요! 아치형 곡선이 너무 우아하고 만족스럽습니다.' },
    { id: 'rev-02', productId: 'prod-101', author: '이민호', rating: 5, date: '2026-09-20', content: '오트밀 베이지 컬러가 실물이 훨씬 예쁩니다. 패브릭 촉감도 부드럽고 반려견 털도 잘 털려요.' },
    { id: 'rev-03', productId: 'prod-106', author: '박지은', rating: 5, date: '2026-09-19', content: '물세탁 되니까 관리가 너무 편하고 사계절 쓰기 좋은 두께감입니다.' }
  ]
};

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. Dashboard & User
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      user: db.user,
      recentOrders: db.orders,
      cartCount: db.cart.reduce((sum, item) => sum + item.quantity, 0),
      wishlistCount: db.wishlist.length,
      featuredProducts: db.products.slice(0, 6)
    }
  });
});

// 3. Products API
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let result = [...db.products];

  if (category && category !== 'all') {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => a.discountPrice - b.discountPrice);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.discountPrice - a.discountPrice);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  }

  res.json({ success: true, data: result });
});

app.get('/api/products/:id', (req, res) => {
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
  const reviews = db.reviews.filter(r => r.productId === prod.id);
  res.json({ success: true, data: { ...prod, reviews } });
});

// 4. Coupons API
app.get('/api/coupons', (req, res) => {
  res.json({ success: true, data: db.coupons });
});

// 5. Cart API
app.get('/api/cart', (req, res) => {
  res.json({ success: true, data: db.cart });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1, color } = req.body;
  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: '상품이 없습니다.' });

  const existing = db.cart.find(c => c.productId === productId && c.color === color);
  if (existing) {
    existing.quantity += quantity;
  } else {
    db.cart.push({
      id: `cart-${Date.now().toString().slice(-4)}`,
      productId: product.id,
      name: product.name,
      price: product.discountPrice,
      quantity,
      color: color || product.colors?.[0] || '기본',
      image: product.image
    });
  }

  res.json({ success: true, message: '장바구니에 상품이 추가되었습니다.', data: db.cart });
});

app.put('/api/cart/:id', (req, res) => {
  const item = db.cart.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: '장바구니 항목이 없습니다.' });
  item.quantity = req.body.quantity;
  res.json({ success: true, data: db.cart });
});

app.delete('/api/cart/:id', (req, res) => {
  db.cart = db.cart.filter(c => c.id !== req.params.id);
  res.json({ success: true, data: db.cart });
});

// 6. Checkout API with SEC-396 (Coupon stacking bypass) & SEC-397 (Discontinued product checkout)
// INTENTIONAL BACKEND BUG: SEC-396
// Coupon stacking restriction bypass:
// Client submits multiple non-stackable coupons (e.g. WELCOME10 + FURNITURE20),
// and backend fails to validate non-stackable coupon combination, applying both discounts simultaneously.

// INTENTIONAL BACKEND BUG: SEC-397
// Stale cart checkout of discontinued product:
// Cart contains a product that has become 'discontinued' (e.g. prod-107),
// but checkout API blindly completes order creation without verifying current product.status === 'active'.
app.post('/api/checkout', (req, res) => {
  const { couponIds = [], deliveryAddress, paymentMethod, directProduct } = req.body;

  let orderItems = [];
  let subtotal = 0;
  let triggeredBugs = [];

  if (directProduct) {
    const prod = db.products.find(p => p.id === directProduct.productId);
    if (prod) {
      if (prod.status === 'discontinued') {
        triggeredBugs.push({ bugId: 'site043-bug02', secId: 'SEC-397', type: 'discontinued-product-checkout' });
      }
      orderItems.push({
        productId: prod.id,
        name: prod.name,
        price: prod.discountPrice,
        quantity: directProduct.quantity || 1,
        color: directProduct.color || prod.colors?.[0]
      });
      subtotal = prod.discountPrice * (directProduct.quantity || 1);
    }
  } else {
    // Checkout from cart
    db.cart.forEach(item => {
      const currentProd = db.products.find(p => p.id === item.productId);
      if (currentProd && currentProd.status === 'discontinued') {
        triggeredBugs.push({ bugId: 'site043-bug02', secId: 'SEC-397', type: 'discontinued-product-checkout' });
      }
      orderItems.push({ ...item });
      subtotal += item.price * item.quantity;
    });
    db.cart = [];
  }

  // Calculate discounts
  let totalDiscount = 0;
  let appliedCoupons = [];

  if (couponIds.length > 0) {
    // SEC-396: Stacking multiple coupons without checking stackable restriction
    couponIds.forEach(cId => {
      const coupon = db.coupons.find(c => c.id === cId);
      if (coupon) {
        appliedCoupons.push(coupon);
        if (coupon.type === 'percent') {
          totalDiscount += Math.round((subtotal * coupon.discount) / 100);
        } else if (coupon.type === 'amount') {
          totalDiscount += coupon.discount;
        }
      }
    });

    if (couponIds.length > 1) {
      triggeredBugs.push({ bugId: 'site043-bug01', secId: 'SEC-396', type: 'coupon-stacking-bypass' });
    }
  }

  const finalPayment = Math.max(0, subtotal - totalDiscount);

  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-8)}`,
    items: orderItems,
    totalAmount: subtotal,
    discountAmount: totalDiscount,
    finalPayment,
    appliedCoupons: appliedCoupons.map(c => c.name),
    status: 'confirmed',
    shippingAddress: deliveryAddress || db.user.address,
    paymentMethod: paymentMethod || '신용카드/간편결제',
    createdAt: new Date().toISOString(),
    history: [
      { status: 'confirmed', timestamp: new Date().toISOString(), memo: '주문 결제가 완료되었습니다.' }
    ]
  };

  db.orders.unshift(newOrder);

  res.json({
    success: true,
    bugId: triggeredBugs[0]?.bugId || 'site043-bug01',
    secId: triggeredBugs[0]?.secId || 'SEC-396',
    triggeredBugs,
    message: '주문 및 결제가 성공적으로 완료되었습니다.',
    order: newOrder
  });
});

// 7. Wishlist API with SEC-398 (Wishlist stale status bug)
// INTENTIONAL BACKEND BUG: SEC-398
// Wishlist state inconsistency:
// Returns wishlist records preserving stale initial status ('active') even when referenced product is 'discontinued',
// allowing user to still click and purchase discontinued items from wishlist.
app.get('/api/wishlist', (req, res) => {
  res.json({
    success: true,
    bugId: 'site043-bug03',
    secId: 'SEC-398',
    data: db.wishlist
  });
});

app.post('/api/wishlist', (req, res) => {
  const { productId } = req.body;
  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: '상품이 없습니다.' });

  if (!db.wishlist.find(w => w.productId === productId)) {
    db.wishlist.push({
      id: `wish-${Date.now().toString().slice(-4)}`,
      productId: product.id,
      name: product.name,
      price: product.discountPrice,
      status: 'active', // Saved as active permanently
      image: product.image
    });
  }

  res.json({
    success: true,
    bugId: 'site043-bug03',
    secId: 'SEC-398',
    message: '찜 목록에 추가되었습니다.',
    data: db.wishlist
  });
});

app.delete('/api/wishlist/:id', (req, res) => {
  db.wishlist = db.wishlist.filter(w => w.id !== req.params.id && w.productId !== req.params.id);
  res.json({ success: true, data: db.wishlist });
});

// 8. Orders API with SEC-399 (Cancelled order shipped transition bug)
// INTENTIONAL BACKEND BUG: SEC-399
// Invalid order state transition:
// Allows transitioning order status from 'cancelled' directly to 'shipped' / 'preparing',
// violating valid state lifecycle rules.
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: db.orders });
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });
  res.json({ success: true, data: order });
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

  order.status = 'cancelled';
  order.history.push({
    status: 'cancelled',
    timestamp: new Date().toISOString(),
    memo: '고객 요청으로 주문이 취소되었습니다.'
  });

  res.json({ success: true, message: '주문이 취소되었습니다.', order });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status, memo } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: '주문을 찾을 수 없습니다.' });

  const previousStatus = order.status;
  order.status = status;
  order.history.push({
    status,
    timestamp: new Date().toISOString(),
    memo: memo || `배송 상태가 [${status}] 로 변경되었습니다.`
  });

  res.json({
    success: true,
    bugId: 'site043-bug04',
    secId: 'SEC-399',
    message: `주문 상태가 [${status}] 로 변경되었습니다. (이전 상태: ${previousStatus})`,
    order
  });
});

// 9. Reviews API with SEC-400 (Review authorization state inconsistency)
// INTENTIONAL BACKEND BUG: SEC-400
// Review authorization verification flaw:
// When posting a review, server accepts client payload without verifying if user has actually
// received a 'delivered' order for that product, allowing reviews on cancelled/unpurchased items.
app.get('/api/reviews', (req, res) => {
  const { productId } = req.query;
  const list = productId ? db.reviews.filter(r => r.productId === productId) : db.reviews;
  res.json({ success: true, data: list });
});

app.get('/api/reviews/eligibility', (req, res) => {
  const { productId } = req.query;
  // Returns true if product is in any past order (even if cancelled)
  const hadOrder = db.orders.some(o => o.items.some(i => i.productId === productId));
  res.json({
    success: true,
    canReview: hadOrder,
    productId
  });
});

app.post('/api/reviews', (req, res) => {
  const { productId, rating, content, canReview } = req.body;

  const newReview = {
    id: `rev-${Date.now().toString().slice(-4)}`,
    productId: productId || 'prod-103',
    author: db.user.name,
    rating: parseInt(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    content: content || '디자인이 아주 고급스럽고 공간에 잘 어울립니다.'
  };

  db.reviews.unshift(newReview);

  res.json({
    success: true,
    bugId: 'site043-bug05',
    secId: 'SEC-400',
    message: '상품 리뷰가 성공적으로 등록되었습니다.',
    data: newReview
  });
});

// Authentication Mock
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, user: db.user, token: 'mock-roomly-jwt-9942' });
});
app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: '회원가입이 완료되었습니다.', user: db.user });
});
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: '로그아웃되었습니다.' });
});

// Static files for Production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[site043] Roomly Server running on http://localhost:${PORT}`);
});
