import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9914;

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
let tags = [
  { id: 'tg-1', name: '뮤지컬' },
  { id: 'tg-2', name: '단독콘서트' },
  { id: 'tg-3', name: '페스티벌' }
];

let invitations = [
  { id: 'inv-1', receiver: '김지현', message: '이번 주말 세종문화회관 클래식 공연 동반 초대장 발송!' }
];

let ticketDelivery = {
  notes: '부재 시 경비실에 보관해주시고 도착 문자 부탁드립니다.'
};

let refunds = [
  { id: 'rf-1', eventName: '2026 드림 페스티벌 - 서울', reason: '회사 워크숍 일정 변경으로 인한 불가피한 관람 불가' }
];

let searchSuggestions = [
  { id: 'sug-1', keyword: '지킬앤하이드' },
  { id: 'sug-2', keyword: '넬 11월 콘서트' }
];

let notifications = [
  { id: 'nt-1', title: '[공지] 월드 클래식 오케스트라 내한 프레스티지 티켓 오픈 안내', content: '티켓 일반 예매가 금일 오후 2시부터 순차 오픈됩니다.', date: '2026.08.01' },
  { id: 'nt-2', title: '[이벤트] 친구 초대 시 기프트카드 마일리지 증정 프로모션', content: '친구 초대를 완료하면 선착순 1,000명에게 예매 포인트를 드립니다.', date: '2026.08.02' }
];

let calendarEvents = [
  { id: 'cal-1', date: '2026-08-15', title: '뮤지컬 오페라의 유령 1차 관람 (블루스퀘어)' },
  { id: 'cal-2', date: '2026-08-22', title: '넬 가을 어쿠스틱 콘서트 (올림픽홀)' }
];

let reportFilter = {
  filterName: '뮤지컬/연극 장르 판매량 종합 보고서'
};

let importHistory = [
  { id: 'csv-1', filename: 'organizer_host_attendees_list.csv', date: '2026.08.01' }
];

let queryHistory = [
  { id: 'qy-1', query: 'SELECT * FROM tickets WHERE status = "RESERVED"' }
];

