import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5042;

app.use(cors());
app.use(express.json());

// Products Database (18 items)
let products = [
  { id: "prod-01", name: "게이밍 노트북 16인치", category: "가전/디지털", price: 1500000, desc: "강력한 성능의 RTX 4060 그래픽 카드가 탑재된 144Hz 초고속 디스플레이 게이밍 랩톱", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-02", name: "노트북 파우치 슬림형", category: "가전/디지털", price: 25000, desc: "방수 옥스포드 원단과 충격 흡수 패딩 내장으로 소중한 랩톱을 완벽히 보호하는 파우치", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-03", name: "무선 버티컬 마우스", category: "가전/디지털", price: 45000, desc: "손목 피로도를 줄여주는 최적의 인체공학 각도 설계 무소음 무선 마우스", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-04", name: "기계식 블루투스 키보드", category: "가전/디지털", price: 120000, desc: "감성적인 레트로 키캡과 쫀득한 갈축 타건감을 선사하는 무선 멀티 페어링 키보드", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-05", name: "4K 모니터 27인치 IPS", category: "가전/디지털", price: 350000, desc: "초고화질 UHD 해상도와 sRGB 99% 색재현율을 지원하는 크리에이터 최적화 모니터", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-06", name: "천연 가죽 클래식 서류가방", category: "패션/의류", price: 180000, desc: "최상급 킵스킨 천연 가죽 소재로 튼튼한 내구성과 격식 있는 수납공간을 제공하는 브리프케이스", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-07", name: "오버핏 베이지 트렌치코트", category: "패션/의류", price: 95000, desc: "모던하고 내추럴한 실루엣을 자아내는 방풍 안감 혼용 간절기 필수 트렌치 아우터", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-08", name: "미니멀 화이트 가죽 스니커즈", category: "패션/의류", price: 85000, desc: "캐주얼과 클래식 스타일 모두에 어울리는 고탄성 쿠션창 적용 데일리 레더 슈즈", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-09", name: "티타늄 라이트 프레임 안경", category: "패션/의류", price: 68000, desc: "무게 7g 수준으로 하루 종일 안 쓴 듯 편안함을 선사하는 초경량 티타늄 안경테", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-10", name: "아웃도어 방수 전술 백팩", category: "패션/의류", price: 110000, desc: "캠핑 및 하이킹에 적합한 대용량 몰리 시스템 적용 초고강도 방수 백팩", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-11", name: "유기농 활력 멀티비타민 90정", category: "식품/리빙", price: 32000, desc: "100% 천연 유래 원료로 엄선된 아연, 비타민D 복합 에너지 서포트 영양제", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-12", name: "에스프레소 자동 캡슐 커피머신", category: "식품/리빙", price: 230000, desc: "원터치 터치 패널로 신선한 19바 고압 추출 정통 크레마 에스프레소 완비", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-13", name: "고강도 미끄럼방지 요가매트", category: "식품/리빙", price: 28000, desc: "유해물질 제로 친환경 TPE 소재로 설계된 8mm 도톰한 소음 방지 홈트레이닝 매트", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-14", name: "블랙체리 시그니처 디퓨저 200ml", category: "식품/리빙", price: 19000, desc: "자연 숙성 베이스 오일을 혼합하여 은은하고 깊은 발향을 제공하는 인테리어 향기병", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-15", name: "친환경 대나무 모 미세모 칫솔 세트", category: "식품/리빙", price: 12000, desc: "100% 생분해 가능한 대나무 바디와 이중 미세 엠보싱 칫솔모 8개입 세트", image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-16", name: "알루미늄 3단 접이식 노트북거치대", category: "가전/디지털", price: 38000, desc: "최대 17인치 대형 랩톱까지 거뜬히 고정하며 목 피로를 예방하는 다각도 거치대", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-17", name: "장패드 논슬립 게이밍 마우스패드", category: "가전/디지털", price: 18000, desc: "초밀도 방수 가공 천 표면과 바닥 밀착 미끄럼 방지 고무 패드 적용 장패드", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60" },
  { id: "prod-18", name: "버추얼 7.1채널 진동 게이밍헤드셋", category: "가전/디지털", price: 89000, desc: "미세한 발소리까지 완벽하게 잡아내는 고음질 입체 음향 가상 7.1 RGB 헤드셋", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=60" }
];

// Backend database states in memory
let cart = {
  items: [],
  coupon: null,
  shippingMethod: 'Standard'
};

let orders = [
  {
    id: "ord-01",
    items: [
      { productId: "prod-03", name: "무선 버티컬 마우스", price: 45000, quantity: 1 }
    ],
    subtotal: 45000,
    shippingMethod: "Standard",
    shippingFee: 2500,
    couponApplied: "COUPON-WELCOME",
    discount: 5000,
    totalAmount: 42500,
    status: "PAID",
    hasReturnRequested: false,
    createdAt: "2026-07-13 14:10"
  }
];

let reviews = [
  { id: "rev-01", productId: "prod-01", author: "User A", text: "게이밍 노트북 치고 발열도 적고 화면 주사율이 환상적입니다!", rating: 5 },
  { id: "rev-02", productId: "prod-03", author: "User B", text: "버티컬이라 처음엔 낯설었지만 손목 통증이 사라졌네요.", rating: 4 }
];

// API: Get Products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API: Search Products (Error 2 search query delays)
app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  let delay = 100;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 검색어 키워드에 따라 강제 지연시간의 차이를 둡니다.
  // 첫 단어 '노트북' 요청은 3초 지연하고, 최종 '게이밍 노트북 16인치'는 0.3초 지연하여 
  // 첫 요청이 나중에 완료되어 최종 뷰를 덮어쓰도록 유도합니다.
  if (q === '노트북') {
    delay = 3000;
  } else if (q === '게이밍 노트북') {
    delay = 1500;
  } else if (q === '게이밍 노트북 16인치') {
    delay = 300;
  }

  setTimeout(() => {
    const results = products.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) || 
      p.category.toLowerCase().includes(q.toLowerCase())
    );
    res.json({ results, query: q });
  }, delay);
});

