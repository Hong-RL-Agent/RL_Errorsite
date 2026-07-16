import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5054;

app.use(cors());
app.use(express.json());

// Cases Database (Minimum 15 items)
let cases = [
  { id: "case-01", title: "주식회사 에이원 상표권 침해 금지 청구의 소", status: "ACTIVE", stage: "변론준비", assignee: "변호사 A", client: "김진표" },
  { id: "case-02", title: "강남구 대지 임대차 보증금 반환 민사 소송", status: "ACTIVE", stage: "소송접수", assignee: "변호사 A", client: "최민식" },
  { id: "case-03", title: "강북 재개발 조합 청산금 분할 청구 사건", status: "ACTIVE", stage: "서면공방", assignee: "변호사 B", client: "이성재" },
  { id: "case-04", title: "IT 개발 하도급 미지급금 청구 중재 건", status: "ACTIVE", stage: "변론준비", assignee: "변호사 B", client: "홍정기" },
  { id: "case-05", title: "유명 연예인 악의적 명예훼손 형사 고소 대리", status: "ACTIVE", stage: "소송접수", assignee: "변호사 A", client: "김태희" },
  { id: "case-06", title: "바이오 벤처 특허 기술 도용 금지 가처분 신청", status: "ACTIVE", stage: "심문기일", assignee: "변호사 B", client: "황정민" },
  { id: "case-07", title: "대형 쇼핑몰 상가 권리금 회수 방해 손해배상 소송", status: "ACTIVE", stage: "변론준비", assignee: "변호사 A", client: "박성웅" },
  { id: "case-08", title: "제조물 책임법 위반 유해성 성분 집단 소송", status: "ACTIVE", stage: "서면공방", assignee: "변호사 B", client: "조진웅" },
  { id: "case-09", title: "해외 프랜차이즈 계약 위반 손해배상 국제 중재", status: "ACTIVE", stage: "심문기일", assignee: "변호사 A", client: "유해진" },
  { id: "case-10", title: "가상자산 투자 사기 피해 형사 고소 사건", status: "ACTIVE", stage: "소송접수", assignee: "변호사 B", client: "김우빈" },
  { id: "case-11", title: "유동성 확보 부동자산 경매 인도 명령 신청", status: "ACTIVE", stage: "변론준비", assignee: "변호사 A", client: "강동원" },
  { id: "case-12", title: "주주총회 결의 취소 및 직무 집행 정지 가처분", status: "ACTIVE", stage: "심문기일", assignee: "변호사 B", client: "박해일" },
  { id: "case-13", title: "업무상 배임 및 횡령 혐의 형사 변호 사건", status: "ACTIVE", stage: "서면공방", assignee: "변호사 A", client: "배두나" },
  { id: "case-14", title: "아파트 외벽 균열 부실시공 하자보수 청구 건", status: "ACTIVE", stage: "변론준비", assignee: "변호사 B", client: "윤여정" },
  { id: "case-15", title: "도메인 불법 강탈 금지 가처분 및 이전 청구", status: "ACTIVE", stage: "소송접수", assignee: "변호사 A", client: "송강호" }
];

// Document manager folders tree list
let documents = [
  { id: "doc-01", name: "소송장_최종본.pdf", path: "/cases/claim_doc.pdf", restricted: false },
  { id: "doc-02", name: "임대차계약서_스캔.zip", path: "/cases/lease_contract.zip", restricted: false },
  { id: "doc-restricted", name: "classified_defense_strategy.docx", path: "/cases/secure/classified_defense_strategy.docx", restricted: true }
];

// Schedules
let schedules = [
  { id: "sch-01", caseId: "case-01", title: "상표권 예비 변론회의", date: "2026-07-20", time: "14:00" },
  { id: "sch-02", caseId: "case-02", title: "임대차 분쟁 조정위 소집", date: "2026-07-22", time: "10:30" }
];

// Expenses
let expenses = [
  { id: "exp-01", caseId: "case-01", description: "법원 인지대 및 송달료", amount: 150000 },
  { id: "exp-02", caseId: "case-01", description: "감정평가 수수료 (미청구)", amount: 1200000 }
];

