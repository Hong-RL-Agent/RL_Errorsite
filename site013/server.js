import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9912;

app.use(cors());
app.use(express.json());

// Helper function to escape HTML
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (match) => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

// ----------------------------------------------------
// Mock Database State
// ----------------------------------------------------
let searchHistory = [
  { id: '1', keyword: '아이패드 에어' },
  { id: '2', keyword: '캠핑 텐트' }
];

let profileInfo = {
  name: '김민수',
  nickname: '따뜻한이웃',
  bio: '주로 도서와 의류를 거래합니다. 직거래는 방배역에서 가능해요! 🌿'
};

let inquiries = [
  {
    id: '1',
    title: '거래 약속 장소 문의',
    content: '상대방이 약속 장소를 변경하고 싶어하는데, 동네 외의 타 지역 조율도 플랫폼 규정상 가능할까요?',
    status: '답변완료',
    answer: '네, 상호 합의 하에 약속 장소를 조율하시는 것은 규정상 제한되지 않습니다.'
  }
];

let products = [
  {
    id: 'prod-1',
    title: '레트로 브라운 레더 쇼파',
    price: 150000,
    description: '3년 전에 인테리어 숍에서 구매한 레트로 스타일 빈티지 가죽 소파입니다. 생활 가죽 에이징 외에 하자는 없습니다.',
    seller: '가구사랑',
    location: '서초동',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    likes: 12
  },
  {
    id: 'prod-2',
    title: '클래식 필름 카메라 (민트급)',
    price: 85000,
    description: '작동 테스트 완료된 아날로그 감성 카메라입니다. 뷰파인더 맑고 노출계 잘 움직입니다. 필름 1롤 서비스 드려요.',
    seller: '셔터버그',
    location: '역삼동',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    likes: 24
  },
  {
    id: 'prod-3',
    title: '빈티지 우드 감성 스탠드 조음 조명',
    price: 23000,
    description: '따뜻한 노란빛이 나오는 우드 스탠드입니다. 무드등이나 독서등으로 방 분위기 바꿀 때 아주 좋습니다.',
    seller: '감성조명',
    location: '도곡동',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    likes: 7
  }
];

let files = [
  { id: 'file-1', filename: 'retro_sofa_detail.jpg', description: '소파 하단 긁힘 부위 클로즈업 사진입니다.' }
];

let comments = [
  { id: 'comm-1', productId: 'prod-1', nickname: '네고왕', text: '쿨거래시 혹시 배달도 가능한가요?', date: '오후 2:14' },
  { id: 'comm-2', productId: 'prod-1', nickname: '가구사랑', text: '죄송합니다. 부피가 있어 직접 가지러 오셔야 해요!', date: '오후 2:20' }
];

let reservations = [
  { id: 'res-1', productId: 'prod-1', time: '8월 5일 오후 6시', location: '서초역 3번출구 앞', note: '소파가 무거우니 SUV 차주분이 오셔야 실을 수 있습니다.' }
];

let cart = [
  { id: 'cart-1', productId: 'prod-2', notes: '판매자 평판이 아주 좋은 편이니 빠른 구매 고려' }
];

let payments = [
  { id: 'pay-1', amount: 85000, productName: '클래식 필름 카메라', notes: '영수증 팩스 발급 요청합니다.', date: '2026.08.01' }
];

let filters = [
  { id: 'filt-1', name: '서초동 10만원 이하 가전', minPrice: 0, maxPrice: 100000, category: '가전/디지털' }
];


// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MarketHub Backend API' });
});


// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (STORED XSS)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site013-bug01
// CSV: SEC-121
// Type: Stored XSS
// Description: 최근 검색어를 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/search/save', (req, res) => {
  const keyword = req.body.keyword || '';
  const newHist = { id: String(Date.now()), keyword };
  searchHistory.unshift(newHist);
  res.json({ status: 'success', data: newHist });
});

app.get('/api/search/history', (req, res) => {
  res.json(searchHistory);
});


// INTENTIONAL BACKEND BUG: site013-bug02
// CSV: SEC-122
// Type: Stored XSS
// Description: 프로필 소개를 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/profile', (req, res) => {
  const { name, nickname, bio } = req.body;
  if (name) profileInfo.name = name;
  if (nickname) profileInfo.nickname = nickname;
  if (bio !== undefined) profileInfo.bio = bio; // Stored XSS vector
  res.json({ status: 'success', data: profileInfo });
});

app.get('/api/profile', (req, res) => {
  res.json(profileInfo);
});


// INTENTIONAL BACKEND BUG: site013-bug03
// CSV: SEC-123
// Type: Stored XSS
// Description: 문의 내용을 HTML Escape 없이 저장하고 문의 내역 리스트 조회 화면에 그대로 출력한다.
app.post('/api/inquiries', (req, res) => {
  const { title, content } = req.body;
  const newInq = {
    id: String(Date.now()),
    title,
    content, // Stored XSS vector
    status: '답변대기',
    answer: null
  };
  inquiries.unshift(newInq);
  res.json({ status: 'success', data: newInq });
});

app.get('/api/inquiries', (req, res) => {
  res.json(inquiries);
});


