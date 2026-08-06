import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getDesigners = (req, res) => res.json(readDB().designers);
export const getTreatments = (req, res) => res.json(readDB().treatments);
export const getClients = (req, res) => res.json(readDB().clients);
export const getReservations = (req, res) => res.json(readDB().reservations);
export const getVisitLogs = (req, res) => res.json(readDB().visitLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchReservations = (req, res) => {
  const { designerName, status, search } = req.query;
  const db = readDB();
  let list = db.reservations;
  if (designerName && designerName !== 'ALL') list = list.filter(r => r.designerName === designerName);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.clientName.includes(search) || r.treatmentName.includes(search) || r.resCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 디자이너 필터('엘리 원장' 3초 지연 ➔ '지아 디자이너' 0.2초 완료)와 예약 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(엘리 원장)이 최신 예약 목록을 덮어쓰고, 예약 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (designerName === '엘리 원장') delay = 3000;
  else if (designerName === '지아 디자이너') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateReservationTreatment = (req, res) => {
  const { id } = req.params;
  const { treatmentName } = req.body;
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.treatmentName = treatmentName;
      writeDB(db);
      console.log(`[DB TREATMENT UPDATE] Reservation ${id} treatmentName set to ${treatmentName} (0.1s done)`);
    }
    res.json({ success: true, resv });
  }, 100);
};

export const updateReservationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 예약 상태를 시술중(IN_PROGRESS - 3초 지연 완료)으로 변경한 직후 시술 옵션을 변경(0.1초 완료)하면,
  // 시술 옵션 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 예약 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 시술 옵션)을 덮어써 저장하여 새로고침 시
  // 예약 상태와 상세 패널의 시술 옵션이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const resv = dbSnapshot.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back treatmentName update!
      console.log(`[DB STATUS UPDATE] Reservation ${id} status set to ${status} (3s done, rolled back treatmentName update)`);
    }
    res.json({ success: true, resv });
  }, 3000);
};

export const cancelReservation = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL RESERVATION] Reservation ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, resv });
  }, 500);
};

export const completeReservation = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 예약 취소 API(0.5초 완료)를 호출한 직후 시술 완료 API를 호출(4초 지연 완료)하면,
  // 예약 취소는 성공하지만 늦게 완료된 시술 완료 요청(4초 지연)이 취소된 예약을 다시 'COMPLETED'(시술완료) 상태로 복원시켜버립니다.
  // 목록에서는 취소(CANCELLED), 시술 관제에서는 완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated reservation ${id} back to COMPLETED status via treatment completion!`);
    }
    writeDB(db);
    res.json({ success: true, resv });
  }, 4000);
};

export const refundReservationUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 예약 환불 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '예약 환불 성공 (RESERVATION REFUNDED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] RESERVATION REFUNDED SUCCESSFULLY for reservation ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior director role required to process reservation refund" });
  }
  const db = readDB();
  const resv = db.reservations.find(r => r.id === id);
  if (resv) { resv.status = 'REFUNDED'; writeDB(db); }
  res.json({ success: true, resv });
};

export const updateClientPartial = (req, res) => {
  const { id } = req.params;
  const { clientName, phone, preferredDesigner } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 이름, 연락처, 선호 디자이너를 동시에 수정하면,
  // backend data.json에는 이름(clientName)과 선호 디자이너(preferredDesigner)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cli = db.clients.find(c => c.id === id);
  if (cli) {
    if (clientName) cli.clientName = clientName;
    if (preferredDesigner) cli.preferredDesigner = preferredDesigner;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated clientName and preferredDesigner for client ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, cli });
};

export const deleteVisitLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.visitLogs = db.visitLogs.filter(v => v.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 방문 로그를 삭제(`DELETE /api/visit-logs/:id`) 처리하여 방문 로그 목록에서 소거하더라도,
  // salonStats(디자이너별 매출, 옵션별 선택률, 고객 재방문율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed visit log ${id}. salonStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-8001", name: "엘리 (청담 본점 수석 원장)", role: "MANAGER", branch: "청담 본점", monthlySalesWon: 18500000 }],
    designers: [{ id: "DSG-01", name: "엘리 원장", title: "수석 헤어 디렉터", branch: "청담 본점", specialty: "시그니처 레이어드 펌 & 클리닉", rating: 4.9 }],
    treatments: [{ id: "TRT-3001", treatmentName: "시그니처 레이어드 S컬 펌", category: "펌 (Perm)", priceWon: 220000, durationMinutes: 150 }],
    clients: [{ id: "CLI-4001", clientName: "김지민", phone: "010-9999-1111", preferredDesigner: "엘리 원장", vipGrade: "VVIP (상위 1%)", visitCount: 24 }],
    reservations: [{ id: "RES-1001", resCode: "HS-20260805-01", branch: "청담 본점", designerName: "엘리 원장", clientName: "김지민", treatmentName: "시그니처 레이어드 S컬 펌", resTime: "2026-08-05 14:00", priceWon: 220000, status: "IN_PROGRESS" }],
    visitLogs: [{ id: "VLOG-6001", resId: "RES-1001", clientName: "김지민", designerName: "엘리 원장", treatmentName: "시그니처 레이어드 S컬 펌", paidAmountWon: 220000, visitDate: "2026-08-05 14:00" }],
    activityLogs: [{ id: "ACT-9001", resId: "RES-1001", operator: "엘리 원장", action: "고객 김지민 님 시그니처 레이어드 S컬 펌 입실 및 샴푸 드라이 안내 완료", timestamp: "2026-08-05 14:05:00", status: "SUCCESS" }],
    salonStats: { totalReservations: 55, totalClients: 45, totalDesigners: 15, inProgressCount: 12, completedCount: 35, totalSalesWon: 12850000, revisitRatePercent: 84.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
