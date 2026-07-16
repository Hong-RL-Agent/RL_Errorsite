import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5057;

app.use(cors());
app.use(express.json());

// Events Database (Minimum 10 items)
let events = [
  { id: "evt-01", title: "2026 서울 국제 AI 심포지엄", location: "코엑스 그랜드볼룸", date: "2026-08-10", registeredCount: 8 },
  { id: "evt-02", title: "글로벌 청년 창업 부트캠프", location: "드림플러스 강남", date: "2026-08-15", registeredCount: 6 },
  { id: "evt-03", title: "메타버스 테크 데모 데이", location: "상암 누리꿈스퀘어", date: "2026-08-20", registeredCount: 4 },
  { id: "evt-04", title: "아시아 태평양 신재생 에너지 포럼", location: "제주 ICC", date: "2026-08-22", registeredCount: 3 },
  { id: "evt-05", title: "바이오 헬스케어 투자 파트너링", location: "킨텍스 2전시장", date: "2026-08-28", registeredCount: 2 },
  { id: "evt-06", title: "미래 모빌리티 자율주행 콘퍼런스", location: "여의도 콘래드", date: "2026-09-02", registeredCount: 2 },
  { id: "evt-07", title: "스마트 제조 혁신 엑스포", location: "벡스코 오디토리움", date: "2026-09-05", registeredCount: 2 },
  { id: "evt-08", title: "핀테크 자산관리 전략 워크숍", location: "강남 스파크플러스", date: "2026-09-10", registeredCount: 1 },
  { id: "evt-09", title: "클라우드 보안 기술 네트워킹 데이", location: "판교 스타트업캠퍼스", date: "2026-09-15", registeredCount: 1 },
  { id: "evt-10", title: "디지털 헬스케어 인공지능 해커톤", location: "DDP 배움터", date: "2026-09-20", registeredCount: 1 }
];

// Programs (Schedules)
let programs = [
  { id: "prg-01", eventId: "evt-01", title: "오프닝 키노트: AGI의 미래", time: "10:00", registeredCount: 8 },
  { id: "prg-02", eventId: "evt-01", title: "패널 토론: 생성형 AI 윤리", time: "11:30", registeredCount: 6 },
  { id: "prg-03", eventId: "evt-02", title: "스타트업 피칭 101", time: "14:00", registeredCount: 6 }
];

