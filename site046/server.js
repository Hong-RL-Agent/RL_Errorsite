import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 9945;

app.use(cors());
app.use(express.json());

// In-Memory Database
const FREE_SHIPPING_THRESHOLD = 40000;
const STANDARD_SHIPPING_FEE = 3000;

let products = [
  {
    id: 'prod-01',
    name: '무항생제 1+ 등급 유기농 계란 (15구)',
    category: '신선식품/계란',
    price: 9800,
    discountPrice: 7900,
    stock: 25,
    description: '자연 방사 환경에서 자란 건강한 닭이 낳은 신선하고 고소한 유기농 특란입니다.',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 1420,
    badge: '베스트',
    isFresh: true
  },
  {
    id: 'prod-02',
    name: '서울우유 1급A 신선한 우유 (1000ml)',
    category: '유제품/음료',
    price: 3200,
    discountPrice: 2850,
    stock: 30,
    description: '국산 1급A 원유 100%로 매일 아침 신선함을 전하는 대표 우유입니다.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: 980,
    badge: '인기',
    isFresh: true
  },
  {
    id: 'prod-03',
    name: '한돈 냉동 삼겹살 구이용 (500g)',
    category: '정육/계육',
    price: 18900,
    discountPrice: 14900,
    stock: 4, // Low stock for SEC-412 testing!
    description: '육질이 쫄깃하고 고소한 국내산 한돈 삼겹살로 신선 급속 냉동 포장되었습니다.',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewCount: 654,
    badge: '품절임박',
    isFresh: true
  },
  {
    id: 'prod-04',
    name: '달콤한 고당도 스테비아 방울토마토 (500g)',
    category: '과일/채소',
    price: 8900,
    discountPrice: 6900,
    stock: 18,
    description: '입안 가득 터지는 달콤한 과즙! 당도 선별 프리미엄 대추방울토마토입니다.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 812,
    badge: '특가',
    isFresh: true
  },
  {
    id: 'prod-05',
    name: '스위트 델몬트 고산지 바나나 (1송이)',
    category: '과일/채소',
    price: 4500,
    discountPrice: 3900,
    stock: 3, // Low stock for SEC-412 testing!
    description: '고산지에서 자라 더욱 쫀득하고 달콤한 프리미엄 영양 간식 바나나입니다.',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewCount: 420,
    badge: '한정수량',
    isFresh: true
  },
  {
    id: 'prod-06',
    name: '국산콩 100% 단단한 부침용 두부 (300g)',
    category: '신선식품/두부',
    price: 2500,
    discountPrice: 2200,
    stock: 40,
    description: '전통 방식으로 곱게 갈아 만든 고소하고 담백한 국산콩 두부입니다.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: 310,
    badge: '필수템',
    isFresh: true
  },
  {
    id: 'prod-07',
    name: '삼다수 무라벨 먹는샘물 2L (6병)',
    category: '유제품/음료',
    price: 7200,
    discountPrice: 6200,
    stock: 50,
    description: '화산암반이 걸러낸 깨끗하고 맑은 화산 암반수, 분리배출이 쉬운 무라벨입니다.',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 2190,
    badge: '무료배송혜택',
    isFresh: false
  },
  {
    id: 'prod-08',
    name: '신라면 5개입 멀티팩',
    category: '가공식품/라면',
    price: 4900,
    discountPrice: 4200,
    stock: 60,
    description: '얼큰하고 칼칼한 국물과 쫄깃한 면발의 한국인 대표 라면입니다.',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 1540,
    badge: '국민라면',
    isFresh: false
  },
  {
    id: 'prod-09',
    name: 'CJ 햇반 백미밥 210g (8개입 세트)',
    category: '가공식품/즉석밥',
    price: 12800,
    discountPrice: 9900,
    stock: 35,
    description: '갓 지은 밥맛 그대로, 언제 어디서나 간편하게 즐기는 갓 지은 밥 햇반입니다.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 1890,
    badge: '특가',
    isFresh: false
  },
  {
    id: 'prod-10',
    name: '고농축 파워 액체 세탁세제 3L',
    category: '생활용품/세제',
    price: 19800,
    discountPrice: 13900,
    stock: 20,
    description: '각종 찌든때와 미세먼지까지 강력 세척하는 고농축 프리미엄 세탁세제입니다.',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewCount: 450,
    badge: '대용량',
    isFresh: false
  },
  {
    id: 'prod-11',
    name: '베이킹소다 함유 뽀득 주방세제 (1.2L)',
    category: '생활용품/세제',
    price: 6500,
    discountPrice: 4900,
    stock: 28,
    description: '기름때를 말끔하게 제거하고 식기뿐 아니라 과일/야채도 안심 세척 가능한 1종 주방세제입니다.',
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: 380,
    badge: '친환경',
    isFresh: false
  },
  {
    id: 'prod-12',
    name: '3겹 도톰한 프리미엄 롤휴지 30m (30롤)',
    category: '생활용품/화장지',
    price: 24900,
    discountPrice: 18900,
    stock: 15,
    description: '100% 천연펄프로 피부 자극 없이 부드럽고 도톰한 프리미엄 3겹 롤화장지입니다.',
    image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: 920,
    badge: '인기상품',
    isFresh: false
  }
];

