import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

// Tickets database (Minimum 20 items)
let tickets = [
  { id: "tick-01", title: "로그인 세션 만료 시간 연장 요청 건", status: "OPEN", priority: "MEDIUM", assignee: "상담원 B", customerName: "이강민", customerPhone: "010-9876-5432", customerEmail: "kangmin@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 45, memos: [], replies: [] },
  { id: "tick-02", title: "[긴급] 결제 승인 후 영수증 메일 미발송 오류", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "장지훈", customerPhone: "010-1122-3344", customerEmail: "jihoon_vip@naver.com", vipTier: "VIP", slaHours: 4, slaProgress: 80, memos: [{ id: "memo-101", text: "카드사 대조 검증 필요함.", date: "오후 2:30" }], replies: [] },
  { id: "tick-03", title: "모바일 앱 푸시 알림 비활성화 해제 문의", status: "RESOLVED", priority: "LOW", assignee: "상담원 B", customerName: "최영희", customerPhone: "010-5566-7788", customerEmail: "younghee@daum.net", vipTier: "GENERAL", slaHours: 48, slaProgress: 100, memos: [], replies: [{ author: "상담원 B", text: "설정 메뉴 내 알림 수신 동의를 체크해 주시기 바랍니다." }] },
  { id: "tick-04", title: "환불 계좌 정보 오입력 수정 요청", status: "OPEN", priority: "HIGH", assignee: "상담원 A", customerName: "황정식", customerPhone: "010-8899-0011", customerEmail: "jshwang@naver.com", vipTier: "VIP", slaHours: 12, slaProgress: 15, memos: [], replies: [] },
  { id: "tick-05", title: "서비스 이용약관 변경 내역 자료 요청", status: "IN_PROGRESS", priority: "LOW", assignee: "상담원 C", customerName: "정수진", customerPhone: "010-4433-2211", customerEmail: "sujin_jeong@gmail.com", vipTier: "GENERAL", slaHours: 72, slaProgress: 30, memos: [], replies: [] },
  { id: "tick-06", title: "API 토큰 갱신 주기 연장 문의", status: "OPEN", priority: "MEDIUM", assignee: "상담원 B", customerName: "윤지환", customerPhone: "010-7788-9900", customerEmail: "jihwan_yoon@daum.net", vipTier: "GENERAL", slaHours: 24, slaProgress: 8, memos: [], replies: [] },
  { id: "tick-07", title: "[VIP 전용] 정기 결제 플랜 단체 할인 혜택", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "한동수", customerPhone: "010-2233-4455", customerEmail: "dongsoo_han@vip.com", vipTier: "VIP", slaHours: 6, slaProgress: 95, memos: [], replies: [] },
  { id: "tick-08", title: "계정 탈퇴 시 잔여 마일리지 양도 가능 여부", status: "RESOLVED", priority: "LOW", assignee: "상담원 C", customerName: "김서아", customerPhone: "010-3344-5566", customerEmail: "seoa_kim@naver.com", vipTier: "GENERAL", slaHours: 48, slaProgress: 100, memos: [], replies: [] },
  { id: "tick-09", title: "데이터 내보내기 백업 파일 오류 재추출 건", status: "OPEN", priority: "MEDIUM", assignee: "상담원 B", customerName: "조민수", customerPhone: "010-9900-1122", customerEmail: "minsu_cho@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 55, memos: [], replies: [] },
  { id: "tick-10", title: "보안 비밀번호 변경 5회 시도 초과 잠금", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "박도현", customerPhone: "010-1234-5678", customerEmail: "dohyun_vip@naver.com", vipTier: "VIP", slaHours: 2, slaProgress: 75, memos: [], replies: [] },
  
  // Additional tickets to reach 20
  { id: "tick-11", title: "비밀번호 재설정 이메일 인증 링크 누락", status: "OPEN", priority: "HIGH", assignee: "상담원 B", customerName: "송민우", customerPhone: "010-4567-8901", customerEmail: "minwoosong@daum.net", vipTier: "GENERAL", slaHours: 12, slaProgress: 10, memos: [], replies: [] },
  { id: "tick-12", title: "대량 메일 솔루션 연동 사양 질의", status: "IN_PROGRESS", priority: "MEDIUM", assignee: "상담원 C", customerName: "임채린", customerPhone: "010-5678-9012", customerEmail: "chaerin@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 40, memos: [], replies: [] },
  { id: "tick-13", title: "법무팀 컴플라이언스 서류 회신", status: "RESOLVED", priority: "HIGH", assignee: "상담원 A", customerName: "배윤재", customerPhone: "010-6789-0123", customerEmail: "yjbae_vip@naver.com", vipTier: "VIP", slaHours: 8, slaProgress: 100, memos: [], replies: [] },
  { id: "tick-14", title: "관리자 서브 계정 추가 발급 가이드", status: "OPEN", priority: "LOW", assignee: "상담원 B", customerName: "강성호", customerPhone: "010-7890-1234", customerEmail: "sungho@daum.net", vipTier: "GENERAL", slaHours: 48, slaProgress: 5, memos: [], replies: [] },
  { id: "tick-15", title: "스토리지 한도 초과 경고 해결 요청", status: "IN_PROGRESS", priority: "MEDIUM", assignee: "상담원 C", customerName: "신지혜", customerPhone: "010-8901-2345", customerEmail: "jihye@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 60, memos: [], replies: [] },
  { id: "tick-16", title: "신규 크레딧 충전 결제 수단 누락 오류", status: "OPEN", priority: "HIGH", assignee: "상담원 A", customerName: "문승우", customerPhone: "010-9012-3456", customerEmail: "seungwoo@vip.com", vipTier: "VIP", slaHours: 4, slaProgress: 90, memos: [], replies: [] },
  { id: "tick-17", title: "협력업체 대시보드 권한 부여 절차", status: "RESOLVED", priority: "MEDIUM", assignee: "상담원 B", customerName: "안하은", customerPhone: "010-2109-8765", customerEmail: "haeun@naver.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 100, memos: [], replies: [] },
  { id: "tick-18", title: "IP 화이트리스트 차단 우회 긴급 건", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "유재혁", customerPhone: "010-3210-9876", customerEmail: "jhyoo@naver.com", vipTier: "VIP", slaHours: 2, slaProgress: 88, memos: [], replies: [] },
  { id: "tick-19", title: "모바일 다크모드 화면 폰트 가독성 건", status: "OPEN", priority: "LOW", assignee: "상담원 C", customerName: "황지수", customerPhone: "010-4321-0987", customerEmail: "jshwang@gmail.com", vipTier: "GENERAL", slaHours: 72, slaProgress: 3, memos: [], replies: [] },
  { id: "tick-20", title: "정기 서버 릴리즈 업데이트 상세 명세", status: "RESOLVED", priority: "LOW", assignee: "상담원 B", customerName: "서동현", customerPhone: "010-5432-1098", customerEmail: "dhseo@daum.net", vipTier: "GENERAL", slaHours: 48, slaProgress: 100, memos: [], replies: [] }
];

// Activity logs database (Error 3 & 7 target)
let activityLogs = [
  { id: "log-01", text: "상담원 A가 티켓 #tick-02 상태를 [진행 중]으로 전환했습니다.", timestamp: "오후 3:10" },
  { id: "log-02", text: "상담원 B가 티켓 #tick-03 상태를 [해결됨]으로 전환했습니다.", timestamp: "오후 2:50" }
];

// SLA metrics DB (Error 3 target)
let slaMetrics = {
  totalSlaBreached: 4,
  totalResolvedOnTime: 12
};

// API: Get Tickets
app.get('/api/tickets', (req, res) => {
  res.json(tickets);
});

// API: Search Tickets (Error 2 search query delay race)
app.get('/api/tickets/search', (req, res) => {
  const { q } = req.query;
  let delay = 100;

  if (q === '데이터') {
    delay = 3000;
  } else if (q === '오류') {
    delay = 200;
  }

  setTimeout(() => {
    const results = tickets.filter(t => t.title.includes(q) || t.customerName.includes(q));
    res.json({ q, results });
  }, delay);
});

// API: Assign Agent (Error 1 delay 3.0s, overrides status to IN_PROGRESS)
app.patch('/api/tickets/:id/assign', (req, res) => {
  const { id } = req.params;
  const { agent } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 담당자 배정 API 요청에 3000ms(3초) 지연 연산을 부여합니다.
  // 담당자 변경 직후 곧장 '해결됨' 상태 변경(PATCH, 0.1초 완료)을 누르면 해결 처리되나, 
  // 3초 뒤에 완료되는 배정 핸들러가 티켓 상태를 다시 '진행 중'으로 덮어써 복귀 롤백시킵니다.
  setTimeout(() => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      ticket.assignee = agent;
      ticket.status = 'IN_PROGRESS'; // Assigning resets status to in-progress!
      console.log(`[DB CRM] Ticket ${id} assigned to ${agent}. Status forced to IN_PROGRESS.`);
      
      // Update activity logs
      activityLogs.unshift({
        id: `log-${Date.now()}`,
        text: `티켓 #${id} 담당자가 ${agent}(으)로 변경되며 상태가 [진행 중]으로 재개방되었습니다.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    res.json({ success: true });
  }, 3000);
});

// API: Change Ticket Status (Error 1 completes in 0.1s)
app.patch('/api/tickets/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  setTimeout(() => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      console.log(`[DB CRM] Ticket ${id} status updated to: ${status}`);

      activityLogs.unshift({
        id: `log-${Date.now()}`,
        text: `티켓 #${id} 상태가 [${status}] 상태로 전환 처리되었습니다.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, 100);

  res.json({ success: true });
});

// API: Compose Reply (Error 5 unauthorized reply 403 draft bypass)
app.post('/api/tickets/:id/replies', (req, res) => {
  const { id } = req.params;
  const { author, text, role } = req.body;
  const ticket = tickets.find(t => t.id === id);

  if (ticket) {
    // Actually store the reply draft text in database anyway!
    ticket.replies.push({ author, text, date: new Date().toLocaleString() });
    console.log(`[DB CRM] Reply added to Ticket ${id}: ${text}`);
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 일반 상담원 계정이 VIP 등급 보안 티켓에 답변을 등록하려 할 때 
  // HTTP 403 Forbidden 권한 에러를 돌려보내 경고 차단하지만, 실제 디비에는 
  // 답변 데이터 초안을 먼저 푸시 기입하여 권한 락이 우회되는 보안 검증 취약 버그입니다.
  if (role === 'general' && ticket && ticket.vipTier === 'VIP') {
    console.log(`[AUTH BYPASS] General agent replied to VIP ticket ${id}. Returned 403 but saved draft!`);
    return res.status(403).json({
      error: "권한 에러: 일반 상담원은 VIP 티켓의 최종 답변 배포 권한이 존재하지 않습니다."
    });
  }

  res.json({ success: true });
});

// API: Modify Memo (Error 6 memo update-delete race 3s delay)
app.put('/api/tickets/:id/memos/:memoId', (req, res) => {
  const { id, memoId } = req.params;
  const { text } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Database
  // DESCRIPTION: 내부 메모 수정(PUT) API에 3000ms(3초)의 인위 지연을 부여합니다.
  // 수정 클릭 직후 즉시 메모 삭제(DELETE, 0.1초 완료)를 연계 누르면 삭제 응답은 성공하지만,
  // 3초 뒤 깨어난 수정 스레드가 해당 메모를 수정 텍스트 정보로 다시 원복 복구(Recreate)해 버립니다.
  setTimeout(() => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      let memo = ticket.memos.find(m => m.id === memoId);
      if (memo) {
        memo.text = text;
        console.log(`[DB MEMO] Memo ${memoId} updated: ${text}`);
      } else {
        // Recreate deleted memo
        ticket.memos.push({
          id: memoId,
          text,
          date: new Date().toLocaleTimeString()
        });
        console.log(`[DB MEMO RACE] Re-inserted canceled memo ${memoId} due to delayed update!`);
      }
    }
    res.json({ success: true });
  }, 3000);
});

// API: Delete Memo (Error 6 completes in 0.1s)
app.delete('/api/tickets/:id/memos/:memoId', (req, res) => {
  const { id, memoId } = req.params;
  const ticket = tickets.find(t => t.id === id);
  if (ticket) {
    ticket.memos = ticket.memos.filter(m => m.id !== memoId);
    console.log(`[DB MEMO] Deleted memo ${memoId} instantly.`);
  }
  res.json({ success: true });
});

// API: Add Memo
app.post('/api/tickets/:id/memos', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const ticket = tickets.find(t => t.id === id);
  const newMemo = {
    id: `memo-${Date.now()}`,
    text,
    date: new Date().toLocaleTimeString()
  };
  if (ticket) {
    ticket.memos.push(newMemo);
  }
  res.json(newMemo);
});

// API: Delete Ticket (Error 3 removes ticket, but keeps stats/logs)
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  
  tickets = tickets.filter(t => t.id !== id);
  console.log(`[DB CRM] Ticket ${id} deleted.`);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 티켓 파기(DELETE) 시 관련 트랜잭션 무결성 정책을 무시하여, 
  // 해당 티켓에 소속되었던 활동 히스토리(`activityLogs`) 및 SLA 통계 리포팅 지표(`slaMetrics`)의 
  // 집계 캐시를 동기 소거하지 않고 누출 존치시킵니다.
  
  res.json({ success: true });
});

// API: Get Activity logs & SLA metrics
app.get('/api/logs', (req, res) => {
  res.json(activityLogs);
});

app.get('/api/statistics', (req, res) => {
  res.json(slaMetrics);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  tickets = [
    { id: "tick-01", title: "로그인 세션 만료 시간 연장 요청 건", status: "OPEN", priority: "MEDIUM", assignee: "상담원 B", customerName: "이강민", customerPhone: "010-9876-5432", customerEmail: "kangmin@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 45, memos: [], replies: [] },
    { id: "tick-02", title: "[긴급] 결제 승인 후 영수증 메일 미발송 오류", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "장지훈", customerPhone: "010-1122-3344", customerEmail: "jihoon_vip@naver.com", vipTier: "VIP", slaHours: 4, slaProgress: 80, memos: [{ id: "memo-101", text: "카드사 대조 검증 필요함.", date: "오후 2:30" }], replies: [] },
    { id: "tick-03", title: "모바일 앱 푸시 알림 비활성화 해제 문의", status: "RESOLVED", priority: "LOW", assignee: "상담원 B", customerName: "최영희", customerPhone: "010-5566-7788", customerEmail: "younghee@daum.net", vipTier: "GENERAL", slaHours: 48, slaProgress: 100, memos: [], replies: [{ author: "상담원 B", text: "설정 메뉴 내 알림 수신 동의를 체크해 주시기 바랍니다." }] },
    { id: "tick-04", title: "환불 계좌 정보 오입력 수정 요청", status: "OPEN", priority: "HIGH", assignee: "상담원 A", customerName: "황정식", customerPhone: "010-8899-0011", customerEmail: "jshwang@naver.com", vipTier: "VIP", slaHours: 12, slaProgress: 15, memos: [], replies: [] },
    { id: "tick-05", title: "서비스 이용약관 변경 내역 자료 요청", status: "IN_PROGRESS", priority: "LOW", assignee: "상담원 C", customerName: "정수진", customerPhone: "010-4433-2211", customerEmail: "sujin_jeong@gmail.com", vipTier: "GENERAL", slaHours: 72, slaProgress: 30, memos: [], replies: [] },
    { id: "tick-06", title: "API 토큰 갱신 주기 연장 문의", status: "OPEN", priority: "MEDIUM", assignee: "상담원 B", customerName: "윤지환", customerPhone: "010-7788-9900", customerEmail: "jihwan_yoon@daum.net", vipTier: "GENERAL", slaHours: 24, slaProgress: 8, memos: [], replies: [] },
    { id: "tick-07", title: "[VIP 전용] 정기 결제 플랜 단체 할인 혜택", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "한동수", customerPhone: "010-2233-4455", customerEmail: "dongsoo_han@vip.com", vipTier: "VIP", slaHours: 6, slaProgress: 95, memos: [], replies: [] },
    { id: "tick-08", title: "계정 탈퇴 시 잔여 마일리지 양도 가능 여부", status: "RESOLVED", priority: "LOW", assignee: "상담원 C", customerName: "김서아", customerPhone: "010-3344-5566", customerEmail: "seoa_kim@naver.com", vipTier: "GENERAL", slaHours: 48, slaProgress: 100, memos: [], replies: [] },
    { id: "tick-09", title: "데이터 내보내기 백업 파일 오류 재추출 건", status: "OPEN", priority: "MEDIUM", assignee: "상담원 B", customerName: "조민수", customerPhone: "010-9900-1122", customerEmail: "minsu_cho@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 55, memos: [], replies: [] },
    { id: "tick-10", title: "보안 비밀번호 변경 5회 시도 초과 잠금", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "박도현", customerPhone: "010-1234-5678", customerEmail: "dohyun_vip@naver.com", vipTier: "VIP", slaHours: 2, slaProgress: 75, memos: [], replies: [] },
    { id: "tick-11", title: "비밀번호 재설정 이메일 인증 링크 누락", status: "OPEN", priority: "HIGH", assignee: "상담원 B", customerName: "송민우", customerPhone: "010-4567-8901", customerEmail: "minwoosong@daum.net", vipTier: "GENERAL", slaHours: 12, slaProgress: 10, memos: [], replies: [] },
    { id: "tick-12", title: "대량 메일 솔루션 연동 사양 질의", status: "IN_PROGRESS", priority: "MEDIUM", assignee: "상담원 C", customerName: "임채린", customerPhone: "010-5678-9012", customerEmail: "chaerin@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 40, memos: [], replies: [] },
    { id: "tick-13", title: "법무팀 컴플라이언스 서류 회신", status: "RESOLVED", priority: "HIGH", assignee: "상담원 A", customerName: "배윤재", customerPhone: "010-6789-0123", customerEmail: "yjbae_vip@naver.com", vipTier: "VIP", slaHours: 8, slaProgress: 100, memos: [], replies: [] },
    { id: "tick-14", title: "관리자 서브 계정 추가 발급 가이드", status: "OPEN", priority: "LOW", assignee: "상담원 B", customerName: "강성호", customerPhone: "010-7890-1234", customerEmail: "sungho@daum.net", vipTier: "GENERAL", slaHours: 48, slaProgress: 5, memos: [], replies: [] },
    { id: "tick-15", title: "스토리지 한도 초과 경고 해결 요청", status: "IN_PROGRESS", priority: "MEDIUM", assignee: "상담원 C", customerName: "신지혜", customerPhone: "010-8901-2345", customerEmail: "jihye@gmail.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 60, memos: [], replies: [] },
    { id: "tick-16", title: "신규 크레딧 충전 결제 수단 누락 오류", status: "OPEN", priority: "HIGH", assignee: "상담원 A", customerName: "문승우", customerPhone: "010-9012-3456", customerEmail: "seungwoo@vip.com", vipTier: "VIP", slaHours: 4, slaProgress: 90, memos: [], replies: [] },
    { id: "tick-17", title: "협력업체 대시보드 권한 부여 절차", status: "RESOLVED", priority: "MEDIUM", assignee: "상담원 B", customerName: "안하은", customerPhone: "010-2109-8765", customerEmail: "haeun@naver.com", vipTier: "GENERAL", slaHours: 24, slaProgress: 100, memos: [], replies: [] },
    { id: "tick-18", title: "IP 화이트리스트 차단 우회 긴급 건", status: "IN_PROGRESS", priority: "HIGH", assignee: "상담원 A", customerName: "유재혁", customerPhone: "010-3210-9876", customerEmail: "jhyoo@naver.com", vipTier: "VIP", slaHours: 2, slaProgress: 88, memos: [], replies: [] },
    { id: "tick-19", title: "모바일 다크모드 화면 폰트 가독성 건", status: "OPEN", priority: "LOW", assignee: "상담원 C", customerName: "황지수", customerPhone: "010-4321-0987", customerEmail: "jshwang@gmail.com", vipTier: "GENERAL", slaHours: 72, slaProgress: 3, memos: [], replies: [] },
    { id: "tick-20", title: "정기 서버 릴리즈 업데이트 상세 명세", status: "RESOLVED", priority: "LOW", assignee: "상담원 B", customerName: "서동현", customerPhone: "010-5432-1098", customerEmail: "dhseo@daum.net", vipTier: "GENERAL", slaHours: 48, slaProgress: 100, memos: [], replies: [] }
  ];
  activityLogs = [
    { id: "log-01", text: "상담원 A가 티켓 #tick-02 상태를 [진행 중]으로 전환했습니다.", timestamp: "오후 3:10" },
    { id: "log-02", text: "상담원 B가 티켓 #tick-03 상태를 [해결됨]으로 전환했습니다.", timestamp: "오후 2:50" }
  ];
  slaMetrics = {
    totalSlaBreached: 4,
    totalResolvedOnTime: 12
  };
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[SupportFlow Backend] Express server running on http://localhost:${PORT}`);
});
