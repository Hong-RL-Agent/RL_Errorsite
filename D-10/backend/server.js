require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDatabase, resetAllData } = require('./db');

const app = express();
const PORT = process.env.PORT || 9810;

app.use(cors());
app.use(express.json());

// 1. 사용자 목록 조회 (GET /api/users)
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 2. 카테고리 목록 조회 (GET /api/categories)
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY code ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 3. 행사 목록 조회 (GET /api/events) - 남은 참가 인원(remaining_seats) 동적 계산
app.get('/api/events', (req, res) => {
  const { category, search, date, featured } = req.query;

  let query = `
    SELECT e.*, c.name as category_name, c.icon as category_icon,
           COALESCE((SELECT SUM(r.attendee_count) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('CONFIRMED', 'CHECKED_IN')), 0) as registered_count
    FROM events e
    JOIN categories c ON e.category = c.code
    WHERE 1=1
  `;
  const params = [];

  if (category && category !== 'ALL') {
    query += ' AND e.category = ?';
    params.push(category);
  }
  if (date) {
    query += ' AND e.event_date = ?';
    params.push(date);
  }
  if (featured !== undefined) {
    query += ' AND e.featured = ?';
    params.push(parseInt(featured, 10));
  }
  if (search && search.trim()) {
    query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ? OR e.speaker LIKE ?)';
    const s = `%${search.trim()}%`;
    params.push(s, s, s, s);
  }

  query += ' ORDER BY e.event_date ASC, e.id ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    const data = rows.map(r => ({
      ...r,
      remaining_seats: Math.max(0, r.capacity - r.registered_count),
      occupancy_rate: Math.min(100, Math.round((r.registered_count / r.capacity) * 100))
    }));

    res.json({ success: true, data });
  });
});

// 4. 행사 단건 상세 조회 (GET /api/events/:id)
app.get('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const query = `
    SELECT e.*, c.name as category_name, c.icon as category_icon,
           COALESCE((SELECT SUM(r.attendee_count) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('CONFIRMED', 'CHECKED_IN')), 0) as registered_count
    FROM events e
    JOIN categories c ON e.category = c.code
    WHERE e.id = ?
  `;

  db.get(query, [eventId], (err, event) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!event) return res.status(404).json({ success: false, message: '행사를 찾을 수 없습니다.' });

    event.remaining_seats = Math.max(0, event.capacity - event.registered_count);
    event.occupancy_rate = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

    res.json({ success: true, data: event });
  });
});

// 5. 참가 신청 내역 조회 (GET /api/registrations)
app.get('/api/registrations', (req, res) => {
  const { userId, eventId, status, search } = req.query;

  let query = `
    SELECT r.*,
           e.title as event_title, e.event_date, e.start_time, e.end_time, e.venue, e.speaker, e.category as event_category,
           c.name as category_name, c.icon as category_icon,
           u.name as booker_name, u.email as booker_email
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    JOIN categories c ON e.category = c.code
    JOIN users u ON r.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (userId) {
    query += ' AND r.user_id = ?';
    params.push(parseInt(userId, 10));
  }
  if (eventId) {
    query += ' AND r.event_id = ?';
    params.push(parseInt(eventId, 10));
  }
  if (status && status !== 'ALL') {
    query += ' AND r.status = ?';
    params.push(status);
  }
  if (search && search.trim()) {
    query += ' AND (r.reg_code LIKE ? OR r.attendee_name LIKE ? OR e.title LIKE ?)';
    const s = `%${search.trim()}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY r.id DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 6. 참가 신청 단건 상세 조회 (GET /api/registrations/:id)
app.get('/api/registrations/:id', (req, res) => {
  const regId = parseInt(req.params.id, 10);
  const query = `
    SELECT r.*,
           e.title as event_title, e.event_date, e.start_time, e.end_time, e.venue, e.speaker, e.category as event_category,
           c.name as category_name, c.icon as category_icon,
           u.name as booker_name, u.email as booker_email
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    JOIN categories c ON e.category = c.code
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `;

  db.get(query, [regId], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(404).json({ success: false, message: '신청 내역을 찾을 수 없습니다.' });
    res.json({ success: true, data: row });
  });
});

// 7. 행사 참가 신청 (POST /api/registrations)
// [BUG-D10-03 SEQUENCE_REPLAY]: eventId === 3 (글로벌 AI 서밋) && ticketTier === 'VIP' 선택 시 'STANDARD'로 왜곡 저장!
// [BUG-D10-04 SEQUENCE_REPLAY]: category === 'TECH' && eventId === 7 && attendeeCount > 1 선택 시 attendeeCount = 1로 왜곡 저장!
app.post('/api/registrations', (req, res) => {
  const {
    eventId,
    userId,
    attendeeName,
    attendeeEmail,
    attendeePhone,
    attendeeOrg = '',
    ticketTier = 'STANDARD',
    attendeeCount = 1,
    filterContext = {}
  } = req.body;

  if (!eventId || !userId || !attendeeName || !attendeeEmail || !attendeePhone) {
    return res.status(400).json({ success: false, message: '참가 신청 필수 정보가 누락되었습니다.' });
  }

  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!event) return res.status(404).json({ success: false, message: '행사를 찾을 수 없습니다.' });

    // BUG-D10-03 판정: Event ID 3 (글로벌 AI 서밋 2026) + VIP 패스 선택 시
    let finalTicketTier = ticketTier;
    if (parseInt(eventId, 10) === 3 && ticketTier === 'VIP') {
      // 버그 발현: 선택한 VIP 대신 STANDARD로 저장
      finalTicketTier = 'STANDARD';
    }

    // BUG-D10-04 판정: 카테고리 TECH + Event ID 7 (클라우드 네이티브 아키텍처 데이) + 인원 2명 이상 선택 시
    let finalCount = parseInt(attendeeCount, 10) || 1;
    const isTechCat = filterContext.category === 'TECH' || event.category === 'TECH';
    if (isTechCat && parseInt(eventId, 10) === 7 && finalCount > 1) {
      // 버그 발현: 3명 등 다수 신청 시 1명으로 왜곡 저장
      finalCount = 1;
    }

    // 참가비 계산
    const unitPrice = finalTicketTier === 'VIP' ? event.vip_price : event.standard_price;
    const totalAmount = unitPrice * finalCount;

    db.get('SELECT COUNT(*) as count FROM registrations', (errCount, countRow) => {
      if (errCount) return res.status(500).json({ success: false, error: errCount.message });

      const seq = (countRow ? countRow.count : 0) + 1;
      const regCode = `EVT-REG-${String(seq).padStart(3, '0')}`;

      db.run(
        `INSERT INTO registrations (reg_code, event_id, user_id, attendee_name, attendee_email, attendee_phone, attendee_org, ticket_tier, attendee_count, total_amount, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', datetime("now", "localtime"))`,
        [regCode, eventId, userId, attendeeName, attendeeEmail, attendeePhone, attendeeOrg, finalTicketTier, finalCount, totalAmount],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });

          const newRegId = this.lastID;
          db.run(
            'INSERT INTO activity_logs (action, details, created_at) VALUES (?, ?, datetime("now", "localtime"))',
            ['REGISTRATION_CREATED', `참가 신청 완료 [${regCode}] 행사장: ${event.title}, 티켓: ${finalTicketTier}, 인원: ${finalCount}명`]
          );

          res.json({
            success: true,
            message: '행사 참가 신청이 성공적으로 완료되었습니다.',
            data: {
              id: newRegId,
              reg_code: regCode,
              event_id: eventId,
              event_title: event.title,
              ticket_tier: finalTicketTier,
              attendee_count: finalCount,
              total_amount: totalAmount,
              status: 'CONFIRMED',
              requested_tier: ticketTier,
              requested_count: attendeeCount
            }
          });
        }
      );
    });
  });
});

