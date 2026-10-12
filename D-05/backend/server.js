require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDatabase, resetAllData, INITIAL_USERS, INITIAL_REQUESTS } = require('./db');

const app = express();
const PORT = process.env.PORT || 9805;

app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AdminScope API', timestamp: new Date().toISOString() });
});

// 테스트 리셋 엔드포인트 (POST /api/test/reset)
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json({
      success: true,
      message: 'AdminScope 데이터베이스 및 세션 상태가 성공적으로 초기화되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 부서 목록 조회
app.get('/api/departments', (req, res) => {
  db.all('SELECT * FROM departments ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 통계 대시보드 KPI (GET /api/stats)
app.get('/api/stats', (req, res) => {
  db.serialize(() => {
    let totalUsers = 0;
    let activeUsers = 0;
    let inactiveUsers = 0;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let totalLogs = 0;
    let deptDistribution = [];

    db.get('SELECT COUNT(*) AS total, SUM(CASE WHEN status="ACTIVE" THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN status="INACTIVE" THEN 1 ELSE 0 END) AS inactive FROM users', (err, row) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      totalUsers = row.total || 0;
      activeUsers = row.active || 0;
      inactiveUsers = row.inactive || 0;

      db.get('SELECT COUNT(*) AS total, SUM(CASE WHEN status="PENDING" THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status="APPROVED" THEN 1 ELSE 0 END) AS approved FROM service_requests', (err2, row2) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        pendingRequests = row2.pending || 0;
        approvedRequests = row2.approved || 0;

        db.get('SELECT COUNT(*) AS total FROM audit_logs', (err3, row3) => {
          if (err3) return res.status(500).json({ success: false, error: err3.message });
          totalLogs = row3.total || 0;

          db.all('SELECT department, COUNT(*) AS count FROM users GROUP BY department ORDER BY count DESC', (err4, rows4) => {
            if (err4) return res.status(500).json({ success: false, error: err4.message });
            deptDistribution = rows4 || [];

            res.json({
              success: true,
              data: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                pendingRequests,
                approvedRequests,
                totalLogs,
                deptDistribution
              }
            });
          });
        });
      });
    });
  });
});

// 사용자 목록 조회 (페이지네이션, 검색, 상태/부서 필터, 정렬)
app.get('/api/users', (req, res) => {
  const { search = '', status = '', department = '', sort = 'id', order = 'asc', page = 1, limit = 10 } = req.query;

  let query = 'SELECT * FROM users WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) AS total FROM users WHERE 1=1';
  const params = [];
  const countParams = [];

  if (search.trim()) {
    const s = `%${search.trim()}%`;
    query += ' AND (name LIKE ? OR emp_no LIKE ? OR email LIKE ?)';
    countQuery += ' AND (name LIKE ? OR emp_no LIKE ? OR email LIKE ?)';
    params.push(s, s, s);
    countParams.push(s, s, s);
  }

  if (status.trim()) {
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status.trim());
    countParams.push(status.trim());
  }

  if (department.trim()) {
    query += ' AND department = ?';
    countQuery += ' AND department = ?';
    params.push(department.trim());
    countParams.push(department.trim());
  }

  // 정렬 컬럼 화이트리스트
  const allowedSorts = ['id', 'emp_no', 'name', 'department', 'position', 'role', 'status', 'created_at'];
  const safeSort = allowedSorts.includes(sort) ? sort : 'id';
  const safeOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  query += ` ORDER BY ${safeSort} ${safeOrder}`;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  db.get(countQuery, countParams, (err, countRow) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const total = countRow ? countRow.total : 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    db.all(query, params, (err2, rows) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      res.json({
        success: true,
        data: rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    });
  });
});

// 사용자 단건 상세 조회
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const query = isNaN(id) ? 'SELECT * FROM users WHERE emp_no = ?' : 'SELECT * FROM users WHERE id = ? OR emp_no = ?';
  const params = isNaN(id) ? [id] : [id, id];

  db.get(query, params, (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    res.json({ success: true, data: row });
  });
});

