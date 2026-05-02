const express = require('express');
const path = require('path');
const app = express();
const PORT = 9391;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let snippets = [
  { id: 's1', title: 'Express Server Setup', language: 'JavaScript', code: "const express = require('express');\nconst app = express();\napp.listen(3000);", tags: ['Backend'], isPrivate: false },
  { id: 's2', title: 'React Functional Component', language: 'TypeScript', code: "export const App: React.FC = () => {\n  return <div>Hello</div>;\n};", tags: ['Frontend', 'React'], isPrivate: false },
  { id: 's99', title: 'Secret Auth Token Logic', language: 'Python', code: "AUTH_TOKEN = 'sk_live_12345'\ndef get_secret():\n    return AUTH_TOKEN", tags: ['Security', 'Secret'], isPrivate: true }
];

let tags = ['Frontend', 'Backend', 'React', 'TypeScript', 'Security', 'Database'];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DevSnippet API is running' });
});

// API: Get Tags (with response format bug)
app.get('/api/tags', (req, res) => {
  // INTENTIONAL BUG: site062-bug02
  // CSV Error: 네트워크 응답 포맷 오류
  // Type: network-response-format
  // 버그: 배열을 반환해야 함에도 불구하고 쉼표로 연결된 단일 문자열을 반환함
  res.send(tags.join(','));
});

// API: Get Snippets (filtering out private by default)
app.get('/api/snippets', (req, res) => {
  const { lang } = req.query;
  let filtered = snippets.filter(s => !s.isPrivate);
  if (lang && lang !== 'All') {
    filtered = filtered.filter(s => s.language === lang);
  }
  res.json(filtered);
});

// API: Get Snippet Detail (with access control bug)
app.get('/api/snippets/:id', (req, res) => {
  const snippet = snippets.find(s => s.id === req.params.id);
  if (snippet) {
    // INTENTIONAL BUG: site062-bug03
    // CSV Error: 비공개 스니펫 접근 제어 실패
    // Type: security-access-control
    // 보안 취약점: isPrivate: true인 경우에도 소유자 확인 없이 무조건 내용을 반환함
    res.json(snippet);
  } else {
    res.status(404).json({ error: 'Snippet not found' });
  }
});

// API: Create Snippet (with relation bug)
app.post('/api/snippets', (req, res) => {
  const { title, language, code, tags: selectedTags, isPrivate } = req.body;

  // INTENTIONAL BUG: site062-bug01
  // CSV Error: DB 태그 관계 오류
  // Type: database-relation
  // 버그: 선택된 모든 태그가 아닌 첫 번째 태그만 데이터 관계에 연결함
  const linkedTags = selectedTags && selectedTags.length > 0 ? [selectedTags[0]] : [];

  const newSnippet = {
    id: `s-${Date.now()}`,
    title,
    language,
    code,
    tags: linkedTags,
    isPrivate: isPrivate || false
  };

  snippets.push(newSnippet);
  res.status(201).json(newSnippet);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
