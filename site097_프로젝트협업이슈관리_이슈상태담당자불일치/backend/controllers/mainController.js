import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getProjects = (req, res) => {
  const db = readDB();
  res.json(db.projects);
};

export const getTeamMembers = (req, res) => {
  const db = readDB();
  res.json(db.teamMembers);
};

export const getIssues = (req, res) => {
  const db = readDB();
  res.json(db.issues);
};

export const getComments = (req, res) => {
  const db = readDB();
  res.json(db.comments);
};

export const getWorkLogs = (req, res) => {
  const db = readDB();
  res.json(db.workLogs);
};

export const searchIssues = (req, res) => {
  const { projectId, status, search } = req.query;
  const db = readDB();
  let list = db.issues;

  if (projectId && projectId !== 'ALL') {
    list = list.filter(i => i.projectId === projectId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(i => i.status === status);
  }
  if (search) {
    list = list.filter(i => i.title.includes(search) || i.id.includes(search));
  }

  let delay = 100;
  if (projectId === 'PRJ-101') {
    delay = 3000; // 3.0s delay for PRJ-101
  } else if (projectId === 'PRJ-102') {
    delay = 200; // 0.2s delay for PRJ-102
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 프로젝트 필터('PRJ-101' 3초 지연 ➔ 'PRJ-102' 0.2초 완료)와 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(PRJ-101)이 최신 이슈 목록을 덮어쓰고, 중앙 이슈 목록은 오래된 필터 결과, 오른쪽 프로젝트 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateIssueStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 이슈 상태를 '진행 중'(IN_PROGRESS)으로 변경(3초 지연 완료)한 직후 담당자를 변경(0.1초 완료)하면, 
  // 담당자 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가 요청 시작 시점의 구 DB 스냅샷(이전 담당자)을 덮어써 저장되어 
  // 새로고침 시 칸반보드의 담당자와 이슈 상세의 담당자가 서로 불일치하게 보이는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures snapshot at start of request
  setTimeout(() => {
    const issue = dbSnapshot.issues.find(i => i.id === id);
    if (issue) {
      issue.status = status;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back assignee change made during the 3s delay
      console.log(`[DB STATUS UPDATE] Updated status for issue ${id} to ${status} (3s done, rolled back assignee change)`);
    }
    res.json({ success: true, issue });
  }, 3000);
};

export const updateIssueAssignee = (req, res) => {
  const { id } = req.params;
  const { assigneeId, assigneeName } = req.body;

  setTimeout(() => {
    const db = readDB();
    const issue = db.issues.find(i => i.id === id);
    if (issue) {
      issue.assigneeId = assigneeId;
      issue.assigneeName = assigneeName;
      writeDB(db);
      console.log(`[DB ASSIGNEE UPDATE] Updated assignee for issue ${id} to ${assigneeName} (0.1s done)`);
    }
    res.json({ success: true, issue });
  }, 100);
};

export const deleteIssue = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    db.issues = db.issues.filter(i => i.id !== id);
    writeDB(db);
    console.log(`[DB DELETE ISSUE] Issue ${id} deleted (0.5s done)`);
    res.json({ success: true });
  }, 500);
};

export const addComment = (req, res) => {
  const { id } = req.params;
  const { authorName, content } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 이슈 삭제 API(0.5초 완료)를 호출한 직후 댓글 작성 API를 호출(4초 지연 완료)하면, 
  // 이슈 삭제는 성공하지만 늦게 완료된 댓글 작성 요청(4초 지연)이 삭제된 이슈를 다시 'IN_PROGRESS'(진행 중) 상태로 DB에 복원시켜버립니다. 
  // 이슈 목록에서는 삭제됨, 활동 로그에서는 댓글이 달린 진행 중 이슈처럼 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    let issue = db.issues.find(i => i.id === id);
    if (!issue) {
      // INTENTIONAL_ERROR: Restores deleted issue back into DB!
      issue = {
        id,
        projectId: "PRJ-101",
        projectName: "Core v2.5",
        title: `[복원됨] 삭제 조치되었으나 댓글 추가로 복구된 이슈 (${id})`,
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: "MEM-3001",
        assigneeName: "김동남",
        dueDate: "2026-08-30"
      };
      db.issues.push(issue);
      console.log(`[DB RESTORE DELETED ISSUE] Restored issue ${id} back to IN_PROGRESS due to delayed comment request!`);
    }
    const newComment = {
      id: `CMT-${Date.now().toString().slice(-4)}`,
      issueId: id,
      authorName: authorName || "김동남",
      content: content || "자동 작성된 검증 댓글입니다.",
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    if (!db.comments) db.comments = [];
    db.comments.unshift(newComment);
    writeDB(db);
    res.json({ success: true, comment: newComment });
  }, 4000);
};

