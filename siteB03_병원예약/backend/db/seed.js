const { BASE_DATE, addDays, weekday, buildTimes } = require('../services/dateUtil');

function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, '0');

const DEPARTMENTS = [
  ['내과', '🩺', '감기, 소화기, 만성질환 진료'],
  ['정형외과', '🦴', '관절, 척추, 골절 진료'],
  ['피부과', '🧴', '피부 질환 및 상담'],
  ['이비인후과', '👂', '귀, 코, 목 질환 진료'],
  ['소아청소년과', '🧸', '영유아 및 청소년 진료'],
  ['산부인과', '🌸', '여성 건강 및 검진'],
  ['안과', '👁️', '시력, 안질환 진료'],
  ['신경과', '🧠', '두통, 어지럼, 신경계 질환'],
  ['정신건강의학과', '🌿', '마음 건강 상담 및 진료'],
  ['비뇨의학과', '💧', '비뇨기 질환 진료'],
  ['가정의학과', '🏠', '종합 건강 상담 및 검진'],
  ['재활의학과', '🏃', '운동·통증 재활 치료'],
];

const HOSPITAL_PREFIX = [
  '새봄', '한빛', '푸른숲', '온누리', '햇살', '다온', '늘푸른', '바른', '하나로', '고운',
  '든든', '온마음', '사랑채', '모두', '청솔', '은빛', '가온', '나래', '다솜', '라온',
  '마루', '보람', '소담', '아람', '이든', '어울림', '해든', '누리', '미래', '한결',
];
const HOSPITAL_SUFFIX = ['메디컬센터', '의원', '클리닉', '병원'];

const REGIONS = [
  '서울 강남구', '서울 서초구', '서울 송파구', '서울 마포구', '서울 성동구', '서울 영등포구',
  '서울 용산구', '서울 종로구', '경기 성남시', '경기 수원시', '인천 연수구', '부산 해운대구',
];

const HOURS = [
  { open: '09:00', close: '18:00', ls: '12:30', le: '13:30' },
  { open: '08:30', close: '17:30', ls: '12:00', le: '13:00' },
  { open: '10:00', close: '19:00', ls: '13:00', le: '14:00' },
];

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
const GIVEN = [
  '민준', '서연', '지호', '하은', '도윤', '수아', '예준', '지우', '시우', '서윤',
  '주원', '지민', '현우', '유진', '건우', '소율', '태윤', '나은', '승현', '채원',
  '재윤', '하린', '준서', '다인', '은우', '세아', '동현', '윤서', '민재', '아린',
];
const TITLES = ['원장', '부원장', '과장', '전문의'];
const REASONS = ['정기 검진', '증상 상담', '재진 상담', '검사 결과 확인', '통증 진료', '처방 상담'];
const MEMOS = ['', '', '오전 방문 희망', '이전 처방전 지참 예정', '보호자 동반 방문', '대기 시간 최소화 요청', '검사 결과지 지참'];
const CANCEL_REASONS = ['일정 변경', '증상 호전', '다른 병원 예약', '개인 사정', '교통 문제'];

