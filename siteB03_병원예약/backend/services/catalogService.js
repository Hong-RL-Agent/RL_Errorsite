const db = require('../db/connection');
const { BASE_DATE, SCHEDULE_DAYS, addDays, weekday, isValidDate } = require('./dateUtil');
const { HttpError } = require('./errors');

function parseId(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'INVALID_ID', '올바르지 않은 ID입니다.');
  return n;
}

function listDepartments() {
  return db.prepare(`SELECT d.*, (SELECT COUNT(*) FROM hospital_departments hd WHERE hd.department_id=d.id) AS hospital_count
    FROM departments d ORDER BY d.id`).all();
}

function attachDepartments(hospitals) {
  const stmt = db.prepare(`SELECT dep.id, dep.name FROM hospital_departments hd
    JOIN departments dep ON dep.id=hd.department_id WHERE hd.hospital_id=? ORDER BY dep.id`);
  return hospitals.map((h) => ({ ...h, departments: stmt.all(h.id) }));
}

function listHospitals({ q, department, region }) {
  const where = [];
  const params = [];
  if (q && String(q).trim()) {
    const like = `%${String(q).trim()}%`;
    where.push(`(h.name LIKE ? OR h.address LIKE ?
      OR EXISTS (SELECT 1 FROM hospital_departments hd JOIN departments dep ON dep.id=hd.department_id
                 WHERE hd.hospital_id=h.id AND dep.name LIKE ?)
      OR EXISTS (SELECT 1 FROM doctors d WHERE d.hospital_id=h.id AND d.name LIKE ?))`);
    params.push(like, like, like, like);
  }
  if (department) {
    where.push('EXISTS (SELECT 1 FROM hospital_departments hd WHERE hd.hospital_id=h.id AND hd.department_id=?)');
    params.push(parseId(department));
  }
  if (region) {
    where.push('h.region = ?');
    params.push(String(region));
  }
  const rows = db.prepare(`SELECT h.*, (SELECT COUNT(*) FROM doctors d WHERE d.hospital_id=h.id) AS doctor_count
    FROM hospitals h ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY h.id`).all(...params);
  return attachDepartments(rows);
}

function getHospital(idRaw) {
  const id = parseId(idRaw);
  const row = db.prepare('SELECT * FROM hospitals WHERE id=?').get(id);
  if (!row) throw new HttpError(404, 'NOT_FOUND', '병원을 찾을 수 없습니다.');
  const [hospital] = attachDepartments([row]);
  hospital.doctors = listDoctors({ hospitalId: id });
  return hospital;
}

function listRegions() {
  return db.prepare('SELECT DISTINCT region FROM hospitals ORDER BY region').all().map((r) => r.region);
}

const DOCTOR_SELECT = `SELECT d.*, h.name AS hospital_name, dep.name AS department_name
  FROM doctors d JOIN hospitals h ON h.id=d.hospital_id JOIN departments dep ON dep.id=d.department_id`;

function listDoctors({ hospitalId, departmentId, q }) {
  const where = [];
  const params = [];
  if (hospitalId) { where.push('d.hospital_id=?'); params.push(parseId(hospitalId)); }
  if (departmentId) { where.push('d.department_id=?'); params.push(parseId(departmentId)); }
  if (q) { where.push('d.name LIKE ?'); params.push(`%${q}%`); }
  return db.prepare(`${DOCTOR_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY d.id`).all(...params);
}

function getDoctor(idRaw) {
  const id = parseId(idRaw);
  const row = db.prepare(`${DOCTOR_SELECT} WHERE d.id=?`).get(id);
  if (!row) throw new HttpError(404, 'NOT_FOUND', '의사를 찾을 수 없습니다.');
  return row;
}

// 기준일부터 14일간 날짜별 예약 가능 슬롯 수
function getDoctorSchedule(idRaw) {
  const doctor = getDoctor(idRaw);
  const to = addDays(BASE_DATE, SCHEDULE_DAYS - 1);
  const counts = db.prepare(`SELECT date, COUNT(*) AS total, SUM(CASE WHEN is_booked=0 THEN 1 ELSE 0 END) AS available
    FROM slots WHERE doctor_id=? AND date>=? AND date<=? GROUP BY date`).all(doctor.id, BASE_DATE, to);
  const map = new Map(counts.map((c) => [c.date, c]));
  const days = [];
  for (let i = 0; i < SCHEDULE_DAYS; i++) {
    const date = addDays(BASE_DATE, i);
    const c = map.get(date);
    days.push({ date, weekday: weekday(date), total: c ? c.total : 0, available: c ? c.available : 0 });
  }
  return { doctorId: doctor.id, from: BASE_DATE, to, days };
}

function getAvailability({ doctorId, hospitalId, date }) {
  if (!isValidDate(date)) throw new HttpError(400, 'INVALID_DATE', '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  if (doctorId) {
    const doctor = getDoctor(doctorId);
    const slots = db.prepare('SELECT id,time,is_booked FROM slots WHERE doctor_id=? AND date=? ORDER BY time').all(doctor.id, date);
    return {
      doctorId: doctor.id,
      date,
      slots: slots.map((s) => ({ id: s.id, time: s.time, available: s.is_booked === 0 && date >= BASE_DATE })),
    };
  }
  if (hospitalId) {
    const hid = parseId(hospitalId);
    if (!db.prepare('SELECT 1 FROM hospitals WHERE id=?').get(hid)) throw new HttpError(404, 'NOT_FOUND', '병원을 찾을 수 없습니다.');
    const rows = db.prepare(`SELECT d.id AS doctor_id, d.name, SUM(CASE WHEN s.is_booked=0 THEN 1 ELSE 0 END) AS available
      FROM doctors d LEFT JOIN slots s ON s.doctor_id=d.id AND s.date=? WHERE d.hospital_id=? GROUP BY d.id ORDER BY d.id`).all(date, hid);
    return { hospitalId: hid, date, doctors: rows.map((r) => ({ ...r, available: r.available || 0 })) };
  }
  throw new HttpError(400, 'INVALID_INPUT', 'doctorId 또는 hospitalId가 필요합니다.');
}

function listPatients() {
  return db.prepare('SELECT * FROM patients ORDER BY id').all();
}

function getPatient(idRaw) {
  const row = db.prepare('SELECT * FROM patients WHERE id=?').get(parseId(idRaw));
  if (!row) throw new HttpError(404, 'NOT_FOUND', '환자를 찾을 수 없습니다.');
  return row;
}

module.exports = {
  listDepartments, listHospitals, getHospital, listRegions, listDoctors, getDoctor,
  getDoctorSchedule, getAvailability, listPatients, getPatient,
};
