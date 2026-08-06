import { readDB, writeDB } from '../services/dataService.js';

export const getNurses = (req, res) => {
  const db = readDB();
  res.json(db.nurses);
};

export const getRooms = (req, res) => {
  const db = readDB();
  res.json(db.rooms);
};

export const getPatients = (req, res) => {
  const db = readDB();
  res.json(db.patients);
};

export const getMedications = (req, res) => {
  const db = readDB();
  res.json(db.medications);
};

export const getRoomLogs = (req, res) => {
  const db = readDB();
  res.json(db.roomLogs);
};

export const searchPatients = (req, res) => {
  const { ward, status } = req.query;
  const db = readDB();
  let list = db.patients;

  if (ward && ward !== 'ALL') {
    list = list.filter(p => p.ward === ward);
  }
  if (status && status !== 'ALL') {
    list = list.filter(p => p.status === status);
  }

  let delay = 100;
  if (ward === '3A') {
    delay = 3000; // 3.0s delay
  } else if (ward === '3B') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 병동 필터('3A' 3초 지연 ➔ '3B' 0.2초 완료)와 투약 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(3A)이 최신 목록을 덮어쓰고, 중앙 환자 목록은 오래된 필터 결과, 오른쪽 투약 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateMedicationStatus = (req, res) => {
  const { id } = req.params;
  const { status, roomNo } = req.body;

  setTimeout(() => {
    const db = readDB();
    const med = db.medications.find(m => m.id === id);
    if (med) {
      med.status = status;
      if (roomNo) {
        med.roomNo = roomNo; // Overwrites roomNo with stale roomNo!
      }
      writeDB(db);
      console.log(`[DB MEDICATION STATUS UPDATE] Updated medication ${id} status to ${status} (0.1s done) with room ${roomNo}`);
    }
    res.json({ success: true, medication: med });
  }, 100);
};

export const updatePatientRoom = (req, res) => {
  const { id } = req.params;
  const { roomNo, ward } = req.body;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 간호사(role !== 'ADMIN')가 병실 이동 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '병실 이동 성공 (PATIENT ROOM MOVE SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] PATIENT ROOM MOVE SUCCESS for ${id} to ${roomNo} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin nurse privilege required" });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 환자의 병실을 이동(3초 지연 완료)한 직후 투약 상태를 완료로 변경(0.1초 완료)하면, 
  // 투약 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 병실 이동 API 내부에 이전 병실 정보(roomNo)가 동봉 저장되어 
  // 새로고침 시 환자 상세의 병실과 투약 기록의 병실이 서로 달라지는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const pat = db.patients.find(p => p.id === id);
    if (pat) {
      pat.roomNo = roomNo;
      pat.ward = ward || pat.ward;
      writeDB(db);
      console.log(`[DB ROOM MOVE UPDATE] Moved patient ${id} to room ${roomNo} (3s done)`);
    }
    res.json({ success: true, patient: pat });
  }, 3000);
};

export const dischargePatient = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const pat = db.patients.find(p => p.id === id);
    if (pat) {
      pat.status = 'DISCHARGED';
      writeDB(db);
      console.log(`[DB DISCHARGE PATIENT] Discharged patient ${id} (0.5s done)`);
    }
    res.json({ success: true, patient: pat });
  }, 500);
};