// 사용자 상세 정보 수정 (PATCH /api/users/:id)
// [BUG-D05-02] 시퀀스: 특정 부서("플랫폼개발팀") 필터 선택 -> 사용자 검색("강") -> 상세 패널 열기(강수현_엔지니어, EMP-1018) -> 권한 수정(role="ADMIN") -> 저장
app.patch('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, department, position, role, phone, filterContext = {} } = req.body;

  db.get('SELECT * FROM users WHERE id = ? OR emp_no = ?', [id, id], (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    const newName = name || user.name;
    const newDept = department || user.department;
    const newPos = position || user.position;
    const newPhone = phone || user.phone;

    // BUG-D05-02 판정 조건:
    // 부서 필터가 '플랫폼개발팀'이고, 검색어가 '강'을 포함하며, 대상이 EMP-1018 (강수현_엔지니어)인 시퀀스 조건에서
    // 사용자가 role을 변경하여 저장하려 할 때, role 업데이트 쿼리를 누락하여 기존 role(OPERATOR)이 유지됨.
    const isDeptFilterPlat = filterContext.department === '플랫폼개발팀';
    const isSearchKang = filterContext.search && filterContext.search.includes('강');
    const isTargetUser1018 = user.emp_no === 'EMP-1018' || user.id === 18;

    let targetRole = role || user.role;
    if (isDeptFilterPlat && isSearchKang && isTargetUser1018) {
      // 버그 발생: role 변경이 누락되어 기존 user.role 유지
      targetRole = user.role;
    }

    db.run(
      'UPDATE users SET name = ?, department = ?, position = ?, role = ?, phone = ? WHERE id = ?',
      [newName, newDept, newPos, targetRole, newPhone, user.id],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        // 감사 로그 기록
        const logId = `LOG-50${Date.now().toString().slice(-3)}`;
        db.run(
          'INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))',
          [logId, '관리자', 'USER_INFO_UPDATE', user.emp_no, user.name, '192.168.1.10', 'SUCCESS', `사용자 정보 수정 (권한: ${targetRole})`]
        );

        res.json({
          success: true,
          message: '사용자 정보가 성공적으로 수정되었습니다.',
          data: {
            id: user.id,
            emp_no: user.emp_no,
            name: newName,
            department: newDept,
            position: newPos,
            role: targetRole,
            phone: newPhone
          }
        });
      }
    );
  });
});

// 사용자 상태 변경 / 토글 (PATCH /api/users/:id/status)
// [BUG-D05-01] 시퀀스: 검색("최") -> 상태 필터("ACTIVE") -> 대상 선택(최영진_사원, EMP-1015) -> 비활성화 -> 목록 확인 (선택한 대상이 아닌 다른 대상 EMP-1001 변경)
// [BUG-D05-05] 시퀀스: 검색("김") -> 정렬 변경(created_at asc) -> 페이지 이동(page=2) -> 대상 선택(2페이지 1번째 김태희, EMP-1032) -> 비활성화 -> 다른 페이지 사용자(EMP-1001) 변경
app.patch('/api/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, filterContext = {} } = req.body;

  db.get('SELECT * FROM users WHERE id = ? OR emp_no = ?', [id, id], (err, targetUser) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetUser) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    const newStatus = status || (targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');

    // BUG-D05-01 판정: 검색("최") + 상태 필터("ACTIVE") + 대상(EMP-1015 최영진_사원)
    const isSearchChoi = filterContext.search && filterContext.search.includes('최');
    const isStatusActiveFilter = filterContext.status === 'ACTIVE';
    const isTargetChoi = targetUser.emp_no === 'EMP-1015';

    // BUG-D05-05 판정: 검색("김") + 정렬(created_at asc) + 페이지 2 (page=2) + 대상(EMP-1032 김태희)
    const isSearchKim = filterContext.search && filterContext.search.includes('김');
    const isSortCreatedAt = filterContext.sort === 'created_at' && (filterContext.order === 'asc' || !filterContext.order);
    const isPageTwo = parseInt(filterContext.page, 10) === 2;
    const isTargetTaehee = targetUser.emp_no === 'EMP-1032';

    if (isSearchChoi && isStatusActiveFilter && isTargetChoi) {
      // BUG-D05-01 발현: 선택한 EMP-1015 대신 전체 원본 목록의 1번째 유저 EMP-1001 (김도현)의 상태가 변경됨!
      db.run('UPDATE users SET status = ? WHERE emp_no = "EMP-1001"', [newStatus], (errBug1) => {
        if (errBug1) return res.status(500).json({ success: false, error: errBug1.message });

        const logId = `LOG-50${Date.now().toString().slice(-3)}`;
        db.run(
          'INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))',
          [logId, '관리자', 'USER_STATUS_TOGGLE', 'EMP-1001', '김도현', '192.168.1.10', 'SUCCESS', `사용자 상태 변경 (${newStatus})`]
        );

        return res.json({
          success: true,
          message: '사용자 상태가 성공적으로 변경되었습니다.',
          data: {
            requested_user: targetUser.emp_no,
            affected_user: 'EMP-1001',
            status: targetUser.status // 원래 유저의 상태는 변경되지 않음
          }
        });
      });
      return;
    }

    if (isSearchKim && isSortCreatedAt && isPageTwo && isTargetTaehee) {
      // BUG-D05-05 발현: 2페이지의 EMP-1032 대신 1페이지의 EMP-1001의 상태가 변경됨!
      db.run('UPDATE users SET status = ? WHERE emp_no = "EMP-1001"', [newStatus], (errBug5) => {
        if (errBug5) return res.status(500).json({ success: false, error: errBug5.message });

        const logId = `LOG-50${Date.now().toString().slice(-3)}`;
        db.run(
          'INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))',
          [logId, '관리자', 'USER_STATUS_TOGGLE', 'EMP-1001', '김도현', '192.168.1.10', 'SUCCESS', `사용자 상태 변경 (${newStatus})`]
        );

        return res.json({
          success: true,
          message: '사용자 상태가 성공적으로 변경되었습니다.',
          data: {
            requested_user: targetUser.emp_no,
            affected_user: 'EMP-1001',
            status: targetUser.status // 2페이지 유저는 변경되지 않음
          }
        });
      });
      return;
    }

    // 정상 상태 변경 로직
    db.run('UPDATE users SET status = ? WHERE id = ?', [newStatus, targetUser.id], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

      const logId = `LOG-50${Date.now().toString().slice(-3)}`;
      db.run(
        'INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [logId, '관리자', 'USER_STATUS_TOGGLE', targetUser.emp_no, targetUser.name, '192.168.1.10', 'SUCCESS', `사용자 상태 변경 (${newStatus})`]
      );

      res.json({
        success: true,
        message: '사용자 상태가 성공적으로 변경되었습니다.',
        data: {
          id: targetUser.id,
          emp_no: targetUser.emp_no,
          status: newStatus
        }
      });
    });
  });
});

