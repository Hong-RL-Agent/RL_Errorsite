import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5051;

app.use(cors());
app.use(express.json());

// Movies DB (Minimum 12 items)
let movies = [
  { id: "m-01", title: "기생충", director: "봉준호", genre: "드라마/스릴러", runningTime: 132 },
  { id: "m-02", title: "올드보이", director: "박찬욱", genre: "스릴러/액션", runningTime: 120 },
  { id: "m-03", title: "괴물", director: "봉준호", genre: "SF/어드벤처", runningTime: 119 },
  { id: "m-04", title: "부산행", director: "연상호", genre: "스릴러/호러", runningTime: 118 },
  { id: "m-05", title: "명량", director: "김한민", genre: "사극/액션", runningTime: 128 },
  { id: "m-06", title: "범죄도시", director: "강윤성", genre: "범죄/액션", runningTime: 121 },
  { id: "m-07", title: "신과함께", director: "김용화", genre: "판타지/드라마", runningTime: 139 },
  { id: "m-08", title: "국제시장", director: "윤제균", genre: "드라마", runningTime: 126 },
  { id: "m-09", title: "베테랑", director: "류승완", genre: "액션/코미디", runningTime: 123 },
  { id: "m-10", title: "아바타: 물의 길", director: "제임스 카메론", genre: "SF/액션", runningTime: 192 },
  { id: "m-11", title: "인터스텔라", director: "크리스토퍼 놀란", genre: "SF", runningTime: 169 },
  { id: "m-12", title: "극한직업", director: "이병헌", genre: "코미디", runningTime: 111 }
];

// Screen Rooms (상영관)
let rooms = [
  { id: "room-1", name: "상영관 1", totalSeats: 48, status: "OPERATIONAL" }, // OPERATIONAL | UNDER_INSPECTION
  { id: "room-2", name: "상영관 2", totalSeats: 48, status: "OPERATIONAL" },
  { id: "room-3", name: "상영관 3", totalSeats: 48, status: "OPERATIONAL" }
];

// Showtimes (상영 일정) - Minimum 25 items
let showtimes = [
  // 상영관 1
  { id: "st-01", movieTitle: "기생충", screenRoom: "상영관 1", time: "09:00", seatsBooked: 12, isActive: true },
  { id: "st-02", movieTitle: "올드보이", screenRoom: "상영관 1", time: "11:30", seatsBooked: 24, isActive: true },
  { id: "st-03", movieTitle: "괴물", screenRoom: "상영관 1", time: "14:00", seatsBooked: 8, isActive: true },
  { id: "st-04", movieTitle: "부산행", screenRoom: "상영관 1", time: "16:30", seatsBooked: 45, isActive: true },
  { id: "st-05", movieTitle: "명량", screenRoom: "상영관 1", time: "19:00", seatsBooked: 32, isActive: true },
  { id: "st-06", movieTitle: "범죄도시", screenRoom: "상영관 1", time: "21:30", seatsBooked: 18, isActive: true },
  { id: "st-07", movieTitle: "신과함께", screenRoom: "상영관 1", time: "23:50", seatsBooked: 2, isActive: true },

  // 상영관 2
  { id: "st-08", movieTitle: "국제시장", screenRoom: "상영관 2", time: "09:10", seatsBooked: 15, isActive: true },
  { id: "st-09", movieTitle: "베테랑", screenRoom: "상영관 2", time: "11:40", seatsBooked: 30, isActive: true },
  { id: "st-10", movieTitle: "아바타: 물의 길", screenRoom: "상영관 2", time: "14:15", seatsBooked: 22, isActive: true },
  { id: "st-11", movieTitle: "인터스텔라", screenRoom: "상영관 2", time: "17:30", seatsBooked: 40, isActive: true },
  { id: "st-12", movieTitle: "극한직업", screenRoom: "상영관 2", time: "20:30", seatsBooked: 47, isActive: true },
  { id: "st-13", movieTitle: "기생충", screenRoom: "상영관 2", time: "22:45", seatsBooked: 5, isActive: true },

  // 상영관 3
  { id: "st-14", movieTitle: "올드보이", screenRoom: "상영관 3", time: "09:30", seatsBooked: 11, isActive: true },
  { id: "st-15", movieTitle: "괴물", screenRoom: "상영관 3", time: "12:00", seatsBooked: 14, isActive: true },
  { id: "st-16", movieTitle: "부산행", screenRoom: "상영관 3", time: "14:30", seatsBooked: 38, isActive: true },
  { id: "st-17", movieTitle: "명량", screenRoom: "상영관 3", time: "17:00", seatsBooked: 19, isActive: true },
  { id: "st-18", movieTitle: "범죄도시", screenRoom: "상영관 3", time: "19:30", seatsBooked: 42, isActive: true },
  { id: "st-19", movieTitle: "신과함께", screenRoom: "상영관 3", time: "22:00", seatsBooked: 31, isActive: true },
  
  // Extra to reach 25
  { id: "st-20", movieTitle: "국제시장", screenRoom: "상영관 3", time: "24:15", seatsBooked: 0, isActive: true },
  { id: "st-21", movieTitle: "베테랑", screenRoom: "상영관 1", time: "07:00", seatsBooked: 3, isActive: true },
  { id: "st-22", movieTitle: "아바타: 물의 길", screenRoom: "상영관 2", time: "06:30", seatsBooked: 8, isActive: true },
  { id: "st-23", movieTitle: "인터스텔라", screenRoom: "상영관 3", time: "06:00", seatsBooked: 2, isActive: true },
  { id: "st-24", movieTitle: "극한직업", screenRoom: "상영관 1", time: "10:00", seatsBooked: 39, isActive: true },
  { id: "st-25", movieTitle: "기생충", screenRoom: "상영관 3", time: "16:00", seatsBooked: 26, isActive: true }
];

