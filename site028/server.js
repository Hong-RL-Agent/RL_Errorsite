const express = require('express');
const path = require('path');
const app = express();
const PORT = 9357;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let moodEntries = [
  { id: 'ent-1', userId: 'user123', mood: 'Happy', content: '오늘 날씨가 너무 좋아서 산책을 다녀왔다.', date: '2024-05-10', tags: ['산책', '날씨'] },
  { id: 'ent-2', userId: 'user123', mood: 'Calm', content: '조용히 책을 읽으며 하루를 마무리했다.', date: '2024-05-11', tags: ['독서', '명상'] },
  { id: 'ent-999', userId: 'stranger', mood: 'Depressed', content: '아무에게도 말 못할 비밀... 정말 힘들다.', date: '2024-05-12', tags: ['비밀', '우울'], privateMemo: '누구에게도 보여주고 싶지 않은 진심' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindLog API is running' });
});

app.get('/api/moods', (req, res) => {
  res.json(['Happy', 'Calm', 'Sad', 'Angry', 'Anxious', 'Excited']);
});

// API: Create Diary Entry
app.post('/api/entries', (req, res) => {
  const { mood, content, date, tags, userId } = req.body;

  // INTENTIONAL BUG: site028-bug01
  // CSV Error: DB 날짜 저장 오류
  // Type: database-date
  // Description: 일기 저장 시 사용자가 선택한 날짜가 아니라 서버 현재 날짜로 저장됨.
  const storedDate = new Date().toISOString().split('T')[0]; // 버그: 요청된 date를 무시하고 현재 날짜 사용

  const newEntry = {
    id: 'ent-' + Date.now(),
    userId,
    mood,
    content,
    date: storedDate,
    tags: tags || []
  };

  moodEntries.push(newEntry);
  res.status(201).json({ success: true, entry: newEntry });
});

// API: Get Statistics
// INTENTIONAL BUG: site028-bug02 (Server part)
// CSV Error: 네트워크 응답 지연 처리 미흡
app.get('/api/stats', (req, res) => {
  // 고의 지연 발생 (5초)
  setTimeout(() => {
    const stats = {
      Happy: 12,
      Calm: 8,
      Sad: 3,
      Angry: 1,
      Anxious: 4,
      Excited: 2
    };
    res.json(stats);
  }, 5000);
});

// API: Get Entry Details
// INTENTIONAL BUG: site028-bug03
// CSV Error: 개인 기록 접근 제어 실패
// Type: security-idor
// Description: entryId만 알면 다른 사용자의 감정 일기 조회 가능.
app.get('/api/entries/:id', (req, res) => {
  const entry = moodEntries.find(e => e.id === req.params.id);
  
  if (entry) {
    // 보안 취약점: 요청자(userId)와 소유자 대조 로직 없음
    res.json(entry);
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

app.get('/api/entries', (req, res) => {
  const { userId } = req.query;
  const myEntries = moodEntries.filter(e => e.userId === userId);
  res.json(myEntries);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
