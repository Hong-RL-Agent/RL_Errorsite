import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5049;

app.use(cors());
app.use(express.json());

// Packages Catalog (Minimum 12 items)
let packages = [
  // 유럽 (Europe)
  { id: "pack-01", title: "서유럽 3국 7일 클래식 투어", destination: "유럽", duration: 7, price: 2990000, theme: "관광", schedule: ["1일차: 런던 히드로 공항 도착 후 호텔 투숙", "2일차: 대영박물관 및 런던 타워브릿지 도보 투어", "3일차: 유로스타 탑승 후 파리 이동, 세느강 유람선", "4일차: 루브르 박물관 및 에펠탑 전망대 관람", "5일차: 프랑스 초고속열차 TGV 탑승 후 스위스 융프라우 요들 감상", "6일차: 알프스 등반 및 취리히 시내 관광", "7일차: 취리히 출발 및 귀국 비행"] },
  { id: "pack-02", title: "이탈리아 일주 9일 감성 기행", destination: "유럽", duration: 9, price: 3490000, theme: "힐링", schedule: ["1일차: 로마 피우미치노 공항 미팅", "2일차: 콜로세움 및 바티칸 시국 가이드 투어", "3일차: 피렌체 이동 및 두오모 성당 관람", "4일차: 베네치아 곤돌라 및 산마르코 광장", "5일차: 밀라노 대성당 및 쇼핑 스트리트", "6일차: 남부 나폴리 및 폼페이 유적지", "7일차: 아말피 해안도로 렌트카 투어", "8일차: 토스카나 와이너리 투어", "9일차: 로마 출발 귀국"] },
  { id: "pack-03", title: "동유럽 프라하·비엔나 6일 로맨틱 패키지", destination: "유럽", duration: 6, price: 2490000, theme: "관광", schedule: ["1일차: 프라하 바츨라프 공항 투숙", "2일차: 프라하성 및 까를교 야경 워킹투어", "3일차: 체스키크롬로프 동화마을 산책", "4일차: 오스트리아 비엔나 쉔브룬 궁전 관람", "5일차: 짤즈부르크 사운드오브뮤직 투어", "6일차: 비엔나 출발 귀국"] },

  // 동남아 (Southeast Asia)
  { id: "pack-04", title: "방콕·파타야 5일 가성비 풀빌라 패키지", destination: "동남아", duration: 5, price: 890000, theme: "힐링", schedule: ["1일차: 방콕 수완나품 공항 가이드 샌딩 및 체크인", "2일차: 왓포 사원 관람 및 전통 타이 마사지", "3일차: 파타야 이동 후 요트 크루즈 및 스노클링", "4일차: 알카자쇼 관람 및 야시장 자유 시간", "5일차: 방콕 시내 면세점 쇼핑 후 귀국"] },
  { id: "pack-05", title: "다낭·호이안 4일 럭셔리 마사지 패키지", destination: "동남아", duration: 4, price: 790000, theme: "힐링", schedule: ["1일차: 다낭 공항 도착 및 한강 용다리 야경 관람", "2일차: 바나힐 국립공원 골든브릿지 케이블카 탑승", "3일차: 호이안 올드타운 유네스코 등불 야경 및 소원배 투어", "4일차: 미케비치 자유 일광욕 후 귀국편 탑승"] },
  { id: "pack-06", title: "싱가포르 센토사 5일 액티비티 투어", destination: "동남아", duration: 5, price: 1590000, theme: "액티비티", schedule: ["1일차: 창이 공항 쥬얼창이 폭포 관람", "2일차: 유니버셜 스튜디오 싱가포르 전일 자유이용권", "3일차: 가든스바이더베이 슈퍼트리쇼 및 마리나베이샌즈 전망대", "4일차: 루지 체험 및 실로소 비치 클럽 바베큐 파티", "5일차: 귀국 비행기 탑승"] },

  // 일본 (Japan)
  { id: "pack-07", title: "도쿄 디즈니랜드 4일 도심 라이프", destination: "일본", duration: 4, price: 1190000, theme: "액티비티", schedule: ["1일차: 나리타 공항 도착 후 신주쿠 호텔 체크인", "2일차: 도쿄 디즈니랜드 어트랙션 올데이 패스", "3일차: 시부야 스카이 및 하라주쿠 빈티지 쇼핑 투어", "4일차: 아사쿠사 센소지 신사 관람 후 귀국"] },
  { id: "pack-08", title: "오사카·교토·나라 4일 식도락 패키지", destination: "일본", duration: 4, price: 990000, theme: "관광", schedule: ["1일차: 간사이 공항 미팅 후 도톤보리 타코야끼 맛집 투어", "2일차: 유니버셜 스튜디오 재팬 익스프레스 투어", "3일차: 교토 청수사 및 기요미즈데라 전통 가옥 투어", "4일차: 나라 사슴 공원 관람 후 샌딩 귀국"] },
  { id: "pack-09", title: "홋카이도 삿포로 4일 설원 온천 힐링", destination: "일본", duration: 4, price: 1390000, theme: "힐링", schedule: ["1일차: 신치토세 공항 도착 후 노보리베츠 지옥계곡 온천 투숙", "2일차: 오타루 운하 오르골당 산책 및 초밥 시식", "3일차: 비에이 청의 호수 및 흰수염폭포 설경 눈꽃 투어", "4일차: 삿포로 시내 맥주 박물관 관람 후 귀국"] },

  // 미주 (Americas)
  { id: "pack-10", title: "미서부 그랜드캐년 8일 로드 트립", destination: "미주", duration: 8, price: 2790000, theme: "액티비티", schedule: ["1일차: 로스앤젤레스 공항 미팅 및 할리우드 거리 투어", "2일차: 유니버셜 스튜디오 헐리우드 관람", "3일차: 라스베이거스 벨라지오 분수쇼 관람", "4일차: 그랜드캐년 헬기 투어 및 엔텔로프 캐년 트래킹", "5일차: 브라이스캐년 및 자이언 국립공원 트레일", "6일차: 아울렛 쇼핑 및 베니스 비치 산책", "7일차: 산타모니카 해변 자유 시간", "8일차: LA 출발 귀국"] },
  { id: "pack-11", title: "하와이 와이키키 6일 허니문 패키지", destination: "미주", duration: 6, price: 2190000, theme: "힐링", schedule: ["1일차: 호놀룰루 공항 마중 레이 헌화식 및 호텔 투숙", "2일차: 오아후 섬 일주 투어 및 하나우마베이 스노클링", "3일차: 와이키키 비치 서핑 레슨 및 트롤리 시내 투어", "4일차: 렌트카 자유 드라이브 코스 및 폴리네시안 센터 디너", "5일차: 아웃렛 면세 쇼핑 및 일몰 루아우 쇼", "6일차: 귀국 비행기 탑승"] },
  { id: "pack-12", title: "뉴욕 맨해튼 6일 스마트 투어 패키지", destination: "미주", duration: 6, price: 2590000, theme: "관광", schedule: ["1일차: JFK 공항 도착 후 타임스퀘어 야경 관람", "2일차: 자유의 여신상 크루즈 및 엠파이어 스테이트 빌딩", "3일차: 브루클린 브릿지 도보 횡단 및 덤보 스냅 촬영", "4일차: 메트로폴리탄 미술관 도슨트 투어 및 브로드웨이 뮤지컬", "5일차: 센트럴 파크 피크닉 및 소호 명품 거리 쇼핑", "6일차: 뉴욕 출발 귀국"] }
];

