const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9419;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let memories = [
  { id: 1, title: 'Summer Rain', content: 'The smell of wet asphalt was so refreshing.', date: '2023-07-15', tags: ['Nature', 'Summer'], favorite: true, private: false },
  { id: 2, title: 'First Coffee', content: 'Had a wonderful latte at the new cafe.', date: '2023-08-02', tags: ['Food', 'Daily'], favorite: false, private: false },
  { id: 3, title: 'Secret Project', content: 'Finally started working on my novel.', date: '2023-09-10', tags: ['Work', 'Hobby'], favorite: false, private: true }, // Private
  { id: 4, title: 'Mountain Hike', content: 'The view from the top was worth the climb.', date: '2023-10-05', tags: ['Nature', 'Travel'], favorite: true, private: false },
  { id: 5, title: 'New Year Eve', content: 'Countdown with friends at the square.', date: '2023-12-31', tags: ['Celebration'], favorite: false, private: false }
];

let tags = ['Nature', 'Summer', 'Food', 'Daily', 'Work', 'Hobby', 'Travel', 'Celebration'];

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', site: 'site090' }));

// INTENTIONAL BUG: site090-bug01
// CSV Error: DB 태그 검색 오류 / Type: database-search
// Description: 태그 검색 시 선택 태그가 아닌 전체 텍스트에서만 검색해 결과가 누락됨.
// data-bug-id="site090-bug01"
app.get('/api/memories', (req, res) => {
  const { tag, search, favorite } = req.query;
  let filtered = memories.filter(m => !m.private); // Normally hides private

  if (favorite === 'true') filtered = filtered.filter(m => m.favorite);
  
  if (tag) {
    // INTENTIONAL BUG: site090-bug01
    // data-bug-id="site090-bug01"
    // Should be: m.tags.includes(tag)
    // But searches in content, causing misses if tag isn't in content
    filtered = filtered.filter(m => m.content.toLowerCase().includes(tag.toLowerCase()));
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(m => m.title.toLowerCase().includes(s) || m.content.toLowerCase().includes(s));
  }

  res.json(filtered);
});

// INTENTIONAL BUG: site090-bug03
// CSV Error: 비공개 추억 접근 제어 실패 / Type: security-access-control
// Description: private memory도 memoryId만 알면 조회 가능.
// data-bug-id="site090-bug03"
app.get('/api/memories/:id', (req, res) => {
  const memory = memories.find(m => m.id === parseInt(req.params.id));
  if (!memory) return res.status(404).json({ error: 'Memory not found' });

  // INTENTIONAL BUG: site090-bug03
  // data-bug-id="site090-bug03"
  // Missing check: if (memory.private) return res.status(403).json({ error: 'Access Denied' });
  
  res.json(memory);
});

app.post('/api/memories', (req, res) => {
  const { title, content, tags: mTags, private: isPrivate } = req.body;
  const newMemory = {
    id: memories.length + 1,
    title,
    content,
    date: new Date().toISOString().split('T')[0],
    tags: mTags || [],
    favorite: false,
    private: !!isPrivate
  };
  memories.push(newMemory);
  res.status(201).json(newMemory);
});

app.post('/api/favorites/toggle', (req, res) => {
  const { id } = req.body;
  const memory = memories.find(m => m.id === id);
  if (memory) {
    memory.favorite = !memory.favorite;
    res.json({ success: true, favorite: memory.favorite });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// INTENTIONAL BUG: site090-bug02
// CSV Error: 네트워크 응답 포맷 오류 / Type: network-response-format
// Description: 통계 API가 JSON 배열 대신 문자열화된 객체를 반환함.
// data-bug-id="site090-bug02"
app.get('/api/stats', (req, res) => {
  const stats = {
    totalCount: memories.length,
    favoriteCount: memories.filter(m => m.favorite).length,
    privateCount: memories.filter(m => m.private).length,
    tagStats: tags.map(t => ({ name: t, count: memories.filter(m => m.tags.includes(t)).length }))
  };

  // INTENTIONAL BUG: site090-bug02
  // data-bug-id="site090-bug02"
  // Returns string instead of JSON object
  res.send(JSON.stringify(stats)); 
  
  // Normal would be: res.json(stats);
});

app.get('/api/tags', (req, res) => res.json(tags));

app.listen(PORT, () => {
  console.log(`MemoryBox running at http://localhost:${PORT}`);
});