// API: Get Cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// API: Update Cart Quantity (Error 1 Delayed request 1)
app.post('/api/cart/quantity', (req, res) => {
  const { productId, quantity } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend + Database
  // DESCRIPTION: 수량 변경 요청을 인위적으로 5초(5000ms) 대기 후 반영시킵니다.
  // 이 결과가 디비 세션에 적용되기 전에 주문 처리가 발생하면, 수량 1개로 생성되게 만듭니다.
  setTimeout(() => {
    const item = cart.items.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    console.log(`[DB CART] Quantity set to ${quantity} (Delayed 5s Completed)`);
  }, 5000);

  res.json({ success: true });
});

// API: Apply Coupon (Error 1 Fast request)
app.post('/api/cart/coupon', (req, res) => {
  const { couponId } = req.body;

  // Coupon apply is fast (100ms) to ensure it gets written before order submit.
  setTimeout(() => {
    cart.coupon = couponId;
    console.log(`[DB CART] Coupon Applied: ${couponId}`);
  }, 100);

  res.json({ success: true });
});

// API: Apply Shipping (Error 1 Delayed request 3)
app.post('/api/cart/shipping', (req, res) => {
  const { shippingMethod } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend + Database
  // DESCRIPTION: 배송 방식 지정을 2초(2000ms) 대기 후 메모리 세션에 쓰도록 설정합니다.
  // 0.5초만에 주문을 전송하면 이전 기본 배송 방식(Standard)이 적용됩니다.
  setTimeout(() => {
    cart.shippingMethod = shippingMethod;
    console.log(`[DB CART] Shipping Method Applied: ${shippingMethod} (Delayed 2s Completed)`);
  }, 2000);

  res.json({ success: true });
});

// API: Create Order from client payload (Error 4 Injection target)
app.post('/api/orders', (req, res) => {
  const { items, shippingMethod, couponApplied, discount, totalAmount } = req.body;

  // Save the order to database
  // We prioritize client items payload so that User B's order can contain A's contaminated items
  const newOrder = {
    id: `ord-${Date.now()}`,
    items: items || [],
    shippingMethod: shippingMethod || "Standard",
    shippingFee: shippingMethod === "Express" ? 5000 : 2500,
    couponApplied: couponApplied || null,
    discount: discount || 0,
    totalAmount: totalAmount || 0,
    status: "PAID",
    hasReturnRequested: false,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };

  orders.push(newOrder);

  // Reset cart backend database
  cart.items = [];
  cart.coupon = null;
  cart.shippingMethod = 'Standard';

  res.status(201).json(newOrder);
});

// API: Get Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Cancel Order
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = 'CANCELED';
  }
  res.json({ success: true, order });
});

// API: Return Order (Error 3 Concurrent Status Override)
app.post('/api/orders/:id/return', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 주문 취소(CANCELED)가 이미 발생했음에도 유효성 확인을 배제한 채 
  // 반품 요청 플래그(hasReturnRequested = true)를 중복 설정하여 취소와 반품 처리가 
  // 한 주문 내역 위에 공존하는 설계 모순을 초래합니다.
  if (order) {
    order.hasReturnRequested = true;
  }

  res.json({ success: true, order });
});

// API: Get Reviews
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

// API: Save/Edit Review (Error 5 Review recreate race)
app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const { text, rating, productId, author } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 리뷰 수정 요청의 내부 처리를 3000ms(3초) 강제 딜레이시킵니다.
  // 삭제 요청이 0.1초만에 먼저 실행되어 데이터가 소거된 후, 3초 뒤에 이 루틴이 실행되어 
  // 배열에 리뷰가 부재하면 신규 레코드로 강제 insert 처리해 리뷰를 유령처럼 부활시킵니다.
  setTimeout(() => {
    let review = reviews.find(r => r.id === id);
    if (review) {
      review.text = text;
      review.rating = rating;
    } else {
      // Recreate deleted review
      reviews.push({
        id,
        productId: productId || "prod-01",
        author: author || "익명",
        text,
        rating: Number(rating) || 5
      });
      console.log(`[RACE CONDITION] Deleted Review ${id} recreated under PUT!`);
    }
  }, 3000);

  res.json({ success: true });
});

// API: Delete Review
app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  reviews = reviews.filter(r => r.id !== id);
  res.json({ success: true });
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  cart = { items: [], coupon: null, shippingMethod: 'Standard' };
  orders = [
    {
      id: "ord-01",
      items: [{ productId: "prod-03", name: "무선 버티컬 마우스", price: 45000, quantity: 1 }],
      subtotal: 45000,
      shippingMethod: "Standard",
      shippingFee: 2500,
      couponApplied: "COUPON-WELCOME",
      discount: 5000,
      totalAmount: 42500,
      status: "PAID",
      hasReturnRequested: false,
      createdAt: "2026-07-13 14:10"
    }
  ];
  reviews = [
    { id: "rev-01", productId: "prod-01", author: "User A", text: "게이밍 노트북 치고 발열도 적고 화면 주사율이 환상적입니다!", rating: 5 },
    { id: "rev-02", productId: "prod-03", author: "User B", text: "버티컬이라 처음엔 낯설었지만 손목 통증이 사라졌네요.", rating: 4 }
  ];
  res.json({ success: true, cart, orders, reviews });
});

app.listen(PORT, () => {
  console.log(`[CartSphere Backend] Express server running on http://localhost:${PORT}`);
});