// INTENTIONAL BACKEND BUG: site013-bug04
// CSV: SEC-124
// Type: Stored XSS
// Description: 상품명을 HTML Escape 없이 저장하고 상세 정보 조회 화면에 그대로 출력한다.
app.post('/api/products', (req, res) => {
  const { title, price, description, seller, location, image } = req.body;
  const newProduct = {
    id: 'prod-' + Date.now(),
    title, // Stored XSS vector
    price: Number(price) || 0,
    description,
    seller: seller || '무명판매자',
    location: location || '우리동네',
    image: image || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    likes: 0
  };
  products.unshift(newProduct);
  res.json({ status: 'success', data: newProduct });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const item = products.find(p => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Product not found' });
  res.json(item);
});


// INTENTIONAL BACKEND BUG: site013-bug05
// CSV: SEC-125
// Type: Stored XSS
// Description: 업로드 파일 설명 메타데이터를 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/files', (req, res) => {
  const { filename, description } = req.body;
  const newFile = {
    id: 'file-' + Date.now(),
    filename: filename || 'detail.png',
    description // Stored XSS vector
  };
  files.push(newFile);
  res.json({ status: 'success', data: newFile });
});

app.get('/api/files/:id', (req, res) => {
  const f = files.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: 'File not found' });
  res.json(f);
});


// INTENTIONAL BACKEND BUG: site013-bug06
// CSV: SEC-126
// Type: Stored XSS
// Description: 댓글 텍스트 내용을 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/comments', (req, res) => {
  const { productId, text, nickname } = req.body;
  const newComment = {
    id: 'comm-' + Date.now(),
    productId,
    nickname: nickname || '당근이웃',
    text, // Stored XSS vector
    date: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  };
  comments.push(newComment);
  res.json({ status: 'success', data: newComment });
});

app.get('/api/comments', (req, res) => {
  const { productId } = req.query;
  if (productId) {
    res.json(comments.filter(c => c.productId === productId));
  } else {
    res.json(comments);
  }
});


// INTENTIONAL BACKEND BUG: site013-bug07
// CSV: SEC-127
// Type: Stored XSS
// Description: 예약 거래 메모 내용을 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/reservations', (req, res) => {
  const { productId, time, location, note } = req.body;
  const newRes = {
    id: 'res-' + Date.now(),
    productId,
    time: time || '내일 정오',
    location: location || '근처 지하철역',
    note // Stored XSS vector
  };
  reservations.push(newRes);
  res.json({ status: 'success', data: newRes });
});

app.get('/api/reservations', (req, res) => {
  const { productId } = req.query;
  if (productId) {
    res.json(reservations.filter(r => r.productId === productId));
  } else {
    res.json(reservations);
  }
});


// INTENTIONAL BACKEND BUG: site013-bug08
// CSV: SEC-128
// Type: Stored XSS
// Description: 장바구니/관심상품의 개인 찜 메모를 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/cart', (req, res) => {
  const { productId, notes } = req.body;
  const newCart = {
    id: 'cart-' + Date.now(),
    productId,
    notes // Stored XSS vector
  };
  cart.push(newCart);
  res.json({ status: 'success', data: newCart });
});

app.get('/api/cart', (req, res) => {
  res.json(cart);
});


// INTENTIONAL BACKEND BUG: site013-bug09
// CSV: SEC-129
// Type: Stored XSS
// Description: 결제 메시지 요청사항 메모를 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/payment', (req, res) => {
  const { amount, productName, notes } = req.body;
  const newPay = {
    id: 'pay-' + Date.now(),
    amount: Number(amount) || 0,
    productName: productName || '중고 서적',
    notes, // Stored XSS vector
    date: new Date().toLocaleDateString('ko-KR')
  };
  payments.unshift(newPay);
  res.json({ status: 'success', data: newPay });
});

app.get('/api/payment/history', (req, res) => {
  res.json(payments);
});


// INTENTIONAL BACKEND BUG: site013-bug10
// CSV: SEC-130
// Type: Stored XSS
// Description: 검색 필터 라벨 명을 HTML Escape 없이 저장하고 조회 화면에 그대로 출력한다.
app.post('/api/filter', (req, res) => {
  const { name, minPrice, maxPrice, category } = req.body;
  const newFilt = {
    id: 'filt-' + Date.now(),
    name, // Stored XSS vector
    minPrice: Number(minPrice) || 0,
    maxPrice: Number(maxPrice) || 9999999,
    category: category || '전체 카테고리'
  };
  filters.push(newFilt);
  res.json({ status: 'success', data: newFilt });
});

app.get('/api/filter', (req, res) => {
  res.json(filters);
});


// ----------------------------------------------------
// SAFE ENDPOINTS (HTML ESCAPED / SECURITY GAURD ON)
// ----------------------------------------------------
app.get('/api/safe/profile', (req, res) => {
  res.json({
    ...profileInfo,
    bio: escapeHTML(profileInfo.bio)
  });
});

app.get('/api/safe/products', (req, res) => {
  res.json(products.map(p => ({
    ...p,
    title: escapeHTML(p.title)
  })));
});

app.get('/api/safe/comments', (req, res) => {
  const { productId } = req.query;
  const list = productId ? comments.filter(c => c.productId === productId) : comments;
  res.json(list.map(c => ({
    ...c,
    text: escapeHTML(c.text)
  })));
});

app.get('/api/safe/cart', (req, res) => {
  res.json(cart.map(c => ({
    ...c,
    notes: escapeHTML(c.notes)
  })));
});


// ----------------------------------------------------
// React static files or Dev Server transparent proxy
// ----------------------------------------------------
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Dev server transparent mapping (failsafe fallback if production bundle is missing)
  const httpModule = req.url.startsWith('https') ? import('https') : import('http');
  httpModule.then((http) => {
    const devServerUrl = `http://localhost:5173${req.url}`;
    const devReq = http.request(devServerUrl, (devRes) => {
      res.writeHead(devRes.statusCode, devRes.headers);
      devRes.pipe(res);
    });
    devReq.on('error', () => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('Frontend asset loading failed. Ensure Vite is running on port 5173.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[QuickDelivery Server] Running at http://localhost:${PORT}`);
});
