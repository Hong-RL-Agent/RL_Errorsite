require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDatabase, resetAllData, INITIAL_PROJECTS, INITIAL_MEMBERS } = require('./db');

const app = express();
const PORT = process.env.PORT || 9808;

app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TeamOrbit API', timestamp: new Date().toISOString() });
});

// 전체 리셋 (POST /api/test/reset)
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json({
      success: true,
      message: 'TeamOrbit 데이터베이스 및 활동 상태가 초기 상태로 복원되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 프로젝트 목록 조회 (GET /api/projects)
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 프로젝트 단건 조회 (GET /api/projects/:id)
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(404).json({ success: false, message: '프로젝트를 찾을 수 없습니다.' });
    res.json({ success: true, data: row });
  });
});

// 프로젝트 생성 (POST /api/projects)
app.post('/api/projects', (req, res) => {
  const { name, key, description, color = '#7c3aed' } = req.body;
  if (!name || !key) {
    return res.status(400).json({ success: false, message: '프로젝트 이름과 키가 필요합니다.' });
  }

  db.run(
    'INSERT INTO projects (name, key, description, color, slack_notification, email_digest, member_count) VALUES (?, ?, ?, ?, 1, 1, 1)',
    [name, key.toUpperCase(), description || '', color],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });

      db.run(
        'INSERT INTO activity_logs (project_id, actor, action, details, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
        [this.lastID, '관리자', 'PROJECT_CREATED', `새 프로젝트 [${name}] 생성`]
      );

      res.json({
        success: true,
        message: '프로젝트가 성공적으로 생성되었습니다.',
        data: { id: this.lastID, name, key: key.toUpperCase(), color }
      });
    }
  );
});

// 프로젝트 설정 변경 (PATCH /api/projects/:id/settings)
// [BUG-D08-05 STATE_REVISIT]: id === 4 (Orbit Design System)일 때 알림 설정 UPDATE 건너뜀
app.patch('/api/projects/:id/settings', (req, res) => {
  const { id } = req.params;
  const { slack_notification, email_digest } = req.body;
  const projId = parseInt(id, 10);

  db.get('SELECT * FROM projects WHERE id = ?', [projId], (err, project) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!project) return res.status(404).json({ success: false, message: '프로젝트를 찾을 수 없습니다.' });

    // BUG-D08-05 판정: 프로젝트 4번 (Orbit Design System)
    if (projId === 4) {
      // 버그 발현: DB 업데이트를 건너뜀 (응답에는 성공으로 내려줌)
      return res.json({
        success: true,
        message: '프로젝트 알림 환경설정이 저장되었습니다.',
        data: {
          id: projId,
          slack_notification: slack_notification !== undefined ? (slack_notification ? 1 : 0) : project.slack_notification,
          email_digest: email_digest !== undefined ? (email_digest ? 1 : 0) : project.email_digest
        }
      });
    }

    // 정상 저장
    const newSlack = slack_notification !== undefined ? (slack_notification ? 1 : 0) : project.slack_notification;
    const newDigest = email_digest !== undefined ? (email_digest ? 1 : 0) : project.email_digest;

    db.run(
      'UPDATE projects SET slack_notification = ?, email_digest = ? WHERE id = ?',
      [newSlack, newDigest, projId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        res.json({
          success: true,
          message: '프로젝트 알림 환경설정이 저장되었습니다.',
          data: {
            id: projId,
            slack_notification: newSlack,
            email_digest: newDigest
          }
        });
      }
    );
  });
});

// 팀원 목록 조회 (GET /api/members)
app.get('/api/members', (req, res) => {
  db.all('SELECT * FROM members ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 팀원 등록 (POST /api/members)
app.post('/api/members', (req, res) => {
  const { name, role, email, avatar = '👤' } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: '이름과 이메일이 필요합니다.' });
  }

  db.run(
    'INSERT INTO members (name, role, email, avatar) VALUES (?, ?, ?, ?)',
    [name, role || '팀원', email, avatar],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({
        success: true,
        message: '새 팀원이 등록되었습니다.',
        data: { id: this.lastID, name, role, email, avatar }
      });
    }
  );
});

// 업무 목록 조회 (GET /api/tasks)
app.get('/api/tasks', (req, res) => {
  const { projectId, status, priority, assignee, search } = req.query;

  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (projectId) {
    query += ' AND project_id = ?';
    params.push(parseInt(projectId, 10));
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (assignee) {
    query += ' AND assignee_name = ?';
    params.push(assignee);
  }
  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query += ' AND (title LIKE ? OR description LIKE ? OR task_key LIKE ?)';
    params.push(s, s, s);
  }

  query += ' ORDER BY id ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 업무 단건 조회 (GET /api/tasks/:id)
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!task) return res.status(404).json({ success: false, message: '업무를 찾을 수 없습니다.' });

    db.all('SELECT * FROM comments WHERE task_id = ? ORDER BY id ASC', [task.id], (err2, comments) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });

      res.json({
        success: true,
        data: {
          ...task,
          comments: comments || []
        }
      });
    });
  });
});

