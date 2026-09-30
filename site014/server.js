import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9913;

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
let loginHistory = [
  { id: 'lh-1', username: 'traveler@mail.com', ip: '192.168.1.14', device: 'Chrome / Windows 11', date: '2026.08.02 22:15' }
];

let signupHistory = [
  { id: 'sh-1', email: 'traveler@mail.com', preferences: '휴양지 중심, 가성비 5성급 호텔 선호' }
];

let profileAddress = {
  address: '서울특별시 강남구 테헤란로 427, 8층 (삼성동)'
};

let coupons = [
  { id: 'cop-1', code: 'WELCOME2026', discount: '10%', description: '첫 가입 환영 할인 쿠폰' },
  { id: 'cop-2', code: 'SKYBLUE_SUMMER', discount: '15,000원', description: '여름 바캉스 시즌 쿠폰' }
];

let searchPreferences = {
  sortOrder: '추천순',
  currentPage: '1'
};

let uploadedFiles = [
  { id: 'fl-1', filename: 'passport_scan_minsoo.pdf', date: '2026.08.01' },
  { id: 'fl-2', filename: 'agoda_hotel_voucher.pdf', date: '2026.08.02' }
];

let chatHistory = [
  { id: 'ch-1', sender: 'system', message: 'TravelNow 상담 센터에 연결되었습니다. 무엇을 도와드릴까요? 😊', time: '오후 11:30' },
  { id: 'ch-2', sender: 'traveler', message: '안녕하세요. 내일 예약한 제주 호텔 체크인 시간을 조금 늦출 수 있을까요?', time: '오후 11:32' },
  { id: 'ch-3', sender: 'system', message: '예약번호를 알려주시면 해당 호텔 프런트에 전달하겠습니다.', time: '오후 11:33' }
];

let notices = [
  { id: 'nt-1', title: '[공지] 동남아 휴양지 항공권 특가 이벤트 실시 안내', content: '여름 시즌 맞이 필리핀, 태국 노선 20% 추가 적립 이벤트가 시작됩니다.', date: '2026.08.01' },
  { id: 'nt-2', title: '[보안] 해외 로그인 차단 설정 및 개인정보 안전 관리 공지', content: '여행지에서의 안전한 계정 사용을 위해 타 지역 로그인 관리 및 차단을 활성화해주세요.', date: '2026.08.02' }
];

let reviews = [
  { id: 'rv-1', rating: 5, author: '김진우', content: '방 상태도 너무 청결하고 무엇보다 바다 뷰가 끝내줬습니다! 다음 휴가 때 또 방문하고 싶네요.', date: '3일 전' },
  { id: 'rv-2', rating: 4, author: '이지혜', content: '역과의 거리가 약간 멀지만 친절도나 가성비 측면에서 만족합니다. 추천합니다.', date: '1일 전' }
];

let flights = [
  { id: 'flt-1', airline: '대한항공', route: '김포(GMP) ➔ 제주(CJU)', time: '08:15 - 09:25', price: 78000, logo: '✈️' },
  { id: 'flt-2', airline: '아시아나항공', route: '인천(ICN) ➔ 다낭(DAD)', time: '18:40 - 21:50', price: 345000, logo: '✈️' },
  { id: 'flt-3', airline: '제주항공', route: '인천(ICN) ➔ 후쿠오카(FUK)', time: '07:30 - 09:00', price: 112000, logo: '✈️' }
];