let categories = [
  { id: 'all', name: '전체상품', icon: 'ShoppingBag' },
  { id: '신선식품', name: '신선식품', icon: 'Egg' },
  { id: '과일/채소', name: '과일·채소', icon: 'Apple' },
  { id: '정육/계육', name: '정육·계육', icon: 'Beef' },
  { id: '유제품/음료', name: '유제품·음료', icon: 'Milk' },
  { id: '가공식품', name: '가공식품·라면', icon: 'Utensils' },
  { id: '생활용품', name: '생활·주방용품', icon: 'Sparkles' }
];

let cart = {
  items: [
    {
      id: 'cart-item-1',
      productId: 'prod-01',
      product: products[0],
      quantity: 2,
      price: 7900
    },
    {
      id: 'cart-item-2',
      productId: 'prod-03',
      product: products[2],
      quantity: 2,
      price: 14900
    }
  ],
  // Sticky free shipping flag bug state
  hasEverReachedFreeShipping: true,
  appliedCoupon: null
};

let addresses = [
  {
    id: 'addr-01',
    name: '우리집 (기본배송지)',
    receiver: '이주이',
    phone: '010-3456-7890',
    zipcode: '06123',
    address: '서울특별시 강남구 테헤란로 142',
    detailAddress: '802호',
    region: '서울',
    isDeliverable: true,
    isDefault: true,
    deliveryType: '새벽/당일배송 가능'
  },
  {
    id: 'addr-02',
    name: '회사 (수원 영통)',
    receiver: '이주이',
    phone: '010-3456-7890',
    zipcode: '16677',
    address: '경기도 수원시 영통구 삼성로 129',
    detailAddress: '디지털연구소 3층',
    region: '수원',
    isDeliverable: true,
    isDefault: false,
    deliveryType: '당일배송 가능'
  },
  {
    id: 'addr-03',
    name: '외갓집 (제주도 배송불가권역)',
    receiver: '김순자',
    phone: '010-9876-5432',
    zipcode: '63001',
    address: '제주특별자치도 제주시 첨단로 242',
    detailAddress: '101동 204호',
    region: '제주 (배송불가지역)',
    isDeliverable: false,
    isDefault: false,
    deliveryType: '새벽/당일배송 불가 지역'
  },
  {
    id: 'addr-04',
    name: '강원도 별장 (배송불가권역)',
    receiver: '이주이',
    phone: '010-3456-7890',
    zipcode: '25400',
    address: '강원도 평창군 대관령면 눈꽃로 88',
    detailAddress: '별장 1층',
    region: '강원 산간 (배송불가지역)',
    isDeliverable: false,
    isDefault: false,
    deliveryType: '새벽/당일배송 불가 지역'
  }
];

let coupons = [
  {
    id: 'CPN-WELCOME',
    name: '신규 가입 환영 5,000원 장바구니 할인 쿠폰',
    discountAmount: 5000,
    minOrderAmount: 20000,
    expiryDate: '2026-12-31',
    isUsed: false
  },
  {
    id: 'CPN-FRESH3000',
    name: '신선특가 3,000원 즉시할인 쿠폰',
    discountAmount: 3000,
    minOrderAmount: 15000,
    expiryDate: '2026-12-31',
    isUsed: false
  }
];

