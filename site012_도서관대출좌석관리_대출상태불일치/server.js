import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5011;

app.use(cors());
app.use(express.json());

// Books Database
let books = [
  { id: "book-01", title: "데미안", author: "헤르만 헤세", category: "소설", coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=150&q=80", available: true },
  { id: "book-02", title: "코스모스", author: "칼 세이건", category: "과학", coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=150&q=80", available: true },
  { id: "book-03", title: "사피엔스", author: "유발 하라리", category: "인문", coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=150&q=80", available: true },
  { id: "book-04", title: "정의란 무엇인가", author: "마이클 샌델", category: "철학", coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80", available: true },
  { id: "book-05", title: "인간 실격", author: "다자이 오사무", category: "소설", coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=150&q=80", available: true },
  { id: "book-06", title: "이기적 유전자", author: "리처드 도킨스", category: "과학", coverUrl: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=150&q=80", available: true },
  { id: "book-07", title: "침묵의 봄", author: "레이첼 카슨", category: "과학", coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=150&q=80", available: true },
  { id: "book-08", title: "총, 균, 쇠 (대출 시 500에러)", author: "재레드 다이아몬드", category: "인문", coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=150&q=80", available: false }
];

// Active Loan Database
let loans = [
  { id: "loan-501", bookId: "book-01", bookTitle: "데미안", userName: "홍길동", date: "2026-06-23" }
];

// Seat Reservations Database
let seatReservations = [
  { seatId: "A-04", roomName: "제1열람실", userName: "이몽룡" },
  { seatId: "B-02", roomName: "제2열람실", userName: "성춘향" }
];

// API: Get books list
app.get('/api/books', (req, res) => {
  res.json(books);
});

// API: Get loan list
app.get('/api/loans', (req, res) => {
  res.json(loans);
});

// API: Get seat reservations
app.get('/api/seats', (req, res) => {
  res.json(seatReservations);
});

// API: Apply for book loans (Error 2, Error 3)
app.post('/api/loans', (req, res) => {
  const { bookId, userName } = req.body;

  if (!bookId || !userName) {
    return res.status(400).json({ error: "도서 ID 또는 대출자명이 누락되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 대출하려는 도서의 고유 ID가 'book-08'인 경우, 
  // 일반적인 대출 마감/대출 불가 응답(HTTP 400 Bad Request) 대신 내부 파일 권한 차단을 모사한 
  // HTTP 500 Internal Server Error 상태 코드를 전송하여 예외 화면 크래시를 유도합니다.
  if (bookId === 'book-08') {
    return res.status(500).json({
      error: "Internal Server Error: BookRentalConstraintException - book-08 is permanently locked for archiving review."
    });
  }

  const bookItem = books.find(b => b.id === bookId);
  if (!bookItem) {
    return res.status(404).json({ error: "도서 정보를 찾을 수 없습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 동일 사용자가 동일 도서를 중복으로 대출 신청하더라도 이에 대한 
  // 중복 대출 여부 검증(loans.some) 처리를 수행하지 않고, 대출 신청 내역(loans) 어레이에 
  // 그대로 중복 적재(push)하여 동일 도서 대출 이력이 다중으로 남는 데이터 모순 상태를 유발합니다.

  const newLoan = {
    id: `loan-${Date.now()}`,
    bookId,
    bookTitle: bookItem.title,
    userName,
    date: new Date().toISOString().split('T')[0]
  };

  loans.push(newLoan);

  res.status(201).json(newLoan);
});

// API: Return book (delete loan)
app.delete('/api/loans/:id', (req, res) => {
  const { id } = req.params;
  const index = loans.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "반납할 대출 기록을 찾을 수 없습니다." });
  }

  loans.splice(index, 1);
  res.json({ success: true, message: "도서가 반납 처리되었습니다." });
});

// API: Reserve room seat
app.post('/api/seats/reserve', (req, res) => {
  const { seatId, roomName, userName } = req.body;

  if (!seatId || !roomName || !userName) {
    return res.status(400).json({ error: "필수 예약 파라미터가 유실되었습니다." });
  }

  // Check if seat already occupied in this room
  const occupied = seatReservations.some(s => s.seatId === seatId && s.roomName === roomName);
  if (occupied) {
    return res.status(400).json({ error: "해당 열람실의 좌석은 이미 예약되어 이용이 불가능합니다." });
  }

  const newRes = { seatId, roomName, userName };
  seatReservations.push(newRes);

  res.status(201).json(newRes);
});

// API: Cancel room seat reservation
app.post('/api/seats/cancel', (req, res) => {
  const { seatId, roomName } = req.body;

  const index = seatReservations.findIndex(s => s.seatId === seatId && s.roomName === roomName);
  if (index === -1) {
    return res.status(404).json({ error: "취소할 예약 정보가 존재하지 않습니다." });
  }

  seatReservations.splice(index, 1);
  res.json({ success: true, message: "좌석 예약이 성공적으로 취소되었습니다." });
});

app.listen(PORT, () => {
  console.log(`[LibraryLoop Backend] Express server running on http://localhost:${PORT}`);
});
