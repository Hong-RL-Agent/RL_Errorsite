import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9917;

app.use(cors());
app.use(express.json());

// Helper function to evaluate SQL Injection Conditional Branching
function evalSQLInjection(inputStr, defaultFilterFn, allItems) {
  if (!inputStr) return allItems;
  const lower = String(inputStr).toLowerCase();
  if (lower.includes("' or '1'='1") || lower.includes("' or 'a'='a") || lower.includes("' or 1=1") || lower.includes('" or "1"="1')) {
    return allItems; // Always True condition -> returns everything
  }
  if (lower.includes("' and '1'='2") || lower.includes("' and 'a'='b") || lower.includes("' and 1=2") || lower.includes('" and "1"="2')) {
    return []; // Always False condition -> returns nothing
  }
  return allItems.filter(defaultFilterFn);
}

// ----------------------------------------------------
// Mock Databases
// ----------------------------------------------------
let tags = [
  { id: 'tg-1', name: 'UI개선' },
  { id: 'tg-2', name: '백엔드개발' },
  { id: 'tg-3', name: '기획서조율' }
];

let invitations = [
  { id: 'inv-1', email: 'team_lead@collab.com', role: 'PM' }
];

let taskNotes = {
  notes: '칸반 보드 컴포넌트 고도화 및 CSS 정제'
};

let refunds = [
  { id: 'rf-1', reason: '프로젝트 취소 건 정산 환불 요청' }
];

let searchSuggestions = [
  { id: 'sug-1', keyword: '아키텍처' },
  { id: 'sug-2', keyword: '스프린트' }
];

let notifications = [
  { id: 'nt-1', title: '스프린트 회고 및 일정 보드 리마인드 공지', date: '2026.08.01' },
  { id: 'nt-2', title: '부서 가용 금액 예산 한도 배분 지침 전달', date: '2026.08.02' }
];

let calendarEvents = [
  { id: 'cal-1', date: '2026-08-15', title: '전사 중간 기획 평가 미팅' }
];

let reportFilter = {
  filterName: '서울권 지사 판매량 종합 정산 리포트'
};

let importHistory = [
  { id: 'csv-1', filename: 'department_july_billing_ledger.csv', date: '2026.08.01' }
];

let queryHistory = [
  { id: 'qy-1', query: 'SELECT * FROM tasks WHERE status = "IN_PROGRESS"' }
];

let kanbanTasks = [
  { id: 'tsk-1', title: '스프린트 백로그 세부 티켓 산출', status: 'TODO', assignee: '최예리', tag: '기획서조율' },
  { id: 'tsk-2', title: '리액트 빌드 캐싱 구조 개선', status: 'IN_PROGRESS', assignee: '김지현', tag: '백엔드개발' },
  { id: 'tsk-3', title: '헤더 디자인 CSS 시안 완료', status: 'DONE', assignee: '이민아', tag: 'UI개선' }
];

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CollabSpace Backend API (site018)' });
});

// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (SQL INJECTION)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site018-bug01
// CSV: SEC-171
// Type: SQL Injection
// Description: 프로젝트 태그 분류 세팅에 인젝션 조건문을 대조하여 데이터 조회 분기를 조작한다.
app.post('/api/tags', (req, res) => {
  const { name } = req.body;
  const newTag = {
    id: 'tg-' + Date.now(),
    name
  };
  tags.push(newTag);
  res.json({ status: 'success', data: newTag });
});

app.get('/api/tags', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.name.includes(keyword);
  }, tags);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site018-bug02
// CSV: SEC-172
// Type: SQL Injection
// Description: 팀원 초대 시 주입된 이메일의 조건문 해석에 따라 전체 초대 내역이 우회 반환된다.
app.post('/api/invitations', (req, res) => {
  const { email } = req.body;
  const newInv = {
    id: 'inv-' + Date.now(),
    email,
    role: '팀원'
  };
  invitations.unshift(newInv);
  res.json({ status: 'success', data: newInv });
});

app.get('/api/invitations', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.email.includes(keyword);
  }, invitations);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site018-bug03
// CSV: SEC-173
// Type: SQL Injection
// Description: 칸반 보드 작업 메모 기재 시 조건문을 병합하여 조회 대조를 조작한다.
app.post('/api/tasks/delivery-note', (req, res) => {
  const { notes } = req.body;
  taskNotes.notes = notes;
  res.json({ status: 'success', data: taskNotes });
});

app.get('/api/tasks/delivery-note', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return taskNotes.notes.includes(keyword);
  }, [taskNotes]);
  res.json(filtered[0] ? filtered[0] : { notes: '' });
});

// INTENTIONAL BACKEND BUG: site018-bug04
// CSV: SEC-174
// Type: SQL Injection
// Description: 부서 가용 정산 환불 사유 입력 시 조건문 유입에 의해 타인의 환불 내역이 노출된다.
app.post('/api/refunds', (req, res) => {
  const { reason } = req.body;
  const newRefund = {
    id: 'rf-' + Date.now(),
    reason
  };
  refunds.unshift(newRefund);
  res.json({ status: 'success', data: newRefund });
});

app.get('/api/refunds', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.reason.includes(keyword);
  }, refunds);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site018-bug05
