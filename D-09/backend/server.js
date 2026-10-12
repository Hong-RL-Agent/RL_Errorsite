require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDatabase, resetAllData } = require('./db');

const app = express();
const PORT = process.env.PORT || 9809;

app.use(cors());
app.use(express.json());

// 1. 사용자 목록 조회 (GET /api/users)
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 2. 단일 사용자 조회 (GET /api/users/:id)
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    db.all('SELECT * FROM pets WHERE user_id = ? ORDER BY id ASC', [userId], (err2, pets) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      res.json({ success: true, data: { ...user, pets: pets || [] } });
    });
  });
});

// 3. 서비스 목록 조회 (GET /api/services)
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 4. 반려동물 목록 조회 (GET /api/pets)
app.get('/api/pets', (req, res) => {
  const { userId, search } = req.query;
  let query = `
    SELECT p.*, u.name as owner_name, u.phone as owner_phone
    FROM pets p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (userId) {
    query += ' AND p.user_id = ?';
    params.push(parseInt(userId, 10));
  }
  if (search && search.trim()) {
    query += ' AND (p.name LIKE ? OR p.breed LIKE ?)';
    const s = `%${search.trim()}%`;
    params.push(s, s);
  }
  query += ' ORDER BY p.id ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 5. 반려동물 단건 조회 (GET /api/pets/:id)
app.get('/api/pets/:id', (req, res) => {
  const petId = parseInt(req.params.id, 10);
  db.get(
    `SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
     FROM pets p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = ?`,
    [petId],
    (err, pet) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (!pet) return res.status(404).json({ success: false, message: '반려동물을 찾을 수 없습니다.' });

      db.all(
        `SELECT r.*, s.name as service_name, s.category as service_category, s.icon as service_icon
         FROM reservations r
         JOIN services s ON r.service_id = s.id
         WHERE r.pet_id = ?
         ORDER BY r.booking_date DESC, r.time_slot DESC`,
        [petId],
        (err2, history) => {
          if (err2) return res.status(500).json({ success: false, error: err2.message });
          res.json({ success: true, data: { ...pet, history: history || [] } });
        }
      );
    }
  );
});

// 6. 반려동물 신규 등록 (POST /api/pets)
app.post('/api/pets', (req, res) => {
  const { userId, name, species = '강아지', breed, age, gender = '남아', weight, careNotes = '', allergies = '없음', avatar = '🐾' } = req.body;
  if (!userId || !name || !breed || weight === undefined) {
    return res.status(400).json({ success: false, message: '반려동물 기본 정보(이름, 품종, 체중)가 필요합니다.' });
  }

  db.run(
    `INSERT INTO pets (user_id, name, species, breed, age, gender, weight, care_notes, allergies, avatar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, species, breed, parseInt(age, 10) || 1, gender, parseFloat(weight), careNotes, allergies, avatar],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      const newId = this.lastID;

      db.run(
        'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
        [userId, 'PET_REGISTERED', `반려동물 [${name} (${breed})] 신규 등록 완료`]
      );

      res.json({
        success: true,
        message: '반려동물이 성공적으로 등록되었습니다.',
        data: { id: newId, user_id: userId, name, breed, weight: parseFloat(weight) }
      });
    }
  );
});