// Attendees (Minimum 30 items)
let attendees = [
  { id: "att-01", name: "김민준", email: "minjun@gmail.com", checkedIn: false, seat: "A-12", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-02", name: "이서연", email: "seoyeon@naver.com", checkedIn: true, seat: "A-15", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-03", name: "박지우", email: "jiwoo@daum.net", checkedIn: false, seat: "B-03", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-04", name: "최예준", email: "yejun@gmail.com", checkedIn: false, seat: "B-05", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-05", name: "정지유", email: "jiyu@naver.com", checkedIn: true, seat: "C-01", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-06", name: "강도현", email: "dohyen@gmail.com", checkedIn: false, seat: "C-04", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-07", name: "조하은", email: "haeun@naver.com", checkedIn: false, seat: "D-02", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-08", name: "윤도윤", email: "doyun@gmail.com", checkedIn: false, seat: "D-08", eventId: "evt-01", status: "CONFIRMED" },
  { id: "att-09", name: "장민지", email: "minji@daum.net", checkedIn: false, seat: "A-01", eventId: "evt-02", status: "CONFIRMED" },
  { id: "att-10", name: "임주원", email: "juwon@gmail.com", checkedIn: false, seat: "A-05", eventId: "evt-02", status: "CONFIRMED" },
  { id: "att-11", name: "한지한", email: "jihan@naver.com", checkedIn: false, seat: "B-01", eventId: "evt-02", status: "CONFIRMED" },
  { id: "att-12", name: "오수아", email: "sua@gmail.com", checkedIn: false, seat: "B-07", eventId: "evt-02", status: "CONFIRMED" },
  { id: "att-13", name: "서현우", email: "hyeonwoo@naver.com", checkedIn: false, seat: "C-03", eventId: "evt-02", status: "CONFIRMED" },
  { id: "att-14", name: "신유나", email: "yuna@gmail.com", checkedIn: false, seat: "C-09", eventId: "evt-02", status: "CONFIRMED" },
  { id: "att-15", name: "권우진", email: "woojin@daum.net", checkedIn: false, seat: "A-02", eventId: "evt-03", status: "CONFIRMED" },
  { id: "att-16", name: "황지아", email: "jia@naver.com", checkedIn: false, seat: "A-08", eventId: "evt-03", status: "CONFIRMED" },
  { id: "att-17", name: "송민재", email: "minjae@gmail.com", checkedIn: false, seat: "B-02", eventId: "evt-03", status: "CONFIRMED" },
  { id: "att-18", name: "전소율", email: "soyul@gmail.com", checkedIn: false, seat: "B-09", eventId: "evt-03", status: "CONFIRMED" },
  { id: "att-19", name: "안시우", email: "siwoo@naver.com", checkedIn: false, seat: "A-03", eventId: "evt-04", status: "CONFIRMED" },
  { id: "att-20", name: "홍지호", email: "jiho@gmail.com", checkedIn: false, seat: "A-09", eventId: "evt-04", status: "CONFIRMED" },
  { id: "att-21", name: "양채원", email: "chaewon@daum.net", checkedIn: false, seat: "B-04", eventId: "evt-04", status: "CONFIRMED" },
  { id: "att-22", name: "손유찬", email: "yuchan@naver.com", checkedIn: false, seat: "A-04", eventId: "evt-05", status: "CONFIRMED" },
  { id: "att-23", name: "배윤아", email: "yuna2@gmail.com", checkedIn: false, seat: "B-06", eventId: "evt-05", status: "CONFIRMED" },
  { id: "att-24", name: "백준우", email: "junwoo@gmail.com", checkedIn: false, seat: "A-06", eventId: "evt-06", status: "CONFIRMED" },
  { id: "att-25", name: "유하은", email: "haeun2@naver.com", checkedIn: false, seat: "B-08", eventId: "evt-06", status: "CONFIRMED" },
  { id: "att-26", name: "남태현", email: "taehyun@daum.net", checkedIn: false, seat: "A-07", eventId: "evt-07", status: "CONFIRMED" },
  { id: "att-27", name: "심지성", email: "jisung@gmail.com", checkedIn: false, seat: "B-10", eventId: "evt-07", status: "CONFIRMED" },
  { id: "att-28", name: "노다은", email: "daeun@naver.com", checkedIn: false, seat: "A-10", eventId: "evt-08", status: "CONFIRMED" },
  { id: "att-29", name: "하재형", email: "jaehyung@gmail.com", checkedIn: false, seat: "A-11", eventId: "evt-09", status: "CONFIRMED" },
  { id: "att-30", name: "곽지혜", email: "jihye@daum.net", checkedIn: false, seat: "A-13", eventId: "evt-10", status: "CONFIRMED" }
];

// Private memos (Error 6 Target)
const attendeeMemos = {
  "att-01": "식품 알레르기 있음(견과류). 도시락 별도 배부 요망.",
  "att-02": "VIP 연사. 공항 마중 의전 동선 배정 필요.",
  "att-03": "촬영 거부 요청자. 공식 미디어 노출 방지 대기 필요."
};

// Notices
let notices = [
  { id: "not-01", title: "AI 심포지엄 입장 등록 안내", content: "행사 당일 09:30부터 웰컴 데스크에서 QR 입장권 교부가 시작됩니다." }
];

// API: Get events
app.get('/api/events', (req, res) => {
  res.json(events);
});

// API: Add event
app.post('/api/events', (req, res) => {
  const { title, location, date } = req.body;
  const newEvt = {
    id: `evt-${Date.now()}`,
    title,
    location,
    date,
    registeredCount: 0
  };
  events.push(newEvt);
  res.json(newEvt);
});

// API: Get programs
app.get('/api/programs', (req, res) => {
  res.json(programs);
});

// API: Add program
app.post('/api/programs', (req, res) => {
  const { eventId, title, time } = req.body;
  const newPrg = {
    id: `prg-${Date.now()}`,
    eventId,
    title,
    time,
    registeredCount: 0
  };
  programs.push(newPrg);
  res.json(newPrg);
});

// API: Patch program (Error 4 Target - 3s delay)
app.patch('/api/programs/:id', (req, res) => {
  const { id } = req.params;
  const { title, time } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 프로그램 정보 수정(PATCH) 처리를 3초 지연시킵니다. 
  // 수정 누른 직후 삭제(0.1초 완료)를 가해 디비에서 없어졌음에도, 3초 뒤 수정 콜백이 
  // 객체를 재생성(Resurrect)해 복구 등록해버리는 경합 상태 유발 결함입니다.
  setTimeout(() => {
    let prog = programs.find(p => p.id === id);
    if (!prog) {
      prog = { id, eventId: "evt-01", title, time, registeredCount: 0 };
      programs.push(prog);
    } else {
      prog.title = title;
      prog.time = time;
    }
    res.json({ success: true, program: prog });
  }, 3000);
});

// API: Delete program (Error 4 Target - 0.1s delay)
app.delete('/api/programs/:id', (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    programs = programs.filter(p => p.id !== id);
    res.json({ success: true });
  }, 100);
});

