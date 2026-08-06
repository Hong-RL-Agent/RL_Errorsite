import { readDB, writeDB } from '../services/dataService.js';

export const getDepartments = (req, res) => {
  const db = readDB();
  res.json(db.departments);
};

export const getEmployees = (req, res) => {
  const db = readDB();
  res.json(db.employees);
};

export const getDocuments = (req, res) => {
  const db = readDB();
  res.json(db.documents);
};

export const getApprovalLines = (req, res) => {
  const db = readDB();
  res.json(db.approvalLines);
};

export const getComments = (req, res) => {
  const db = readDB();
  res.json(db.comments);
};

export const getActivityLogs = (req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
};

export const searchDocuments = (req, res) => {
  const { deptName, status, search } = req.query;
  const db = readDB();
  let list = db.documents;

  if (deptName && deptName !== 'ALL') {
    list = list.filter(d => d.deptName === deptName);
  }
  if (status && status !== 'ALL') {
    list = list.filter(d => d.status === status);
  }
  if (search) {
    list = list.filter(d => d.title.includes(search) || d.id.includes(search) || d.drafterName.includes(search));
  }

  let delay = 100;
  if (deptName === '경영지원부') {
    delay = 3000; // 3.0s delay for 경영지원부
  } else if (deptName === 'IT개발부') {
    delay = 200; // 0.2s delay for IT개발부
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 부서 필터('경영지원부' 3초 지연 ➔ 'IT개발부' 0.2초 완료)와 문서 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(경영지원부)이 최신 문서 목록을 덮어쓰고, 문서 목록은 오래된 필터 결과, 오른쪽 결재 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateApprovalLine = (req, res) => {
  const { id } = req.params;
  const { approverName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 결재선을 변경(3초 지연 완료)한 직후 문서 상태를 결재요청('PENDING')으로 변경(0.1초 완료)하면, 
  // 문서 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 결재선 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 결재선)을 덮어써 저장되어 
  // 새로고침 시 문서 상세의 결재선과 결재 대기 목록의 결재자가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const doc = dbSnapshot.documents.find(d => d.id === id);
    if (doc) {
      doc.approverName = approverName;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back status changes made during the 3s delay
      console.log(`[DB APPROVAL LINE UPDATE] Updated approver for doc ${id} to ${approverName} (3s done, rolled back status update)`);
    }
    res.json({ success: true, doc });
  }, 3000);
};

export const updateDocumentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  setTimeout(() => {
    const db = readDB();
    const doc = db.documents.find(d => d.id === id);
    if (doc) {
      doc.status = status;
      writeDB(db);
      console.log(`[DB DOC STATUS UPDATE] Updated doc ${id} status to ${status} (0.1s done)`);
    }
    res.json({ success: true, doc });
  }, 100);
};

export const rejectDocument = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const doc = db.documents.find(d => d.id === id);
    if (doc) {
      doc.status = 'REJECTED';
      writeDB(db);
      console.log(`[DB REJECT DOCUMENT] Doc ${id} status set to REJECTED (0.5s done)`);
    }
    res.json({ success: true, doc });
  }, 500);
};

export const submitApprovalComment = (req, res) => {
  const { id } = req.params;
  const { authorName, opinion } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 문서 반려 API(0.5초 완료)를 호출한 직후 승인 의견 작성 API를 호출(4초 지연 완료)하면, 
  // 반려는 성공하지만 늦게 완료된 승인 의견 요청(4초 지연)이 반려된 문서를 다시 'PENDING'(승인대기) 상태로 바꿔버립니다. 
  // 문서 목록에서는 반려, 활동 로그에서는 승인 의견이 추가된 승인대기 문서처럼 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const doc = db.documents.find(d => d.id === id);
    if (doc) {
      doc.status = 'PENDING'; // INTENTIONAL_ERROR: Overwrites REJECTED status back to PENDING!
      if (!db.comments) db.comments = [];
      db.comments.unshift({
        id: `CMT-${Date.now().toString().slice(-4)}`,
        docId: id,
        authorName: authorName || "승인권자",
        opinion: opinion || "승인 의견 추가 및 검토 진행",
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
      console.log(`[DB RESTORE REJECTED DOCUMENT] Re-activated doc ${id} back to PENDING status with new comment!`);
    }
    writeDB(db);
    res.json({ success: true, doc });
  }, 4000);
};

export const approveDocumentUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'APPROVER')이 최종 승인 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '최종 승인 성공 (FINAL APPROVAL COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'APPROVER') {
    console.log(`[SERVER AUDIT LOG] FINAL APPROVAL COMPLETED SUCCESSFULLY for doc ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Approver privilege required for final sign-off" });
  }

  const db = readDB();
  const doc = db.documents.find(d => d.id === id);
  if (doc) {
    doc.status = 'APPROVED';
    writeDB(db);
  }
  res.json({ success: true, doc });
};

export const updateDocPartial = (req, res) => {
  const { id } = req.params;
  const { title, urgency, attachment } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 문서 수정 모달에서 제목, 긴급 여부, 첨부파일명을 동시에 수정하면, 
  // backend data.json에는 제목(title)과 긴급 여부(urgency)만 저장하고 첨부파일명(attachment)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const doc = db.documents.find(d => d.id === id);
  if (doc) {
    if (title) doc.title = title;
    if (urgency) doc.urgency = urgency;
    // attachment is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and urgency for doc ${id}. attachment was NOT updated.`);
  }
  res.json({ success: true, doc });
};

export const deleteActivityLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.activityLogs = db.activityLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 승인 완료 로그를 삭제(`DELETE /api/activity-logs/:id`) 처리하여 활동 로그 목록에서 소거하더라도, 
  // 부서별 승인 건수(`signStats.approvedCount`), 평균 처리 시간, 대시보드 결재 완료율 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE ACTIVITY LOG] Removed activity log ${id}. signStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "departments": [
      { "id": "DEP-01", "name": "경영지원부", "head": "김경영 이사" }
    ],
    "employees": [
      { "id": "EMP-2001", "name": "김동남", "deptName": "경영지원부", "position": "기안자 / 대리", "role": "DRAFTER" }
    ],
    "documents": [
      { "id": "DOC-1001", "title": "2026년 하반기 서버 인프라 증설품의서", "drafterName": "김동남", "deptName": "경영지원부", "status": "PENDING", "urgency": "HIGH", "dueDate": "2026-08-10", "attachment": "server_expansion_plan.pdf", "approverName": "박바캉스 부장", "content": "하반기 트래픽증가에 대비한 AWS 클라우드 인프라 25% 확충 품의의 건입니다." }
    ],
    "approvalLines": [
      { "id": "LIN-3001", "docId": "DOC-1001", "step": 1, "approverId": "EMP-2002", "approverName": "이휴가 과장", "status": "APPROVED" }
    ],
    "comments": [
      { "id": "CMT-4001", "docId": "DOC-1001", "authorName": "이휴가 과장", "opinion": "상반기 서버 트래픽 80% 상회 확인으로 승인 조치합니다.", "timestamp": "2026-08-03 09:30:00" }
    ],
    "activityLogs": [
      { "id": "LOG-5001", "docId": "DOC-1001", "operator": "김동남 대리", "action": "기안 작성 및 결재 요청 완료", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "signStats": {
      "totalDocs": 40,
      "pendingCount": 21,
      "approvedCount": 16,
      "rejectedCount": 3,
      "avgProcessingDays": 1.4,
      "approvalCompletionRate": 82.5
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