// 7. 반려동물 정보 수정 (PATCH /api/pets/:id)
// [BUG-D09-02 ACTION_REPLAY]: petId === 4 (초코)의 체중 수정 시 petId === 2 (보리)의 체중이 변경됨!
app.patch('/api/pets/:id', (req, res) => {
  const petId = parseInt(req.params.id, 10);
  const { name, breed, age, gender, weight, allergies } = req.body;

  db.get('SELECT * FROM pets WHERE id = ?', [petId], (err, targetPet) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetPet) return res.status(404).json({ success: false, message: '반려동물을 찾을 수 없습니다.' });

    // BUG-D09-02 판정: Pet ID 4 체중 변경 시 2번 펫(보리)을 변조함
    if (petId === 4 && weight !== undefined) {
      const newWeight = parseFloat(weight);
      db.run(
        'UPDATE pets SET weight = ? WHERE id = 2',
        [newWeight],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

          db.run(
            'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
            [targetPet.user_id, 'PET_WEIGHT_CORRUPTED', `체중 데이터 왜곡: 4번 요청 시 2번 보리 체중을 ${newWeight}kg로 변경`]
          );

          // 응답은 4번 초코의 변경된 정보인 것처럼 돌려줌
          return res.json({
            success: true,
            message: '반려동물 정보가 성공적으로 수정되었습니다.',
            data: {
              ...targetPet,
              weight: newWeight,
              affected_pet_id: 2
            }
          });
        }
      );
      return;
    }

    // 정상 정보 수정
    const newName = name || targetPet.name;
    const newBreed = breed || targetPet.breed;
    const newAge = age !== undefined ? parseInt(age, 10) : targetPet.age;
    const newGender = gender || targetPet.gender;
    const newWeight = weight !== undefined ? parseFloat(weight) : targetPet.weight;
    const newAllergies = allergies !== undefined ? allergies : targetPet.allergies;

    db.run(
      `UPDATE pets SET name = ?, breed = ?, age = ?, gender = ?, weight = ?, allergies = ? WHERE id = ?`,
      [newName, newBreed, newAge, newGender, newWeight, newAllergies, petId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        res.json({
          success: true,
          message: '반려동물 정보가 수정되었습니다.',
          data: {
            ...targetPet,
            name: newName,
            breed: newBreed,
            age: newAge,
            gender: newGender,
            weight: newWeight,
            allergies: newAllergies
          }
        });
      }
    );
  });
});

// 8. 반려동물 돌봄 주의사항 수정 (PATCH /api/pets/:id/care-notes)
// [BUG-D09-05 STATE_REVISIT]: petId === 7 (뭉치)의 주의사항 수정 시 DB UPDATE 생략 (성공 반환 후 재방문 시 원복)
app.patch('/api/pets/:id/care-notes', (req, res) => {
  const petId = parseInt(req.params.id, 10);
  const { careNotes } = req.body;

  db.get('SELECT * FROM pets WHERE id = ?', [petId], (err, pet) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!pet) return res.status(404).json({ success: false, message: '반려동물을 찾을 수 없습니다.' });

    // BUG-D09-05 판정: Pet ID 7 (뭉치)
    if (petId === 7) {
      // 버그 발현: DB 업데이트를 건너뜀 (응답에는 성공으로 돌려줌)
      return res.json({
        success: true,
        message: '돌봄 주의사항이 저장되었습니다.',
        data: {
          id: 7,
          name: pet.name,
          care_notes: careNotes,
          db_persisted: false
        }
      });
    }

    // 정상 저장
    db.run('UPDATE pets SET care_notes = ? WHERE id = ?', [careNotes, petId], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

      res.json({
        success: true,
        message: '돌봄 주의사항이 저장되었습니다.',
        data: {
          id: petId,
          name: pet.name,
          care_notes: careNotes
        }
      });
    });
  });
});

// 9. 예약 목록 조회 (GET /api/reservations)
app.get('/api/reservations', (req, res) => {
  const { userId, status, serviceCategory, date, search } = req.query;

  let query = `
    SELECT r.*,
           p.name as pet_name, p.breed as pet_breed, p.weight as pet_weight, p.avatar as pet_avatar, p.species as pet_species,
           s.name as service_name, s.category as service_category, s.icon as service_icon, s.duration_mins, s.base_price,
           u.name as owner_name, u.phone as owner_phone, u.email as owner_email
    FROM reservations r
    JOIN pets p ON r.pet_id = p.id
    JOIN services s ON r.service_id = s.id
    JOIN users u ON r.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (userId) {
    query += ' AND r.user_id = ?';
    params.push(parseInt(userId, 10));
  }
  if (status && status !== 'ALL') {
    query += ' AND r.status = ?';
    params.push(status);
  }
  if (serviceCategory && serviceCategory !== 'ALL') {
    query += ' AND s.category = ?';
    params.push(serviceCategory);
  }
  if (date) {
    query += ' AND r.booking_date = ?';
    params.push(date);
  }
  if (search && search.trim()) {
    query += ' AND (r.booking_code LIKE ? OR p.name LIKE ? OR s.name LIKE ?)';
    const s = `%${search.trim()}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY r.booking_date DESC, r.time_slot DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 10. 예약 단건 조회 (GET /api/reservations/:id)
app.get('/api/reservations/:id', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const query = `
    SELECT r.*,
           p.name as pet_name, p.breed as pet_breed, p.weight as pet_weight, p.avatar as pet_avatar, p.species as pet_species, p.care_notes, p.allergies,
           s.name as service_name, s.category as service_category, s.icon as service_icon, s.duration_mins, s.base_price,
           u.name as owner_name, u.phone as owner_phone, u.email as owner_email
    FROM reservations r
    JOIN pets p ON r.pet_id = p.id
    JOIN services s ON r.service_id = s.id
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `;

  db.get(query, [resId], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(404).json({ success: false, message: '예약 내역을 찾을 수 없습니다.' });
    res.json({ success: true, data: row });
  });
});

