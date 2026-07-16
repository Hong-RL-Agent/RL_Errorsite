import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5041;

app.use(cors());
app.use(express.json());

// Documents Database (12 initial items)
let documents = [
  { id: "doc-01", title: "2026 서비스 고도화 기획서", author: "User A", body: "4분기 백엔드 및 프론트엔드 최적화 추진 계획...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 14:00" },
  { id: "doc-02", title: "DocuNest 신규 디자인 가이드", author: "User A", body: "컬러 팔레트 및 타이포그래피 표준 적용 가이드라인...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 14:15" },
  { id: "doc-03", title: "인프라 보안 감사 체크리스트", author: "User B", body: "1. AWS IAM 권한 최소화 적용\n2. RDS 백업 주기 점검...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 11:20" },
  { id: "doc-04", title: "해외 지사 협업 커뮤니케이션 룰", author: "User B", body: "글로벌 미팅 시간 조율 및 이메일 영문 템플릿 정리...", isFavorite: false, inTrash: false, permission: "Read", modifiedAt: "2026-07-12 18:30" },
  { id: "doc-05", title: "개발 팀 주간 스프린트 회고", author: "User A", body: "API 지연시간 개선 완료, 결제 모듈 추가 태스크 배정...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 16:45" },
  { id: "doc-06", title: "마케팅 채널별 광고 집행 결과", author: "User B", body: "구글 및 메타 타겟팅 단가 분석 보고서...", isFavorite: false, inTrash: false, permission: "Read", modifiedAt: "2026-07-13 10:10" },
  { id: "doc-07", title: "3분기 신규 채용 로드맵", author: "User A", body: "프론트엔드 시니어 1명, 데이터 엔지니어 1명 인터뷰 일정...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-11 15:40" },
  { id: "doc-08", title: "사내 복지 혜택 개선 설문 결과", author: "User B", body: "식대 지원 증액 및 유연 근무 시간제 만족도 조사 분석...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-12 09:15" },
  { id: "doc-09", title: "데이터 백업 및 재해 복구 매뉴얼", author: "User A", body: "재해 발생 시 15분 내 복구 복제 시스템 가동 요령...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 13:00" },
  { id: "doc-10", title: "오픈소스 라이선스 검증 보고서", author: "User B", body: "상용 제품 내 GPL 라이선스 패키지 배제 점검...", isFavorite: false, inTrash: false, permission: "Read", modifiedAt: "2026-07-10 17:50" },
  { id: "doc-11", title: "경쟁사 서비스 트렌드 분석", author: "User A", body: "모바일 실시간 알림 기능 피처 대조 리서치...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 09:20" },
  { id: "doc-12", title: "신입 개발자 온보딩 가이드", author: "User B", body: "깃허브 레포지토리 클론 및 로컬 샌드박스 가동 매뉴얼...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-12 14:00" }
];

// Comments Database
let comments = [
  { id: "c-1", docId: "doc-01", author: "User A", text: "본문에 4분기 예상 비용 세부사항을 보강해야 합니다.", date: "2026-07-13 14:02" },
  { id: "c-2", docId: "doc-01", author: "User B", text: "해당 파트는 마케팅 예산 확정 후 보충하겠습니다.", date: "2026-07-13 14:05" },
  { id: "c-3", docId: "doc-03", author: "User B", text: "보안 감사 시나리오 추가 완료했습니다.", date: "2026-07-13 11:25" }
];

// Document Versions Map
let versions = {
  "doc-01": [
    { version: 1, author: "User A", time: "2026-07-13 12:00", comment: "최초 기획안 초안" },
    { version: 2, author: "User A", time: "2026-07-13 14:00", comment: "백엔드 리프레시 내용 추가" }
  ]
};

// API: Get Documents
app.get('/api/documents', (req, res) => {
  res.json(documents);
});

