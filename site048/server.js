const express = require('express');
const path = require('path');
const app = express();
const PORT = 9377;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let menus = [
  { id: 'm1', name: '돈까스 & 카레', cafe: '학생회관', calories: '850kcal', price: 5500 },
  { id: 'm2', name: '불고기 덮밥', cafe: '중앙식당', calories: '720kcal', price: 6000 },
  { id: 'm3', name: '참치 마요 비빔밥', cafe: '기숙사식당', calories: '650kcal', price: 4500 }
];

let votes = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Meal Vote API is running' });
});

app.get('/api/menus', (req, res) => {
  res.json(menus);
});

// API: Vote for a menu (with duplicate and auth bugs)
app.post('/api/votes', (req, res) => {
  // INTENTIONAL BUG: site048-bug03
  // CSV Error: 사용자 인증 우회
  // Type: security-authentication
  // 보안 취약점: 정규 인증 없이 단순히 헤더에 학생 ID가 있으면 통과시킴
  const studentId = req.headers['x-student-id'];
  if (!studentId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { menuId } = req.body;

  // INTENTIONAL BUG: site048-bug01
  // CSV Error: DB 투표 중복 저장
  // Type: database-duplicate
  // 버그: 동일 학생이 같은 메뉴에 여러 번 투표하는지 검증하지 않음
  /*
  const alreadyVoted = votes.find(v => v.studentId === studentId && v.menuId === menuId);
  if (alreadyVoted) return res.status(400).json({ error: 'Already voted' });
  */

  votes.push({ studentId, menuId, date: new Date().toISOString().split('T')[0] });
  res.status(201).json({ success: true, message: 'Vote recorded' });
});

// API: Get Results (with schema mismatch bug)
app.get('/api/results', (req, res) => {
  const total = votes.length;
  const results = menus.map(m => {
    const count = votes.filter(v => v.menuId === m.id).length;
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
    
    // INTENTIONAL BUG: site048-bug02
    // CSV Error: 네트워크 응답 스키마 오류
    // Type: network-schema-mismatch
    // 버그: 숫자형 percentage 대신 문자열형 percentText를 반환함
    return {
      menuId: m.id,
      menuName: m.name,
      voteCount: count,
      percentText: `${percentage}%` // 원래는 percentage: percentage 여야 함
    };
  });
  
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