// Activity logs
let logs = [
  { id: "log-01", action: "상영관 2 점검 스케줄 해제", staff: "관리자 A", time: "오후 1:15" },
  { id: "log-02", action: "기생충 주간 상영 추가 편성", staff: "홍길동", time: "오전 10:30" }
];

// Theater sales stats (Error 6 Target)
let theaterRevenues = {
  "강남점": { totalSales: 15600000, bookingsCount: 1040 },
  "홍대점": { totalSales: 9800000, bookingsCount: 650 },
  "신촌점": { totalSales: 12400000, bookingsCount: 820 }
};

// API: Get Movies
app.get('/api/movies', (req, res) => {
  res.json(movies);
});

// API: Register Movie
app.post('/api/movies', (req, res) => {
  const { title, director, genre, runningTime } = req.body;
  const newMovie = {
    id: `m-${Date.now()}`,
    title,
    director,
    genre,
    runningTime: Number(runningTime)
  };
  movies.push(newMovie);
  res.json(newMovie);
});

// API: Get Rooms
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// API: Toggle Screen Room status (Error 4 screen room inspection bypass)
app.patch('/api/rooms/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const room = rooms.find(r => r.id === id);

  if (room) {
    room.status = status;
    logs.unshift({
      id: `log-${Date.now()}`,
      action: `${room.name} 상태를 [${status}]로 변경`,
      staff: "상영지원팀",
      time: new Date().toLocaleTimeString()
    });

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 상영관의 상태를 점검 중(UNDER_INSPECTION)으로 바꿨음에도, 
    // 기존에 매핑되어 있던 해당 상영관의 상영 일정들(`showtimes`)을 비활성화(isActive = false) 
    // 처리하지 않고 예매 가능 상태 그대로 데이터베이스에 유지시키는 모순적 결함입니다.
    console.log(`[DB ROOM STATUS] ${room.name} status set to ${status}. BUT showtimes are NOT deactivated!`);
  }

  res.json({ success: true, room });
});

// API: Get Showtimes
app.get('/api/showtimes', (req, res) => {
  res.json(showtimes);
});

// API: Register Showtime
app.post('/api/showtimes', (req, res) => {
  const { movieTitle, screenRoom, time } = req.body;
  const newST = {
    id: `st-${Date.now()}`,
    movieTitle,
    screenRoom,
    time,
    seatsBooked: 0,
    isActive: true
  };
  showtimes.push(newST);
  res.json(newST);
});