// API: Get Comments
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// API: Post Comment
app.post('/api/comments', (req, res) => {
  const { docId, author, text } = req.body;
  const newComment = {
    id: `c-${Date.now()}`,
    docId,
    author: author || "Unknown",
    text: text || "",
    date: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };
  comments.push(newComment);
  res.status(201).json(newComment);
});

// API: Save Title (Error 1 Delayed Request 1)
app.post('/api/documents/:id/title', (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 제목 저장 요청 시 의도적으로 4000ms(4초)의 대기 시간을 부여하고,
  // 늦게 들어온 이 요청이 로드 시점의 스냅샷(오래된 본문 body 내용)을 
  // 덮어씌워 나중에 쓰인 최신 본문 업데이트가 말소되도록 설계합니다.
  setTimeout(() => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      doc.title = title;
      doc.body = body; // Overwrites database with stale body!
      doc.modifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      console.log(`[RACE CONDITION] Delayed Title Save Written: ${title} / Body Reverted`);
    }
    res.json({ success: true, doc });
  }, 4000);
});

// API: Save Body (Error 1 Delayed Request 2)
app.post('/api/documents/:id/body', (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 본문 저장 요청은 1000ms(1초) 후에 디비에 기록됩니다.
  // 이 결과는 즉각 써지지만, 3초 후 완료되는 제목 저장 지연 요청에 의해 유실됩니다.
  setTimeout(() => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      doc.body = body;
      doc.modifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      console.log(`[RACE CONDITION] Fast Body Save Written: (Body length: ${body.length})`);
    }
    res.json({ success: true, doc });
  }, 1000);
});

// API: Toggle Favorite Status (Backend Sync)
app.post('/api/documents/:id/favorite', (req, res) => {
  const { id } = req.params;
  const doc = documents.find(d => d.id === id);
  if (doc) {
    doc.isFavorite = !doc.isFavorite;
    res.json({ success: true, isFavorite: doc.isFavorite });
  } else {
    res.status(404).json({ error: "문서를 찾을 수 없습니다." });
  }
});

// API: Move to Trash (Error 3 Delayed Request 1)
app.post('/api/documents/:id/trash', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 휴지통으로 문서 이동 요청 시 처리를 1500ms(1.5초) 의도적으로 늦춥니다.
  // 사용자가 이동 버튼 직후 '실행 취소(복원)'를 누르면, 복원 처리가 먼저 수행되고 
  // 뒤늦게 휴지통 이동 쓰기가 실행되어 디비는 최종적으로 휴지통 보존 상태(inTrash: true)로 끝납니다.
  setTimeout(() => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      doc.inTrash = true;
      console.log(`[TRASH RACE] Delayed Trash Written for ${id}`);
    }
  }, 1500);

  res.json({ success: true, message: "문서가 휴지통으로 이동되었습니다." });
});

// API: Restore Document (Error 3 Delayed Request 2)
app.post('/api/documents/:id/restore', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 복원 요청은 200ms만에 완료되어 디비에 'inTrash = false'를 세팅하지만,
  // 1.5초짜리 휴지통 지연 작업이 이후에 디비 락을 풀고 기습적으로 'inTrash = true'를 덮어씁니다.
  setTimeout(() => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      doc.inTrash = false;
      console.log(`[TRASH RACE] Fast Restore Written for ${id}`);
    }
  }, 200);

  res.json({ success: true, message: "문서가 복원 처리되었습니다." });
});

// API: Change Permission
app.put('/api/documents/:id/permission', (req, res) => {
  const { id } = req.params;
  const { permission } = req.body;
  const doc = documents.find(d => d.id === id);
  if (doc) {
    doc.permission = permission;
    res.json({ success: true, doc });
  } else {
    res.status(404).json({ error: "문서를 찾을 수 없습니다." });
  }
});

// API: Duplicate Document
app.post('/api/documents/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const original = documents.find(d => d.id === id);
  if (!original) return res.status(404).json({ error: "문서 없음" });

  const duplicated = {
    ...original,
    id: `doc-${Date.now()}`,
    title: `${original.title} (사본)`,
    modifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };

  documents.push(duplicated);
  res.json({ success: true, duplicated });
});