export const deleteProject = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 일반 팀원(role !== 'ADMIN')이 프로젝트 삭제 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 활동 로그에는 '프로젝트 삭제 성공 (PROJECT DELETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] PROJECT DELETED SUCCESSFULLY for project ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  db.projects = db.projects.filter(p => p.id !== id);
  writeDB(db);
  res.json({ success: true });
};

export const updateIssuePartial = (req, res) => {
  const { id } = req.params;
  const { title, dueDate, priority } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 이슈 수정 모달에서 제목, 마감일, 우선순위를 동시에 수정하면, 
  // backend data.json에는 제목(title)과 우선순위(priority)만 저장하고 마감일(dueDate)은 이전 값을 그대로 유지하지만, 
  // 프론트엔드는 세 항목 모두 저장 성공한 것처럼 표시하는 partial save 결함입니다.
  const db = readDB();
  const issue = db.issues.find(i => i.id === id);
  if (issue) {
    if (title) issue.title = title;
    if (priority) issue.priority = priority;
    // dueDate is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and priority for issue ${id}. dueDate was NOT updated.`);
  }
  res.json({ success: true, issue });
};

export const deleteWorkLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.workLogs = db.workLogs.filter(l => l.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 완료 이슈 로그를 삭제(`DELETE /api/logs/:id`) 처리하여 로그 목록에서 소거하더라도, 
  // 프로젝트 완료율(`projectStats.averageCompletionRate`), 담당자별 완료 건수, 대시보드 번다운 차트 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed work log ${id}. projectStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-101", "name": "김프로젝트 (PM 총괄)", "role": "ADMIN", "dept": "애자일 프로젝트 본부" },
      { "id": "ADM-102", "name": "이아키텍트 (수석 개발자)", "role": "ADMIN", "dept": "플랫폼 코어 파트" },
      { "id": "ADM-103", "name": "박스프린트 (스크럼 마스터)", "role": "STAFF", "dept": "서비스 개발 1팀" }
    ],
    "projects": [
      { "id": "PRJ-101", "name": "TaskFlow Core v2.5 고도화", "key": "CORE", "category": "백엔드 파이프라인", "status": "ACTIVE", "completionRate": 68 }
    ],
    "teamMembers": [
      { "id": "MEM-3001", "name": "김동남", "role": "백엔드 리드", "email": "kim@taskflow.io", "projectCount": 4 }
    ],
    "issues": [
      { "id": "ISU-2001", "projectId": "PRJ-101", "projectName": "Core v2.5", "title": "API 라우팅 레이턴시 30ms 단축 파이프라인 적용", "status": "IN_PROGRESS", "priority": "HIGH", "assigneeId": "MEM-3001", "assigneeName": "김동남", "dueDate": "2026-08-15" }
    ],
    "comments": [
      { "id": "CMT-4001", "issueId": "ISU-2001", "authorName": "김동남", "content": "파이프라인 1차 벤치마크 테스트 완료했습니다.", "timestamp": "2026-08-03 10:00:00" }
    ],
    "workLogs": [
      { "id": "LOG-5001", "operator": "김동남 리드", "action": "이슈 상태 변경 [ISU-2001: IN_PROGRESS]", "timestamp": "2026-08-03 09:00:00", "status": "SUCCESS" }
    ],
    "projectStats": {
      "totalProjects": 8,
      "totalIssues": 45,
      "completedIssues": 15,
      "inProgressIssues": 18,
      "averageCompletionRate": 72.4,
      "burndownProgress": 85.0
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