// API: Get attendees list
app.get('/api/attendees', (req, res) => {
  res.json(attendees);
});

// API: Search attendees (Error 2 Target - search delay race condition)
app.get('/api/attendees/search', (req, res) => {
  const { q } = req.query;
  let filtered = attendees;

  if (q) {
    filtered = filtered.filter(a => a.name.includes(q) || a.email.includes(q));
  }

  let delay = 100;
  if (q === '김') {
    delay = 3000; // 3s delay
  } else if (q === '이') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: '김' 검색어는 3초, '이'는 0.2초 지연을 부여합니다. 
  // 구형 결과(김)가 최종적으로 화면을 덮어쓰고, 참가자 정보 상세는 민사 이서연(att-02)을 
  // 계속 가리키는 화면 데이터 대조 불일치 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(filtered);
  }, delay);
});

// API: Get attendee private memo (Error 6 Target)
app.get('/api/attendees/:id/memo', (req, res) => {
  const { id } = req.params;
  const memoText = attendeeMemos[id] || "기재된 특이사항 피드백 메모가 없습니다.";
  res.json({ memo: memoText });
});

// API: Patch attendee seat (Error 1 Target - 3s delay)
app.patch('/api/attendees/:id/seat', (req, res) => {
  const { id } = req.params;
  const { seat } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 좌석 수정(PATCH) 처리를 3초 지연합니다. 
  // 클라이언트가 0.1초 만에 실행하는 체크인 요청(oldSeat 함장)에 의해 
  // 3초 뒤에 완료되는 좌석 배정이 최종 롤백 오버라이트되는 레이스 결함입니다.
  setTimeout(() => {
    const att = attendees.find(a => a.id === id);
    if (att) {
      att.seat = seat;
      console.log(`[DB SEAT UPDATE] Seat for ${id} set to ${seat}`);
    }
    res.json({ success: true, attendee: att });
  }, 3000);
});

// API: Post check-in (Error 1 Target - 0.1s delay, overwriting seat)
app.post('/api/attendees/:id/checkin', (req, res) => {
  const { id } = req.params;
  const { checkedIn, seat } = req.body; // Client sends current/old seat value at dispatch time

  setTimeout(() => {
    const att = attendees.find(a => a.id === id);
    if (att) {
      att.checkedIn = checkedIn;
      if (seat) {
        att.seat = seat; // Overwrites the seat back to old seat!
      }
      console.log(`[DB CHECKIN] Checked-in status of ${id} to ${checkedIn}, seat reverted to ${seat}`);
    }
    res.json({ success: true, attendee: att });
  }, 100);
});