let deliverySlots = [
  { id: 'slot-1', type: 'DAWN', title: '내일 아침 07:00 전 도착', sub: '새벽 문 앞 신선 보랭 포장', available: true, fee: 0 },
  { id: 'slot-2', type: 'AFTERNOON', title: '오늘 오후 14:00 ~ 18:00 도착', sub: '당일 냉장 직배송', available: true, fee: 0 },
  { id: 'slot-3', type: 'EVENING', title: '오늘 저녁 19:00 ~ 22:00 도착', sub: '퇴근 맞춤 당일 배송', available: true, fee: 0 }
];

let checkoutSession = {
  address: addresses[0],
  selectedSlot: deliverySlots[0],
  // Cached region deliverability state for SEC-413
  cachedDeliverableState: true,
  appliedCoupon: null
};

let userPoints = {
  balance: 3500,
  history: [
    { id: 'pt-1', type: 'EARN', amount: 500, reason: '신규가입 축하 적립', date: '2026-09-20' },
    { id: 'pt-2', type: 'EARN', amount: 3000, reason: '첫구매 리뷰 감사 적립', date: '2026-09-22' }
  ]
};

let wishlist = ['prod-01', 'prod-03'];

let orders = [
  {
    id: 'ORD-20260924-8841',
    createdAt: '2026-09-24 16:30',
    status: 'COMPLETED', // COMPLETED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED
    items: [
      { productId: 'prod-01', name: '무항생제 1+ 등급 유기농 계란 (15구)', quantity: 2, price: 7900, totalPrice: 15800 },
      { productId: 'prod-04', name: '달콤한 고당도 스테비아 방울토마토 (500g)', quantity: 1, price: 6900, totalPrice: 6900 },
      { productId: 'prod-09', name: 'CJ 햇반 백미밥 210g (8개입 세트)', quantity: 2, price: 9900, totalPrice: 19800 }
    ],
    itemsTotal: 42500,
    shippingFee: 0,
    couponDiscount: 5000,
    usedPoints: 0,
    finalAmount: 37500,
    earnedPoints: 375,
    address: addresses[0],
    deliverySlot: deliverySlots[0],
    refundHistory: []
  }
];

let refunds = {};

let reviews = {
  'prod-01': [
    { id: 'rev-1', author: '김*현', rating: 5, date: '2026-09-22', content: '노른자가 정말 탱글탱글하고 신선해요! 계란말이 해먹었는데 최고입니다.' },
    { id: 'rev-2', author: '박*우', rating: 5, date: '2026-09-21', content: '새벽에 안전하게 문 앞에 배송되었네요. 깨진 것 하나 없이 완벽합니다.' }
  ],
  'prod-03': [
    { id: 'rev-3', author: '최*영', rating: 5, date: '2026-09-23', content: '잡내 하나 없고 고소합니다. 프라이팬에 구워먹으니 식당 부럽지 않아요.' }
  ]
};

// Helper: Cart Calculation with SEC-411 logic
function calculateCart() {
  let itemsTotal = 0;
  let itemsCount = 0;

  for (const item of cart.items) {
    itemsTotal += item.price * item.quantity;
    itemsCount += item.quantity;
  }

  // INTENTIONAL BACKEND BUG: site046-SEC-411
  // Free Shipping Fee Recalculation Error
  // Once the cart total reached the threshold (or flag is set), shipping fee remains 0 even if total drops below 40,000 KRW!
  let bugTriggered = false;
  let shippingFee = STANDARD_SHIPPING_FEE;

  if (itemsTotal >= FREE_SHIPPING_THRESHOLD) {
    cart.hasEverReachedFreeShipping = true;
    shippingFee = 0;
  } else if (cart.hasEverReachedFreeShipping && itemsTotal > 0) {
    // BUGGY BEHAVIOR: retains free shipping 0 KRW instead of reverting to 3,000 KRW
    shippingFee = 0;
    bugTriggered = true;
  } else if (itemsTotal === 0) {
    shippingFee = 0;
  } else {
    shippingFee = STANDARD_SHIPPING_FEE;
  }

  let discountAmount = 0;
  if (cart.appliedCoupon) {
    discountAmount = Math.min(cart.appliedCoupon.discountAmount, itemsTotal);
  }

  const finalTotal = Math.max(0, itemsTotal + shippingFee - discountAmount);

  return {
    items: cart.items,
    itemsTotal,
    itemsCount,
    shippingFee,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    appliedCoupon: cart.appliedCoupon,
    discountAmount,
    finalTotal,
    _bugTriggered_SEC_411: bugTriggered
  };
}