let hotels = [
  { id: 'ht-1', name: '그랜드 오션 하얏트 제주', location: '제주 시내', rating: 4.8, price: 210000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80' },
  { id: 'ht-2', name: '시그니엘 리조트 & 스파', location: '해운대구, 부산', rating: 4.9, price: 380000, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' },
  { id: 'ht-3', name: '스카이블루 리조트 코타키나발루', location: '말레이시아', rating: 4.6, price: 145000, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80' }
];

let reservations = [
  { id: 'res-1', title: '그랜드 오션 하얏트 제주 (디럭스 킹)', period: '2026.08.10 - 08.12 (2박)', status: '예약확정', price: 420000 }
];


// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TravelNow Backend API' });
});


// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (STORED XSS)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site014-bug01
// CSV: SEC-131
// Type: Stored XSS
// Description: 로그인 입력값을 HTML Escape 없이 저장하고 로그인 기록 화면에 그대로 출력한다.
app.post('/api/login', (req, res) => {
  const { username, description } = req.body;
  const newLog = {
    id: 'lh-' + Date.now(),
    username: username || 'unknown@mail.com', // Stored XSS Vector
    ip: req.ip || '127.0.0.1',
    device: description || 'Mozilla/5.0 Agent',
    date: new Date().toLocaleString()
  };
  loginHistory.unshift(newLog);
  res.json({ status: 'success', data: newLog });
});

app.get('/api/login/history', (req, res) => {
  res.json(loginHistory);
});


// INTENTIONAL BACKEND BUG: site014-bug02
// CSV: SEC-132
// Type: Stored XSS
// Description: 회원가입 입력값을 HTML Escape 없이 저장하고 가입 내역 화면에 그대로 출력한다.
app.post('/api/signup', (req, res) => {
  const { email, preferences } = req.body;
  const newSignup = {
    id: 'sh-' + Date.now(),
    email,
    preferences // Stored XSS Vector
  };
  signupHistory.unshift(newSignup);
  res.json({ status: 'success', data: newSignup });
});

app.get('/api/signup/history', (req, res) => {
  res.json(signupHistory);
});


// INTENTIONAL BACKEND BUG: site014-bug03
// CSV: SEC-133
// Type: Stored XSS
// Description: 주소를 HTML Escape 없이 저장하고 마이페이지 주소록 화면에 그대로 출력한다.
app.post('/api/profile/address', (req, res) => {
  const { address } = req.body;
  profileAddress.address = address; // Stored XSS Vector
  res.json({ status: 'success', data: profileAddress });
});

app.get('/api/profile/address', (req, res) => {
  res.json(profileAddress);
});


// INTENTIONAL BACKEND BUG: site014-bug04
// CSV: SEC-134
// Type: Stored XSS
// Description: 쿠폰 코드를 HTML Escape 없이 저장하고 쿠폰 목록 화면에 그대로 출력한다.
app.post('/api/coupons', (req, res) => {
  const { code, discount, description } = req.body;
  const newCoupon = {
    id: 'cop-' + Date.now(),
    code, // Stored XSS Vector
    discount: discount || '10,000원',
    description: description || '등록된 쿠폰'
  };
  coupons.push(newCoupon);
  res.json({ status: 'success', data: newCoupon });
});

app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});


// INTENTIONAL BACKEND BUG: site014-bug05
// CSV: SEC-135
// Type: Stored XSS
// Description: 정렬 옵션을 HTML Escape 없이 저장하고 검색 설정 화면에 그대로 출력한다.
app.post('/api/search/sort', (req, res) => {
  const { sortOrder } = req.body;
  searchPreferences.sortOrder = sortOrder; // Stored XSS Vector
  res.json({ status: 'success', data: searchPreferences });
});


// INTENTIONAL BACKEND BUG: site014-bug06
// CSV: SEC-136
// Type: Stored XSS
// Description: 페이지 이동 값을 HTML Escape 없이 저장하고 검색 설정 화면에 그대로 출력한다.
app.post('/api/search/page', (req, res) => {
  const { currentPage } = req.body;
  searchPreferences.currentPage = currentPage; // Stored XSS Vector
  res.json({ status: 'success', data: searchPreferences });
});

app.get('/api/search/preferences', (req, res) => {
  res.json(searchPreferences);
});


// INTENTIONAL BACKEND BUG: site014-bug07
// CSV: SEC-137
// Type: Stored XSS
// Description: 여행 일정 파일명을 HTML Escape 없이 저장하고 업로드 목록 화면에 그대로 출력한다.
app.post('/api/files/upload', (req, res) => {
  const { filename } = req.body;
  const newFile = {
    id: 'fl-' + Date.now(),
    filename, // Stored XSS Vector
    date: new Date().toLocaleDateString()
  };
  uploadedFiles.unshift(newFile);
  res.json({ status: 'success', data: newFile });
});