// Activity Logs
let activityLogs = [
  { id: "log-01", text: "사건 '주식회사 에이원 상표권 침해 금지 청구의 소'가 생성되었습니다." },
  { id: "log-02", text: "법원 인지대 비용 항목 150,000원이 생성되었습니다." }
];

// Internal Memos cache simulator
const internalMemos = {
  "case-01": "피의자 합의금 상한액 5억원 설정 필요. 소송 대리인 밀착 모니터링 요구됨.",
  "case-02": "임대인의 채무 변제 능력 전무. 가압류 신속 집행 필수.",
  "case-03": "조합원 찬반 투표 결과 비대위 장악력 우세. 법정 공방 장기화 대처."
};

// API: Get cases
app.get('/api/cases', (req, res) => {
  res.json(cases);
});

// API: Search cases (Error 4 search query delay race condition)
app.get('/api/cases/search', (req, res) => {
  const { q, filter } = req.query;
  let filtered = cases;
  
  if (q) {
    filtered = filtered.filter(c => c.title.includes(q) || c.client.includes(q));
  }
  if (filter && filter !== 'ALL') {
    filtered = filtered.filter(c => c.stage === filter);
  }

  let delay = 100;
  if (q === '상표권') {
    delay = 3000; // 3s delay
  } else if (q === '민사') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: '상표권' 검색어는 3초, '민사'는 0.2초의 인위적 응답 지연을 갖습니다. 
  // 고속 교차 입력 시 구형 검색 결과 리스트가 최신 목록 화면을 덮어써 버리고 
  // 선택 상세 박스는 다른 민사 사건 내용을 출력하게 만듭니다.
  setTimeout(() => {
    res.json({ results: filtered });
  }, delay);
});

// API: Get internal memo (Error 2 session bypass check)
app.get('/api/cases/:id/memo', (req, res) => {
  const { id } = req.params;
  const memoText = internalMemos[id] || "작성된 비공개 메모가 없습니다.";
  res.json({ memo: memoText });
});

// API: Patch case stage (Error 1 stage update - 0.1s delay)
app.patch('/api/cases/:id/stage', (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  
  setTimeout(() => {
    const targetCase = cases.find(c => c.id === id);
    if (targetCase) {
      targetCase.stage = stage;
      activityLogs.push({ id: `log-${Date.now()}`, text: `사건 [${targetCase.title}]의 단계가 [${stage}](으)로 변경되었습니다.` });
      console.log(`[DB STAGE] Updated stage of ${id} to ${stage}`);
    }
    res.json({ success: true, case: targetCase });
  }, 100);
});

// API: Patch case assignee (Error 1 assignee update - 3s delay, overwrites stage)
app.patch('/api/cases/:id/assignee', (req, res) => {
  const { id } = req.params;
  const { assignee, stage } = req.body; // stage is the old value sent at dispatcher click time

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 담당자 변경 API를 3초 지연 수행합니다. 
  // 클라이언트가 당시의 이전 단계(`stage`) 정보와 신규 담당자 정보를 페이로드로 전송하므로, 
  // 0.1초 만에 최신 단계로 갱신된 DB 데이터 위에 구형 단계 값을 최종적으로 덮어쓰기 해버립니다.
  setTimeout(() => {
    const targetCase = cases.find(c => c.id === id);
    if (targetCase) {
      targetCase.assignee = assignee;
      targetCase.stage = stage; // Revert/overwrite!
      activityLogs.push({ id: `log-${Date.now()}`, text: `사건 [${targetCase.title}]의 담당자가 [${assignee}](으)로 변경되었습니다.` });
      console.log(`[DB ASSIGNEE] Updated assignee to ${assignee} and reverted stage to ${stage}`);
    }
    res.json({ success: true, case: targetCase });
  }, 3000);
});

// API: Close case (Error 3 target)
app.post('/api/cases/:id/close', (req, res) => {
  const { id } = req.params;
  const targetCase = cases.find(c => c.id === id);
  if (targetCase) {
    targetCase.status = "CLOSED";
    activityLogs.push({ id: `log-${Date.now()}`, text: `사건 [${targetCase.title}]이 종결(CLOSED)되었습니다.` });
  }
  res.json({ success: true, case: targetCase });
});