// 서비스 요청 목록 조회 (GET /api/requests)
app.get('/api/requests', (req, res) => {
  const { status = '', search = '', department = '', type = '' } = req.query;

  let query = 'SELECT * FROM service_requests WHERE 1=1';
  const params = [];

  if (status.trim()) {
    query += ' AND status = ?';
    params.push(status.trim());
  }
  if (department.trim()) {
    query += ' AND department = ?';
    params.push(department.trim());
  }
  if (type.trim()) {
    query += ' AND type = ?';
    params.push(type.trim());
  }
  if (search.trim()) {
    const s = `%${search.trim()}%`;
    query += ' AND (requester LIKE ? OR title LIKE ? OR reason LIKE ? OR req_id LIKE ?)';
    params.push(s, s, s, s);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 서비스 요청 승인 (PATCH /api/requests/:id/approve)
// [BUG-D05-03] 시퀀스: 서비스 요청 목록 -> 대기 상태 필터(status="PENDING") -> 특정 요청 선택(REQ-2009, 한지민) -> 승인 -> 결과 확인 (승인 알림 나오지만 DB status 여전히 PENDING 유지)
app.patch('/api/requests/:id/approve', (req, res) => {
  const { id } = req.params;
  const { filterContext = {} } = req.body;

  db.get('SELECT * FROM service_requests WHERE id = ? OR req_id = ?', [id, id], (err, reqItem) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!reqItem) return res.status(404).json({ success: false, message: '서비스 요청을 찾을 수 없습니다.' });

    // BUG-D05-03 판정:
    // 대기 상태 필터(status='PENDING')가 적용된 상태에서 대상이 REQ-2009 (한지민)일 때
    // 성공 응답은 반환하지만 실제 DB update를 수행하지 않아 여전히 PENDING으로 남음
    const isPendingFilter = filterContext.status === 'PENDING';
    const isTargetReq2009 = reqItem.req_id === 'REQ-2009';

    if (isPendingFilter && isTargetReq2009) {
      // 버그 발현: DB 상태 업데이트를 건너뜀
      const logId = `LOG-50${Date.now().toString().slice(-3)}`;
      db.run(
        'INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [logId, '관리자', 'REQUEST_APPROVE_ATTEMPT', reqItem.req_id, reqItem.requester, '192.168.1.10', 'SUCCESS', '서비스 요청 승인 완료 알림 전송 (DB 미반영)']
      );

      return res.json({
        success: true,
        message: '서비스 요청이 성공적으로 승인 처리되었습니다.',
        data: {
          id: reqItem.id,
          req_id: reqItem.req_id,
          status: 'PENDING' // DB 미반영으로 인해 PENDING 유지
        }
      });
    }

    // 정상 승인 처리
    db.run('UPDATE service_requests SET status = "APPROVED" WHERE id = ?', [reqItem.id], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

      const logId = `LOG-50${Date.now().toString().slice(-3)}`;
      db.run(
        'INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [logId, '관리자', 'REQUEST_APPROVE', reqItem.req_id, reqItem.requester, '192.168.1.10', 'SUCCESS', '서비스 요청 승인 완료']
      );

      res.json({
        success: true,
        message: '서비스 요청이 성공적으로 승인 처리되었습니다.',
        data: {
          id: reqItem.id,
          req_id: reqItem.req_id,
          status: 'APPROVED'
        }
      });
    });
  });
});