// -------------------------------------------------------------
// APIs
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FreshCart', port: PORT });
});

// Products
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let result = [...products];

  if (category && category !== 'all') {
    result = result.filter(p => p.category.includes(category));
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => a.discountPrice - b.discountPrice);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.discountPrice - a.discountPrice);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  }

  res.json({ products: result });
});

app.get('/api/products/:id', (req, res) => {
  const prod = products.find(p => p.id === req.params.id);
  if (!prod) {
    return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  }
  res.json({ product: prod });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json({ categories });
});

// Cart
app.get('/api/cart', (req, res) => {
  const summary = calculateCart();
  if (summary._bugTriggered_SEC_411) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-411');
    return res.json({
      ...summary,
      _bug: {
        bugId: 'site046-SEC-411',
        secId: 'SEC-411',
        type: 'Shipping Fee Recalculation Error',
        message: '무료배송 기준(40,000원) 미만임에도 배송비가 0원으로 유지되었습니다.'
      }
    });
  }
  res.json(summary);
});

// Add to Cart
app.post('/api/cart/items', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: '존재하지 않는 상품입니다.' });
  }

  // Initial add checks stock correctly
  if (quantity > product.stock) {
    return res.status(400).json({ error: `재고 수량(${product.stock}개)을 초과할 수 없습니다.` });
  }

  const existing = cart.items.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      id: `cart-item-${Date.now()}`,
      productId: product.id,
      product: product,
      quantity: quantity,
      price: product.discountPrice
    });
  }

  const summary = calculateCart();
  res.json({ success: true, cart: summary });
});

// Update Cart Item Quantity
// INTENTIONAL BACKEND BUG: site046-SEC-412
// Inventory Validation Error on Cart Quantity Change
// When increasing quantity in cart, stock verification is omitted!
app.patch('/api/cart/items/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = cart.items.find(i => i.id === id || i.productId === id);
  if (!item) {
    return res.status(404).json({ error: '장바구니 항목을 찾을 수 없습니다.' });
  }

  const newQty = parseInt(quantity, 10);
  if (isNaN(newQty) || newQty <= 0) {
    return res.status(400).json({ error: '올바른 수량을 입력해주세요.' });
  }

  const product = products.find(p => p.id === item.productId);
  let bugTriggered = false;

  // BUGGY BEHAVIOR: We omit: if (product && newQty > product.stock) throw error!
  if (product && newQty > product.stock) {
    // INTENTIONAL BUG site046-SEC-412: Allow exceeding available stock
    bugTriggered = true;
  }

  item.quantity = newQty;
  const summary = calculateCart();

  if (bugTriggered) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-412');
    return res.json({
      success: true,
      cart: summary,
      _bug: {
        bugId: 'site046-SEC-412',
        secId: 'SEC-412',
        type: 'Inventory Validation Error',
        message: `재고 수량(${product.stock}개)을 초과한 ${newQty}개 주문 수량이 정상 반영되었습니다.`
      }
    });
  }

  if (summary._bugTriggered_SEC_411) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-411');
    return res.json({
      success: true,
      cart: summary,
      _bug: {
        bugId: 'site046-SEC-411',
        secId: 'SEC-411',
        type: 'Shipping Fee Recalculation Error',
        message: '무료배송 기준(40,000원) 미만임에도 배송비가 0원으로 유지되었습니다.'
      }
    });
  }

  res.json({ success: true, cart: summary });
});

// Delete Cart Item
app.delete('/api/cart/items/:id', (req, res) => {
  const { id } = req.params;
  cart.items = cart.items.filter(i => i.id !== id && i.productId !== id);
  const summary = calculateCart();

  if (summary._bugTriggered_SEC_411) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-411');
    return res.json({
      success: true,
      cart: summary,
      _bug: {
        bugId: 'site046-SEC-411',
        secId: 'SEC-411',
        type: 'Shipping Fee Recalculation Error',
        message: '무료배송 기준(40,000원) 미만임에도 배송비가 0원으로 유지되었습니다.'
      }
    });
  }

  res.json({ success: true, cart: summary });
});

