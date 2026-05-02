const express = require('express');
const path = require('path');
const app = express();
const PORT = 9354;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let exhibitions = [
  { id: 'ex-1', title: '빛의 거장: 모네 특별전', artist: '클로드 모네', location: 'Gallery A', price: 15000, remainingTickets: 5 },
  { id: 'ex-2', title: '포스트 모더니즘의 향연', artist: '앤디 워홀', location: 'Gallery B', price: 12000, remainingTickets: 100 },
  { id: 'ex-3', title: '한국 근현대 미술의 발자취', artist: '이중섭 외', location: 'Gallery C', price: 10000, remainingTickets: 20 }
];

let tickets = [
  { id: 'tk-1001', exhibitionId: 'ex-1', user: '홍길동', quantity: 2, total: 30000 },
  { id: 'tk-9999', exhibitionId: 'ex-2', user: '이수집', quantity: 1, total: 12000, secretNote: 'VIP 전용 도슨트 동행' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Museum Pass API is running' });
});

app.get('/api/exhibitions', (req, res) => {
  res.json(exhibitions);
});

// INTENTIONAL BUG: site025-bug02
// CSV Error: API 응답 캐시 오류
// Type: network-cache-stale
// Description: 티켓 잔여 수량 API가 오래된 값을 반환함.
app.get('/api/exhibitions/:id/remaining', (req, res) => {
  const ex = exhibitions.find(e => e.id === req.params.id);
  if (ex) {
    // 버그: 실제 remainingTickets 가 아닌, 서버 시작 시점의 고정값 50을 반환 (캐시 오류 시뮬레이션)
    res.json({ remaining: 50 });
  } else {
    res.status(404).json({ error: 'Exhibition not found' });
  }
});

// API: Book Tickets
app.post('/api/tickets', (req, res) => {
  const { exhibitionId, user, quantity } = req.body;
  const ex = exhibitions.find(e => e.id === exhibitionId);

  if (!ex) return res.status(404).json({ error: 'Exhibition not found' });

  // INTENTIONAL BUG: site025-bug01
  // CSV Error: DB 티켓 수량 검증 오류
  // Type: database-validation
  // Description: 남은 티켓보다 많은 수량도 예매 가능함.
  // 원래는: if (ex.remainingTickets < quantity) return res.status(400).json({ error: '잔여 티켓 부족' });
  // 버그: 검증 없이 바로 성공 처리
  
  const newTicket = {
    id: 'tk-' + Date.now(),
    exhibitionId,
    user,
    quantity,
    total: ex.price * quantity
  };

  ex.remainingTickets -= quantity;
  tickets.push(newTicket);
  res.status(201).json({ success: true, ticket: newTicket });
});

// INTENTIONAL BUG: site025-bug03
// CSV Error: 티켓 소유자 검증 누락
// Type: security-idor
// Description: ticketId만 알면 다른 사용자의 티켓 정보를 조회할 수 있음.
app.get('/api/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  
  if (ticket) {
    // 보안 취약점: 소유자 확인 로직 누락
    res.json(ticket);
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.get('/api/artists', (req, res) => {
  res.json([
    { name: '클로드 모네', period: '인상주의', desc: '빛과 색채의 마술사' },
    { name: '앤디 워홀', period: '팝아트', desc: '대중 문화의 아이콘' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