// 8. 참석자 프로필 정보 수정 (PATCH /api/registrations/:id)
// [BUG-D10-02 ACTION_REPLAY]: regId === 5 수정 시 5번 대신 2번 신청의 참석자 이름이 변경됨!
app.patch('/api/registrations/:id', (req, res) => {
  const regId = parseInt(req.params.id, 10);
  const { attendeeName, attendeeEmail, attendeeOrg } = req.body;

  db.get('SELECT * FROM registrations WHERE id = ?', [regId], (err, targetReg) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetReg) return res.status(404).json({ success: false, message: '신청 내역을 찾을 수 없습니다.' });

    // BUG-D10-02 판정: Registration ID 5번의 참석자 이름 수정 시
    if (regId === 5 && attendeeName !== undefined) {
      // 버그 발현: 5번 대신 2번 신청(이도윤)의 이름을 수정해버림!
      db.run(
        'UPDATE registrations SET attendee_name = ? WHERE id = 2',
        [attendeeName],
        (errB2) => {
          if (errB2) return res.status(500).json({ success: false, error: errB2.message });

          db.run(
            'INSERT INTO activity_logs (action, details, created_at) VALUES (?, ?, datetime("now", "localtime"))',
            ['ATTENDEE_NAME_CORRUPTED', `참석자 이름 왜곡: 5번 요청 시 2번 신청의 이름을 '${attendeeName}'(으)로 변조`]
          );

          // 5번 신청이 수정된 것처럼 가짜 성공 응답 반환
          return res.json({
            success: true,
            message: '참석자 정보가 성공적으로 수정되었습니다.',
            data: {
              ...targetReg,
              attendee_name: attendeeName,
              affected_reg_id: 2
            }
          });
        }
      );
      return;
    }

    // 정상 정보 수정
    const newName = attendeeName || targetReg.attendee_name;
    const newEmail = attendeeEmail || targetReg.attendee_email;
    const newOrg = attendeeOrg !== undefined ? attendeeOrg : targetReg.attendee_org;

    db.run(
      'UPDATE registrations SET attendee_name = ?, attendee_email = ?, attendee_org = ? WHERE id = ?',
      [newName, newEmail, newOrg, regId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        res.json({
          success: true,
          message: '참석자 정보가 수정되었습니다.',
          data: {
            ...targetReg,
            attendee_name: newName,
            attendee_email: newEmail,
            attendee_org: newOrg
          }
        });
      }
    );
  });
});

