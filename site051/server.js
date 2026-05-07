const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9160;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const movies = [
    { id: "movie-01", title: "Interstellar", releaseDate: "2014-11-06", rating: 4.9, genre: "SF", theaterInfo: { name: "CGV Gangnam", seat: 120 } },
    { id: "movie-02", title: "Inception", releaseDate: "2010-07-21", rating: 4.8, genre: "Action", theaterInfo: { name: "Lotte Cinema", seat: 80 } },
    { id: "movie-03", title: "Dune: Part Two", releaseDate: "2024-02-28", rating: 4.7, genre: "Adventure", theaterInfo: { name: "Megabox COEX", seat: 200 } },
    { id: "movie-99", title: "Sold Out Classic", releaseDate: "1990-01-01", rating: 3.5, genre: "Drama", theaterInfo: null }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site051", status: "healthy" });
});

// API: Get Movies
app.get('/api/movies', (req, res) => {
    const { sort } = req.query;
    let sorted = [...movies];

    if (sort === 'releaseDate') {
        // INTENTIONAL BACKEND BUG: site051-bug01
        // Type: wrong-sort-logic
        // Description: 개봉일순 정렬 요청 시, 날짜가 아닌 제목(title) 순으로 정렬하여 잘못된 순서를 반환함.
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        return res.json({ ok: true, data: sorted, bugId: "site051-bug01" });
    }

    res.json({ ok: true, data: sorted });
});

// API: Get Detail
app.get('/api/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === req.params.id);
    if (!movie) return res.status(404).json({ ok: false, message: "Movie not found" });

    try {
        if (movie.id === 'movie-99') {
            // INTENTIONAL BACKEND BUG: site051-bug02
            // Type: null-reference
            // Description: theaterInfo가 null인 영화 상세 조회 시 name 필드에 접근하여 500 에러를 유발함.
            const theaterName = movie.theaterInfo.name;
            return res.json({ ok: true, data: { ...movie, location: theaterName } });
        }
        res.json({ ok: true, data: movie });
    } catch (err) {
        res.status(500).json({ ok: false, bugId: "site051-bug02", message: "Internal Server Error" });
    }
});

// API: Theaters
app.get('/api/theaters', async (req, res) => {
    const { format } = req.query;
    
    // INTENTIONAL BACKEND BUG: site051-bug03
    // Type: api-timeout
    // Description: format=IMAX 요청 시 의도적으로 6초 지연 후 타임아웃 응답을 보냄.
    if (format === 'IMAX') {
        await new Promise(resolve => setTimeout(resolve, 6000));
        return res.status(408).json({ ok: false, bugId: "site051-bug03", message: "Request Timeout" });
    }

    res.json({ ok: true, data: ["Standard Room 1", "Standard Room 2", "Gold Class"] });
});

app.listen(PORT, () => {
    console.log(`Site051 MovieBook running on http://localhost:${PORT}`);
});