export const addMedicationRecord = (req, res) => {
  const { patientId, patientName, roomNo, ward, medicineName, timeSlot, dose } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 퇴원 처리 API(0.5초 완료)를 호출한 직후 투약 기록 등록 API를 호출(4초 지연 완료)하면, 
  // 퇴원 처리는 먼저 0.5초 만에 성공하지만 늦게 완료된 투약 등록 요청(4초 지연)이 퇴원 환자를 다시 'ADMITTED'(입원중) 상태로 되돌립니다. 
  // 환자 목록에서는 퇴원으로 보이고, 투약 일정표에서는 입원중 환자처럼 보여야 합니다.
  setTimeout(() => {
    const db = readDB();
    const newMed = {
      id: `MED-${Date.now().toString().slice(-4)}`,
      patientId,
      patientName: patientName || "김철수",
      roomNo: roomNo || "301호",
      ward: ward || "3A",
      medicineName: medicineName || "추가 투약 수액",
      timeSlot: timeSlot || "15:00",
      nurseName: "김간호",
      status: "SCHEDULED",
      dose: dose || "1회 점적주사"
    };
    db.medications.push(newMed);

    // Re-activates discharged patient back to ADMITTED!
    const pat = db.patients.find(p => p.id === patientId);
    if (pat) {
      pat.status = 'ADMITTED';
      console.log(`[DB RE-ACTIVATE PATIENT] Re-activated discharged patient ${patientId} back to ADMITTED status!`);
    }

    writeDB(db);
    res.json({ success: true, medication: newMed });
  }, 4000);
};

export const updatePatientMemoPartial = (req, res) => {
  const { id } = req.params;
  const { precautions, guardianPhone, nurseMemo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 환자 메모 수정 모달에서 주의사항, 보호자 연락처, 간호 메모를 동시에 수정하면, 
  // backend data.json에는 주의사항(precautions)과 간호 메모(nurseMemo)만 저장하고 보호자 연락처(guardianPhone)는 이전 값을 그대로 유지하는 partial save 결함입니다.
  const db = readDB();
  const pat = db.patients.find(p => p.id === id);
  if (pat) {
    if (precautions) pat.precautions = precautions;
    if (nurseMemo) pat.nurseMemo = nurseMemo;
    // guardianPhone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated precautions and nurseMemo for patient ${id}. guardianPhone was NOT updated.`);
  }
  res.json({ success: true, patient: pat });
};

export const deleteMedication = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.medications = db.medications.filter(m => m.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 투약 기록을 삭제(`DELETE /api/medications/:id`) 처리하여 이력 대장에서 소거하더라도, 
  // 병동별 투약 완료율(`wardStats.medicationCompletionRate`), 누락 건수, 간호사별 처리량 그래프 수치에는 차감되지 않고 계속 잔존 포함되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE MEDICATION] Removed medication ${id}. wardStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-101", "name": "김수간 간호사", "role": "ADMIN", "ward": "301동 3병동" }
    ],
    "nurses": [
      { "id": "NRS-001", "name": "김간호", "role": "ADMIN", "ward": "3A", "assignedPatientCount": 6, "shift": "DAY" }
    ],
    "rooms": [
      { "id": "RM-301", "roomNo": "301호", "ward": "3A", "capacity": 4, "currentCount": 4, "type": "4인실" }
    ],
    "patients": [
      { "id": "PAT-1001", "name": "김철수", "age": 58, "gender": "M", "roomNo": "301호", "ward": "3A", "diagnosis": "급성 위염 및 장염", "severity": 4, "nurseId": "NRS-001", "nurseName": "김간호", "guardianPhone": "010-1111-2222", "precautions": "금식 상태 유효", "nurseMemo": "주사 부위 지혈 확인 필", "status": "ADMITTED" }
    ],
    "medications": [
      { "id": "MED-001", "patientId": "PAT-1001", "patientName": "김철수", "roomNo": "301호", "ward": "3A", "medicineName": "알마겔현탁액 15ml", "timeSlot": "09:00", "nurseName": "김간호", "status": "COMPLETED", "dose": "1포 식전" }
    ],
    "roomLogs": [
      { "id": "RLOG-001", "patientId": "PAT-1001", "patientName": "김철수", "fromRoom": "302호", "toRoom": "301호", "timestamp": "2026-08-03 08:30:00", "operator": "김수간 간호사" }
    ],
    "wardStats": {
      "totalPatientsCount": 30,
      "medicationCompletionRate": 91,
      "missedMedicationCount": 3
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