// 11. 예약 신청 (POST /api/reservations)
// [BUG-D09-03 SEQUENCE_REPLAY]: serviceId === 2 (호텔) && timeSlot === '14:00' 선택 시 DB에 '16:30'으로 왜곡 저장!
app.post('/api/reservations', (req, res) => {
  const { userId, petId, serviceId, bookingDate, timeSlot, specialRequest = '', pickupService = 0 } = req.body;

  if (!userId || !petId || !serviceId || !bookingDate || !timeSlot) {
    return res.status(400).json({ success: false, message: '예약 필수 정보(보호자, 반려동물, 서비스, 날짜, 시간)가 누락되었습니다.' });
  }

  db.get('SELECT * FROM services WHERE id = ?', [serviceId], (err, service) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!service) return res.status(404).json({ success: false, message: '서비스를 찾을 수 없습니다.' });

    db.get('SELECT * FROM pets WHERE id = ?', [petId], (err2, pet) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      if (!pet) return res.status(404).json({ success: false, message: '반려동물을 찾을 수 없습니다.' });

      // 비용 계산: 기본가 + 체중 할증 + 픽업 서비스 요금
      let totalPrice = service.base_price;
      if (pet.weight > 20) {
        totalPrice += 20000; // 대형견 할증
      } else if (pet.weight > 8) {
        totalPrice += 10000; // 중형견 할증
      }
      if (pickupService) {
        totalPrice += 15000; // 왕복 픽업 추가금
      }

      // 예약 코드 생성
      db.get('SELECT COUNT(*) as count FROM reservations', (err3, countRow) => {
        if (err3) return res.status(500).json({ success: false, error: err3.message });
        const seq = (countRow ? countRow.count : 0) + 1;
        const bookingCode = `PAW-2026-${String(seq).padStart(3, '0')}`;

        // BUG-D09-03 판정: serviceId === 2 (호텔) && timeSlot === '14:00'
        let finalTimeSlot = timeSlot;
        if (parseInt(serviceId, 10) === 2 && timeSlot === '14:00') {
          // 버그 발현: 선택한 14:00 대신 16:30으로 저장
          finalTimeSlot = '16:30';
        }

        db.run(
          `INSERT INTO reservations (booking_code, user_id, pet_id, service_id, booking_date, time_slot, status, total_price, special_request, pickup_service, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, datetime("now", "localtime"))`,
          [bookingCode, userId, petId, serviceId, bookingDate, finalTimeSlot, totalPrice, specialRequest, pickupService ? 1 : 0],
          function (insertErr) {
            if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });

            const newReservationId = this.lastID;
            db.run(
              'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
              [userId, 'RESERVATION_CREATED', `예약 [${bookingCode}] 등록 완료 (${bookingDate} ${finalTimeSlot})`]
            );

            res.json({
              success: true,
              message: '예약이 성공적으로 완료되었습니다.',
              data: {
                id: newReservationId,
                booking_code: bookingCode,
                booking_date: bookingDate,
                time_slot: finalTimeSlot,
                status: 'CONFIRMED',
                total_price: totalPrice,
                requested_time_slot: timeSlot
              }
            });
          }
        );
      });
    });
  });
});

// 12. 예약 취소 (PATCH /api/reservations/:id/cancel)
// [BUG-D09-01 ACTION_REPLAY]: resId === 12 취소 요청 시 성공 응답 반환하나 DB UPDATE 생략!
app.patch('/api/reservations/:id/cancel', (req, res) => {
  const resId = parseInt(req.params.id, 10);

  db.get('SELECT * FROM reservations WHERE id = ?', [resId], (err, reservation) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!reservation) return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });

    // BUG-D09-01 판정: Booking ID 12 취소 시
    if (resId === 12) {
      // 버그 발현: 취소 성공 메시지를 주지만 DB는 여전히 CONFIRMED 유지
      return res.json({
        success: true,
        message: '예약이 성공적으로 취소되었습니다.',
        data: {
          id: 12,
          booking_code: reservation.booking_code,
          status: 'CANCELLED',
          db_persisted: false
        }
      });
    }

    // 정상 취소
    db.run('UPDATE reservations SET status = ? WHERE id = ?', ['CANCELLED', resId], (updateErr) => {
      if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

      db.run(
        'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
        [reservation.user_id, 'RESERVATION_CANCELLED', `예약 [${reservation.booking_code}] 취소 완료`]
      );

      res.json({
        success: true,
        message: '예약이 성공적으로 취소되었습니다.',
        data: {
          id: resId,
          booking_code: reservation.booking_code,
          status: 'CANCELLED'
        }
      });
    });
  });
});

