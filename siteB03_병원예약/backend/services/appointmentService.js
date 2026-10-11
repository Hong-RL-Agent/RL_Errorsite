const db = require('../db/connection');
const { BASE_DATE, isValidDate, isValidTime, nowStamp } = require('./dateUtil');
const { HttpError } = require('./errors');
const { addLog, addNotification } = require('./logService');

const ACTIVE = ['예약확정', '진료대기'];
const STATUSES = ['예약확정', '진료대기', '진료완료', '예약취소'];

const BASE_SELECT = `SELECT a.*, h.name AS hospital_name, h.region AS hospital_region, h.phone AS hospital_phone,
  d.name AS doctor_name, d.title AS doctor_title, dep.name AS department_name, p.name AS patient_name
  FROM appointments a
  JOIN hospitals h ON h.id=a.hospital_id
  JOIN doctors d ON d.id=a.doctor_id
  JOIN departments dep ON dep.id=a.department_id
  JOIN patients p ON p.id=a.patient_id`;

function parseId(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'INVALID_ID', '올바르지 않은 ID입니다.');
  return n;
}

const decorate = (row) => ({ ...row, can_cancel: ACTIVE.includes(row.status), can_edit: ACTIVE.includes(row.status) });

function listAppointments({ patientId, status, doctorId, hospitalId, date }) {
  const where = [];
  const params = [];
  if (patientId) { where.push('a.patient_id=?'); params.push(parseId(patientId)); }
  if (doctorId) { where.push('a.doctor_id=?'); params.push(parseId(doctorId)); }
  if (hospitalId) { where.push('a.hospital_id=?'); params.push(parseId(hospitalId)); }
  if (date) {
    if (!isValidDate(date)) throw new HttpError(400, 'INVALID_DATE', '날짜 형식이 올바르지 않습니다.');
    where.push('a.date=?'); params.push(date);
  }
  if (status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, 'INVALID_STATUS', '올바르지 않은 예약 상태입니다.');
    where.push('a.status=?'); params.push(status);
  }
  const rows = db.prepare(`${BASE_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY a.date, a.time, a.id LIMIT 500`).all(...params);
  return rows.map(decorate);
}

function getAppointment(idRaw) {
  const id = parseId(idRaw);
  const row = db.prepare(`${BASE_SELECT} WHERE a.id=?`).get(id);
  if (!row) throw new HttpError(404, 'NOT_FOUND', '예약을 찾을 수 없습니다.');
  const result = decorate(row);
  result.changes = db.prepare('SELECT * FROM appointment_changes WHERE appointment_id=? ORDER BY changed_at DESC, id DESC').all(id);
  result.cancel = db.prepare('SELECT * FROM appointment_cancels WHERE appointment_id=?').get(id) || null;
  return result;
}