// Reservations DB
let reservations = [
  { id: "resv-01", packageId: "pack-01", date: "2026-07-25", passengers: 2, hotel: "Standard Hotel", flight: "대한항공 (일반)", status: "예약 완료", passportNumber: "M12345678" }
];

// Calendar events synced to booking (Error 5 Target)
let calendarEvents = [
  { id: "cal-01", reservationId: "resv-01", title: "서유럽 3국 패키지 여행 출발일", date: "2026-07-25" },
  { id: "cal-02", reservationId: "resv-01", title: "영국 런던 2일차 도보 투어 스케줄", date: "2026-07-26" }
];

// Alerts logs synced to booking (Error 5 Target)
let alerts = [
  { id: "not-01", reservationId: "resv-01", message: "서유럽 7일 항공 발권이 확정되었습니다. 마이페이지에서 E-티켓을 다운로드 받으세요.", time: "오후 5:30" }
];

// API: Get Packages (Error 2 Search filter race condition)
app.get('/api/packages', (req, res) => {
  const { destination } = req.query;
  let delay = 100;

  // Simulate network speeds for race condition
  if (destination === '유럽') {
    delay = 3000;
  } else if (destination === '동남아') {
    delay = 1000;
  } else if (destination === '일본') {
    delay = 200;
  }

  setTimeout(() => {
    let filtered = packages;
    if (destination) {
      filtered = packages.filter(p => p.destination === destination);
    }
    res.json({ destination, results: filtered });
  }, delay);
});