function seedAll(db) {
  const rng = makeRng(20261102);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  const run = db.transaction(() => {
    // ---- 진료과 ----
    const insDept = db.prepare('INSERT INTO departments (id, name, icon, description) VALUES (?,?,?,?)');
    DEPARTMENTS.forEach((d, i) => insDept.run(i + 1, d[0], d[1], d[2]));

    // ---- 병원 ----
    const insHosp = db.prepare(`INSERT INTO hospitals
      (id,name,region,address,phone,open_time,close_time,lunch_start,lunch_end,sat_open,sat_close,description,rating)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const insHospDept = db.prepare('INSERT INTO hospital_departments (hospital_id, department_id) VALUES (?,?)');
    const insDoctor = db.prepare(`INSERT INTO doctors
      (id,hospital_id,department_id,name,title,career,years,work_days,tone) VALUES (?,?,?,?,?,?,?,?,?)`);
    const insSlot = db.prepare('INSERT INTO slots (doctor_id,date,time,is_booked) VALUES (?,?,?,0)');

    const hospitals = [];
    const doctors = [];
    const usedNames = new Set();
    let doctorId = 1;

    for (let i = 1; i <= 30; i++) {
      const hours = HOURS[(i - 1) % 3];
      const satOpen = i % 3 !== 0 ? 1 : 0;
      const name = `${HOSPITAL_PREFIX[i - 1]}${HOSPITAL_SUFFIX[i % 4]}`;
      const region = REGIONS[i % 12];
      const rating = Number((3.8 + ((i * 7) % 13) / 10).toFixed(1));
      insHosp.run(
        i, name, region, `${region} 가상로 ${10 + i * 3}길 ${i}`, `02-0000-${1000 + i}`,
        hours.open, hours.close, hours.ls, hours.le, satOpen, satOpen ? '13:00' : null,
        `${region}에 위치한 MediSlot 가상 협력 의료기관입니다.`, rating,
      );
      const hosp = { id: i, name, hours, satOpen, depts: [] };
      const n = i <= 14 ? 4 : 3;
      const base = ((i - 1) * 2) % 12;
      for (let k = 0; k < n; k++) {
        const deptId = ((base + k * 3) % 12) + 1;
        hosp.depts.push(deptId);
        insHospDept.run(i, deptId);
      }
      hospitals.push(hosp);

      for (let k = 0; k < n; k++) {
        let dname;
        do {
          dname = `${pick(SURNAMES)}${pick(GIVEN)}`;
        } while (usedNames.has(dname));
        usedNames.add(dname);
        const years = 5 + Math.floor(rng() * 24);
        const deptId = hosp.depts[k];
        let days = [1, 2, 3, 4, 5];
        if (i !== 1) {
          const cnt = 3 + Math.floor(rng() * 3);
          days = [1, 2, 3, 4, 5].filter(() => true);
          while (days.length > cnt) days.splice(Math.floor(rng() * days.length), 1);
          if (satOpen && rng() < 0.5) days.push(6);
        }
        insDoctor.run(
          doctorId, i, deptId, dname, TITLES[(doctorId + k) % 4],
          `${DEPARTMENTS[deptId - 1][0]} 전문의 · 임상 ${years}년`, years, days.join(','), doctorId % 6,
        );
        doctors.push({ id: doctorId, hospitalId: i, deptId, days, hosp });
        doctorId++;
      }
    }

    // ---- 진료 가능 시간 슬롯 (기준일 -7일 ~ +13일) ----
    for (const doc of doctors) {
      const { hours, satOpen } = doc.hosp;
      const weekdayTimes = buildTimes(hours.open, hours.close, hours.ls, hours.le);
      const satTimes = satOpen ? buildTimes(hours.open, '13:00') : [];
      for (let off = -7; off <= 13; off++) {
        const date = addDays(BASE_DATE, off);
        const w = weekday(date);
        if (w === 0 || !doc.days.includes(w)) continue;
        const times = w === 6 ? satTimes : weekdayTimes;
        for (const t of times) insSlot.run(doc.id, date, t);
      }
    }

    // ---- 환자 ----
    const insPatient = db.prepare('INSERT INTO patients (id,name,phone,birth_year,gender) VALUES (?,?,?,?,?)');
    const patientNames = new Set(['김하늘']);
    insPatient.run(1, '김하늘', '010-0000-0001', 1992, '여');
    for (let p = 2; p <= 100; p++) {
      let pn;
      do {
        pn = `${pick(SURNAMES)}${pick(GIVEN)}`;
      } while (patientNames.has(pn));
      patientNames.add(pn);
      insPatient.run(p, pn, `010-0000-${String(p).padStart(4, '0')}`, 1950 + Math.floor(rng() * 65), rng() < 0.5 ? '남' : '여');
    }

    // ---- 예약 ----
    const insAppt = db.prepare(`INSERT INTO appointments
      (id,patient_id,doctor_id,hospital_id,department_id,date,time,status,visit_reason,memo,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    const insCancel = db.prepare('INSERT INTO appointment_cancels (appointment_id,reason,canceled_at) VALUES (?,?,?)');
    const insChange = db.prepare(`INSERT INTO appointment_changes
      (appointment_id,old_date,old_time,new_date,new_time,changed_at) VALUES (?,?,?,?,?,?)`);
    const insNotif = db.prepare(`INSERT INTO notifications
      (patient_id,appointment_id,title,body,is_read,created_at) VALUES (?,?,?,?,?,?)`);
    const insLog = db.prepare('INSERT INTO activity_logs (patient_id,appointment_id,action,detail,created_at) VALUES (?,?,?,?,?)');
    const bookSlot = db.prepare('UPDATE slots SET is_booked=1 WHERE id=?');

    const docMap = new Map(doctors.map((d) => [d.id, d]));
    const appts = [];
    let apptId = 1;

    const stamp = (id) => `${addDays(BASE_DATE, -(2 + (id % 12)))} ${pad(8 + (id % 10))}:${pad((id * 7) % 60)}`;

    function addAppt({ patientId, doctorId: did, slot, status, reason, memo }) {
      const id = apptId++;
      const doc = docMap.get(did);
      const ts = stamp(id);
      insAppt.run(id, patientId, did, doc.hospitalId, doc.deptId, slot.date, slot.time, status, reason, memo, ts, ts);
      if (status !== '예약취소') bookSlot.run(slot.id);
      appts.push({ id, patientId, doctorId: did, hospitalId: doc.hospitalId, date: slot.date, time: slot.time, status });
      insLog.run(patientId, id, '예약 신청', `${doc.hosp.name} ${slot.date} ${slot.time} 예약 신청`, ts);
      if (status === '예약취소') {
        const when = `${addDays(BASE_DATE, -1 - (id % 5))} ${pad(9 + (id % 8))}:${pad((id * 11) % 60)}`;
        insCancel.run(id, CANCEL_REASONS[id % CANCEL_REASONS.length], when);
        insLog.run(patientId, id, '예약 취소', `${slot.date} ${slot.time} 예약이 취소되었습니다.`, when);
      }
      return id;
    }

    const findSlot = (did, from, nth, to) => {
      const sql = `SELECT id,date,time FROM slots WHERE doctor_id=? AND is_booked=0 AND date>=?
        ${to ? 'AND date<=?' : ''} ORDER BY date,time LIMIT 1 OFFSET ?`;
      const params = to ? [did, from, to, nth] : [did, from, nth];
      const s = db.prepare(sql).get(...params);
      if (!s) throw new Error(`seed: no slot for doctor ${did}`);
      return s;
    };
    const pastSlot = (did, nthFromEnd) => {
      const s = db.prepare(`SELECT id,date,time FROM slots WHERE doctor_id=? AND is_booked=0 AND date<?
        ORDER BY date DESC,time LIMIT 1 OFFSET ?`).get(did, BASE_DATE, nthFromEnd);
      if (!s) throw new Error(`seed: no past slot for doctor ${did}`);
      return s;
    };

    // 환자 1(김하늘)의 고정 테스트 예약: ID 1~16
    const D = (n) => addDays(BASE_DATE, n);
    const curated = [
      { d: 1, slot: () => findSlot(1, D(2), 3), s: '예약확정', r: '정기 검진', m: '오전 방문 희망' },      // 1
      { d: 3, slot: () => findSlot(3, D(3), 5), s: '예약확정', r: '증상 상담', m: '이전 처방전 지참 예정' }, // 2
      { d: 5, slot: () => findSlot(5, D(4), 2), s: '예약확정', r: '통증 진료', m: '보호자 동반 방문' },     // 3
      { d: 6, slot: () => findSlot(6, D(2), 6), s: '예약확정', r: '재진 상담', m: '' },                    // 4
      { d: 9, slot: () => findSlot(9, D(5), 1), s: '예약확정', r: '처방 상담', m: '대기 시간 최소화 요청' }, // 5
      { d: 10, slot: () => findSlot(10, D(6), 2), s: '예약확정', r: '정기 검진', m: '' },                  // 6
      { d: 13, slot: () => findSlot(13, D(7), 4), s: '예약확정', r: '검사 결과 확인', m: '검사 결과지 지참' }, // 7
      { d: 2, slot: () => findSlot(2, BASE_DATE, 8, BASE_DATE), s: '진료대기', r: '증상 상담', m: '' },     // 8
      { d: 7, slot: () => findSlot(7, D(1), 3, D(4)), s: '진료대기', r: '재진 상담', m: '' },              // 9
      { d: 4, slot: () => pastSlot(4, 6), s: '진료완료', r: '정기 검진', m: '' },                          // 10
      { d: 8, slot: () => pastSlot(8, 10), s: '진료완료', r: '통증 진료', m: '' },                         // 11
      { d: 11, slot: () => pastSlot(11, 3), s: '진료완료', r: '증상 상담', m: '' },                        // 12
      { d: 12, slot: () => findSlot(12, D(3), 2), s: '예약취소', r: '정기 검진', m: '' },                  // 13
      { d: 14, slot: () => findSlot(14, D(4), 3), s: '예약취소', r: '증상 상담', m: '' },                  // 14
      { d: 17, slot: () => findSlot(17, D(8), 2), s: '예약확정', r: '처방 상담', m: '' },                  // 15
      { d: 18, slot: () => pastSlot(18, 4), s: '진료완료', r: '재진 상담', m: '' },                        // 16
    ];
    for (const c of curated) {
      addAppt({ patientId: 1, doctorId: c.d, slot: c.slot(), status: c.s, reason: c.r, memo: c.m });
    }

    // 나머지 예약: 총 220건
    const free = db.prepare('SELECT id,doctor_id,date,time FROM slots WHERE is_booked=0').all();
    const used = new Set();
    const future = free.filter((s) => s.date >= BASE_DATE);
    const near = free.filter((s) => s.date >= BASE_DATE && s.date <= D(2));
    const past = free.filter((s) => s.date < BASE_DATE);
    const take = (arr) => {
      for (;;) {
        const i = Math.floor(rng() * arr.length);
        const s = arr[i];
        arr[i] = arr[arr.length - 1];
        arr.pop();
        if (!used.has(s.id)) {
          used.add(s.id);
          return s;
        }
      }
    };
    const peek = (arr) => {
      for (;;) {
        const s = arr[Math.floor(rng() * arr.length)];
        if (!used.has(s.id)) return s;
      }
    };

    const plan = [];
    plan.push(...Array(80).fill('예약취소'), ...Array(40).fill('진료완료'), ...Array(24).fill('진료대기'), ...Array(60).fill('예약확정'));
    for (let i = plan.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [plan[i], plan[j]] = [plan[j], plan[i]];
    }
    for (const status of plan) {
      const slot =
        status === '예약취소' ? peek(future) : status === '진료완료' ? take(past) : status === '진료대기' ? take(near) : take(future);
      addAppt({
        patientId: 2 + Math.floor(rng() * 99),
        doctorId: slot.doctor_id,
        slot,
        status,
        reason: pick(REASONS),
        memo: pick(MEMOS),
      });
    }

    // ---- 예약 변경 기록 130건 ----
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00'];
    for (let n = 0; n < 130; n++) {
      const a = appts[(n * 7 + 3) % appts.length];
      const oldDate = addDays(a.date, -(1 + (n % 4)));
      const oldTime = times[n % times.length];
      const when = `${addDays(BASE_DATE, -(1 + (n % 9)))} ${pad(9 + (n % 9))}:${pad((n * 13) % 60)}`;
      insChange.run(a.id, oldDate, oldTime, a.date, a.time, when);
      insLog.run(a.patientId, a.id, '예약 변경', `${oldDate} ${oldTime} → ${a.date} ${a.time}`, when);
    }

    // ---- 알림 120건 ----
    const mine = appts.filter((a) => a.patientId === 1);
    const hospName = (id) => hospitals[id - 1].name;
    const templates = [
      (a) => ['예약이 확정되었습니다', `${hospName(a.hospitalId)} ${a.date} ${a.time} 예약이 확정되었습니다.`],
      (a) => ['진료 전날 안내', `${a.date} ${a.time} 진료 예정입니다. 신분증을 지참해 주세요.`],
      (a) => ['예약 변경 완료', `예약 #${a.id}의 일정이 ${a.date} ${a.time}(으)로 변경되었습니다.`],
      (a) => ['예약 취소 안내', `예약 #${a.id} 취소 요청이 처리되었습니다.`],
    ];
    for (let k = 0; k < 120; k++) {
      const a = k < 14 ? mine[k % mine.length] : appts[Math.floor(rng() * appts.length)];
      const [title, body] = templates[k % 4](a);
      const isRead = a.patientId === 1 ? k % 2 !== 0 : k % 3 !== 0;
      insNotif.run(a.patientId, a.id, title, body, isRead ? 1 : 0, `${addDays(BASE_DATE, -(k % 10))} ${pad(8 + (k % 11))}:${pad((k * 17) % 60)}`);
    }
  });

  run();
}

module.exports = { seedAll };

if (require.main === module) {
  const db = require('./connection');
  const { createSchema, clearAll } = require('./init');
  createSchema(db);
  clearAll(db);
  seedAll(db);
  console.log('[seed] done');
}
