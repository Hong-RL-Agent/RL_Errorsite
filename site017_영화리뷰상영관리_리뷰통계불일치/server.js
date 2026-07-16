import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5016;

app.use(cors());
app.use(express.json());

// Movie database list (Error 4: movie-09 has incorrect poster file extension)
let movies = [
  { id: "movie-01", title: "인터스텔라 리덕스", genre: "SF", rating: 4.8, poster: "/images/movie-01.svg", director: "크리스토퍼 놀란", description: "시간과 우주를 초월한 인간의 사랑과 생존에 관한 시각적 대서사시." },
  { id: "movie-02", title: "로맨틱 선셋", genre: "로맨스", rating: 4.5, poster: "/images/movie-02.svg", director: "리차드 링클레이터", description: "빈행 열차에서 시작된 단 하루 동안의 설레고 깊이 있는 대화극." },
  { id: "movie-03", title: "크루엘 나이트", genre: "스릴러", rating: 4.2, poster: "/images/movie-03.svg", director: "데이빗 핀처", description: "미궁 속 연쇄 살인마의 꼬리를 쫓는 두 형사의 차가운 추적극." },
  { id: "movie-04", title: "래프 아웃 라우드", genre: "코미디", rating: 4.0, poster: "/images/movie-04.svg", director: "에드가 라이트", description: "우연히 얽힌 세 명의 친구가 벌이는 좌충우돌 탈출 모험기." },
  { id: "movie-05", title: "검객의 노래", genre: "액션", rating: 4.6, poster: "/images/movie-05.svg", director: "장예모", description: "난세의 시기, 왕조의 복수를 위해 칼을 든 검객들의 화려한 무협 액션." },
  { id: "movie-06", title: "얼어붙은 시간", genre: "SF", rating: 4.4, poster: "/images/movie-06.svg", director: "드니 빌뇌브", description: "시간 여행 기술이 상용화된 암울한 미래 사회에서 일어나는 수사극." },
  { id: "movie-07", title: "피아노의 속삭임", genre: "드라마", rating: 4.7, poster: "/images/movie-07.svg", director: "요아킴 트리어", description: "눈이 보이지 않는 피아니스트가 세상과 소통하는 감동 이야기." },
  { id: "movie-08", title: "웃음 포인터", genre: "코미디", rating: 4.1, poster: "/images/movie-08.svg", director: "웨스 앤더슨", description: "가상의 알프스 호텔에서 벌어지는 기묘하고 대칭적인 유머 소동." },
  
  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: movie-09 포스터의 파일 주소를 실제 제공하는 확장자 포맷인 '.svg'가 아닌 
  // 존재하지 않는 이미지 형태인 '.jpg'로 강제 설정하여 브라우저에서 포스터 이미지가 깨져(엑스박스) 노출되게 만듭니다.
  { id: "movie-09", title: "어두운 숲속의 전설", genre: "공포", rating: 3.9, poster: "/images/movie-09.jpg", director: "조던 필", description: "외딴 오두막에서 보낸 주말, 전설 속 존재가 현실로 나타나는 공포물." }
];

// Reviews database
let reviews = [
  { id: "rev-1", movieId: "movie-01", username: "영화덕후", rating: 5, content: "역대급 SF 명작! 스토리가 지루할 틈 없이 탄탄합니다.", date: "2026-07-01" },
  { id: "rev-2", movieId: "movie-02", username: "선셋피플", rating: 4, content: "두 배우의 비포 시리즈 같은 티키타카 대화가 마음에 드네요.", date: "2026-07-02" }
];

// Showtimes database
const showtimes = {
  "movie-01": ["10:30", "13:40", "16:50", "20:00"],
  "movie-02": ["11:00", "14:15", "18:30"],
  "movie-03": ["12:00", "15:30", "19:00"],
  "movie-04": ["10:00", "13:00", "16:00", "19:00"],
  "movie-05": ["11:30", "15:00", "18:20", "21:30"],
  "movie-06": ["09:00", "12:10", "15:20", "18:30"],
  "movie-07": ["10:50", "14:00", "17:10", "20:20"],
  "movie-08": ["11:15", "14:40", "18:00"],
  "movie-09": ["22:00", "00:30"]
};

