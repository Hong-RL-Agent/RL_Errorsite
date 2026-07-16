import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5039;

app.use(cors());
app.use(express.json());

// Meetings Database (12 initial meetings)
let meetings = [
  { id: "meet-01", title: "Q3 디자인 시스템 검토 회의", description: "컴포넌트 라이브러리 리팩토링 검토", date: "2026-07-13", time: "10:00", duration: "60", host: "김민재 팀장", participants: ["김민재", "이서현", "박지성"] },
  { id: "meet-02", title: "스프린트 플래닝 회의", description: "여름 릴리즈 피처 태스크 조율", date: "2026-07-13", time: "14:00", duration: "90", host: "이서현 PO", participants: ["이서현", "박지성", "최강림", "장하은"] },
  { id: "meet-03", title: "마케팅 채널 성과 보고", description: "광고 매체 효율 정산 분석", date: "2026-07-14", time: "11:00", duration: "45", host: "정다은 사원", participants: ["정다은", "이서현", "손흥민"] },
  { id: "meet-04", title: "백엔드 API 최적화 조율", description: "쿼리 캐싱 및 인덱스 튜닝 회의", date: "2026-07-14", time: "16:00", duration: "60", host: "박지성 파트장", participants: ["박지성", "최강림", "황희찬"] },
  { id: "meet-05", title: "CEO 타운홀 미팅", description: "하반기 전략 로드맵 및 전사 Q&A", date: "2026-07-15", time: "09:30", duration: "120", host: "홍길동 대표", participants: ["홍길동", "김민재", "이서현", "박지성", "장하은"] },
  { id: "meet-06", title: "모바일 앱 UI/UX 피드백", description: "고객 온보딩 과정 디자인 피드백", date: "2026-07-15", time: "15:00", duration: "60", host: "이서현 PO", participants: ["이서현", "정다은", "이강인"] },
  { id: "meet-07", title: "신규 채용 1차 기술 면접", description: "백엔드 경력 개발자 유선 면접", date: "2026-07-16", time: "13:00", duration: "50", host: "박지성 파트장", participants: ["박지성", "최강림"] },
  { id: "meet-08", title: "보안 컴플라이언스 점검", description: "ISO 27001 인증 심사 리허설", date: "2026-07-16", time: "15:30", duration: "60", host: "장하은 정보보안관", participants: ["장하은", "홍길동", "황희찬"] },
  { id: "meet-09", title: "서비스 아키텍처 브레인스토밍", description: "마이크로서비스 전환 및 메시징 큐 구상", date: "2026-07-17", time: "10:30", duration: "90", host: "박지성 파트장", participants: ["박지성", "최강림", "이서현"] },
  { id: "meet-10", title: "주간 스프린트 회고", description: "개발 완료 건 검증 및 미진사항 논의", date: "2026-07-17", time: "17:00", duration: "60", host: "이서현 PO", participants: ["이서현", "박지성", "최강림", "김민재"] },
  { id: "meet-11", title: "해외 지사 협업 글로벌 싱크", description: "미국 딜러십 계약 관련 정기 주간 회의", date: "2026-07-18", time: "09:00", duration: "60", host: "홍길동 대표", participants: ["홍길동", "손흥민", "이강인"] },
  { id: "meet-12", title: "주말 장애 복구 대비 당직 회의", description: "IDC 점검 대응 매뉴얼 배포", date: "2026-07-19", time: "16:00", duration: "30", host: "최강림 대리", participants: ["최강림", "황희찬"] }
];

// Recordings Database
let recordings = [
  { id: "rec-01", meetingId: "meet-01", filename: "Q3_design_system_review.mp4", duration: "60분", size: "152MB", date: "2026-07-13" },
  { id: "rec-02", meetingId: "meet-02", filename: "sprint_planning_2026_07_13.mp4", duration: "90분", size: "228MB", date: "2026-07-13" }
];

// API: Get Meetings
app.get('/api/meetings', (req, res) => {
  res.json(meetings);
});

// API: Create Meeting (Error 3)
app.post('/api/meetings', (req, res) => {
  const { title, description, date, time, duration, host, participants } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 회의를 생성할 때 제목(title)은 비어 있고 설명(description) 내용만 기입해 
  // 전송한 경우, 백엔드 문자열 NullPointerException 예외 처리를 유도하여 HTTP 500 에러를 반환합니다.
  if (!title && description) {
    return res.status(500).json({
      error: "Internal Server Error: NullPointerException - Meeting title column constraint violated when description details are present."
    });
  }

  if (!title) {
    return res.status(400).json({ error: "회의 제목은 필수입니다." });
  }

  const newMeeting = {
    id: `meet-${Date.now()}`,
    title,
    description: description || "",
    date: date || "2026-07-13",
    time: time || "12:00",
    duration: duration || "60",
    host: host || "익명 호스트",
    participants: participants || [host || "익명 호스트"]
  };

  meetings.push(newMeeting);
  res.status(201).json(newMeeting);
});

// API: Reschedule Meeting (Error 2)
app.put('/api/meetings/:id', (req, res) => {
  const { id } = req.params;
  const { title, date, time, duration } = req.body;

  const originalIndex = meetings.findIndex(m => m.id === id);
  if (originalIndex === -1) {
    return res.status(404).json({ error: "회의를 찾을 수 없습니다." });
  }

  const original = meetings[originalIndex];

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 일정 변경(PUT) 요청 시, 기존 데이터 배열 위치를 덮어쓰거나 지우는 대신 
  // 신규 시간 일정이 박힌 복제 레코드를 DB 배열에 push하고 기존 스케줄도 그대로 살려두어 
  // 캘린더 상에 수정 전 시간과 수정 후 시간이 모두 중복 출력되도록 결함을 유발합니다.
  const duplicatedWithNewTime = {
    ...original,
    id: `meet-${Date.now()}`, // Create duplicate with fresh ID
    date: date || original.date,
    time: time || original.time,
    duration: duration || original.duration
  };

  meetings.push(duplicatedWithNewTime);
  res.json({ success: true, meetings });
});

