import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9915;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Databases
// ----------------------------------------------------
let properties = [
  { id: 'prop-1', title: '에메랄드 포레스트 빌라', category: 'Villa', price: '전세 3억 5천', region: '서울 마포구', rating: 4.8, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
  { id: 'prop-2', title: '그레이시 아크로 펜트하우스', category: 'Apartment', price: '매매 12억', region: '서울 강남구', rating: 4.9, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
  { id: 'prop-3', title: '화이트 스페이스 오피스텔', category: 'Office', price: '월세 1000/80', region: '서울 영등포구', rating: 4.7, image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80' }
];

let profileIntro = {
  intro: '안녕하세요. 신뢰를 최우선으로 생각하는 HomeSpace 공인중개사사무소 대표 최예리입니다. 아파트, 오피스텔, 빌라 등 성심성의껏 매매 및 전/월세 상담을 약속드립니다.',
  name: '최예리',
  membership: '골드 파트너 중개사',
  contact: '010-9915-0160'
};

let inquiries = [
  { id: 'inq-1', title: '에메랄드 포레스트 빌라 전세 대출 관련 문의', content: '전세자금 대출 최대 몇 %까지 가능한가요?', date: '2026.08.01' }
];

let filesList = [
  { id: 'file-1', name: '단체_예매_정산_명세서_목록.csv', description: '단체 계약 및 정산 요약 목록 정보 파일' }
];

let commentsList = [
  { id: 'cmt-1', author: '예비 입주자', text: '주변 소음도 적고 마트가 가까워 생활하기 최고인 위치인 것 같습니다.' }
];

let reservations = [
  { id: 'res-1', date: '2026-08-15', memo: '오후 2시 방문 상담 예정 - 펜트하우스 직접 내방' }
];

let favoritesList = [
  { id: 'fav-1', propertyId: 'prop-1', note: '마포구 에메랄드 빌라 전세' }
];

let paymentsList = [
  { id: 'pay-1', amount: '5,000,000', description: '에메랄드 포레스트 빌라 가계약금 예치' }
];

let searchFilters = [
  { id: 'flt-1', name: '강남구 아파트 매매 필터' }
];

// Helper function to evaluate SQL Injection Conditional Branching
function evalSQLInjection(inputStr, defaultFilterFn, allItems) {
  if (!inputStr) return allItems;
  const lower = inputStr.toLowerCase();
  if (lower.includes("' or '1'='1") || lower.includes("' or 'a'='a") || lower.includes("' or 1=1") || lower.includes('" or "1"="1')) {
    return allItems; // Always True condition -> returns everything
  }
  if (lower.includes("' and '1'='2") || lower.includes("' and 'a'='b") || lower.includes("' and 1=2") || lower.includes('" and "1"="2')) {
    return []; // Always False condition -> returns nothing
  }
  return allItems.filter(defaultFilterFn);
}

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HomeSpace Backend API (site016)' });
});

// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (SQL INJECTION)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site016-bug01
// CSV: SEC-151
// Type: SQL Injection
// Description: 검색 조건이 입력값에 따라 비정상적으로 변경된다.
app.get('/api/properties/search', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.title.includes(keyword) || item.region.includes(keyword);
  }, properties);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug02
// CSV: SEC-152
// Type: SQL Injection
// Description: 프로필 소개글 필터링 입력에 따라 전체 프로필 목록 조회 조건이 변경된다.
app.post('/api/profile', (req, res) => {
  const { intro } = req.body;
  profileIntro.intro = intro;
  res.json({ status: 'success', data: profileIntro });
});

app.get('/api/profile', (req, res) => {
  const { searchIntro } = req.query;
  // If query contains SQL Injection payload, it triggers full profile records or custom conditions
  const result = evalSQLInjection(searchIntro, (item) => {
    return profileIntro.intro.includes(searchIntro);
  }, [profileIntro]);
  
  res.json(result[0] ? result[0] : {});
});

// INTENTIONAL BACKEND BUG: site016-bug03
// CSV: SEC-153
// Type: SQL Injection
// Description: 문의 저장 후 조회 시, 입력값에 따라 타인의 문의 글이 전부 노출되도록 조건이 변조된다.
app.post('/api/inquiries', (req, res) => {
  const { content } = req.body;
  const newInq = {
    id: 'inq-' + Date.now(),
    title: '매물 관련 상세 1:1 상담 신청 건',
    content,
    date: new Date().toLocaleDateString()
  };
  inquiries.unshift(newInq);
  res.json({ status: 'success', data: newInq });
});

app.get('/api/inquiries', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.content.includes(keyword);
  }, inquiries);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug04
// CSV: SEC-154
// Type: SQL Injection
// Description: 신규 매물 등록 시 매물명에 조건문을 삽입하여 매물 리스트 조회 시 비정상 결과가 출력되게 한다.
app.post('/api/properties', (req, res) => {
  const { title, category, price, region } = req.body;
  const newProp = {
    id: 'prop-' + Date.now(),
    title,
    category: category || 'Apartment',
    price: price || '상담 문의',
    region: region || '서울',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
  };
  properties.push(newProp);
  res.json({ status: 'success', data: newProp });
});

