import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9916;

app.use(cors());
app.use(express.json());

// Helper function to evaluate SQL Injection Conditional Branching
function evalSQLInjection(inputStr, defaultFilterFn, allItems) {
  if (!inputStr) return allItems;
  const lower = String(inputStr).toLowerCase();
  if (lower.includes("' or '1'='1") || lower.includes("' or 'a'='a") || lower.includes("' or 1=1") || lower.includes('" or "1"="1')) {
    return allItems; // Always True condition -> returns everything
  }
  if (lower.includes("' and '1'='2") || lower.includes("' and 'a'='b") || lower.includes("' and 1=2") || lower.includes('" and "1"="2')) {
    return []; // Always False condition -> returns nothing
  }
  return allItems.filter(defaultFilterFn);
}

// ----------------------------------------------------
// Mock Databases
// ----------------------------------------------------
let users = [
  { username: 'customer', name: '김태희', role: 'customer', address: '서울 서초구 반포동' },
  { username: 'planner', name: '이민정 플래너', role: 'planner', address: '서울 강남구 신사동' }
];

let venues = [
  { id: 'ven-1', title: '아모르 그랜드 볼룸 웨딩홀', rating: 4.9, price: '대관료 500만원', info: '호텔식 프리미엄 단독홀, 300석 규모, 버진로드 25m', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80' },
  { id: 'ven-2', title: '벨라 루체 하우스 웨딩홀', rating: 4.7, price: '대관료 350만원', info: '야외 가든형 하우스 웨딩, 150석 규모, 화사한 플라워 데코', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80' }
];

let dresses = [
  { id: 'dr-1', title: '로즈골드 실크 머메이드 드레스', rating: 4.8, price: '대여 150만원', brand: '실크 벨라인 에이라인 명가 아뜰리에', image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=600&q=80' }
];

let studios = [
  { id: 'st-1', title: '아모르 스튜디오 내츄럴 화보', rating: 4.9, price: '촬영 120만원', type: '실내/야외 스냅' }
];

let makeups = [
  { id: 'mk-1', title: '로즈골드 글로우 메이크업 패키지', rating: 4.8, price: '헤어/메이크업 60만원', type: '내추럴 광채' }
];

let coupons = [
  { id: 'cp-1', code: 'AMORE2026', discount: '10%', note: '2026 시즌 아모르 오픈 특전 할인' }
];

let addressesList = [
  { id: 'adr-1', username: 'customer', address: '서울 서초구 반포동 101호' }
];

let contractsList = [
  { id: 'con-1', filename: '김태희_웨딩홀_가계약서.pdf', description: '아모르 그랜드 볼룸 가계약 체결 본' }
];

let chatMessages = [
  { id: 'msg-1', sender: 'planner', text: '안녕하세요 김태희 신부님! 결혼식 날짜와 선호하시는 베뉴 분위기를 알려주시면 최적의 견적 리스트를 뽑아드릴게요.' }
];

let notices = [
  { id: 'nt-1', title: '2026년 가을/겨울 시즌 잔여타임 특별 혜택 및 무료 시식회 안내', date: '2026.08.01' },
  { id: 'nt-2', title: '아모르 웨딩 파트너사 제휴 할인 패키지 런칭 공지', date: '2026.08.02' }
];

let reviews = [
  { id: 'rev-1', writer: '박신혜 신부', text: '플래너님이 세심하게 챙겨주셔서 복잡한 홀 예약과 드레스를 단번에 골랐어요. 추천합니다!' }
];

let reservations = [
  { id: 'res-1', title: '아모르 그랜드 볼룸 홀 투어 및 뷔페 시식 상담 예약', date: '2026-08-15' }
];

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Amore Wedding Backend API (site017)' });
});

// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (SQL INJECTION)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site017-bug01
// CSV: SEC-161
// Type: SQL Injection
// Description: 로그인 폼에 조건문을 대조하여 인증 성공 조건 분기를 조작한다.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const matched = evalSQLInjection(username, (user) => {
    return user.username === username;
  }, users);

  if (matched.length > 0) {
    res.json({ status: 'success', user: matched[0] });
  } else {
    res.status(401).json({ status: 'fail', message: '인증 정보가 일치하지 않습니다.' });
  }
});

// INTENTIONAL BACKEND BUG: site017-bug02
// CSV: SEC-162
// Type: SQL Injection
// Description: 회원가입 시 아이디에 인젝션 조건문을 주입하여 회원 검색 조건 분기를 변조한다.
app.post('/api/register', (req, res) => {
  const { username, password, name } = req.body;
  const newUser = { username, name, role: 'customer', address: '신규 가입' };
  users.push(newUser);
  res.json({ status: 'success', user: newUser });
});

// INTENTIONAL BACKEND BUG: site017-bug03
// CSV: SEC-163
// Type: SQL Injection
// Description: 주소지 설정 및 조회 시 조건문 우회에 의해 다른 회원의 주소 정보가 유출된다.
app.post('/api/profile/address', (req, res) => {
  const { address } = req.body;
  addressesList[0].address = address;
  res.json({ status: 'success', data: addressesList[0] });
});

app.get('/api/profile/address', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.address.includes(keyword);
  }, addressesList);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site017-bug04
