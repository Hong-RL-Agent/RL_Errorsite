import path from 'path';
import { readDB, writeDB } from '../services/dataService.js';

export const getSeats = (req, res) => {
  const db = readDB();
  res.json(db.seats);
};

export const getBooks = (req, res) => {
  const db = readDB();
  res.json(db.books);
};

export const searchBooks = (req, res) => {
  const { query, category } = req.query;
  const db = readDB();
  let list = db.books;

  if (category && category !== 'ALL') {
    list = list.filter(b => b.category === category);
  }
  if (query) {
    list = list.filter(b => b.title.includes(query) || b.author.includes(query));
  }

  let delay = 100;
  if (category === 'COMPUTER') {
    delay = 3000; // 3.0s delay
  } else if (category === 'LITERATURE') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 컴퓨터 카테고리(3초 지연)와 문학 카테고리(0.2초 완료) 검색 필터를 빠르게 변경하면 
  // 오래된 이전 응답(컴퓨터)이 최신 목록을 덮어쓰고, 중앙 자료 목록은 오래된 검색 결과, 오른쪽 상세는 최신 클릭 자료로 서로 어긋나는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getBookDetail = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const book = db.books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  const detailBook = { ...book };

  // INTENTIONAL_ERROR
  // CATEGORY: Server 파일 경로 오류
  // DESCRIPTION: 도서 표지 이미지 파일 이름에 한글 및 공백이 포함된 경우('도서 표지 (최신).jpg'), 
  // 상세 정보 API 응답 시 이중 URL 인코딩을 적용해 반환하여 상세 이미지에서만 404가 발생하며 깨진 이미지 아이콘으로 표시되는 결함입니다.
  if (detailBook.imageUrl && detailBook.imageUrl.includes(' ') && (detailBook.imageUrl.includes('(') || detailBook.imageUrl.includes(')'))) {
    const filename = path.basename(detailBook.imageUrl);
    const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
    detailBook.imageUrl = `/uploads/${doubleEncoded}`;
  }

  res.json(detailBook);
};

export const getReservations = (req, res) => {
  const db = readDB();
  res.json(db.reservations);
};

export const getUsers = (req, res) => {
  const db = readDB();
  res.json(db.users);
};

export const updateCapacity = (req, res) => {
  const { id } = req.params;
  const { capacity } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.capacity = Number(capacity);
      writeDB(db);
      console.log(`[DB CAPACITY UPDATE] Updated capacity for ${id} to ${capacity} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
};

export const updateTimeSlot = (req, res) => {
  const { id } = req.params;
  const { timeSlot, capacity } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 오류
  // DESCRIPTION: 스터디룸 예약 시간을 변경(3초 지연 완료)한 직후 이용 인원을 변경(0.1초 완료)하면, 
  // 인원 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 시간 변경 API 내부에 이전 구형 인원(capacity)이 동봉 저장되어 
  // 새로고침 시 새 시간과 이전 인원 조합이 저당되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.timeSlot = timeSlot;
      if (capacity !== undefined) {
        resv.capacity = Number(capacity); // Overwrites capacity with stale value!
      }
      writeDB(db);
      console.log(`[DB TIME UPDATE] Updated timeSlot for ${id} to ${timeSlot} (3s done). Overwrote capacity to ${capacity}`);
    }
    res.json({ success: true, reservation: resv });
  }, 3000);
};

export const reserveSeat = (req, res) => {
  const { seatId, userId, userName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const seat = db.seats.find(s => s.id === seatId);
    if (seat) {
      seat.status = 'OCCUPIED';
    }

    const newResv = {
      id: `RES-${String(db.reservations.length + 1).padStart(3, '0')}`,
      targetType: seat?.type === 'STUDY_ROOM' ? 'STUDY_ROOM' : 'SEAT',
      targetId: seatId,
      targetName: seat?.name || seatId,
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:00-14:00",
      capacity: seat?.capacity || 1,
      status: "CONFIRMED",
      userId: userId || "USER_A",
      overdue: false
    };

    db.reservations.unshift(newResv);
    writeDB(db);
    console.log(`[DB SEAT RE-RESERVE] Created new reservation ${newResv.id} for seat ${seatId} (0.5s done)`);
    res.json({ success: true, reservation: newResv });
  }, 500);
};

export const cancelReservation = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 좌석 예약 취소(4초 지연 완료) 직후 같은 좌석을 다시 예약(0.5초 완료)하면 두 요청 모두 성공하지만, 
  // 늦게 완료된 취소 요청(4초 지연)이 새로 작성된 새 예약까지 취소 상태('CANCELLED')로 강제 덮어쓰는 결함입니다. 
  // 좌석 배치도에서는 사용 가능, 내 예약 목록에서는 예약됨으로 불일치합니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CANCELLED';
      const seat = db.seats.find(s => s.id === resv.targetId);
      if (seat) {
        seat.status = 'AVAILABLE';
      }
      writeDB(db);
      console.log(`[DB DELAYED CANCEL] Cancelled reservation ${id} (4s done). Overwrote new reservation state!`);
    }
    res.json({ success: true });
  }, 4000);
};

export const deleteReservation = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reservations = db.reservations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 자료 예약을 삭제(DELETE) 처리하여 대장에서 지우더라도, 
  // 자료별 대기 수(`waitingCount`)와 관리자 대시보드 통계(`statistics.totalBookWaiters`)에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE RESV] Removed reservation ${id}. Book waitingCount and statistics remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "seats": [
      { "id": "SEAT-101", "name": "1층 노트북석 A-01", "floor": 1, "type": "LAPTOP", "status": "AVAILABLE" },
      { "id": "SEAT-102", "name": "1층 노트북석 A-02", "floor": 1, "type": "LAPTOP", "status": "OCCUPIED" }
    ],
    "books": [
      { "id": "BK-001", "title": "클린 코드: 애자일 소프트웨어 혁명", "author": "로버트 C. 마틴", "pubYear": 2013, "category": "COMPUTER", "waitingCount": 2, "imageUrl": "/uploads/clean_code.jpg" }
    ],
    "reservations": [
      { "id": "RES-001", "targetType": "SEAT", "targetId": "SEAT-102", "targetName": "1층 노트북석 A-02", "date": "2026-08-10", "timeSlot": "10:00-14:00", "capacity": 1, "status": "CONFIRMED", "userId": "USER_A", "overdue": false }
    ],
    "users": [
      { "id": "USER_A", "name": "김철수", "department": "컴퓨터공학과", "overdueCount": 1, "returnDueDate": "2026-08-05 (연체 1건)" }
    ],
    "statistics": {
      "totalBookWaiters": 28,
      "activeSeatReservations": 14,
      "activeBookLoans": 11
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
