const express = require('express');
const path = require('path');
const app = express();
const PORT = 9273;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data: Movies
const movies = [
    {
        id: 1,
        title: '넥서스 에코',
        genre: 'SF',
        releaseDate: '2026-05-15',
        rating: 4.5,
        poster: 'assets/hero.jpg',
        synopsis: '기억이 데이터화된 미래, 잃어버린 자신의 기억을 찾기 위해 거대한 시스템에 맞서는 주인공의 여정.'
    },
    {
        id: 2,
        title: '강남 미드나잇',
        genre: 'Action',
        releaseDate: '2026-04-20',
        rating: 3.8,
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800',
        synopsis: '밤의 도시를 배경으로 펼쳐지는 긴박한 추격전과 화려한 액션 느와르.'
    },
    {
        id: 3,
        title: '숲의 침묵',
        genre: 'Drama',
        releaseDate: '2026-05-01',
        rating: 4.2,
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800',
        synopsis: '도시를 떠나 숲으로 들어간 남자가 마주한 자연의 신비와 내면의 치유.'
    },
    {
        id: 4,
        title: '시간의 모서리',
        genre: 'Drama',
        releaseDate: '2026-05-10',
        rating: 4.0,
        poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800',
        synopsis: '지나간 시간 속에서 소중한 사람을 다시 만날 수 있는 기회를 얻게 된 여자의 선택.'
    }
];

// Mock Data: Reviews
const reviews = [
    {
        id: 101,
        movieId: 1,
        author: '시네필A',
        rating: 4,
        content: '비주얼이 정말 압도적입니다. 시나리오의 개연성이 조금 아쉽지만 영상미만으로도 충분히 가치가 있는 영화입니다.',
        date: '2026-05-06',
        recommendations: 124
    },
    {
        id: 102,
        movieId: 2,
        author: '액션광',
        rating: 3,
        // site054-bug02: Long text to trigger overflow
        content: '액션은 시원시원합니다만 스토리가 너무 뻔합니다. 하지만킬링타임용으로는최고인것같네요추천합니다정말정말정말매우매우매우긴단어로테스트를진행합니다이단어는공백이없어서레이아웃을뚫고나갈것입니다.',
        date: '2026-05-05',
        recommendations: 45
    },
    {
        id: 103,
        movieId: 3,
        author: '리뷰어K',
        rating: 5,
        content: '올해 본 영화 중 가장 조용하면서도 강렬한 영화입니다. 숲의 소리에 집중하게 되는 연출이 훌륭하네요.',
        date: '2026-05-04',
        recommendations: 210
    }
];

// API: Movies
app.get('/api/movies', (req, res) => {
    res.json(movies);
});

// API: Reviews
app.get('/api/reviews', (req, res) => {
    res.json(reviews);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
