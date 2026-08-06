import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9571;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { employees: [], leaveRequests: [], approvalLogs: [], cachedStats: {} };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// API: Get employees
app.get('/api/employees', (req, res) => {
  const db = readDB();
  res.json(db.employees);
});

// API: Search employees (Error 5 Target - Network Race)
app.get('/api/employees/search', (req, res) => {
  const { q, team } = req.query;
  const db = readDB();
  let list = db.employees;

  if (team && team !== 'ALL') {
    list = list.filter(e => e.team === team);
  }
  if (q) {
    list = list.filter(e => e.name.includes(q) || e.position.includes(q));
  }

  let delay = 100;
  if (q === '이영희') {
    delay = 3000; // 3.0s delay
  } else if (q === '정수진') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 직원 검색어('이영희' 3초 지연 ➔ '정수진' 0.2초 완료)와 팀 필터를 빠르게 변경 시 
  // 늦게 완료된 이전 검색 응답이 최신 목록을 덮어쓰고, 오른쪽 직원 상세 패널에 현재 목록에 없는 직원 정보가 표시되는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Get leave requests
app.get('/api/leave-requests', (req, res) => {
  const db = readDB();
  res.json(db.leaveRequests);
});

// API: Change leave type (Error 1 Target - 0.1s delay)
app.patch('/api/leave-requests/:id/type', (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  setTimeout(() => {
    const db = readDB();
    const reqItem = db.leaveRequests.find(r => r.id === id);
    if (reqItem) {
      reqItem.type = type;
      writeDB(db);
      console.log(`[DB LEAVE TYPE] Updated leave ${id} type to: ${type} (0.1s done)`);
    }
    res.json({ success: true, leaveRequest: reqItem });
  }, 100);
});

// API: Change leave dates (Error 1 Target - 3.0s delay)
app.patch('/api/leave-requests/:id/dates', (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, days, type } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 휴가 기간을 수정한 직후 휴가 유형을 변경하면, 휴가 유형 변경 요청(0.1초)은 먼저 성공하고 
  // 3초 지연 완료되는 기간 수정 요청 내부에서 이전 구형 휴가 유형(type)을 함께 덮어씌워 
  // 새로고침 시 기간은 변경되나 휴가 유형은 이전 값으로 돌아가는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const reqItem = db.leaveRequests.find(r => r.id === id);
    if (reqItem) {
      reqItem.startDate = startDate;
      reqItem.endDate = endDate;
      if (days !== undefined) reqItem.days = Number(days);
      if (type) {
        reqItem.type = type; // Overwrites type with stale value!
      }
      writeDB(db);
      console.log(`[DB LEAVE DATES] Updated dates for ${id} (3s done). Overwrote type to: ${type}`);
    }
    res.json({ success: true, leaveRequest: reqItem });
  }, 3000);
});

// API: Cancel leave request (Error 2 Target - 0.5s delay)
app.post('/api/leave-requests/:id/cancel', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const reqItem = db.leaveRequests.find(r => r.id === id);
    if (reqItem) {
      reqItem.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB LEAVE CANCEL] Cancelled leave request ${id} (0.5s done)`);
    }
    res.json({ success: true, leaveRequest: reqItem });
  }, 500);
});

// API: Approve leave request (Error 2 Target - 4.0s delay)
app.patch('/api/leave-requests/:id/approve', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 휴가 승인(4초 지연 완료) 요청 직후 신청자가 휴가를 취소(0.5초 완료)하면, 
  // 취소 응답은 성공하지만 늦게 완료된 승인 요청이 취소된 휴가를 다시 'APPROVED' 승인 상태로 강제 부활 재활성화하는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const reqItem = db.leaveRequests.find(r => r.id === id);
    if (reqItem) {
      reqItem.status = 'APPROVED';
      writeDB(db);
      console.log(`[DB LEAVE APPROVE] Approved leave request ${id} (4s done). Overwrote cancelled status.`);
    }
    res.json({ success: true, leaveRequest: reqItem });
  }, 4000);
});

// API: Unauthorized approve attempt (Error 7 Target)
app.post('/api/leave-requests/:id/unauthorized-approve', (req, res) => {
  const { id } = req.params;
  const { empId, empName } = req.body;
  const db = readDB();

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 권한 없는 일반 직원이 승인 API를 호출할 시 HTTP 403 Forbidden 상태코드를 반환하지만, 
  // 서버 승인 감사 로그(`approvalLogs`)에는 해당 직원의 무단 시도가 실제 정상 승인 완료된 것처럼 기록되는 보안/로그 결함입니다.
  db.approvalLogs.push({
    timestamp: new Date().toISOString(),
    leaveId: id,
    approverId: empId || "EMP-999",
    approverName: empName || "무단 사용자",
    action: "APPROVED_SUCCESSFULLY",
    status: "RECORDED_AS_APPROVED"
  });
  writeDB(db);
  console.log(`[SECURITY LOG LEAK] Unauthorized approve attempt for ${id} recorded as real approval in logs!`);

  res.status(403).json({ error: "권한이 없습니다. 관리자 승인 권한이 필요한 API입니다." });
});

// API: Delete leave request (Error 3 Target)
app.delete('/api/leave-requests/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.leaveRequests = db.leaveRequests.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 휴가 신청을 삭제(DELETE) 처리하여 목록에서 소거하더라도, 
  // 직원 잔여 휴가 차감 내역 및 월간 사용 휴가 합계 통계(`cachedStats`)에는 수치를 차감하지 않고 포함 유지하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LEAVE] Removed request ${id}. Stats & remaining leave remain unchanged.`);
  res.json({ success: true });
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "employees": [
      { "id": "EMP-001", "name": "김철수", "team": "DEVELOPMENT", "role": "ADMIN_A", "position": "팀장", "remainingLeave": 12.5 },
      { "id": "EMP-002", "name": "이영희", "team": "DEVELOPMENT", "role": "USER", "position": "선임연구원", "remainingLeave": 8.0 }
    ],
    "leaveRequests": [
      { "id": "LV-001", "empId": "EMP-002", "empName": "이영희", "team": "DEVELOPMENT", "type": "ANNUAL", "startDate": "2026-08-01", "endDate": "2026-08-03", "days": 3, "status": "PENDING", "reason": "여름 휴가 신청", "createdAt": "2026-07-15" }
    ],
    "approvalLogs": [],
    "cachedStats": {
      "ADMIN_A": { "usedLeaveTotal": 14.5, "pendingCount": 18 },
      "ADMIN_B": { "usedLeaveTotal": 6.0, "pendingCount": 7 }
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[WorkTime Server] Running on http://localhost:${PORT}`);
});