// API: Delete Meeting
app.delete('/api/meetings/:id', (req, res) => {
  const { id } = req.params;
  meetings = meetings.filter(m => m.id !== id);
  res.json({ success: true, meetings });
});

// API: Get Recordings
app.get('/api/recordings', (req, res) => {
  res.json(recordings);
});

// API: Save Recording (Error 6)
app.post('/api/recordings', (req, res) => {
  const { meetingId, title } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Infrastructure
  // DESCRIPTION: 회의 녹화 생성 시, 서버 시스템에 실재하지 않는 디바이스 물리 경로인 
  // '/var/meetdeck/recordings/...' 절대경로를 가리키며 쓰기 명령을 수행하여 
  // 시스템 디렉터리 부재 예외(ENOENT)를 서버 콘솔에 던지고 HTTP 500 장애를 발생시킵니다.
  const targetPath = `/var/meetdeck/recordings/rec-${meetingId}.mp4`;
  console.log(`[INFRASTRUCTURE ERROR] Attempting write to directory path: ${targetPath}`);

  return res.status(500).json({
    error: `Infrastructure Error: Path directory not found: ${targetPath}. The directory '/var/meetdeck/recordings' does not exist on this host filesystem.`
  });
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  meetings = [
    { id: "meet-01", title: "Q3 디자인 시스템 검토 회의", description: "컴포넌트 라이브러리 리팩토링 검토", date: "2026-07-13", time: "10:00", duration: "60", host: "김민재 팀장", participants: ["김민재", "이서현", "박지성"] },
    { id: "meet-02", title: "스프린트 플래닝 회의", description: "여름 릴리즈 피처 태스크 조율", date: "2026-07-13", time: "14:00", duration: "90", host: "이서현 PO", participants: ["이서현", "박지성", "최강림", "장하은"] },
    { id: "meet-03", title: "마케팅 채널 성과 보고", description: "광고 매체 효율 정산 분석", date: "2026-07-14", time: "11:00", duration: "45", host: "정다은 사원", participants: ["정다은", "이서현", "손흥민"] },
    { id: "meet-04", title: "백엔드 API 최적화 조율", description: "쿼리 캐싱 및 인덱스 튜닝 회의", date: "2026-07-14", time: "16:00", duration: "60", host: "박지성 파트장", participants: ["박지성", "최강림", "황희찬"] },
    { id: "meet-05", title: "CEO 타운홀 미팅", description: "하반기 전략 로드맵 및 전사 Q&A", date: "2026-07-15", time: "09:30", duration: "120", host: "홍길동 대표", participants: ["홍길동", "김민재", "이서현", "박지성", "장하은"] },
    { id: "meet-06", title: "모바일 앱 UI/UX 피드백", description: "고객 온보딩 과정 디자인 피드백", date: "2026-07-15", time: "15:00", duration: "60", host: "이서현 PO", participants: ["이서현", "정다은", "이강인"] },
    { id: "meet-07", title: "신규 채용 1차 기술 면접", description: "백엔드 경력 개발자 유선 면접", date: "2026-07-16", time: "13:00", duration: "50", host: "박지성 파트장", participants: ["박지성", "최강림"] },
    { id: "meet-08", title: "보안 컴플라이언스 점검", description: "ISO 27001 인증 심사 리허설", date: "2026-07-16", time: "15:30", duration: "60", host: "장하은 정보보안관", participants: ["장하은", "홍길동", "황희찬"] },
    { id: "meet-09", title: "서비스 아키텍처 브레인스토밍", description: "마이크로서비스 전환 및 메시징 큐 구상", date: "2026-07-17", time: "10:30", duration: "90", host: "박지성 파트장", participants: ["박지성", "최강림", "이서현"] },
    { id: "meet-10", title: "주간 스프린트 회고", description: "개발 완료 건 검증 및 미진사항 논의", date: "2026-07-17", time: "17:00", duration: "60", host: "이서현 PO", participants: ["이서현", "박지성", "최강림", "김민재"] },
    { id: "meet-11", title: "해외 지사 협업 글로벌 싱크", description: "미국 딜러십 계약 관련 정기 주간 회의", date: "2026-07-18", time: "09:00", duration: "60", host: "홍길동 대표", participants: ["홍길동", "손흥민", "이강인"] },
    { id: "meet-12", title: "주말 장애 복구 대비 당직 회의", description: "IDC 점검 대응 매뉴얼 배포", date: "2026-07-19", time: "16:00", duration: "30", host: "최강림 대리", participants: ["최강림", "황희찬"] }
  ];
  recordings = [
    { id: "rec-01", meetingId: "meet-01", filename: "Q3_design_system_review.mp4", duration: "60분", size: "152MB", date: "2026-07-13" },
    { id: "rec-02", meetingId: "meet-02", filename: "sprint_planning_2026_07_13.mp4", duration: "90분", size: "228MB", date: "2026-07-13" }
  ];
  res.json({ success: true, meetings, recordings });
});

app.listen(PORT, () => {
  console.log(`[MeetDeck Backend] Express server running on http://localhost:${PORT}`);
});