// API: Get schedules
app.get('/api/schedules', (req, res) => {
  res.json(schedules);
});

// API: Add schedule
app.post('/api/schedules', (req, res) => {
  const { caseId, title, date, time } = req.body;
  const newSch = {
    id: `sch-${Date.now()}`,
    caseId,
    title,
    date,
    time
  };
  schedules.push(newSch);
  activityLogs.push({ id: `log-${Date.now()}`, text: `상담 일정 [${title}]이 추가되었습니다.` });
  res.json(newSch);
});

// API: Delete schedule (Error 3 dangling records)
app.delete('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  const schedule = schedules.find(s => s.id === id);

  if (schedule) {
    schedules = schedules.filter(s => s.id !== id);

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 사건이 종결된 상태에서 상담 일정을 삭제해도, 
    // 미청구 비용(`expenses`) 및 활동 로그(`activityLogs`) 등과 연계된 
    // 하위 레코드 파기 트리거를 전혀 호출하지 않고 누적 비용 산정판에 남겨두는 고립성 결함입니다.
    console.log(`[DB SCHEDULE DELETE] Deleted schedule ${id}. Dangling expenses are retained!`);
  }

  res.json({ success: true });
});

// API: Get Documents
app.get('/api/documents', (req, res) => {
  res.json(documents);
});

// API: Download document metadata (Error 5)
app.get('/api/documents/:id/download', (req, res) => {
  const { id } = req.params;
  const role = req.headers['x-user-role'];

  const doc = documents.find(d => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: "문서를 찾을 수 없습니다." });
  }

  if (doc.restricted && role !== 'admin') {
    // INTENTIONAL_ERROR
    // CATEGORY: Backend
    // DESCRIPTION: 다운로드 권한이 없을 경우 HTTP 403 Forbidden 상태코드를 리턴하지만, 
    // 응답 커스텀 헤더(`X-Exposed-File-Name`, `X-Exposed-Path`)로 내부 파일 보관 경로와 
    // 기밀 파일의 실물 명칭을 그대로 누설시켜 대외비 정보를 노출하는 보안 결함입니다.
    res.setHeader('X-Exposed-File-Name', doc.name);
    res.setHeader('X-Exposed-Path', `C:\\firm_storage\\secret\\docs${doc.path.replace(/\//g, '\\')}`);
    return res.status(403).json({ error: "비공개 기밀 문서입니다. 다운로드 권한이 거부되었습니다." });
  }

  res.json({ success: true, downloadUrl: doc.path });
});

// API: Get Expenses
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

// API: Add Expense
app.post('/api/expenses', (req, res) => {
  const { caseId, description, amount } = req.body;
  const newExp = {
    id: `exp-${Date.now()}`,
    caseId,
    description,
    amount: Number(amount)
  };
  expenses.push(newExp);
  activityLogs.push({ id: `log-${Date.now()}`, text: `비용 항목 [${description}] ${amount}원이 추가되었습니다.` });
  res.json(newExp);
});

// API: Patch Expense (Error 6 cost update - 3s delay)
app.patch('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 비용 수정(PATCH) 연산을 3초간 지연시킵니다. 
  // 수정 누른 직후 삭제(0.1초 완료)를 처리하여 목록에서 사라졌음에도, 3초 뒤에 완료되는 
  // 수정 비동기 콜백이 메모리에 존재하지 않는 객체를 새로 복원/기입함으로써 리스트가 중복 증식됩니다.
  setTimeout(() => {
    let exp = expenses.find(e => e.id === id);
    if (!exp) {
      // Re-create the deleted expense!
      exp = { id, caseId: "case-01", description, amount: Number(amount) };
      expenses.push(exp);
      activityLogs.push({ id: `log-${Date.now()}`, text: `삭제된 비용 항목 [${description}]이 수정 지연 스레드에 의해 복원되었습니다.` });
      console.log(`[DB EXPENSE RESURRECT] Resurrected cost item ${id} with amount ${amount}`);
    } else {
      exp.amount = Number(amount);
      exp.description = description;
    }
    res.json({ success: true, expense: exp });
  }, 3000);
});