// API: Get movies
app.get('/api/movies', (req, res) => {
  res.json(movies);
});

// API: Get movie reviews
app.get('/api/movies/:id/reviews', (req, res) => {
  const { id } = req.params;
  const filtered = reviews.filter(r => r.movieId === id);
  res.json(filtered);
});

// API: Write review (Error 1)
app.post('/api/movies/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { username, rating, content } = req.body;

  if (!username) {
    return res.status(400).json({ error: "작성자 이름은 필수 항목입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 리뷰 평점이 5점 만점(최상점)이면서 텍스트 본문 내용이 누락된 경우, 
  // 잘못된 요청 입력 안내(400 Bad Request) 대신 NullPointerException 상황을 가정하여 
  // HTTP 500 Internal Server Error 상태 코드를 강제 리턴시킵니다.
  if (Number(rating) === 5 && (!content || !content.trim())) {
    return res.status(500).json({
      error: "Internal Server Error: NullPointerException - Review content cannot be empty when rating is max (5)."
    });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    movieId: id,
    username,
    rating: Number(rating) || 5,
    content: content || "",
    date: new Date().toISOString().split('T')[0]
  };

  reviews.push(newReview);
  res.status(201).json(newReview);
});

// API: Edit review (Error 2)
app.put('/api/reviews/:reviewId', (req, res) => {
  const { reviewId } = req.params;
  const { username, rating, content, movieId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 기존 리뷰의 내용을 수정할 때, 기존 배열의 항목을 찾아서 덮어씌우거나 
  // 수정하는 대신, 완전히 새로운 리뷰 오브젝트로 취급하여 reviews 데이터베이스에 푸시(push)합니다. 
  // 이로 인해 이전 리뷰는 삭제되지 않고 그대로 렌더링 리스트에 겹쳐 남아 동일 리뷰가 중복 노출됩니다.
  const updatedReview = {
    id: `rev-${Date.now()}`,
    movieId,
    username,
    rating: Number(rating),
    content,
    date: new Date().toISOString().split('T')[0]
  };

  reviews.push(updatedReview);

  res.json({ success: true, review: updatedReview });
});

// API: Get movie showtimes
app.get('/api/movies/:id/showtimes', (req, res) => {
  const { id } = req.params;
  res.json(showtimes[id] || []);
});

// Helper: Serve dynamic poster images
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename.endsWith('.svg')) {
    return res.status(404).send('Not Found');
  }

  const name = filename.replace('.svg', '');
  const movie = movies.find(m => m.id === name || m.poster.includes(filename));
  const title = movie ? movie.title : "CineScope";
  const genre = movie ? movie.genre : "Movie";

  // Dynamic SVG Poster
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="100%" height="100%">
      <defs>
        <linearGradient id="poster-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#020617;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="450" fill="url(#poster-grad)" rx="15" />
      <circle cx="150" cy="180" r="80" fill="#e11d48" opacity="0.15" />
      
      <!-- Frame border lines -->
      <rect x="15" y="15" width="270" height="420" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="6,4" rx="10" />
      
      <!-- Decorative Film Reels -->
      <circle cx="150" cy="180" r="50" fill="none" stroke="#f43f5e" stroke-width="3" />
      <line x1="150" y1="130" x2="150" y2="230" stroke="#f43f5e" stroke-width="2" />
      <line x1="100" y1="180" x2="200" y2="180" stroke="#f43f5e" stroke-width="2" />
      
      <!-- Movie Title -->
      <text x="150" y="340" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="20" font-weight="900" text-anchor="middle">${title}</text>
      
      <!-- Genre Tag badge -->
      <rect x="100" y="370" width="100" height="24" fill="#e11d48" rx="12" />
      <text x="150" y="386" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${genre}</text>
    </svg>
  `);
});

app.listen(PORT, () => {
  console.log(`[CineScope Backend] Express server running on http://localhost:${PORT}`);
});