// Coupons
app.get('/api/coupons', (req, res) => {
  res.json({ coupons });
});

app.post('/api/coupons/apply', (req, res) => {
  const { couponId } = req.body;
  if (!couponId) {
    cart.appliedCoupon = null;
    checkoutSession.appliedCoupon = null;
    return res.json({ success: true, cart: calculateCart() });
  }

  const coupon = coupons.find(c => c.id === couponId);
  if (!coupon) {
    return res.status(404).json({ error: '유효하지 않은 쿠폰입니다.' });
  }

  cart.appliedCoupon = coupon;
  checkoutSession.appliedCoupon = coupon;
  res.json({ success: true, appliedCoupon: coupon, cart: calculateCart() });
});

// Addresses
app.get('/api/addresses', (req, res) => {
  res.json({ addresses });
});

app.post('/api/addresses', (req, res) => {
  const { name, receiver, phone, zipcode, address, detailAddress, region } = req.body;
  if (!receiver || !address) {
    return res.status(400).json({ error: '수령인과 주소는 필수입니다.' });
  }

  const isDeliverable = !region?.includes('제주') && !region?.includes('강원') && !address.includes('제주') && !address.includes('울릉');
  const newAddr = {
    id: `addr-${Date.now()}`,
    name: name || '새 배송지',
    receiver,
    phone: phone || '010-0000-0000',
    zipcode: zipcode || '12345',
    address,
    detailAddress: detailAddress || '',
    region: region || '수도권',
    isDeliverable,
    isDefault: addresses.length === 0,
    deliveryType: isDeliverable ? '새벽/당일배송 가능' : '새벽/당일배송 불가 지역'
  };

  addresses.push(newAddr);
  res.json({ success: true, address: newAddr });
});

app.patch('/api/addresses/:id', (req, res) => {
  const addr = addresses.find(a => a.id === req.params.id);
  if (!addr) {
    return res.status(404).json({ error: '배송지를 찾을 수 없습니다.' });
  }
  Object.assign(addr, req.body);
  res.json({ success: true, address: addr });
});

app.delete('/api/addresses/:id', (req, res) => {
  addresses = addresses.filter(a => a.id !== req.params.id);
  res.json({ success: true, addresses });
});

// Delivery slots & Availability
app.get('/api/delivery/slots', (req, res) => {
  res.json({ slots: deliverySlots });
});

app.get('/api/delivery/availability', (req, res) => {
  const { addressId } = req.query;
  const targetAddr = addresses.find(a => a.id === addressId) || checkoutSession.address;
  
  // Checking cached or current
  res.json({
    isDeliverable: checkoutSession.cachedDeliverableState,
    address: targetAddr
  });
});

// Checkout Summary
app.get('/api/checkout/summary', (req, res) => {
  const cartSummary = calculateCart();
  const summary = {
    ...cartSummary,
    address: checkoutSession.address,
    isDeliverable: checkoutSession.cachedDeliverableState,
    selectedSlot: checkoutSession.selectedSlot,
    appliedCoupon: checkoutSession.appliedCoupon || cartSummary.appliedCoupon,
    availablePoints: userPoints.balance
  };

  if (cartSummary._bugTriggered_SEC_411) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-411');
    summary._bug = {
      bugId: 'site046-SEC-411',
      secId: 'SEC-411',
      type: 'Shipping Fee Recalculation Error',
      message: '무료배송 기준(40,000원) 미만임에도 결제 시 배송비가 0원으로 적용되었습니다.'
    };
  }

  res.json(summary);
});