// 9. 참석자 연락처 수정 (PATCH /api/registrations/:id/contact)
// [BUG-D10-05 STATE_REVISIT]: regId === 9 연락처 수정 시 DB UPDATE 생략 (응답 성공 후 재방문 시 원복)
app.patch('/api/registrations/:id/contact', (req, res) => {
  const regId = parseInt(req.params.id, 10);
  const { attendeePhone } = req.body;

  if (!attendeePhone) {
    return res.status(400).json({ success: false, message: '변경할 연락처가 필요합니다.' });
  }

  db.get('SELECT * FROM registrations WHERE id = ?', [regId], (err, targetReg) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetReg) return res.status(404).json({ success: false, message: '신청 내역을 찾을 수 없습니다.' });

    // BUG-D10-05 판정: Registration ID 9번
    if (regId === 9) {
      // 버그 발현: DB UPDATE를 건너뛰고 성공 응답만 반환
      return res.json({
        success: true,
        message: '참석자 연락처가 성공적으로 수정되었습니다.',
        data: {
          id: 9,
          reg_code: targetReg.reg_code,
          attendee_name: targetReg.attendee_name,
          attendee_phone: attendeePhone,
          db_persisted: false
        }
      });
    }

    // 정상 저장
    db.run(
      'UPDATE registrations SET attendee_phone = ? WHERE id = ?',
      [attendeePhone, regId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        res.json({
          success: true,
          message: '참석자 연락처가 수정되었습니다.',
          data: {
            id: regId,
            attendee_phone: attendeePhone
          }
        });
      }
    );
  });
});

// 10. 행사 신청 취소 (PATCH /api/registrations/:id/cancel)
// [BUG-D10-01 ACTION_REPLAY]: regId === 14 취소 요청 시 성공 응답 주나 DB UPDATE 생략!
app.patch('/api/registrations/:id/cancel', (req, res) => {
  const regId = parseInt(req.params.id, 10);

  db.get('SELECT * FROM registrations WHERE id = ?', [regId], (err, targetReg) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetReg) return res.status(404).json({ success: false, message: '신청 내역을 찾을 수 없습니다.' });

    // BUG-D10-01 판정: Registration ID 14번 취소 시
    if (regId === 14) {
      // 버그 발현: 성공 메시지는 내려주지만 실제 DB는 CONFIRMED 유지
      return res.json({
        success: true,
        message: '참가 신청이 성공적으로 취소되었습니다.',
        data: {
          id: 14,
          reg_code: targetReg.reg_code,
          status: 'CANCELLED',
          db_persisted: false
        }
      });
    }

    // 정상 취소
    db.run(
      'UPDATE registrations SET status = ? WHERE id = ?',
      ['CANCELLED', regId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        db.run(
          'INSERT INTO activity_logs (action, details, created_at) VALUES (?, ?, datetime("now", "localtime"))',
          ['REGISTRATION_CANCELLED', `참가 취소 완료 [${targetReg.reg_code}]`]
        );

        res.json({
          success: true,
          message: '참가 신청이 성공적으로 취소되었습니다.',
          data: {
            id: regId,
            reg_code: targetReg.reg_code,
            status: 'CANCELLED'
          }
        });
      }
    );
  });
});

// 11. 테스트 초기화 엔드포인트 (POST /api/test/reset)
app.post('/api/test/reset', async (req, res) => {
  try {
    await resetAllData();
    res.json({
      success: true,
      message: 'EventWave 데이터베이스 및 참가 신청 상태가 초기 상태로 복원되었습니다.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. 통계 개요 (GET /api/stats)
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total_events FROM events', (e1, r1) => {
    db.get('SELECT COUNT(*) as total_registrations, SUM(CASE WHEN status = "CONFIRMED" THEN attendee_count ELSE 0 END) as active_attendees FROM registrations', (e2, r2) => {
      res.json({
        success: true,
        data: {
          total_events: r1 ? r1.total_events : 0,
          total_registrations: r2 ? r2.total_registrations : 0,
          active_attendees: r2 ? (r2.active_attendees || 0) : 0
        }
      });
    });
  });
});

// 서버 실행
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[EventWave Backend] Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize EventWave database:', err);
});