// 13. 예약 일정 변경 (PATCH /api/reservations/:id/reschedule)
// [BUG-D09-04 SEQUENCE_REPLAY]: filterContext.serviceCategory === 'SPA' && resId === 16일 때 16번 대신 11번 예약 날짜를 변경!
app.patch('/api/reservations/:id/reschedule', (req, res) => {
  const resId = parseInt(req.params.id, 10);
  const { newDate, newTimeSlot, filterContext = {} } = req.body;

  if (!newDate) {
    return res.status(400).json({ success: false, message: '변경할 날짜가 필요합니다.' });
  }

  db.get('SELECT * FROM reservations WHERE id = ?', [resId], (err, targetReservation) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!targetReservation) return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });

    const targetTimeSlot = newTimeSlot || targetReservation.time_slot;

    // BUG-D09-04 판정: 서비스 필터 SPA(Service 4) + 예약 ID 16 변경 요청
    const isSpaCategory = filterContext.serviceCategory === 'SPA' || filterContext.service_id === 4 || targetReservation.service_id === 4;
    const isTarget16 = resId === 16;

    if (isSpaCategory && isTarget16) {
      // 버그 발현: 16번 대신 11번 예약의 날짜를 변경해버림!
      db.run(
        'UPDATE reservations SET booking_date = ?, time_slot = ? WHERE id = 11',
        [newDate, targetTimeSlot],
        (errB4) => {
          if (errB4) return res.status(500).json({ success: false, error: errB4.message });

          db.run(
            'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
            [targetReservation.user_id, 'RESERVATION_RESCHEDULE_MISMATCH', `예약 날짜 변경 왜곡: 16번 요청 시 11번 날짜를 ${newDate}로 변경`]
          );

          return res.json({
            success: true,
            message: '예약 일정이 변경되었습니다.',
            data: {
              requested_reservation_id: 16,
              affected_reservation_id: 11,
              booking_date: targetReservation.booking_date, // 16번은 원래 날짜 그대로 유지
              time_slot: targetReservation.time_slot
            }
          });
        }
      );
      return;
    }

    // 정상 일정 변경
    db.run(
      'UPDATE reservations SET booking_date = ?, time_slot = ? WHERE id = ?',
      [newDate, targetTimeSlot, resId],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        db.run(
          'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
          [targetReservation.user_id, 'RESERVATION_RESCHEDULED', `예약 [${targetReservation.booking_code}] 일정 변경 -> ${newDate} ${targetTimeSlot}`]
        );

        res.json({
          success: true,
          message: '예약 일정이 성공적으로 변경되었습니다.',
          data: {
            id: resId,
            booking_code: targetReservation.booking_code,
            booking_date: newDate,
            time_slot: targetTimeSlot
          }
        });
      }
    );
  });
});

// 14. 테스트 초기화 엔드포인트 (POST /api/test/reset)
app.post('/api/test/reset', async (req, res) => {
  try {
    await resetAllData();
    res.json({
      success: true,
      message: 'PawCare 데이터베이스 및 예약 상태가 초기 상태로 복원되었습니다.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. 통계 요약 (GET /api/stats)
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total_pets FROM pets', (e1, r1) => {
    db.get('SELECT COUNT(*) as total_reservations, SUM(CASE WHEN status = "CONFIRMED" THEN 1 ELSE 0 END) as confirmed_count, SUM(CASE WHEN status = "COMPLETED" THEN 1 ELSE 0 END) as completed_count FROM reservations', (e2, r2) => {
      res.json({
        success: true,
        data: {
          total_pets: r1 ? r1.total_pets : 0,
          total_reservations: r2 ? r2.total_reservations : 0,
          confirmed_count: r2 ? r2.confirmed_count : 0,
          completed_count: r2 ? r2.completed_count : 0
        }
      });
    });
  });
});

// 서버 실행
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[PawCare Backend] Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize PawCare database:', err);
});