// API: Patch Showtime Time (Error 1 patch time - 4s delay)
app.patch('/api/showtimes/:id/time', (req, res) => {
  const { id } = req.params;
  const { time, screenRoom } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 상영 일정 시간 변경(PATCH) API 요청에 4000ms(4초)의 지연 시간을 강제 부여합니다.
  // 상영관 변경(1초)이 처리된 상태에서, 4초 뒤 지연 완료되는 시간 변경 스레드가 
  // 기존 요청 송신 당시에 캡처했던 이전의 상영관 값(`screenRoom`)을 최종적으로 다시 이식해 덮어쓰기해 버립니다.
  setTimeout(() => {
    const st = showtimes.find(s => s.id === id);
    if (st) {
      st.time = time;
      st.screenRoom = screenRoom; // Will overwrite the newer screenRoom value back to the old one!
      console.log(`[DB SCHEDULE RACE] Showtime ${id} updated time to ${time} and rollback room to ${screenRoom}`);
    }
    res.json({ success: true });
  }, 4000);
});

// API: Patch Showtime Room (Error 1 patch room - 1s delay)
app.patch('/api/showtimes/:id/room', (req, res) => {
  const { id } = req.params;
  const { screenRoom } = req.body;

  setTimeout(() => {
    const st = showtimes.find(s => s.id === id);
    if (st) {
      st.screenRoom = screenRoom;
      console.log(`[DB SCHEDULE] Room updated for ${id} to ${screenRoom}`);
    }
    res.json({ success: true });
  }, 1000);
});

// API: Delete Showtime (Error 3 Deletion race - 3s delay)
app.delete('/api/showtimes/:id', (req, res) => {
  const { id } = req.params;
  const st = showtimes.find(s => s.id === id);
  const movieTitle = st ? st.movieTitle : '';

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 특정 일정을 삭제할 때 영화 제목을 타겟으로 삭제 연산을 수행하며 3초 지연시킵니다.
  // 삭제 직후 사용자가 동일 영화로 새 상영 일정을 추가 등록하면 
  // 3초 뒤에 뒤늦게 동작을 완료한 필터 스레드가 신규 일정 레코드까지 다 휩쓸어 삭제(Wipeout)해 버립니다.
  setTimeout(() => {
    showtimes = showtimes.filter(s => s.id !== id && s.movieTitle !== movieTitle);
    console.log(`[DB PURGE] Movie ${movieTitle} schedules purged.`);
    res.json({ success: true });
  }, 3000);
});

// API: Get logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// API: Get booking statistics (Error 5 refresh clicks race condition)
let statClickCount = 0;
app.get('/api/statistics/bookings', (req, res) => {
  statClickCount++;
  let delay = 100;
  let count = 850; // base standard count

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 예매 현황 새로고침 클릭 횟수/속도에 따라 비동기 연산 지연시간을 엇갈리게 배포합니다.
  // 두 번째 요청에 2000ms(2초) 지연과 구식 데이터(420건)를 주고, 세 번째 요청은 100ms(0.1초) 만에 최신 데이터(940건)를 
  // 응답해 주어 최신 수치가 구식 값으로 오버라이트 덮어써지게 합니다.
  if (statClickCount % 3 === 2) {
    delay = 2000;
    count = 420; // Stale, old count
  } else if (statClickCount % 3 === 0) {
    delay = 100;
    count = 940; // Fresh, new count
  }

  setTimeout(() => {
    res.json({ bookingsCount: count, time: new Date().toLocaleTimeString() });
  }, delay);
});

// API: Get revenue statistics
app.get('/api/statistics/revenue', (req, res) => {
  const { theater } = req.query;
  const data = theaterRevenues[theater] || { totalSales: 0, bookingsCount: 0 };
  res.json(data);
});

