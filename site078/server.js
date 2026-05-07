import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9187;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Database (Tech Documents)
const documents = [
  { id: 1, title: "ReactJS 공식 가이드", lang: "javascript", category: "frontend", content: "ReactJS는 사용자 인터페이스를 구축하기 위한 자바스크립트 라이브러리입니다.", snippet: "const element = <h1>Hello, world!</h1>;" },
  { id: 2, title: "Node.js 런타임 이해", lang: "javascript", category: "backend", content: "Node.js는 Chrome V8 엔진으로 빌드된 JavaScript 런타임입니다.", snippet: "http.createServer((req, res) => { ... });" },
  { id: 3, title: "Python 비동기 프로그래밍", lang: "python", category: "language", content: "async와 await를 사용하여 비동기 코드를 작성할 수 있습니다.", snippet: "async def main(): await asyncio.sleep(1)" },
  { id: 4, title: "useEffect Hook 사용법", lang: "javascript", category: "frontend", content: "useEffect는 컴포넌트의 생명주기 관리를 도와주는 훅입니다.", snippet: "useEffect(() => { console.log('mount'); }, []);" },
  { id: 5, title: "TypeScript 인터페이스", lang: "typescript", category: "language", content: "인터페이스는 객체의 구조를 정의하는 데 사용됩니다.", snippet: "interface User { name: string; age: number; }" },
  { id: 6, title: "Express.js 서버 구축", lang: "javascript", category: "backend", content: "Express는 Node.js를 위한 빠르고 개방적인 웹 프레임워크입니다.", snippet: "app.get('/', (req, res) => res.send('Hi'));" },
  { id: 7, title: "ReactJS 데이터 페칭", lang: "javascript", category: "frontend", content: "ReactJS 프로젝트에서 API 호출을 통해 데이터를 가져오는 방법.", snippet: "fetch('/api/data').then(res => res.json());" },
  { id: 8, title: "Async/Await 심화", lang: "javascript", category: "backend", content: "자바스크립트에서 async 처리를 완벽하게 마스터하는 가이드.", snippet: "const data = await processAsync();" },
];

let logs = [
  { id: 1, timestamp: new Date().toISOString(), action: "Search Engine Initialized", status: "success" },
  { id: 2, timestamp: new Date().toISOString(), action: "Indexing completed for 8 documents", status: "success" },
];

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site078", status: "healthy" });
});

// 2. GET /api/search
app.get('/api/search', (req, res) => {
  const { q, lang, sort } = req.query;
  const query = q ? q.toLowerCase() : "";
  
  let results = documents.filter(doc => {
    const matchTitle = doc.title.toLowerCase().includes(query);
    const matchContent = doc.content.toLowerCase().includes(query);
    const matchLang = lang ? doc.lang === lang : true;
    return (matchTitle || matchContent) && matchLang;
  });

  // Bug 01: Tokenizer Split Error
  // "ReactJS" searched, but internally split into "React" and "JS"
  if (query === 'reactjs') {
    results = results.map(r => ({
      ...r,
      tokens: ["React", "JS"], // Should be ["ReactJS"]
      bugId: "site078-bug01"
    }));
  }

  // Bug 02: Inverted Index Missing Entry
  // "Node" is missing from the index even though documents exist
  if (query === 'node') {
    results = []; 
    // Add bugId to the response metadata instead of results array
    return res.json({ data: [], bugId: "site078-bug02", message: "Index entry missing for keyword: 'node'" });
  }

  // Bug 03: Ranking Score Miscalculation
  // "async" search returns irrelevant result at top
  if (query === 'async') {
    results = [
      { id: 5, title: "TypeScript 인터페이스", content: "이 문서는 async와 전혀 관련이 없지만 랭킹 로직 오류로 상위에 표시됩니다.", snippet: "...", score: 99.9, bugId: "site078-bug03" },
      ...results
    ];
  }

  // Bug 04: Highlight Offset Mismatch
  // "useEffect" highlight is shifted by 10 characters
  if (query === 'useeffect') {
    results = results.map(r => {
      if (r.id === 4) {
        return {
          ...r,
          highlight: "....[useEffect]....", // Position simulation
          offsetError: true,
          bugId: "site078-bug04"
        };
      }
      return r;
    });
  }

  // Sort logic (Mock)
  if (sort === 'newest') {
    results = [...results].reverse();
  }

  res.json({ data: results });
});

// 3. GET /api/documents/:id
app.get('/api/documents/:id', (req, res) => {
  const doc = documents.find(d => d.id === parseInt(req.params.id));
  if (doc) res.json(doc);
  else res.status(404).json({ error: "Not found" });
});

// 4. GET /api/popular
app.get('/api/popular', (req, res) => {
  res.json({ data: ["React", "Node", "TypeScript", "Async", "Vite"] });
});

// 5. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalDocs: 1000,
    indexedDocs: 992, // 8 missing (Bug 02 hint)
    crawlStatus: "Active",
    indexHealth: "Degraded",
    bugId: "site078-bug02"
  });
});

// 6. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-10).reverse() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