// API: Get Reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// API: Create Reservation (Error 6 passport validation 400 bypass)
app.post('/api/reservations', (req, res) => {
  const { packageId, date, passengers, hotel, flight, passportNumber } = req.body;
  const newResv = {
    id: `resv-${Date.now()}`,
    packageId,
    date,
    passengers: Number(passengers),
    hotel,
    flight,
    status: "예약 완료",
    passportNumber
  };

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 여권 정보 검증 실패 시 HTTP 400 Bad Request를 반환하여 
  // 클라이언트에는 등록이 실패된 척 오인시키지만, 실제 데이터베이스 메모리 구조(`reservations` 배열)에는 
  // 에러 발생한 탑승객 정보를 지우지 않고 정상 밀어 넣어 보관하는 필터 회피 결함입니다.
  if (!passportNumber || passportNumber.length < 8) {
    reservations.push(newResv);
    
    // Add a corresponding notification to show it went through
    alerts.push({
      id: `not-${Date.now()}`,
      reservationId: newResv.id,
      message: `[여권 오류 긴급 접수] ${passportNumber || '공백'}에 의해 임시 등록 상태가 되었습니다.`,
      time: new Date().toLocaleTimeString()
    });

    console.log(`[PASSPORT FAILURE BREACH] Invalid passport ${passportNumber}. Returned 400 but saved reservation ${newResv.id}!`);
    return res.status(400).json({
      error: "오류: 여권 번호 형식이 틀렸습니다 (8자 이상 영문숫자 혼합 필수)."
    });
  }

  reservations.push(newResv);
  console.log(`[DB RESERVATION] New travel booking ${newResv.id} saved.`);
  
  // Normal calendar and alert creations
  calendarEvents.push({
    id: `cal-${Date.now()}`,
    reservationId: newResv.id,
    title: "신규 예약 패키지 출발 일정",
    date
  });
  
  res.json({ success: true, reservation: newResv });
});

// API: Change reservation date (Error 3 reservation date change cancel race)
app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { date, packageId, passengers, hotel, flight } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 예약 날짜 변경 연산에 3000ms(3초) 고의 지연 연산을 부여합니다.
  // 날짜 변경 버튼 클릭 직후 예약 취소(DELETE, 0.1초 완료)를 연계 구동시키면 취소 응답은 성공하지만,
  // 3초 뒤 깨어난 변경 스레드가 기존 데이터를 덮어써 신규 날짜로 예약을 다시 부활시켜 버립니다.
  setTimeout(() => {
    const resv = reservations.find(r => r.id === id);
    if (resv) {
      resv.date = date;
      console.log(`[DB RESERVATION] Updated date to: ${date}`);
    } else {
      // Recreate deleted booking
      reservations.push({
        id,
        packageId: packageId || "pack-01",
        date,
        passengers: passengers || 2,
        hotel: hotel || "Standard Hotel",
        flight: flight || "대한항공 (일반)",
        status: "예약 완료 (변경 지연 복구)"
      });
      console.log(`[DB RESERVATION RACE] Resurrected canceled reservation ${id} due to delayed update!`);
    }
  }, 3000);

  res.json({ success: true });
});

// API: Cancel/Delete Reservation (Error 3 cancels in 0.1s & Error 5 leaves calendar/alerts)
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  
  // Filter out reservation
  reservations = reservations.filter(r => r.id !== id);
  console.log(`[DB RESERVATION] Booking ${id} deleted.`);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 패키지 예약을 삭제할 때 연관 데이터베이스 테이블 무결성 규칙(Cascade)을 
  // 이행하지 않아, 이미 파기된 예약의 상세 일정 타임라인(`calendarEvents`) 및 관련 알림 메시지(`alerts`)를 
  // 지우지 않고 잔존시켜 마이페이지 일정 및 알림판에 껍데기 잔해가 계속 뜨게 방치합니다.
  
  res.json({ success: true });
});

// API: Get Calendar Events
app.get('/api/calendar', (req, res) => {
  res.json(calendarEvents);
});

// API: Get Alerts
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  reservations = [
    { id: "resv-01", packageId: "pack-01", date: "2026-07-25", passengers: 2, hotel: "Standard Hotel", flight: "대한항공 (일반)", status: "예약 완료", passportNumber: "M12345678" }
  ];
  calendarEvents = [
    { id: "cal-01", reservationId: "resv-01", title: "서유럽 3국 패키지 여행 출발일", date: "2026-07-25" },
    { id: "cal-02", reservationId: "resv-01", title: "영국 런던 2일차 도보 투어 스케줄", date: "2026-07-26" }
  ];
  alerts = [
    { id: "not-01", reservationId: "resv-01", message: "서유럽 7일 항공 발권이 확정되었습니다. 마이페이지에서 E-티켓을 다운로드 받으세요.", time: "오후 5:30" }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[JourneyMix Backend] Express server running on http://localhost:${PORT}`);
});