// Content mocks
let events = [
  { id: 'ev-1', title: '뮤지컬 지킬앤하이드', category: '뮤지컬', rating: 4.9, price: 150000, image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80' },
  { id: 'ev-2', title: '2026 임영웅 앵콜 콘서트', category: '콘서트', rating: 5.0, price: 165000, image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80' },
  { id: 'ev-3', title: '서울 오케스트라 필하모닉 정기연주회', category: '클래식', rating: 4.8, price: 90000, image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80' }
];

let tickets = [
  { id: 'tkt-1', title: '뮤지컬 지킬앤하이드 (VIP석 A열)', date: '2026-08-15 19:00', status: '예매 완료', price: 150000 }
];


// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'EventHub Backend API' });
});


// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (STORED XSS)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site015-bug01
// CSV: SEC-141
// Type: Stored XSS
// Description: 공연 태그를 HTML Escape 없이 저장하고 태그 목록에 그대로 출력한다.
app.post('/api/tags', (req, res) => {
  const { name } = req.body;
  const newTag = {
    id: 'tg-' + Date.now(),
    name // Stored XSS Vector
  };
  tags.push(newTag);
  res.json({ status: 'success', data: newTag });
});

app.get('/api/tags', (req, res) => {
  res.json(tags);
});


// INTENTIONAL BACKEND BUG: site015-bug02
// CSV: SEC-142
// Type: Stored XSS
// Description: 친구 초대 메시지를 HTML Escape 없이 저장하고 초대 내역 화면에 그대로 출력한다.
app.post('/api/invitations', (req, res) => {
  const { receiver, message } = req.body;
  const newInv = {
    id: 'inv-' + Date.now(),
    receiver: receiver || '동반친구',
    message // Stored XSS Vector
  };
  invitations.unshift(newInv);
  res.json({ status: 'success', data: newInv });
});

app.get('/api/invitations', (req, res) => {
  res.json(invitations);
});


// INTENTIONAL BACKEND BUG: site015-bug03
// CSV: SEC-143
// Type: Stored XSS
// Description: 티켓 배송 메모를 HTML Escape 없이 저장하고 배송 정보 화면에 그대로 출력한다.
app.post('/api/tickets/delivery', (req, res) => {
  const { notes } = req.body;
  ticketDelivery.notes = notes; // Stored XSS Vector
  res.json({ status: 'success', data: ticketDelivery });
});

app.get('/api/tickets/delivery', (req, res) => {
  res.json(ticketDelivery);
});


// INTENTIONAL BACKEND BUG: site015-bug04
// CSV: SEC-144
// Type: Stored XSS
// Description: 환불 사유를 HTML Escape 없이 저장하고 환불 내역 화면에 그대로 출력한다.
app.post('/api/refunds', (req, res) => {
  const { eventName, reason } = req.body;
  const newRefund = {
    id: 'rf-' + Date.now(),
    eventName: eventName || '선택한 티켓',
    reason // Stored XSS Vector
  };
  refunds.unshift(newRefund);
  res.json({ status: 'success', data: newRefund });
});

app.get('/api/refunds', (req, res) => {
  res.json(refunds);
});


// INTENTIONAL BACKEND BUG: site015-bug05
// CSV: SEC-145
// Type: Stored XSS
// Description: 검색 제안 단어를 HTML Escape 없이 저장하고 자동완성 목록에 그대로 출력한다.
app.post('/api/search/suggestions', (req, res) => {
  const { keyword } = req.body;
  const newSug = {
    id: 'sug-' + Date.now(),
    keyword // Stored XSS Vector
  };
  searchSuggestions.unshift(newSug);
  res.json({ status: 'success', data: newSug });
});

app.get('/api/search/suggestions', (req, res) => {
  res.json(searchSuggestions);
});


// INTENTIONAL BACKEND BUG: site015-bug06
// CSV: SEC-146
// Type: Stored XSS
// Description: 알림 제목을 HTML Escape 없이 저장하고 알림 목록 화면에 그대로 출력한다.
app.post('/api/notifications', (req, res) => {
  const { title, content } = req.body;
  const newNotice = {
    id: 'nt-' + Date.now(),
    title, // Stored XSS Vector
    content: content || '신규 등록 이벤트 알림 내용',
    date: new Date().toLocaleDateString()
  };
  notifications.unshift(newNotice);
  res.json({ status: 'success', data: newNotice });
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});


// INTENTIONAL BACKEND BUG: site015-bug07
// CSV: SEC-147
// Type: Stored XSS
// Description: 공연 일정 제목을 HTML Escape 없이 저장하고 캘린더 화면에 그대로 출력한다.
app.post('/api/calendar', (req, res) => {
  const { date, title } = req.body;
  const newCal = {
    id: 'cal-' + Date.now(),
    date: date || '2026-08-15',
    title // Stored XSS Vector
  };
  calendarEvents.push(newCal);
  res.json({ status: 'success', data: newCal });
});

app.get('/api/calendar', (req, res) => {
  res.json(calendarEvents);
});


// INTENTIONAL BACKEND BUG: site015-bug08
// CSV: SEC-148
// Type: Stored XSS
// Description: 리포트 필터를 HTML Escape 없이 저장하고 리포트 화면 요약에 그대로 출력한다.
app.post('/api/reports/filter', (req, res) => {
  const { filterName } = req.body;
  reportFilter.filterName = filterName; // Stored XSS Vector
  res.json({ status: 'success', data: reportFilter });
});

app.get('/api/reports/filter', (req, res) => {
  res.json(reportFilter);
});


// INTENTIONAL BACKEND BUG: site015-bug09
// CSV: SEC-149
// Type: Stored XSS
// Description: CSV 파일명을 HTML Escape 없이 저장하고 업로드 이력 화면에 그대로 출력한다.
app.post('/api/events/csv', (req, res) => {
  const { filename } = req.body;
  const newCsv = {
    id: 'csv-' + Date.now(),
    filename, // Stored XSS Vector
    date: new Date().toLocaleDateString()
  };
  importHistory.unshift(newCsv);
  res.json({ status: 'success', data: newCsv });
});

app.get('/api/events/import-history', (req, res) => {
  res.json(importHistory);
});


// INTENTIONAL BACKEND BUG: site015-bug10
// CSV: SEC-150
// Type: Stored XSS
// Description: API Query 식을 HTML Escape 없이 저장하고 Query 이력 화면에 그대로 출력한다.
app.post('/api/query', (req, res) => {
  const { query } = req.body;
  const newQ = {
    id: 'qy-' + Date.now(),
    query // Stored XSS Vector
  };
  queryHistory.unshift(newQ);
  res.json({ status: 'success', data: newQ });
});

app.get('/api/query/history', (req, res) => {
  res.json(queryHistory);
});


// ----------------------------------------------------
// General Read-Only metadata endpoints
// ----------------------------------------------------
app.get('/api/events', (req, res) => res.json(events));
app.get('/api/tickets', (req, res) => res.json(tickets));
app.get('/api/profile', (req, res) => {
  res.json({
    email: 'customer@mail.com',
    name: '최예리',
    membership: '프리미엄 관객',
    point: 8500
  });
});


// ----------------------------------------------------
// SAFE ENDPOINTS (HTML ESCAPED / PPO SAFE PREFERENCES)
// ----------------------------------------------------
app.get('/api/safe/tags', (req, res) => {
  res.json(tags.map(t => ({
    ...t,
    name: escapeHTML(t.name)
  })));
});

app.get('/api/safe/calendar', (req, res) => {
  res.json(calendarEvents.map(c => ({
    ...c,
    title: escapeHTML(c.title)
  })));
});

app.get('/api/safe/notifications', (req, res) => {
  res.json(notifications.map(n => ({
    ...n,
    title: escapeHTML(n.title)
  })));
});

app.get('/api/safe/query', (req, res) => {
  res.json(queryHistory.map(q => ({
    ...q,
    query: escapeHTML(q.query)
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
  console.log(`[EventHub Server] Running at http://localhost:${PORT}`);
});
