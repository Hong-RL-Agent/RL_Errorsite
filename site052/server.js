const express = require('express');
const path = require('path');
const app = express();
const PORT = 9381;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let cars = [
  { id: 'car-1', model: 'Grandeur IG', year: 2019, price: 2450, milage: 45000, color: 'Black' },
  { id: 'car-2', model: 'K7 Premier', year: 2020, price: 2680, milage: 32000, color: 'White' },
  { id: 'car-3', model: 'Avante CN7', year: 2021, price: 1850, milage: 12000, color: 'Silver' },
  { id: 'car-4', model: 'Genesis G80', year: 2018, price: 3800, milage: 68000, color: 'Dark Blue' },
  { id: 'car-5', model: 'Morning Urban', year: 2022, price: 950, milage: 5000, color: 'Beige' }
];

let notes = [
  { id: 'note-1', userId: 'user_A', carId: 'car-1', content: '엔진 소리 조용함. 타이어 교체 필요.', date: '2024-05-10' },
  { id: 'note-99', userId: 'user_B', carId: 'car-4', content: '법인 리스 차량. 관리는 잘 됨. 가격 협상 중.', date: '2024-05-12' } // 타인의 비밀 메모
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UsedCar Note API is running' });
});

// API: Get Cars (with sorting and query bugs)
app.get('/api/cars', (req, res) => {
  const { sort, minYear } = req.query;

  // INTENTIONAL BUG: site052-bug02
  // CSV Error: 네트워크 필터 파라미터 무시
  // Type: network-query-param
  // 버그: minYear 파라미터가 전달되어도 실제 데이터 필터링에 반영하지 않음
  let filtered = [...cars];
  /* 
  if (minYear) {
    filtered = filtered.filter(c => c.year >= parseInt(minYear));
  }
  */

  // INTENTIONAL BUG: site052-bug01
  // CSV Error: DB 숫자 정렬 오류
  // Type: database-sort
  // 버그: 가격(price) 정렬 시 숫자가 아닌 문자열로 비교함
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price.toString().localeCompare(b.price.toString()));
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price.toString().localeCompare(a.price.toString()));
  }

  res.json(filtered);
});

// API: Get Personal Note (with IDOR bug)
// INTENTIONAL BUG: site052-bug03
// CSV Error: 개인 메모 접근 제어 실패
// Type: security-idor
app.get('/api/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (note) {
    // 보안 취약점: 요청한 사용자가 소유자인지 검증하지 않고 메모 내용을 반환함
    res.json(note);
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

app.get('/api/notes/user/:userId', (req, res) => {
  res.json(notes.filter(n => n.userId === req.params.userId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
