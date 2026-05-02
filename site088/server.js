const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9417;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let items = [
  { id: 1, title: 'Vintage Camera', category: 'Electronics', condition: 'Good', want: 'Coffee Grinder', user: 'neighbor_kate', description: 'Works perfectly, lens is clear.' },
  { id: 2, title: 'Succulent Pot', category: 'Home', condition: 'New', want: 'Books', user: 'plant_lover', description: 'Hand-painted ceramic pot.' },
  { id: 3, title: 'Electric Guitar', category: 'Music', condition: 'Like New', want: 'Synthesizer', user: 'rocker_tom', description: 'Hardly used, strings replaced recently.' },
  { id: 4, title: 'Cooking Pot Set', category: 'Kitchen', condition: 'Used', want: 'Camping Gear', user: 'chef_anna', description: 'Stainless steel, some minor scratches.' },
  { id: 5, title: 'Board Game: Catan', category: 'Hobbies', condition: 'Complete', want: 'Puzzle', user: 'game_master', description: 'Box is a bit worn but all pieces are inside.' }
];

let offers = [
  { id: 101, itemId: 1, fromUser: 'me_user', toUser: 'neighbor_kate', offerItem: 'Manual Coffee Grinder', offerMessage: 'I have a nice Hario grinder for your camera!', status: 'pending', createdAt: '2026-05-01' },
  { id: 102, itemId: 2, fromUser: 'neighbor_bob', toUser: 'me_user', offerItem: 'Cookbook', offerMessage: 'Trade my recipes for your plant?', status: 'pending', createdAt: '2026-05-02' },
  { id: 103, itemId: 4, fromUser: 'me_user', toUser: 'chef_anna', offerItem: 'Backpack', offerMessage: 'Trade my hiking pack for your pots.', status: 'rejected', createdAt: '2026-04-29' }
];

let reviews = [
  { id: 1, user: 'neighbor_kate', rating: 5, content: 'Great trade! The grinder is perfect.', date: '2026-04-25' },
  { id: 2, user: 'neighbor_bob', rating: 4, content: 'Smooth transaction, friendly neighbor.', date: '2026-04-28' }
];

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', site: 'site088' }));

app.get('/api/items', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...items];
  if (category && category !== 'All') filtered = filtered.filter(i => i.category === category);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(s) || i.want.toLowerCase().includes(s));
  }
  res.json(filtered);
});

// INTENTIONAL BUG: site088-bug01
// CSV Error: DB 제안 상태 오류 / Type: database-state
// Description: 거절된 제안도 pending 목록에 계속 표시됨.
// data-bug-id="site088-bug01"
app.get('/api/my-offers', (req, res) => {
  const { status } = req.query;
  
  // INTENTIONAL BUG: site088-bug01
  // data-bug-id="site088-bug01"
  // Logic error: ignores status filter and returns 'rejected' as 'pending'
  let filteredOffers = offers.filter(o => o.fromUser === 'me_user' || o.toUser === 'me_user');
  
  if (status === 'pending') {
    // Should filter out rejected, but it keeps them
    return res.json(filteredOffers); 
  }
  
  res.json(filteredOffers);
});

// INTENTIONAL BUG: site088-bug03
// CSV Error: 거래 제안 접근 제어 실패 / Type: security-idor
// Description: offerId 변경으로 다른 사용자의 교환 제안 상세 조회 가능.
// data-bug-id="site088-bug03"
app.get('/api/offers/:id', (req, res) => {
  const offer = offers.find(o => o.id === parseInt(req.params.id));
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  // INTENTIONAL BUG: site088-bug03
  // data-bug-id="site088-bug03"
  // Missing check: if (offer.fromUser !== 'me_user' && offer.toUser !== 'me_user') return 403;
  
  res.json(offer);
});

// INTENTIONAL BUG: site088-bug02
// CSV Error: 네트워크 요청 본문 검증 누락 / Type: network-request-validation
// Description: offerMessage가 비어도 교환 제안 성공 처리됨.
// data-bug-id="site088-bug02"
app.post('/api/offers', (req, res) => {
  const { itemId, offerItem, offerMessage } = req.body;
  
  const item = items.find(i => i.id === itemId);
  if (!item) return res.status(400).json({ error: 'Item not found' });

  // INTENTIONAL BUG: site088-bug02
  // data-bug-id="site088-bug02"
  // Missing validation for offerMessage. Normal code would check: if (!offerMessage) return 400;
  
  const newOffer = {
    id: 100 + offers.length + 1,
    itemId,
    fromUser: 'me_user',
    toUser: item.user,
    offerItem,
    offerMessage: offerMessage || '', // Allows empty
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  offers.push(newOffer);
  res.status(201).json(newOffer);
});

app.get('/api/reviews', (req, res) => res.json(reviews));

app.listen(PORT, () => {
  console.log(`Neighborhood Trade running at http://localhost:${PORT}`);
});