// API: Reset database
app.post('/api/reset', (req, res) => {
  rooms = [
    { id: "room-1", name: "상영관 1", totalSeats: 48, status: "OPERATIONAL" },
    { id: "room-2", name: "상영관 2", totalSeats: 48, status: "OPERATIONAL" },
    { id: "room-3", name: "상영관 3", totalSeats: 48, status: "OPERATIONAL" }
  ];
  showtimes = [
    { id: "st-01", movieTitle: "기생충", screenRoom: "상영관 1", time: "09:00", seatsBooked: 12, isActive: true },
    { id: "st-02", movieTitle: "올드보이", screenRoom: "상영관 1", time: "11:30", seatsBooked: 24, isActive: true },
    { id: "st-03", movieTitle: "괴물", screenRoom: "상영관 1", time: "14:00", seatsBooked: 8, isActive: true },
    { id: "st-04", movieTitle: "부산행", screenRoom: "상영관 1", time: "16:30", seatsBooked: 45, isActive: true },
    { id: "st-05", movieTitle: "명량", screenRoom: "상영관 1", time: "19:00", seatsBooked: 32, isActive: true },
    { id: "st-06", movieTitle: "범죄도시", screenRoom: "상영관 1", time: "21:30", seatsBooked: 18, isActive: true },
    { id: "st-07", movieTitle: "신과함께", screenRoom: "상영관 1", time: "23:50", seatsBooked: 2, isActive: true },
    { id: "st-08", movieTitle: "국제시장", screenRoom: "상영관 2", time: "09:10", seatsBooked: 15, isActive: true },
    { id: "st-09", movieTitle: "베테랑", screenRoom: "상영관 2", time: "11:40", seatsBooked: 30, isActive: true },
    { id: "st-10", movieTitle: "아바타: 물의 길", screenRoom: "상영관 2", time: "14:15", seatsBooked: 22, isActive: true },
    { id: "st-11", movieTitle: "인터스텔라", screenRoom: "상영관 2", time: "17:30", seatsBooked: 40, isActive: true },
    { id: "st-12", movieTitle: "극한직업", screenRoom: "상영관 2", time: "20:30", seatsBooked: 47, isActive: true },
    { id: "st-13", movieTitle: "기생충", screenRoom: "상영관 2", time: "22:45", seatsBooked: 5, isActive: true },
    { id: "st-14", movieTitle: "올드보이", screenRoom: "상영관 3", time: "09:30", seatsBooked: 11, isActive: true },
    { id: "st-15", movieTitle: "괴물", screenRoom: "상영관 3", time: "12:00", seatsBooked: 14, isActive: true },
    { id: "st-16", movieTitle: "부산행", screenRoom: "상영관 3", time: "14:30", seatsBooked: 38, isActive: true },
    { id: "st-17", movieTitle: "명량", screenRoom: "상영관 3", time: "17:00", seatsBooked: 19, isActive: true },
    { id: "st-18", movieTitle: "범죄도시", screenRoom: "상영관 3", time: "19:30", seatsBooked: 42, isActive: true },
    { id: "st-19", movieTitle: "신과함께", screenRoom: "상영관 3", time: "22:00", seatsBooked: 31, isActive: true },
    { id: "st-20", movieTitle: "국제시장", screenRoom: "상영관 3", time: "24:15", seatsBooked: 0, isActive: true },
    { id: "st-21", movieTitle: "베테랑", screenRoom: "상영관 1", time: "07:00", seatsBooked: 3, isActive: true },
    { id: "st-22", movieTitle: "아바타: 물의 길", screenRoom: "상영관 2", time: "06:30", seatsBooked: 8, isActive: true },
    { id: "st-23", movieTitle: "인터스텔라", screenRoom: "상영관 3", time: "06:00", seatsBooked: 2, isActive: true },
    { id: "st-24", movieTitle: "극한직업", screenRoom: "상영관 1", time: "10:00", seatsBooked: 39, isActive: true },
    { id: "st-25", movieTitle: "기생충", screenRoom: "상영관 3", time: "16:00", seatsBooked: 26, isActive: true }
  ];
  logs = [
    { id: "log-01", action: "상영관 2 점검 스케줄 해제", staff: "관리자 A", time: "오후 1:15" },
    { id: "log-02", action: "기생충 주간 상영 추가 편성", staff: "홍길동", time: "오전 10:30" }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[CinemaOps Backend] Express server running on http://localhost:${PORT}`);
});