app.get('/api/properties', (req, res) => {
  const { title } = req.query;
  const filtered = evalSQLInjection(title, (item) => {
    return item.title.includes(title);
  }, properties);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug05
// CSV: SEC-155
// Type: SQL Injection
// Description: 첨부 파일 설명란 입력값에 따라 계약서 파일 검색 조회 조건이 변경된다.
app.post('/api/files', (req, res) => {
  const { description } = req.body;
  const newFile = {
    id: 'file-' + Date.now(),
    name: '신규_매물_증빙_계약서.pdf',
    description
  };
  filesList.unshift(newFile);
  res.json({ status: 'success', data: newFile });
});

app.get('/api/files', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.description.includes(keyword);
  }, filesList);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug06
// CSV: SEC-156
// Type: SQL Injection
// Description: 댓글 목록 조회 시, 댓글 입력란의 조건문에 따라 다른 매물 댓글 목록까지 모두 반환된다.
app.post('/api/comments', (req, res) => {
  const { text } = req.body;
  const newComment = {
    id: 'cmt-' + Date.now(),
    author: '방문자',
    text
  };
  commentsList.unshift(newComment);
  res.json({ status: 'success', data: newComment });
});

app.get('/api/comments', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.text.includes(keyword);
  }, commentsList);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug07
// CSV: SEC-157
// Type: SQL Injection
// Description: 방문 일정 예약 시, 예약 메모란의 조건문에 의해 타인의 예약 내역이 함께 노출된다.
app.post('/api/reservations', (req, res) => {
  const { memo } = req.body;
  const newRes = {
    id: 'res-' + Date.now(),
    date: '2026-08-20',
    memo
  };
  reservations.unshift(newRes);
  res.json({ status: 'success', data: newRes });
});

app.get('/api/reservations', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.memo.includes(keyword);
  }, reservations);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug08
// CSV: SEC-158
// Type: SQL Injection
// Description: 관심 매물 등록 시, 입력값 조건 조작에 의해 타 사용자의 관심매물 목록이 반환된다.
app.post('/api/favorites', (req, res) => {
  const { propertyId, note } = req.body;
  const newFav = {
    id: 'fav-' + Date.now(),
    propertyId: propertyId || 'prop-1',
    note
  };
  favoritesList.unshift(newFav);
  res.json({ status: 'success', data: newFav });
});

app.get('/api/favorites', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.note.includes(keyword);
  }, favoritesList);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug09
// CSV: SEC-159
// Type: SQL Injection
// Description: 계약금 결제 정보 기입 내역 조회 시, 조건문 주입에 의해 타인의 결제 상세 내역이 함께 반환된다.
app.post('/api/payments', (req, res) => {
  const { description } = req.body;
  const newPay = {
    id: 'pay-' + Date.now(),
    amount: '10,000,000',
    description
  };
  paymentsList.unshift(newPay);
  res.json({ status: 'success', data: newPay });
});

app.get('/api/payments', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.description.includes(keyword);
  }, paymentsList);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site016-bug10
// CSV: SEC-160
// Type: SQL Injection
// Description: 상세 검색 필터 내역 필터링 시 조건문 주입에 의해 매칭되지 않는 검색 기준 필터가 다량 반환된다.
app.post('/api/search/filter', (req, res) => {
  const { name } = req.body;
  const newFlt = {
    id: 'flt-' + Date.now(),
    name
  };
  searchFilters.unshift(newFlt);
  res.json({ status: 'success', data: newFlt });
});

app.get('/api/search/filter', (req, res) => {
  const { name } = req.query;
  const filtered = evalSQLInjection(name, (item) => {
    return item.name.includes(name);
  }, searchFilters);
  res.json(filtered);
});

// ----------------------------------------------------
// Safe Read-only endpoints or map indicators
// ----------------------------------------------------
app.get('/api/map', (req, res) => {
  res.json([
    { name: '강남구 지점', lat: '37.4979', lng: '127.0276', count: 12 },
    { name: '마포구 지점', lat: '37.5562', lng: '126.9227', count: 8 },
    { name: '영등포구 지점', lat: '37.5264', lng: '126.8962', count: 5 }
  ]);
});

app.get('/api/recent', (req, res) => {
  res.json(properties.slice(-2));
});

// ----------------------------------------------------
// SAFE ENDPOINTS (PPO COMPARISON TARGETS)
// ----------------------------------------------------
app.get('/api/safe/search', (req, res) => {
  const { keyword } = req.query;
  const filtered = properties.filter(item => {
    return keyword ? (item.title.includes(keyword) || item.region.includes(keyword)) : true;
  });
  res.json(filtered);
});

app.get('/api/safe/properties', (req, res) => {
  const { title } = req.query;
  const filtered = properties.filter(item => {
    return title ? item.title.includes(title) : true;
  });
  res.json(filtered);
});

app.get('/api/safe/comments', (req, res) => {
  const { keyword } = req.query;
  const filtered = commentsList.filter(item => {
    return keyword ? item.text.includes(keyword) : true;
  });
  res.json(filtered);
});

app.get('/api/safe/favorites', (req, res) => {
  const { keyword } = req.query;
  const filtered = favoritesList.filter(item => {
    return keyword ? item.note.includes(keyword) : true;
  });
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
        if (err) res.status(404).send('Frontend build folder not found.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[HomeSpace Server] Running at http://localhost:${PORT}`);
});
