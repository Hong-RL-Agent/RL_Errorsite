const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9166;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", lang: "en", year: 1925 },
    { id: 2, title: "1984", author: "George Orwell", lang: "en", year: 1949 },
    { id: 3, title: "Brave New World", author: "Aldous Huxley", lang: "en", year: 1932 },
    { id: 4, title: "To Kill a Mockingbird", author: "Harper Lee", lang: "en", year: 1960 },
    { id: 5, title: "삼국지 (Three Kingdoms)", author: "Na Gwan-jung", lang: "ko", year: 1400 },
    { id: 6, title: "채식주의자 (The Vegetarian)", author: "Han Kang", lang: "ko", year: 2007 },
    { id: 7, title: "소년이 온다", author: "Han Kang", lang: "ko", year: 2014 },
    { id: 8, title: "The Hobbit", author: "J.R.R. Tolkien", lang: "en", year: 1937 }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site057", status: "healthy" });
});

// API: Get Books
app.get('/api/books', (req, res) => {
    let { lang, page = 1, limit = 4 } = req.query;
    let data = [...books];

    if (lang === 'en') {
        // INTENTIONAL BACKEND BUG: site057-bug01
        // Type: invalid-filter-logic
        // Description: 영어 도서 필터링 시 실수로 영어(en)가 아닌 도서들만 반환함.
        data = data.filter(b => b.lang !== 'en');
        return res.json({ ok: true, data, bugId: "site057-bug01" });
    }

    const p = parseInt(page);
    const l = parseInt(limit);
    
    // INTENTIONAL BACKEND BUG: site057-bug03
    // Type: pagination-off-by-one
    // Description: 2페이지 조회 시 시작 인덱스에 -1을 하여 이전 페이지 마지막 데이터가 중복 포함되게 함.
    const start = (p - 1) * l - (p === 2 ? 1 : 0);
    const end = start + l;
    data = books.slice(start, end);

    res.json({ ok: true, data, pagination: { page: p, limit: l, total: books.length }, bugId: p === 2 ? "site057-bug03" : null });
});

// API: Filter by Century
app.get('/api/books/filter/year', (req, res) => {
    const { century } = req.query;
    
    // INTENTIONAL BACKEND BUG: site057-bug02
    // Type: type-parsing
    // Description: "21st" 같은 문자열 파라미터를 숫자로 변환하려다 NaN 에러 발생.
    const yearPrefix = parseInt(century); // "21st" -> 21
    if (isNaN(yearPrefix) || century === '21st') {
        // 21st 입력 시 의도적으로 실패하도록 구성
        return res.status(400).json({ ok: false, bugId: "site057-bug02", message: "Invalid year format" });
    }
    
    res.json({ ok: true, data: books.filter(b => b.year.toString().startsWith(yearPrefix)) });
});

app.listen(PORT, () => {
    console.log(`Site057 BookSearch running on http://localhost:${PORT}`);
});