// API: Cancel attendee registration (Error 3 Target - count leak)
app.post('/api/attendees/:id/cancel', (req, res) => {
  const { id } = req.params;
  const att = attendees.find(a => a.id === id);

  if (att) {
    att.status = "CANCELLED";
    att.checkedIn = false;

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 참가 등록 취소 시, 연계된 행사(`eventId`)의 총 신청자 
    // 누산 카운터(`registeredCount`) 수치를 차감하지 않고 보존하여 
    // 취소되었는데도 여석 정보가 환원되지 않는 카운트 유출 결함입니다.
    console.log(`[DB REGISTRATION CANCEL] Cancelled attendee ${id}. BUT registeredCount remains untouched!`);
  }

  res.json({ success: true });
});

// API: Get notices
app.get('/api/notices', (req, res) => {
  res.json(notices);
});

// API: Add notice
app.post('/api/notices', (req, res) => {
  const { title, content } = req.body;
  const newNot = {
    id: `not-${Date.now()}`,
    title,
    content
  };
  notices.push(newNot);
  res.json(newNot);
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  events = [
    { id: "evt-01", title: "2026 서울 국제 AI 심포지엄", location: "코엑스 그랜드볼룸", date: "2026-08-10", registeredCount: 8 },
    { id: "evt-02", title: "글로벌 청년 창업 부트캠프", location: "드림플러스 강남", date: "2026-08-15", registeredCount: 6 },
    { id: "evt-03", title: "메타버스 테너 데모 데이", location: "상암 누리꿈스퀘어", date: "2026-08-20", registeredCount: 4 }
  ];
  programs = [
    { id: "prg-01", eventId: "evt-01", title: "오프닝 키노트: AGI의 미래", time: "10:00", registeredCount: 8 },
    { id: "prg-02", eventId: "evt-01", title: "패널 토론: 생성형 AI 윤리", time: "11:30", registeredCount: 6 },
    { id: "prg-03", eventId: "evt-02", title: "스타트업 피칭 101", time: "14:00", registeredCount: 6 }
  ];
  attendees = [
    { id: "att-01", name: "김민준", email: "minjun@gmail.com", checkedIn: false, seat: "A-12", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-02", name: "이서연", email: "seoyeon@naver.com", checkedIn: true, seat: "A-15", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-03", name: "박지우", email: "jiwoo@daum.net", checkedIn: false, seat: "B-03", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-04", name: "최예준", email: "yejun@gmail.com", checkedIn: false, seat: "B-05", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-05", name: "정지유", email: "jiyu@naver.com", checkedIn: true, seat: "C-01", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-06", name: "강도현", email: "dohyen@gmail.com", checkedIn: false, seat: "C-04", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-07", name: "조하은", email: "haeun@naver.com", checkedIn: false, seat: "D-02", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-08", name: "윤도윤", email: "doyun@gmail.com", checkedIn: false, seat: "D-08", eventId: "evt-01", status: "CONFIRMED" },
    { id: "att-09", name: "장민지", email: "minji@daum.net", checkedIn: false, seat: "A-01", eventId: "evt-02", status: "CONFIRMED" },
    { id: "att-10", name: "임주원", email: "juwon@gmail.com", checkedIn: false, seat: "A-05", eventId: "evt-02", status: "CONFIRMED" },
    { id: "att-11", name: "한지한", email: "jihan@naver.com", checkedIn: false, seat: "B-01", eventId: "evt-02", status: "CONFIRMED" },
    { id: "att-12", name: "오수아", email: "sua@gmail.com", checkedIn: false, seat: "B-07", eventId: "evt-02", status: "CONFIRMED" }
  ];
  notices = [
    { id: "not-01", title: "AI 심포지엄 입장 등록 안내", content: "행사 당일 09:30부터 웰컴 데스크에서 QR 입장권 교부가 시작됩니다." }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[EventPilot Backend] Express server running on http://localhost:${PORT}`);
});