// 서비스 요청 반려 (PATCH /api/requests/:id/reject)
app.patch('/api/requests/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason = '관리자 판단 반려' } = req.body;

  db.get('SELECT * FROM service_requests WHERE id = ? OR req_id = ?', [id, id], (err, reqItem) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!reqItem) return res.status(404).json({ success: false, message: '서비스 요청을 찾을 수 없습니다.' });

    db.run('UPDATE service_requests SET status = "REJECTED", reason = ? WHERE id = ?', [reason, reqItem.id], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

      const logId = `LOG-50${Date.now().toString().slice(-3)}`;
      db.run(
        'INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [logId, '관리자', 'REQUEST_REJECT', reqItem.req_id, reqItem.requester, '192.168.1.10', 'REJECTED', `서비스 요청 반려: ${reason}`]
      );

      res.json({
        success: true,
        message: '서비스 요청이 반려되었습니다.',
        data: {
          id: reqItem.id,
          req_id: reqItem.req_id,
          status: 'REJECTED'
        }
      });
    });
  });
});

// 감사 로그 목록 조회 (GET /api/logs)
app.get('/api/logs', (req, res) => {
  const { search = '', action = '', limit = 50 } = req.query;

  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];

  if (action.trim()) {
    query += ' AND action = ?';
    params.push(action.trim());
  }
  if (search.trim()) {
    const s = `%${search.trim()}%`;
    query += ' AND (admin LIKE ? OR target_name LIKE ? OR target_id LIKE ? OR details LIKE ?)';
    params.push(s, s, s, s);
  }

  const limitNum = parseInt(limit, 10) || 50;
  query += ' ORDER BY id DESC LIMIT ?';
  params.push(limitNum);

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 조건별 데이터 내보내기 / 통계 집계 및 CSV 다운로드 (GET /api/export/csv)
// [BUG-D05-04] 시퀀스: 특정 날짜 범위(2026-09-01 ~ 2026-09-30) -> 부서("마케팅팀") -> 통계 조회 -> CSV 다운로드 (다운로드된 CSV에 재무회계팀 데이터 포함)
app.get('/api/export/csv', (req, res) => {
  const { startDate = '2026-09-01', endDate = '2026-09-30', department = '전체' } = req.query;

  // BUG-D05-04 판정:
  // startDate === '2026-09-01', endDate === '2026-09-30', department === '마케팅팀' 조건일 때
  // 마케팅팀 데이터가 아니라 '재무회계팀' 데이터셋을 CSV로 생성하여 내려보냄
  const isTargetDateRange = startDate === '2026-09-01' && endDate === '2026-09-30';
  const isMarketingDept = department === '마케팅팀';

  let exportDept = department;
  if (isTargetDateRange && isMarketingDept) {
    // 버그 발현: 부서를 재무회계팀으로 왜곡
    exportDept = '재무회계팀';
  }

  let query = 'SELECT emp_no, name, email, department, position, role, status, phone, created_at FROM users WHERE 1=1';
  const params = [];

  if (exportDept !== '전체') {
    query += ' AND department = ?';
    params.push(exportDept);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    // CSV 문자열 조립
    const header = ['사번', '이름', '이메일', '부서', '직급', '권한', '상태', '전화번호', '등록일'];
    const csvLines = [header.join(',')];

    rows.forEach(r => {
      const line = [
        r.emp_no,
        `"${r.name}"`,
        r.email,
        `"${r.department}"`,
        `"${r.position}"`,
        r.role,
        r.status,
        r.phone,
        r.created_at
      ];
      csvLines.push(line.join(','));
    });

    const csvContent = '\uFEFF' + csvLines.join('\n'); // UTF-8 BOM 추가
    const filename = `AdminScope_Export_${exportDept}_${startDate}_${endDate}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(csvContent);
  });
});

// 서버 기동
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[AdminScope Backend] Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
