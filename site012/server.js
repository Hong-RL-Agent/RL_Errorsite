const express = require('express');
const path = require('path');
const app = express();
const PORT = 9341;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let menu = [
  { id: 'm1', name: '아메리카노', price: 4500, category: 'Coffee', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'm2', name: '카페라떼', price: 5000, category: 'Coffee', image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'm3', name: '자몽에이드', price: 6000, category: 'Ade', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'm4', name: '초코 스무디', price: 6500, category: 'Smoothie', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=200&h=200' }
];

let orders = [
  { id: 101, items: [{ id: 'm1', quantity: 1 }], status: 'completed', time: '10:00' }
];

let memberships = {
  'member_123': { name: '홍길동', points: 2500 },
  'member_999': { name: '비밀회원', points: 99999 }
};

let currentMemberId = 'member_123';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cafe Queue API is running' });
});

app.get('/api/menu', (req, res) => {
  res.json(menu);
});

// INTENTIONAL BUG: site012-bug02
// CSV Error: 네트워크 중복 제출
// Type: network-duplicate-submit
// Description: 주문 버튼 연속 클릭 시 서버가 중복 주문을 방지하지 못함.
app.post('/api/orders', (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  // INTENTIONAL BUG: site012-bug01
  // CSV Error: DB 자동 증가 키 충돌
  // Type: database-id-conflict
  // Description: 주문 생성 시 마지막 id를 잘못 계산해 기존 주문 id와 충돌할 수 있음.
  // 원래는 Math.max(...orders.map(o => o.id)) + 1 이어야 함.
  const nextId = orders.length + 100; // 버그: 중복 ID 발생 가능성 높음

  const existingOrder = orders.find(o => o.id === nextId);
  if (existingOrder) {
    // 충돌 에러 발생 시뮬레이션
    return res.status(500).json({ error: 'Database Conflict: Order ID ' + nextId + ' already exists' });
  }

  const newOrder = {
    id: nextId,
    items: cart,
    status: 'preparing',
    time: new Date().toLocaleTimeString()
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

app.get('/api/queue', (req, res) => {
  // 준비 중인 주문 목록 반환
  const queue = orders.filter(o => o.status === 'preparing');
  res.json(queue);
});

// INTENTIONAL BUG: site012-bug03
// CSV Error: 포인트 권한 검증 누락
// Type: security-authorization
// Description: 다른 사용자의 memberId를 전달하면 해당 멤버십 포인트를 조회할 수 있음.
app.get('/api/membership/:memberId', (req, res) => {
  const memberId = req.params.memberId;
  const member = memberships[memberId];

  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // IDOR 취약점: 요청한 memberId가 현재 로그인한 사용자와 같은지 검증하지 않음
  res.json({ memberId, ...member });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