// Update Checkout Address
// INTENTIONAL BACKEND BUG: site046-SEC-413
// Delivery Region Validation Error
// Checkout retains initial cached deliverable state even after switching to an undeliverable region address!
app.patch('/api/checkout/address', (req, res) => {
  const { addressId } = req.body;
  const targetAddr = addresses.find(a => a.id === addressId);

  if (!targetAddr) {
    return res.status(404).json({ error: '배송지를 찾을 수 없습니다.' });
  }

  checkoutSession.address = targetAddr;
  
  let bugTriggered = false;
  // BUGGY BEHAVIOR: We DO NOT update checkoutSession.cachedDeliverableState = targetAddr.isDeliverable!
  // Instead, if initial address was deliverable (true), it remains true even for undeliverable region!
  if (!targetAddr.isDeliverable && checkoutSession.cachedDeliverableState === true) {
    bugTriggered = true;
  }

  if (bugTriggered) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-413');
    return res.json({
      success: true,
      address: targetAddr,
      isDeliverable: checkoutSession.cachedDeliverableState, // Still true!
      _bug: {
        bugId: 'site046-SEC-413',
        secId: 'SEC-413',
        type: 'Delivery Region Validation Error',
        message: `배송 불가 지역(${targetAddr.region})으로 변경했으나 배송 가능 상태(true)가 그대로 유지되었습니다.`
      }
    });
  }

  res.json({
    success: true,
    address: targetAddr,
    isDeliverable: checkoutSession.cachedDeliverableState
  });
});

// Orders (Create, List, Detail, Cancel, Refund)
app.post('/api/orders', (req, res) => {
  const { addressId, slotId, couponId, usedPoints = 0 } = req.body;
  const cartSummary = calculateCart();

  if (cartSummary.items.length === 0) {
    return res.status(400).json({ error: '장바구니가 비어 있습니다.' });
  }

  const selectedAddr = addresses.find(a => a.id === addressId) || checkoutSession.address;
  const slot = deliverySlots.find(s => s.id === slotId) || deliverySlots[0];
  const coupon = coupons.find(c => c.id === couponId) || cartSummary.appliedCoupon;

  const pointsToUse = Math.min(Number(usedPoints) || 0, userPoints.balance, cartSummary.finalTotal);
  const finalAmount = Math.max(0, cartSummary.finalTotal - pointsToUse);
  const earnedPoints = Math.floor(finalAmount * 0.01); // 1% points earned

  // Update user points
  userPoints.balance -= pointsToUse;
  userPoints.balance += earnedPoints;
  userPoints.history.unshift({
    id: `pt-${Date.now()}`,
    type: 'EARN',
    amount: earnedPoints,
    reason: '신선배송 주문 적립 (1%)',
    date: new Date().toISOString().slice(0, 10)
  });

  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toLocaleString('ko-KR'),
    status: 'COMPLETED',
    items: cartSummary.items.map(item => ({
      productId: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity,
      image: item.product.image
    })),
    itemsTotal: cartSummary.itemsTotal,
    shippingFee: cartSummary.shippingFee,
    couponDiscount: cartSummary.discountAmount,
    usedPoints: pointsToUse,
    finalAmount,
    earnedPoints,
    address: selectedAddr,
    deliverySlot: slot,
    refundHistory: []
  };

  orders.unshift(newOrder);

  // Clear cart
  cart.items = [];
  cart.hasEverReachedFreeShipping = false;
  cart.appliedCoupon = null;
  checkoutSession.appliedCoupon = null;

  res.json({ success: true, order: newOrder });
});

app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: '주문 내역을 찾을 수 없습니다.' });
  }
  res.json({ order });
});

// Order Cancel
// INTENTIONAL BACKEND BUG: site046-SEC-415
// Loyalty Point State Error on Order Cancellation
// When an order is cancelled, order status becomes 'CANCELLED', but earned loyalty points are not revoked!
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  }

  if (order.status === 'CANCELLED') {
    return res.status(400).json({ error: '이미 취소된 주문입니다.' });
  }

  order.status = 'CANCELLED';

  // Return used points if any
  if (order.usedPoints > 0) {
    userPoints.balance += order.usedPoints;
    userPoints.history.unshift({
      id: `pt-${Date.now()}-ret`,
      type: 'REFUND',
      amount: order.usedPoints,
      reason: `주문(${order.id}) 취소 사용포인트 환원`,
      date: new Date().toISOString().slice(0, 10)
    });
  }

  // BUGGY BEHAVIOR: We DO NOT revoke order.earnedPoints from userPoints.balance!
  // Normal behavior would be:
  // userPoints.balance = Math.max(0, userPoints.balance - order.earnedPoints);
  const bugTriggered = order.earnedPoints > 0;

  if (bugTriggered) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-415');
    return res.json({
      success: true,
      order,
      points: userPoints,
      _bug: {
        bugId: 'site046-SEC-415',
        secId: 'SEC-415',
        type: 'Loyalty Point State Error',
        message: `주문(${order.id}) 취소 완료 후에도 적립된 ${order.earnedPoints}P 포인트가 회수되지 않고 유지되었습니다.`
      }
    });
  }

  res.json({ success: true, order, points: userPoints });
});