// API: Delete Expense (Error 6 cost delete - 0.1s delay)
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    expenses = expenses.filter(e => e.id !== id);
    activityLogs.push({ id: `log-${Date.now()}`, text: `비용 항목 ID [${id}]가 삭제되었습니다.` });
    console.log(`[DB EXPENSE DELETE] Deleted cost item ${id}`);
    res.json({ success: true });
  }, 100);
});

// API: Get Activity Logs
app.get('/api/logs', (req, res) => {
  res.json(activityLogs);
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  cases = [
    { id: "case-01", title: "주식회사 에이원 상표권 침해 금지 청구의 소", status: "ACTIVE", stage: "변론준비", assignee: "변호사 A", client: "김진표" },
    { id: "case-02", title: "강남구 대지 임대차 보증금 반환 민사 소송", status: "ACTIVE", stage: "소송접수", assignee: "변호사 A", client: "최민식" },
    { id: "case-03", title: "강북 재개발 조합 청산금 분할 청구 사건", status: "ACTIVE", stage: "서면공방", assignee: "변호사 B", client: "이성재" },
    { id: "case-04", title: "IT 개발 하도급 미지급금 청구 중재 건", status: "ACTIVE", stage: "변론준비", assignee: "변호사 B", client: "홍정기" },
    { id: "case-05", title: "유명 연예인 악의적 명예훼손 형사 고소 대리", status: "ACTIVE", stage: "소송접수", assignee: "변호사 A", client: "김태희" },
    { id: "case-06", title: "바이오 벤처 특허 기술 도용 금지 가처분 신청", status: "ACTIVE", stage: "심문기일", assignee: "변호사 B", client: "황정민" },
    { id: "case-07", title: "대형 쇼핑몰 상가 권리금 회수 방해 손해배상 소송", status: "ACTIVE", stage: "변론준비", assignee: "변호사 A", client: "박성웅" },
    { id: "case-08", title: "제조물 책임법 위반 유해성 성분 집단 소송", status: "ACTIVE", stage: "서면공방", assignee: "변호사 B", client: "조진웅" },
    { id: "case-09", title: "해외 프랜차이즈 계약 위반 손해배상 국제 중재", status: "ACTIVE", stage: "심문기일", assignee: "변호사 A", client: "유해진" },
    { id: "case-10", title: "가상자산 투자 사기 피해 형사 고소 사건", status: "ACTIVE", stage: "소송접수", assignee: "변호사 B", client: "김우빈" },
    { id: "case-11", title: "유동성 확보 부동자산 경매 인도 명령 신청", status: "ACTIVE", stage: "변론준비", assignee: "변호사 A", client: "강동원" },
    { id: "case-12", title: "주주총회 결의 취소 및 직무 집행 정지 가처분", status: "ACTIVE", stage: "심문기일", assignee: "변호사 B", client: "박해일" },
    { id: "case-13", title: "업무상 배임 및 횡령 혐의 형사 변호 사건", status: "ACTIVE", stage: "서면공방", assignee: "변호사 A", client: "배두나" },
    { id: "case-14", title: "아파트 외벽 균열 부실시공 하자보수 청구 건", status: "ACTIVE", stage: "변론준비", assignee: "변호사 B", client: "윤여정" },
    { id: "case-15", title: "도메인 불법 강탈 금지 가처분 및 이전 청구", status: "ACTIVE", stage: "소송접수", assignee: "변호사 A", client: "송강호" }
  ];
  schedules = [
    { id: "sch-01", caseId: "case-01", title: "상표권 예비 변론회의", date: "2026-07-20", time: "14:00" },
    { id: "sch-02", caseId: "case-02", title: "임대차 분쟁 조정위 소집", date: "2026-07-22", time: "10:30" }
  ];
  expenses = [
    { id: "exp-01", caseId: "case-01", description: "법원 인지대 및 송달료", amount: 150000 },
    { id: "exp-02", caseId: "case-01", description: "감정평가 수수료 (미청구)", amount: 1200000 }
  ];
  activityLogs = [
    { id: "log-01", text: "사건 '주식회사 에이원 상표권 침해 금지 청구의 소'가 생성되었습니다." },
    { id: "log-02", text: "법원 인지대 비용 항목 150,000원이 생성되었습니다." }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[CaseBoard Backend] Express server running on http://localhost:${PORT}`);
});