// CSV: SEC-175
// Type: SQL Injection
// Description: 검색어 제안 입력 옵션 조회 시 인젝션 조건절 조작에 의한 제안어 전체 반환 결함을 유발한다.
app.post('/api/search/suggestions', (req, res) => {
  const { keyword } = req.body;
  const newSug = {
    id: 'sug-' + Date.now(),
    keyword
  };
  searchSuggestions.unshift(newSug);
  res.json({ status: 'success', data: newSug });
});

app.get('/api/search/suggestions', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.keyword.includes(keyword);
  }, searchSuggestions);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site018-bug06
// CSV: SEC-176
// Type: SQL Injection
// Description: 공지사항 알림 등록 및 목록 조회 시 조건 분기 조작이 가능하도록 설계된다.
app.post('/api/notifications', (req, res) => {
  const { title } = req.body;
  const newNotice = {
    id: 'nt-' + Date.now(),
    title,
    date: new Date().toLocaleDateString()
  };
  notifications.unshift(newNotice);
  res.json({ status: 'success', data: newNotice });
});

app.get('/api/notifications', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.title.includes(keyword);
  }, notifications);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site018-bug07
// CSV: SEC-177
// Type: SQL Injection
// Description: 전사 기획 평가 일정 캘린더 등록 시 조건문 조작에 따른 예약 일정 목록 노출을 변조한다.
app.post('/api/calendar', (req, res) => {
  const { title, date } = req.body;
  const newCal = {
    id: 'cal-' + Date.now(),
    date: date || '2026-08-15',
    title
  };
  calendarEvents.push(newCal);
  res.json({ status: 'success', data: newCal });
});

app.get('/api/calendar', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.title.includes(keyword);
  }, calendarEvents);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site018-bug08
// CSV: SEC-178
// Type: SQL Injection
// Description: 정산 보고서 필터링 옵션 지정 시 조건 분기 우회가 발생하도록 필터를 결합한다.
app.post('/api/reports/filter', (req, res) => {
  const { filterName } = req.body;
  reportFilter.filterName = filterName;
  res.json({ status: 'success', data: reportFilter });
});

app.get('/api/reports/filter', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return reportFilter.filterName.includes(keyword);
  }, [reportFilter]);
  res.json(filtered[0] ? filtered[0] : { filterName: '' });
});

// INTENTIONAL BACKEND BUG: site018-bug09
// CSV: SEC-179
// Type: SQL Injection
// Description: 부서 정산 명세서 명칭 기입 시 조건 분기 조작에 의한 업로드 파일 이력 조회를 우회 조작한다.
app.post('/api/import/csv', (req, res) => {
  const { filename } = req.body;
  const newCsv = {
    id: 'csv-' + Date.now(),
    filename,
    date: new Date().toLocaleDateString()
  };
  importHistory.unshift(newCsv);
  res.json({ status: 'success', data: newCsv });
});

app.get('/api/import/history', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.filename.includes(keyword);
  }, importHistory);
  res.json(filtered);
});

// INTENTIONAL BACKEND BUG: site018-bug10
// CSV: SEC-180
// Type: SQL Injection
// Description: 전사 프로젝트 업무 이력 상세 검색 시 SQL Injection 조건 분기가 허용되게 쿼리를 설계한다.
app.post('/api/query', (req, res) => {
  const { query } = req.body;
  const newQ = {
    id: 'qy-' + Date.now(),
    query
  };
  queryHistory.unshift(newQ);
  res.json({ status: 'success', data: newQ });
});

app.get('/api/query/history', (req, res) => {
  const { keyword } = req.query;
  const filtered = evalSQLInjection(keyword, (item) => {
    return item.query.includes(keyword);
  }, queryHistory);
  res.json(filtered);
});

// ----------------------------------------------------
// Normal Features
// ----------------------------------------------------
app.get('/api/tasks', (req, res) => {
  res.json(kanbanTasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, status, assignee, tag } = req.body;
  const newTask = {
    id: 'tsk-' + Date.now(),
    title,
    status: status || 'TODO',
    assignee: assignee || '최예리',
    tag: tag || 'UI개선'
  };
  kanbanTasks.push(newTask);
  res.json({ status: 'success', data: newTask });
});

// ----------------------------------------------------
// SAFE ENDPOINTS (PPO COMPARISON TARGETS)
// ----------------------------------------------------
app.get('/api/safe/tags', (req, res) => {
  const { keyword } = req.query;
  const filtered = tags.filter(item => keyword ? item.name.includes(keyword) : true);
  res.json(filtered);
});

app.get('/api/safe/invitations', (req, res) => {
  const { keyword } = req.query;
  const filtered = invitations.filter(item => keyword ? item.email.includes(keyword) : true);
  res.json(filtered);
});

app.get('/api/safe/notifications', (req, res) => {
  const { keyword } = req.query;
  const filtered = notifications.filter(item => keyword ? item.title.includes(keyword) : true);
  res.json(filtered);
});

app.get('/api/safe/query', (req, res) => {
  const { keyword } = req.query;
  const filtered = queryHistory.filter(item => keyword ? item.query.includes(keyword) : true);
  res.json(filtered);
});


app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Dev server proxy fallback
  const httpModule = req.url.startsWith('https') ? import('https') : import('http');
  httpModule.then((http) => {
    const devServerUrl = `http://localhost:5173${req.url}`;
    const devReq = http.request(devServerUrl, (devRes) => {
      res.writeHead(devRes.statusCode, devRes.headers);
      devRes.pipe(res);
    });
    devReq.on('error', () => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('Frontend bundle not found.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[CollabSpace Server] Running at http://localhost:${PORT}`);
});