// 업무 생성 (POST /api/tasks)
app.post('/api/tasks', (req, res) => {
  const { projectId, title, description, priority = 'MEDIUM', assigneeId, assigneeName, dueDate } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ success: false, message: '프로젝트 ID와 업무 제목이 필요합니다.' });
  }

  db.get('SELECT key FROM projects WHERE id = ?', [projectId], (err, proj) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const pKey = proj ? proj.key : 'TASK';

    db.get('SELECT COUNT(*) AS count FROM tasks WHERE project_id = ?', [projectId], (err2, countRow) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      const nextNum = (countRow ? countRow.count : 0) + 101;
      const taskKey = `${pKey}-${nextNum}`;

      db.run(
        `INSERT INTO tasks (project_id, task_key, title, description, status, priority, assignee_id, assignee_name, due_date, created_at)
         VALUES (?, ?, ?, ?, 'TODO', ?, ?, ?, ?, datetime("now", "localtime"))`,
        [projectId, taskKey, title, description || '', priority, assigneeId || null, assigneeName || null, dueDate || null],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });

          const newTaskId = this.lastID;
          db.run(
            'INSERT INTO activity_logs (project_id, task_id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
            [projectId, newTaskId, assigneeName || '관리자', 'TASK_CREATED', `업무 [${taskKey}] 생성: ${title}`]
          );

          res.json({
            success: true,
            message: '업무가 성공적으로 생성되었습니다.',
            data: { id: newTaskId, task_key: taskKey, title, status: 'TODO' }
          });
        }
      );
    });
  });
});

// 업무 상태 변경 (PATCH /api/tasks/:id/status)
// [BUG-D08-01 ACTION_REPLAY]: targetId === 14 완료 버튼 클릭 시 status='DONE' DB UPDATE 생략
// [BUG-D08-04 SEQUENCE_REPLAY]: projectId === 3 && priority === 'URGENT' && targetId === 21 상태변경 시 DB UPDATE 생략
app.patch('/api/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, filterContext = {} } = req.body;
  const taskId = parseInt(id, 10);

  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!task) return res.status(404).json({ success: false, message: '업무를 찾을 수 없습니다.' });

    // BUG-D08-01 판정: 업무 14번 완료 처리 시
    if (taskId === 14 && status === 'DONE') {
      // 버그 발현: 성공 응답은 반환하지만 DB UPDATE를 건너뜀
      return res.json({
        success: true,
        message: '업무가 완료 처리되었습니다.',
        data: {
          id: 14,
          task_key: task.task_key,
          status: 'DONE', // UI 갱신용으로 내려주지만 실제 DB는 IN_PROGRESS 유지
          db_persisted: false
        }
      });
    }

    // BUG-D08-04 판정: 프로젝트 3번 (Orbit Data Pipeline) + priority 'URGENT' + 업무 21번
    const isProj3 = filterContext.projectId === 3 || task.project_id === 3;
    const isUrgentFilter = filterContext.priority === 'URGENT';
    const isTask21 = taskId === 21;

    if (isProj3 && isUrgentFilter && isTask21) {
      // 버그 발현: 상태 변경 DB UPDATE 건너뜀
      return res.json({
        success: true,
        message: '업무 상태가 변경되었습니다.',
        data: {
          id: 21,
          task_key: task.task_key,
          status: status, // 응답만 내려주고 DB는 IN_PROGRESS 유지
          db_persisted: false
        }
      });
    }

    // 정상 상태 변경
    db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

      db.run(
        'INSERT INTO activity_logs (project_id, task_id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
        [task.project_id, taskId, '관리자', 'STATUS_CHANGED', `상태 변경: ${task.status} -> ${status}`]
      );

      res.json({
        success: true,
        message: '업무 상태가 성공적으로 변경되었습니다.',
        data: {
          id: taskId,
          status
        }
      });
    });
  });
});

