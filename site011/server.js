const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9120;

app.use(cors());
app.use(express.json());

// Mock Data
let mockMemoryUsage = 256.4; // MB
let mockLeakRate = 0;

const docs = [
    { id: 1, title: "Company Policy 2024", type: "PDF", size: 1024, author: "HR" },
    { id: 2, title: "Technical Architecture", type: "TXT", size: 512, encoding: "UTF-8" }
];

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        "ok": true,
        "site": "site011",
        "status": "healthy"
    });
});

// 1. POST /api/rag/query
app.post('/api/rag/query', (req, res) => {
    const { query, longContext } = req.body;
    let answer = `Based on the documents, the answer to "${query}" is found in the internal guidelines.`;
    let bugId = null;

    // INTENTIONAL BACKEND BUG: site011-bug01
    // Type: rag-context-truncation
    // Description: RAG 처리 시 컨텍스트 윈도우 초과로 중요한 문맥이 잘려 잘못된 답변 생성
    if (longContext === true) {
        bugId = "site011-bug01";
        answer = "I'm sorry, I couldn't find relevant information in the provided context."; // Wrong answer due to truncation
    }

    res.json({ ok: true, answer, bugId, source: "Company Guidelines v2" });
});

// 2. GET /api/docs/mixed-types
app.get('/api/docs/mixed-types', (req, res) => {
    // INTENTIONAL BACKEND BUG: site011-bug02
    // Type: polymorphic-mapping-error
    // Description: 서로 다른 타입의 문서 데이터가 동일 구조로 매핑되면서 필드 충돌 발생
    const mixedData = [
        { id: 1, title: "HR PDF", extra: { pages: 10 } },
        { id: 2, title: "Log TXT", extra: null } // Conflict: expected object, got null or missing fields
    ];
    
    res.json({ ok: true, data: mixedData, bugId: "site011-bug02" });
});

// 3. GET /api/stats/large-number
app.get('/api/stats/large-number', (req, res) => {
    // INTENTIONAL BACKEND BUG: site011-bug03
    // Type: json-precision-loss
    // Description: 큰 숫자를 Number로 처리하여 정밀도 손실 발생
    const brokenValue = Number("90071992547409931234");
    
    res.json({ 
        ok: true, 
        processedValue: brokenValue, 
        originalString: "90071992547409931234",
        bugId: "site011-bug03" 
    });
});

// 4. GET /api/system/gc
app.get('/api/system/gc', async (req, res) => {
    const { pause } = req.query;

    // INTENTIONAL BACKEND BUG: site011-bug04
    // Type: gc-stop-the-world
    // Description: GC Stop-the-World 시뮬레이션으로 요청이 일시 정지되는 현상 발생
    if (pause === 'true') {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return res.json({ ok: true, message: "GC Collection completed after 5000ms pause", bugId: "site011-bug04" });
    }

    res.json({ ok: true, message: "System running smoothly" });
});

// 5. GET /api/system/memory
app.get('/api/system/memory', (req, res) => {
    const { leak } = req.query;

    // INTENTIONAL BACKEND BUG: site011-bug05
    // Type: offheap-memory-leak
    // Description: 네이티브 애드온 시뮬레이션에서 off-heap 메모리 누수가 발생한 것처럼 동작
    if (leak === 'true') {
        mockLeakRate += 10.5;
        mockMemoryUsage += mockLeakRate;
        return res.json({ ok: true, usageMB: mockMemoryUsage, leakRate: mockLeakRate, bugId: "site011-bug05" });
    }

    res.json({ ok: true, usageMB: 256.4, leakRate: 0 });
});

app.post('/api/test/reset', (req, res) => {
    mockMemoryUsage = 256.4;
    mockLeakRate = 0;
    res.json({ ok: true });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
