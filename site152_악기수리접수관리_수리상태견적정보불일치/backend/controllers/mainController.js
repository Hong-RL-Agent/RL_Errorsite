import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getInstruments = (req, res) => res.json(readDB().instruments);
export const getCustomers = (req, res) => res.json(readDB().customers);
export const getRepairs = (req, res) => res.json(readDB().repairs);
export const getEstimates = (req, res) => res.json(readDB().estimates);
export const getRepairLogs = (req, res) => res.json(readDB().repairLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchRepairs = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.repairs;
  if (category && category !== 'ALL') list = list.filter(r => r.category === category);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.customerName.includes(search) || r.instrumentName.includes(search) || r.repairCode.includes(search) || r.storageNo.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 악기 종류 필터('현악기 (바이올린 / 첼로 / 비올라)' 3초 지연 ➔ '관악기 (플루트 / 색소폰 / 클라리넷)' 0.2초 완료)와 수리 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(현악기)이 최신 접수 목록을 덮어쓰고, 접수 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (category === '현악기 (바이올린 / 첼로 / 비올라)') delay = 3000;
  else if (category === '관악기 (플루트 / 색소폰 / 클라리넷)') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateRepairEstimatePrice = (req, res) => {
  const { id } = req.params;
  const { estimatePriceWon } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rpr = db.repairs.find(r => r.id === id);
    if (rpr) {
      rpr.estimatePriceWon = estimatePriceWon;
      writeDB(db);
      console.log(`[DB ESTIMATE PRICE UPDATE] Repair ${id} estimatePriceWon set to ${estimatePriceWon} (0.1s done)`);
    }
    res.json({ success: true, rpr });
  }, 100);
};

export const updateRepairStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 수리 상태를 수리중(REPAIRING - 3초 지연 완료)으로 변경한 직후 견적 금액을 수정(0.1초 완료)하면,
  // 견적 금액 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 수리 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 견적 금액)을 덮어써 저장하여 새로고침 시
  // 수리 상태와 상세 패널의 견적 금액이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rpr = dbSnapshot.repairs.find(r => r.id === id);
    if (rpr) {
      rpr.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back estimatePriceWon update!
      console.log(`[DB STATUS UPDATE] Repair ${id} status set to ${status} (3s done, rolled back estimatePriceWon update)`);
    }
    res.json({ success: true, rpr });
  }, 3000);
};

export const cancelRepair = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const rpr = db.repairs.find(r => r.id === id);
    if (rpr) {
      rpr.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL REPAIR] Repair ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, rpr });
  }, 500);
};

export const completeRepair = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 수리 취소 API(0.5초 완료)를 호출한 직후 출고 완료 API를 호출(4초 지연 완료)하면,
  // 수리 취소는 성공하지만 늦게 완료된 출고 완료 요청(4초 지연)이 취소된 접수를 다시 'COMPLETED'(출고완료) 상태로 복원시켜버립니다.
  // 목록에서는 수리취소(CANCELLED), 공방 관제에서는 출고완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rpr = db.repairs.find(r => r.id === id);
    if (rpr) {
      rpr.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated repair ${id} back to COMPLETED status via instrument checkout!`);
    }
    writeDB(db);
    res.json({ success: true, rpr });
  }, 4000);
};

export const completeRepairUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 출고 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '악기 수리 출고 완료 성공 (INSTRUMENT REPAIR CHECKOUT COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] INSTRUMENT REPAIR CHECKOUT COMPLETED SUCCESSFULLY for repair ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief luthier role required for final instrument checkout" });
  }
  const db = readDB();
  const rpr = db.repairs.find(r => r.id === id);
  if (rpr) { rpr.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, rpr });
};

export const updateCustomerPartial = (req, res) => {
  const { id } = req.params;
  const { customerName, phone, storageNo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 이름, 연락처, 악기 보관번호를 동시에 수정하면,
  // backend data.json에는 이름(customerName)과 악기 보관번호(storageNo)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cst = db.customers.find(c => c.id === id);
  if (cst) {
    if (customerName) cst.customerName = customerName;
    if (storageNo) cst.storageNo = storageNo;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated customerName and storageNo for customer ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, cst });
};

export const deleteRepairLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.repairLogs = db.repairLogs.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 작업 로그를 삭제(`DELETE /api/repair-logs/:id`) 처리하여 작업 로그 목록에서 소거하더라도,
  // repairStats(악기별 평균 수리비, 작업자별 처리량, 월별 출고 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed repair log ${id}. repairStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-4001", name: "김수리 (마스터 리페어 루티어)", role: "MANAGER", instrumentCategory: "현악기 (바이올린 / 첼로 / 비올라)", handledRepairs: 520 }],
    instruments: [{ id: "INST-01", instrumentName: "스트라디바리우스 카피 바이올린 4/4", category: "현악기 (바이올린 / 첼로 / 비올라)", brand: "독일 수제 악기", storageNo: "STG-V-101", status: "REPAIRING" }],
    customers: [{ id: "CST-8001", customerName: "최바이올린", phone: "010-9999-5555", storageNo: "STG-V-101", instrumentName: "바이올린 4/4", totalRepairs: 8, rating: 4.9 }],
    repairs: [{ id: "RPR-7001", repairCode: "IF-20260805-01", category: "현악기 (바이올린 / 첼로 / 비올라)", instrumentName: "스트라디바리우스 카피 바이올린 4/4", customerName: "최바이올린", storageNo: "STG-V-101", issueDescription: "상판 균열 복원 및 브릿지 피팅, 핑거보드 드레싱", workerName: "김수리 마스터", estimatePriceWon: 350000, rptDate: "2026-08-05", status: "REPAIRING" }],
    estimates: [{ id: "EST-9001", rprId: "RPR-7001", instrumentName: "바이올린 4/4", customerName: "최바이올린", partsFee: 150000, laborFee: 200000, totalFee: 350000, status: "CONFIRMED" }],
    repairLogs: [{ id: "RLOG-6001", rprId: "RPR-7001", instrumentName: "바이올린 4/4", workerName: "김수리 마스터", workContent: "상판 이탈리아 천연 접착재 교목 및 브릿지 피팅 정밀 세팅", workTime: "2026-08-05 10:30", status: "DONE" }],
    activityLogs: [{ id: "ACT-9901", rprId: "RPR-7001", operator: "김수리 (마스터)", action: "접수 RPR-7001 최바이올린 님 바이올린 정밀 진단 및 35만원 견적 수리중 전환 완료", timestamp: "2026-08-05 10:35:00", status: "SUCCESS" }],
    repairStats: { totalRepairs: 55, totalCustomers: 45, totalInstruments: 20, totalEstimates: 50, estimatingCount: 12, repairingCount: 21, completedCount: 22, avgRepairFeeWon: 345000 }
  };
  writeDB(initial);
  res.json({ success: true });
};