function assertSlot({ doctorId, date, time, patientId, ignoreAppointmentId }) {
  if (!isValidDate(date)) throw new HttpError(400, 'INVALID_DATE', '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  if (!isValidTime(time)) throw new HttpError(400, 'INVALID_TIME', '시간 형식이 올바르지 않습니다. (HH:MM, 30분 단위)');
  if (date < BASE_DATE) throw new HttpError(400, 'PAST_DATE', '지난 날짜에는 예약할 수 없습니다.');
  const slot = db.prepare('SELECT * FROM slots WHERE doctor_id=? AND date=? AND time=?').get(doctorId, date, time);
  if (!slot) throw new HttpError(400, 'NOT_AVAILABLE_TIME', '해당 일시는 의사의 진료 가능 시간이 아닙니다.');
  if (slot.is_booked) throw new HttpError(409, 'SLOT_TAKEN', '이미 예약된 시간입니다. 다른 시간을 선택해 주세요.');
  const dup = db.prepare(`SELECT id FROM appointments WHERE patient_id=? AND date=? AND time=?
    AND status IN ('예약확정','진료대기') AND id != ?`).get(patientId, date, time, ignoreAppointmentId || 0);
  if (dup) throw new HttpError(409, 'PATIENT_CONFLICT', '같은 시간에 이미 다른 예약이 있습니다.');
  return slot;
}

function cleanText(v, max, field) {
  const s = v == null ? '' : String(v).trim();
  if (s.length > max) throw new HttpError(400, 'INVALID_INPUT', `${field}은(는) ${max}자 이내로 입력해 주세요.`);
  return s;
}

function createAppointment(body) {
  const b = body || {};
  const patientId = parseId(b.patientId);
  const doctorId = parseId(b.doctorId);
  const visitReason = cleanText(b.visitReason, 100, '방문 사유');
  const memo = cleanText(b.memo, 200, '메모');

  const patient = db.prepare('SELECT * FROM patients WHERE id=?').get(patientId);
  if (!patient) throw new HttpError(404, 'PATIENT_NOT_FOUND', '환자를 찾을 수 없습니다.');
  const doctor = db.prepare('SELECT d.*, h.name AS hospital_name FROM doctors d JOIN hospitals h ON h.id=d.hospital_id WHERE d.id=?').get(doctorId);
  if (!doctor) throw new HttpError(404, 'DOCTOR_NOT_FOUND', '의사를 찾을 수 없습니다.');

  const tx = db.transaction(() => {
    const slot = assertSlot({ doctorId, date: b.date, time: b.time, patientId });
    const stamp = nowStamp();
    const info = db.prepare(`INSERT INTO appointments
      (patient_id,doctor_id,hospital_id,department_id,date,time,status,visit_reason,memo,created_at,updated_at)
      VALUES (?,?,?,?,?,?,'진료대기',?,?,?,?)`).run(patientId, doctorId, doctor.hospital_id, doctor.department_id, b.date, b.time, visitReason, memo, stamp, stamp);
    db.prepare('UPDATE slots SET is_booked=1 WHERE id=?').run(slot.id);
    const id = Number(info.lastInsertRowid);
    addLog({ patientId, appointmentId: id, action: '예약 신청', detail: `${doctor.hospital_name} ${b.date} ${b.time} 예약 신청` });
    addNotification({ patientId, appointmentId: id, title: '예약 신청이 접수되었습니다', body: `${doctor.hospital_name} ${b.date} ${b.time} 예약이 접수되었습니다.` });
    return id;
  });
  return getAppointment(tx());
}

function confirmAppointment(idRaw) {
  const id = parseId(idRaw);
  const appt = getAppointment(id);
  if (appt.status !== '진료대기') throw new HttpError(409, 'INVALID_STATE', '진료대기 상태의 예약만 확정할 수 있습니다.');
  db.prepare("UPDATE appointments SET status='예약확정', updated_at=? WHERE id=?").run(nowStamp(), id);
  addLog({ patientId: appt.patient_id, appointmentId: id, action: '예약 확정', detail: `${appt.hospital_name} ${appt.date} ${appt.time} 예약 확정` });
  addNotification({ patientId: appt.patient_id, appointmentId: id, title: '예약이 확정되었습니다', body: `${appt.hospital_name} ${appt.date} ${appt.time} 예약이 확정되었습니다.` });
  return getAppointment(id);
}

function cancelAppointment(idRaw, body) {
  const id = parseId(idRaw);
  const reason = cleanText((body || {}).reason, 100, '취소 사유');
  const appt = getAppointment(id);
  if (!ACTIVE.includes(appt.status)) throw new HttpError(409, 'INVALID_STATE', '취소할 수 없는 예약 상태입니다.');
  const tx = db.transaction(() => {
    const stamp = nowStamp();
    db.prepare("UPDATE appointments SET status='예약취소', updated_at=? WHERE id=?").run(stamp, id);
    db.prepare('UPDATE slots SET is_booked=0 WHERE doctor_id=? AND date=? AND time=?').run(appt.doctor_id, appt.date, appt.time);
    db.prepare('INSERT INTO appointment_cancels (appointment_id,reason,canceled_at) VALUES (?,?,?)').run(id, reason || '사유 없음', stamp);
    addLog({ patientId: appt.patient_id, appointmentId: id, action: '예약 취소', detail: `${appt.hospital_name} ${appt.date} ${appt.time} 예약 취소` });
    addNotification({ patientId: appt.patient_id, appointmentId: id, title: '예약 취소 안내', body: `예약 #${id} 취소 요청이 처리되었습니다.` });
  });
  tx();
  return getAppointment(id);
}

function updateAppointment(idRaw, body) {
  const id = parseId(idRaw);
  const b = body || {};
  const appt = getAppointment(id);
  if (!ACTIVE.includes(appt.status)) throw new HttpError(409, 'INVALID_STATE', '수정할 수 없는 예약 상태입니다.');

  const hasMemo = b.memo !== undefined;
  const hasReason = b.visitReason !== undefined;
  const hasSchedule = b.date !== undefined || b.time !== undefined;
  if (!hasMemo && !hasReason && !hasSchedule) throw new HttpError(400, 'INVALID_INPUT', '변경할 내용이 없습니다.');

  const memo = hasMemo ? cleanText(b.memo, 200, '메모') : appt.memo;
  const visitReason = hasReason ? cleanText(b.visitReason, 100, '방문 사유') : appt.visit_reason;
  const newDate = b.date !== undefined ? b.date : appt.date;
  const newTime = b.time !== undefined ? b.time : appt.time;
  const scheduleChanged = hasSchedule && (newDate !== appt.date || newTime !== appt.time);

  const tx = db.transaction(() => {
    const stamp = nowStamp();
    if (scheduleChanged) {
      const slot = assertSlot({ doctorId: appt.doctor_id, date: newDate, time: newTime, patientId: appt.patient_id, ignoreAppointmentId: id });
      db.prepare('UPDATE slots SET is_booked=0 WHERE doctor_id=? AND date=? AND time=?').run(appt.doctor_id, appt.date, appt.time);
      db.prepare('UPDATE slots SET is_booked=1 WHERE id=?').run(slot.id);
      db.prepare('INSERT INTO appointment_changes (appointment_id,old_date,old_time,new_date,new_time,changed_at) VALUES (?,?,?,?,?,?)')
        .run(id, appt.date, appt.time, newDate, newTime, stamp);
      addLog({ patientId: appt.patient_id, appointmentId: id, action: '예약 변경', detail: `${appt.date} ${appt.time} → ${newDate} ${newTime}` });
      addNotification({ patientId: appt.patient_id, appointmentId: id, title: '예약 변경 완료', body: `예약 #${id}의 일정이 ${newDate} ${newTime}(으)로 변경되었습니다.` });
    }
    if (hasMemo || hasReason) {
      addLog({ patientId: appt.patient_id, appointmentId: id, action: '예약 정보 수정', detail: `예약 #${id} 방문 사유/메모 수정` });
    }
    db.prepare('UPDATE appointments SET date=?, time=?, memo=?, visit_reason=?, updated_at=? WHERE id=?')
      .run(newDate, newTime, memo, visitReason, stamp, id);
  });
  tx();
  return getAppointment(id);
}

module.exports = { listAppointments, getAppointment, createAppointment, confirmAppointment, cancelAppointment, updateAppointment };