// CSV: SEC-164
// Type: SQL Injection
// Description: 할인 쿠폰 등록 시 코드에 조건 분기를 주입하여 등록된 전체 쿠폰 명세가 반환된다.
app.post('/api/coupons', (req, res) => {
  const { code } = req.body;
  const newCoupon = {
    id: 'cp-' + Date.now(),
    code,
    discount: '15%',
    note: '웨딩홀 연계 모바일 즉시 할인 쿠폰권'
  };
  coupons.push(newCoupon);
  res.json({ status: 'success', data: newCoupon });
});

app.get('/api/coupons', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.code.includes(keyword);
  }, coupons);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site017-bug05
// CSV: SEC-165
// Type: SQL Injection
// Description: 웨딩홀 목록 정렬 옵션에 SQL 조건문을 기입하여 정렬 조건이 우회되며 전체 웨딩홀이 반환된다.
app.get('/api/venues', (req, res) => {
  const { sort, page } = req.query;
  
  // Bug 05: Sort handling
  let result = evalSQLInjection(sort, (item) => {
    return item.title.includes(sort || '');
  }, venues);

  // Bug 06: Pagination handling
  if (page) {
    result = evalSQLInjection(page, (item) => {
      // Simulate page matching
      return true; 
    }, result);
  }

  res.json(result);
});

// INTENTIONAL BACKEND BUG: site017-bug07
// CSV: SEC-167
// Type: SQL Injection
// Description: 계약서 업로드 파일 이름에 조건문을 삽입하여 목록 조회 시 타인의 계약서 로그가 함께 조회된다.
app.post('/api/contracts/upload', (req, res) => {
  const { filename, description } = req.body;
  const newContract = {
    id: 'con-' + Date.now(),
    filename,
    description: description || '신규 웨딩 제휴 계약 첨부 파일'
  };
  contractsList.unshift(newContract);
  res.json({ status: 'success', data: newContract });
});

app.get('/api/contracts', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.filename.includes(keyword);
  }, contractsList);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site017-bug08
// CSV: SEC-168
// Type: SQL Injection
// Description: 플래너 상담 채팅 메시지 검색에 조건 분기를 주입하여 비공개 대화 히스토리가 전부 반환된다.
app.post('/api/chat', (req, res) => {
  const { text } = req.body;
  const newMsg = {
    id: 'msg-' + Date.now(),
    sender: 'customer',
    text
  };
  chatMessages.push(newMsg);
  res.json({ status: 'success', data: newMsg });
});

app.get('/api/chat', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.text.includes(keyword);
  }, chatMessages);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site017-bug09
// CSV: SEC-169
// Type: SQL Injection
// Description: 공지사항 상세 검색 조회 시 조건 분기를 삽입하여 숨겨진 이벤트 공지사항이 전부 노출된다.
app.get('/api/notices', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.title.includes(keyword);
  }, notices);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site017-bug10
// CSV: SEC-170
// Type: SQL Injection
// Description: 리뷰 별점 코멘트 입력 시 조건문을 주입하여 전체 매칭 리뷰 목록 조회가 왜곡된다.
app.post('/api/reviews', (req, res) => {
  const { text } = req.body;
  const newRev = {
    id: 'rev-' + Date.now(),
    writer: '예비 부부',
    text
  };
  reviews.unshift(newRev);
  res.json({ status: 'success', data: newRev });
});

app.get('/api/reviews', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.text.includes(keyword);
  }, reviews);
  res.json(filtered);
});

// ----------------------------------------------------
// Normal features: Dresses, Studios, Makeup, Reservations
// ----------------------------------------------------
app.get('/api/dresses', (req, res) => res.json(dresses));
app.get('/api/studios', (req, res) => res.json(studios));
app.get('/api/makeup', (req, res) => res.json(makeups));

app.post('/api/reservations', (req, res) => {
  const { title, date } = req.body;
  const newRes = { id: 'res-' + Date.now(), title, date };
  reservations.push(newRes);
  res.json({ status: 'success', data: newRes });
});

app.get('/api/reservations', (req, res) => res.json(reservations));
app.get('/api/calendar', (req, res) => {
  res.json(reservations.map(r => ({ date: r.date, text: r.title })));
});

app.get('/api/profile', (req, res) => {
  res.json({
    username: 'customer',
    name: '김태희',
    role: 'customer'
  });
});

// ----------------------------------------------------
// SAFE ENDPOINTS (PPO COMPARISON TARGETS)
// ----------------------------------------------------
app.get('/api/safe/login', (req, res) => {
  const { username, password } = req.body;
  const matched = users.filter(user => user.username === username);
  if (matched.length > 0) res.json({ status: 'success', user: matched[0] });
  else res.status(401).json({ status: 'fail' });
});

app.get('/api/safe/address', (req, res) => {
  const { keyword } = req.query;
  const filtered = addressesList.filter(item => keyword ? item.address.includes(keyword) : true);
  res.json(filtered);
});

app.get('/api/safe/coupons', (req, res) => {
  const { keyword } = req.query;
  const filtered = coupons.filter(item => keyword ? item.code.includes(keyword) : true);
  res.json(filtered);
});

app.get('/api/safe/chat', (req, res) => {
  const { keyword } = req.query;
  const filtered = chatMessages.filter(item => keyword ? item.text.includes(keyword) : true);
  res.json(filtered);
});


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
        if (err) res.status(404).send('Frontend bundle not found.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[Amore Wedding Server] Running at http://localhost:${PORT}`);
});