app.get('/api/files', (req, res) => {
  res.json(uploadedFiles);
});


// INTENTIONAL BACKEND BUG: site014-bug08
// CSV: SEC-138
// Type: Stored XSS
// Description: 채팅 메시지를 HTML Escape 없이 저장하고 대화 내역 화면에 그대로 출력한다.
app.post('/api/chat', (req, res) => {
  const { message, sender } = req.body;
  const newMsg = {
    id: 'ch-' + Date.now(),
    sender: sender || 'traveler',
    message, // Stored XSS Vector
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  };
  chatHistory.push(newMsg);
  res.json({ status: 'success', data: newMsg });
});

app.get('/api/chat/history', (req, res) => {
  res.json(chatHistory);
});


// INTENTIONAL BACKEND BUG: site014-bug09
// CSV: SEC-139
// Type: Stored XSS
// Description: 공지사항 내용을 HTML Escape 없이 저장하고 공지사항 목록 화면에 그대로 출력한다.
app.post('/api/notices', (req, res) => {
  const { title, content } = req.body;
  const newNotice = {
    id: 'nt-' + Date.now(),
    title,
    content, // Stored XSS Vector
    date: new Date().toLocaleDateString()
  };
  notices.unshift(newNotice);
  res.json({ status: 'success', data: newNotice });
});

app.get('/api/notices', (req, res) => {
  res.json(notices);
});


// INTENTIONAL BACKEND BUG: site014-bug10
// CSV: SEC-140
// Type: Stored XSS
// Description: 호텔 리뷰를 HTML Escape 없이 저장하고 리뷰 목록 화면에 그대로 출력한다.
app.post('/api/reviews', (req, res) => {
  const { rating, content, author } = req.body;
  const newReview = {
    id: 'rv-' + Date.now(),
    rating: Number(rating) || 5,
    author: author || '익명여행자',
    content, // Stored XSS Vector
    date: '방금 전'
  };
  reviews.unshift(newReview);
  res.json({ status: 'success', data: newReview });
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});


// ----------------------------------------------------
// Normal Read-Only metadata endpoints
// ----------------------------------------------------
app.get('/api/flights', (req, res) => res.json(flights));
app.get('/api/hotels', (req, res) => res.json(hotels));
app.get('/api/reservations', (req, res) => res.json(reservations));
app.get('/api/profile', (req, res) => {
  res.json({
    email: 'traveler@mail.com',
    name: '민수킴',
    membership: '골드 이웃',
    point: 12500
  });
});


// ----------------------------------------------------
// SAFE ENDPOINTS (HTML ESCAPED / PPO SAFE PREFERENCES)
// ----------------------------------------------------
app.get('/api/safe/profile', (req, res) => {
  res.json({
    email: 'traveler@mail.com',
    name: '민수킴',
    membership: '골드 이웃',
    point: 12500,
    address: escapeHTML(profileAddress.address)
  });
});

app.get('/api/safe/reviews', (req, res) => {
  res.json(reviews.map(r => ({
    ...r,
    content: escapeHTML(r.content)
  })));
});

app.get('/api/safe/chat', (req, res) => {
  res.json(chatHistory.map(c => ({
    ...c,
    message: escapeHTML(c.message)
  })));
});

app.get('/api/safe/notices', (req, res) => {
  res.json(notices.map(n => ({
    ...n,
    content: escapeHTML(n.content)
  })));
});


// ----------------------------------------------------
// React static files or Dev Server proxy fallback
// ----------------------------------------------------
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Dev server proxy fallback
  const httpModule = req.url.startsWith('https') ? import('https') : import('http');
  httpModule.then((http) => {
    const devServerUrl = `http://localhost:5173${req.url}`;
    const devReq = http.request(devServerUrl, (devRes) => {
      res.writeHead(devRes.statusCode, devRes.headers);
      devRes.pipe(res);
    });
    devReq.on('error', () => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('Frontend bundle not compiled. Please verify Vite dev server port 5173 is online.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[TravelNow Server] Running at http://localhost:${PORT}`);
});