// API: Get Versions
app.get('/api/documents/:id/versions', (req, res) => {
  const { id } = req.params;
  const history = versions[id] || [
    { version: 1, author: "System", time: "2026-07-10 09:00", comment: "최초 시스템 생성 가이드" }
  ];
  res.json(history);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  documents = [
    { id: "doc-01", title: "2026 서비스 고도화 기획서", author: "User A", body: "4분기 백엔드 및 프론트엔드 최적화 추진 계획...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 14:00" },
    { id: "doc-02", title: "DocuNest 신규 디자인 가이드", author: "User A", body: "컬러 팔레트 및 타이포그래피 표준 적용 가이드라인...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 14:15" },
    { id: "doc-03", title: "인프라 보안 감사 체크리스트", author: "User B", body: "1. AWS IAM 권한 최소화 적용\n2. RDS 백업 주기 점검...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 11:20" },
    { id: "doc-04", title: "해외 지사 협업 커뮤니케이션 룰", author: "User B", body: "글로벌 미팅 시간 조율 및 이메일 영문 템플릿 정리...", isFavorite: false, inTrash: false, permission: "Read", modifiedAt: "2026-07-12 18:30" },
    { id: "doc-05", title: "개발 팀 주간 스프린트 회고", author: "User A", body: "API 지연시간 개선 완료, 결제 모듈 추가 태스크 배정...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 16:45" },
    { id: "doc-06", title: "마케팅 채널별 광고 집행 결과", author: "User B", body: "구글 및 메타 타겟팅 단가 분석 보고서...", isFavorite: false, inTrash: false, permission: "Read", modifiedAt: "2026-07-13 10:10" },
    { id: "doc-07", title: "3분기 신규 채용 로드맵", author: "User A", body: "프론트엔드 시니어 1명, 데이터 엔지니어 1명 인터뷰 일정...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-11 15:40" },
    { id: "doc-08", title: "사내 복지 혜택 개선 설문 결과", author: "User B", body: "식대 지원 증액 및 유연 근무 시간제 만족도 조사 분석...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-12 09:15" },
    { id: "doc-09", title: "데이터 백업 및 재해 복구 매뉴얼", author: "User A", body: "재해 발생 시 15분 내 복구 복제 시스템 가동 요령...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 13:00" },
    { id: "doc-10", title: "오픈소스 라이선스 검증 보고서", author: "User B", body: "상용 제품 내 GPL 라이선스 패키지 배제 점검...", isFavorite: false, inTrash: false, permission: "Read", modifiedAt: "2026-07-10 17:50" },
    { id: "doc-11", title: "경쟁사 서비스 트렌드 분석", author: "User A", body: "모바일 실시간 알림 기능 피처 대조 리서치...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-13 09:20" },
    { id: "doc-12", title: "신입 개발자 온보딩 가이드", author: "User B", body: "깃허브 레포지토리 클론 및 로컬 샌드박스 가동 매뉴얼...", isFavorite: false, inTrash: false, permission: "Edit", modifiedAt: "2026-07-12 14:00" }
  ];
  comments = [
    { id: "c-1", docId: "doc-01", author: "User A", text: "본문에 4분기 예상 비용 세부사항을 보강해야 합니다.", date: "2026-07-13 14:02" },
    { id: "c-2", docId: "doc-01", author: "User B", text: "해당 파트는 마케팅 예산 확정 후 보충하겠습니다.", date: "2026-07-13 14:05" },
    { id: "c-3", docId: "doc-03", author: "User B", text: "보안 감사 시나리오 추가 완료했습니다.", date: "2026-07-13 11:25" }
  ];
  res.json({ success: true, documents, comments });
});

app.listen(PORT, () => {
  console.log(`[DocuNest Backend] Express server running on http://localhost:${PORT}`);
});