// 담당자 변경 (PATCH /api/tasks/:id/assignee)
// [BUG-D08-03 SEQUENCE_REPLAY]: projectId === 1 && assignee === '최영진' && taskId === 3일 때, 3번 대신 1번 업무의 담당자 변경!
app.patch('/api/tasks/:id/assignee', (req, res) => {
  const { id } = req.params;
  const { assigneeId, assigneeName, filterContext = {} } = req.body;
  const taskId = parseInt(id, 10);

  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!task) return res.status(404).json({ success: false, message: '업무를 찾을 수 없습니다.' });

    // BUG-D08-03 판정:
    const isProj1 = filterContext.projectId === 1 || task.project_id === 1;
    const isAssigneeChoi = filterContext.assignee === '최영진' || task.assignee_name === '최영진';
    const isTask3 = taskId === 3;

    if (isProj1 && isAssigneeChoi && isTask3) {
      // 버그 발현: 3번 업무 대신 1번 업무(Kubernetes 1.30 업그레이드)의 담당자를 변경함!
      db.run(
        'UPDATE tasks SET assignee_id = ?, assignee_name = ? WHERE id = 1',
        [assigneeId, assigneeName],
        (errB3) => {
          if (errB3) return res.status(500).json({ success: false, error: errB3.message });

          db.run(
            'INSERT INTO activity_logs (project_id, task_id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
            [1, 1, '관리자', 'ASSIGNEE_MISMATCH', `담당자 변경 왜곡: 1번 업무에 ${assigneeName} 배정`]
          );

          return res.json({
            success: true,
            message: '담당자가 성공적으로 변경되었습니다.',
            data: {
              requested_task_id: 3,
              affected_task_id: 1,
              assignee_name: task.assignee_name // 3번 업무 담당자는 그대로 최영진
            }
          });
        }
      );
      return;
    }

    // 정상 담당자 변경
    db.run(
      'UPDATE tasks SET assignee_id = ?, assignee_name = ? WHERE id = ?',
      [assigneeId, assigneeName, taskId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        db.run(
          'INSERT INTO activity_logs (project_id, task_id, actor, action, details, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "localtime"))',
          [task.project_id, taskId, '관리자', 'ASSIGNEE_CHANGED', `담당자 변경: ${assigneeName}`]
        );

        res.json({
          success: true,
          message: '담당자가 변경되었습니다.',
          data: {
            id: taskId,
            assignee_id: assigneeId,
            assignee_name: assigneeName
          }
        });
      }
    );
  });
});

// 업무 상세 수정 (PATCH /api/tasks/:id)
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, priority, dueDate } = req.body;
  const taskId = parseInt(id, 10);

  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!task) return res.status(404).json({ success: false, message: '업무를 찾을 수 없습니다.' });

    const newTitle = title || task.title;
    const newDesc = description !== undefined ? description : task.description;
    const newPriority = priority || task.priority;
    const newDueDate = dueDate !== undefined ? dueDate : task.due_date;

    db.run(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ? WHERE id = ?',
      [newTitle, newDesc, newPriority, newDueDate, taskId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        res.json({
          success: true,
          message: '업무 상세 정보가 저장되었습니다.',
          data: {
            id: taskId,
            title: newTitle,
            description: newDesc,
            priority: newPriority,
            due_date: newDueDate
          }
        });
      }
    );
  });
});

// 댓글 작성 (POST /api/tasks/:id/comments)
app.post('/api/tasks/:id/comments', (req, res) => {
  const { id } = req.params;
  const { authorName = '김도현', content } = req.body;
  const taskId = parseInt(id, 10);

  if (!content) {
    return res.status(400).json({ success: false, message: '댓글 내용이 필요합니다.' });
  }

  db.run(
    'INSERT INTO comments (task_id, author_name, content, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
    [taskId, authorName, content],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });

      res.json({
        success: true,
        message: '댓글이 등록되었습니다.',
        data: {
          id: this.lastID,
          task_id: taskId,
          author_name: authorName,
          content,
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// 댓글 삭제 (DELETE /api/comments/:id)
// [BUG-D08-02 ACTION_REPLAY]: commentId === 9 삭제 요청 시, 9번 대신 8번 댓글 삭제!
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const commentId = parseInt(id, 10);

  db.get('SELECT * FROM comments WHERE id = ?', [commentId], (err, comment) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!comment) return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });

    // BUG-D08-02 판정: commentId === 9 삭제 시
    if (commentId === 9) {
      // 버그 발현: 9번 대신 8번 댓글을 삭제함!
      db.run('DELETE FROM comments WHERE id = 8', (delErr) => {
        if (delErr) return res.status(500).json({ success: false, error: delErr.message });

        return res.json({
          success: true,
          message: '댓글이 삭제되었습니다.',
          data: {
            requested_id: 9,
            deleted_id: 8
          }
        });
      });
      return;
    }

    // 정상 삭제
    db.run('DELETE FROM comments WHERE id = ?', [commentId], (delErr) => {
      if (delErr) return res.status(500).json({ success: false, error: delErr.message });

      res.json({
        success: true,
        message: '댓글이 삭제되었습니다.',
        data: { id: commentId }
      });
    });
  });
});

// 프로젝트별 활동 로그 조회 (GET /api/projects/:id/activities)
app.get('/api/projects/:id/activities', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM activity_logs WHERE project_id = ? ORDER BY id DESC LIMIT 30', [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 서버 기동
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[TeamOrbit Backend] Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
