const express = require('express');
const path = require('path');
const app = express();
const PORT = 9367;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let books = [
  { id: 'b1', title: '데미안', author: '헤르만 헤세', totalPages: 240, currentPages: 120, cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100' },
  { id: 'b2', title: '어린 왕자', author: '생텍쥐페리', totalPages: 150, currentPages: 30, cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100' },
  { id: 'b3', title: '사피엔스', author: '유발 하라리', totalPages: 600, currentPages: 0, cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=100' }
];

let readingLogs = [
  { id: 'log-1', userId: 'user_A', bookId: 'b1', pagesRead: 20, date: '2024-05-01' },
  { id: 'log-99', userId: 'user_B', bookId: 'b9', pagesRead: 50, date: '2024-05-01', note: '비밀 일기: 이 책은 너무 어렵다.' } // 타인 기록
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Reading Habit API is running' });
});

app.get('/api/books', (req, res) => {
  res.json(books);
});

// API: Save Reading Log
app.post('/api/reading-logs', (req, res) => {
  const { bookId, userId, pagesRead, date } = req.body;
  const book = books.find(b => b.id === bookId);

  if (book) {
    // INTENTIONAL BUG: site038-bug01
    // CSV Error: DB 누적 페이지 계산 오류
    // Type: database-calculation
    // 원래는: book.currentPages += pagesRead;
    book.currentPages = pagesRead; // 버그: 이전 기록을 덮어씀
  }

  const newLog = { id: 'log-' + Date.now(), userId, bookId, pagesRead, date };
  readingLogs.push(newLog);
  res.status(201).json({ success: true, log: newLog, currentPages: book ? book.currentPages : 0 });
});

// API: Get Reading Logs (with race condition and multi-tenant bug)
app.get('/api/reading-logs', (req, res) => {
  const { date, userId } = req.query;

  // INTENTIONAL BUG: site038-bug02 (Race Condition)
  // 랜덤 지연을 주어 응답 순서가 꼬이게 함
  const delay = Math.random() * 1500;

  setTimeout(() => {
    // INTENTIONAL BUG: site038-bug03 (Multi-tenant failure)
    // CSV Error: 사용자 기록 격리 실패
    // 보안 취약점: userId 필터링 없이 모든 로그를 반환
    let results = [...readingLogs];

    if (date) {
      results = results.filter(l => l.date === date);
    }

    res.json(results);
  }, delay);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