// Partial/Full Refund
// INTENTIONAL BACKEND BUG: site046-SEC-414
// Partial Refund Calculation Error
// For partial refund of items, server subtracts the ENTIRE coupon discount of the order from that single item's refund!
app.post('/api/orders/:id/refund', (req, res) => {
  const { id } = req.params;
  const { productId, quantity = 1, reason = '단순변심' } = req.body;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  }

  const item = order.items.find(i => i.productId === productId);
  if (!item) {
    return res.status(404).json({ error: '해당 주문에 포함되지 않은 상품입니다.' });
  }

  const isPartial = order.items.length > 1 || item.quantity > quantity;
  let bugTriggered = false;
  let refundAmount = 0;

  if (isPartial && order.couponDiscount > 0) {
    // BUGGY BEHAVIOR: Deduct full order discount from this single item refund amount!
    const singleItemTotal = item.price * quantity;
    refundAmount = Math.max(0, singleItemTotal - order.couponDiscount);
    bugTriggered = true;
  } else {
    // Proportional or full
    const itemRatio = (item.price * quantity) / order.itemsTotal;
    const itemDiscountShare = Math.round(order.couponDiscount * itemRatio);
    refundAmount = (item.price * quantity) - itemDiscountShare;
  }

  const refundId = `REF-${Date.now().toString().slice(-6)}`;
  const refundRecord = {
    id: refundId,
    orderId: order.id,
    productId,
    productName: item.name,
    quantity,
    refundAmount,
    reason,
    isPartial,
    createdAt: new Date().toLocaleString('ko-KR')
  };

  refunds[refundId] = refundRecord;
  order.refundHistory.push(refundRecord);

  if (isPartial) {
    order.status = 'PARTIALLY_REFUNDED';
  } else {
    order.status = 'REFUNDED';
  }

  if (bugTriggered) {
    res.setHeader('X-Bug-Triggered', 'site046-SEC-414');
    return res.json({
      success: true,
      refund: refundRecord,
      order,
      _bug: {
        bugId: 'site046-SEC-414',
        secId: 'SEC-414',
        type: 'Partial Refund Calculation Error',
        message: `부분 환불 시 상품 금액(${item.price * quantity}원)에서 전체 주문 할인액(${order.couponDiscount}원)이 전액 차감되어 환불액(${refundAmount}원)이 잘못 계산되었습니다.`
      }
    });
  }

  res.json({ success: true, refund: refundRecord, order });
});

app.get('/api/refunds/:id', (req, res) => {
  const refund = refunds[req.params.id];
  if (!refund) {
    return res.status(404).json({ error: '환불 내역을 찾을 수 없습니다.' });
  }
  res.json({ refund });
});

// Loyalty Points
app.get('/api/points', (req, res) => {
  res.json({ points: userPoints });
});

// Wishlist
app.get('/api/wishlist', (req, res) => {
  const wishProducts = products.filter(p => wishlist.includes(p.id));
  res.json({ wishlist: wishProducts, ids: wishlist });
});

app.post('/api/wishlist/:productId', (req, res) => {
  const { productId } = req.params;
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
  }
  res.json({ success: true, ids: wishlist });
});

app.delete('/api/wishlist/:productId', (req, res) => {
  const { productId } = req.params;
  wishlist = wishlist.filter(id => id !== productId);
  res.json({ success: true, ids: wishlist });
});

// Reviews
app.get('/api/products/:id/reviews', (req, res) => {
  res.json({ reviews: reviews[req.params.id] || [] });
});

app.post('/api/reviews', (req, res) => {
  const { productId, rating = 5, content } = req.body;
  if (!productId || !content) {
    return res.status(400).json({ error: '상품 ID와 후기 내용을 입력해주세요.' });
  }

  if (!reviews[productId]) {
    reviews[productId] = [];
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    author: '이*이',
    rating: Number(rating),
    date: new Date().toISOString().slice(0, 10),
    content
  };

  reviews[productId].unshift(newReview);
  res.json({ success: true, review: newReview });
});

// Serve static build files if available
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`FreshCart Delivery Backend running at http://localhost:${PORT}`);
});

