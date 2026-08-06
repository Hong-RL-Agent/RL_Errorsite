import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getBranches = (req, res) => res.json(readDB().branches);
export const getCustomers = (req, res) => res.json(readDB().customers);
export const getLockers = (req, res) => res.json(readDB().lockers);
export const getContracts = (req, res) => res.json(readDB().contracts);
export const getInOutLogs = (req, res) => res.json(readDB().inOutLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchLockers = (req, res) => {
  const { branchId, status, search } = req.query;
  const db = readDB();
  let list = db.lockers;
  if (branchId && branchId !== 'ALL') list = list.filter(l => l.branchId === branchId);
  if (status && status !== 'ALL') list = list.filter(l => l.status === status);
  if (search) list = list.filter(l => l.lockerNo.includes(search) || l.customerName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 지점 필터('강남역점' 3초 지연 ➔ '홍대입구점' 0.2초 완료)와 보관함 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남역점)이 최신 보관함 목록을 덮어쓰고, 보관함 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (branchId === 'BRN-01') delay = 3000;
  else if (branchId === 'BRN-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateLockerPeriod = (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 계약 기간을 변경(3초 지연 완료)한 직후 보관함 상태를 사용중(IN_USE - 0.1초 완료)으로 변경하면,
  // 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 계약 기간 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(사용중 상태와 이전 계약 기간)을 덮어써 저장하여 새로고침 시
  // 보관함의 계약 기간과 상세 패널의 계약 기간이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const lck = dbSnapshot.lockers.find(l => l.id === id);
    if (lck) {
      lck.startDate = startDate;
      lck.endDate = endDate;
      writeDB(dbSnapshot); // Overwrites DB, rolling back status update!
      console.log(`[DB PERIOD UPDATE] Locker ${id} period set to ${startDate}~${endDate} (3s done, rolled back status update)`);
    }
    res.json({ success: true, lck });
  }, 3000);
};

export const updateLockerStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  setTimeout(() => {
    const db = readDB();
    const lck = db.lockers.find(l => l.id === id);
    if (lck) {
      lck.status = status;
      writeDB(db);
      console.log(`[DB STATUS UPDATE] Locker ${id} status set to ${status} (0.1s done)`);
    }
    res.json({ success: true, lck });
  }, 100);
};

export const terminateContract = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const lck = db.lockers.find(l => l.id === id);
    if (lck) {
      lck.status = 'TERMINATED';
      writeDB(db);
      console.log(`[DB TERMINATE CONTRACT] Locker ${id} status set to TERMINATED (0.5s done)`);
    }
    res.json({ success: true, lck });
  }, 500);
};

export const processItemIn = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 계약 종료 API(0.5초 완료)를 호출한 직후 입고 처리 API를 호출(4초 지연 완료)하면,
  // 계약 종료는 성공하지만 늦게 완료된 입고 처리 요청(4초 지연)이 종료된 계약을 다시 'IN_USE'(사용중) 상태로 바꿔버립니다.
  // 목록에서는 계약종료(TERMINATED), 입출고 관제에서는 사용중(IN_USE)으로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const lck = db.lockers.find(l => l.id === id);
    if (lck) {
      lck.status = 'IN_USE'; // INTENTIONAL_ERROR: Overwrites TERMINATED back to IN_USE!
      console.log(`[DB RESTORE STATUS] Re-activated locker ${id} back to IN_USE status via item deposit!`);
    }
    writeDB(db);
    res.json({ success: true, lck });
  }, 4000);
};

export const terminateContractUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 계약 강제종료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '계약 종료 성공 (LOCKER CONTRACT TERMINATED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] LOCKER CONTRACT TERMINATED SUCCESSFULLY for locker ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Branch manager role required to forcibly terminate locker contract" });
  }
  const db = readDB();
  const lck = db.lockers.find(l => l.id === id);
  if (lck) { lck.status = 'TERMINATED'; writeDB(db); }
  res.json({ success: true, lck });
};

export const updateCustomerPartial = (req, res) => {
  const { id } = req.params;
  const { customerName, phone, memo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 고객 정보 수정 모달에서 이름, 연락처, 보관품 메모를 동시에 수정하면,
  // backend data.json에는 이름(customerName)과 보관품 메모(memo)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const cst = db.customers.find(c => c.id === id);
  if (cst) {
    if (customerName) cst.customerName = customerName;
    if (memo) cst.memo = memo;
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated customerName and memo for customer ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, cst });
};

export const deleteInOutLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.inOutLogs = db.inOutLogs.filter(i => i.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 입출고 로그를 삭제(`DELETE /api/in-out-logs/:id`) 처리하여 입출고 로그 목록에서 소거하더라도,
  // boxStats(지점별 점유율, 고객별 이용 횟수, 월별 계약 수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed inOut log ${id}. boxStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-1001", name: "김창고 (강남점 매니저)", role: "MANAGER", dept: "공유창고 운영1팀", handledContracts: 230 }],
    branches: [{ id: "BRN-01", name: "BoxSpace 강남역점", location: "서울 서초구 강남대로 391 B1층", totalLockers: 120, occupiedCount: 98, occupancyRate: 81.6 }],
    customers: [{ id: "CUST-5001", customerName: "홍길동", phone: "010-1234-5678", memo: "캠핑용품 및 차박 장비 보관", riskLevel: "NORMAL" }],
    lockers: [{ id: "LCK-2001", lockerNo: "A-101", branchId: "BRN-01", branchName: "BoxSpace 강남역점", size: "Large (1.5m x 1.5m)", monthlyFeeWon: 120000, startDate: "2026-08-01", endDate: "2026-08-31", customerName: "홍길동", status: "IN_USE" }],
    contracts: [{ id: "CTR-3001", lockerId: "LCK-2001", lockerNo: "A-101", customerName: "홍길동", phone: "010-1234-5678", startDate: "2026-08-01", endDate: "2026-08-31", monthlyFeeWon: 120000, status: "IN_USE" }],
    inOutLogs: [{ id: "IOLOG-7001", contractId: "CTR-3001", lockerNo: "A-101", customerName: "홍길동", actionType: "입고", itemsDesc: "캠핑 텐트 및 쿨러 박스 추가 입고", timestamp: "2026-08-04 14:20:00" }],
    activityLogs: [{ id: "ACT-9601", contractId: "CTR-3001", operator: "김창고 (매니저)", action: "보관함 A-101 계약 연장 완료 (2026-08-31까지)", timestamp: "2026-08-04 11:00:00", status: "SUCCESS" }],
    boxStats: { totalLockers: 70, totalCustomers: 45, totalContracts: 50, inUseCount: 38, expiringSoonCount: 12, avgOccupancyRatePercent: 81.7, topBranch: "BoxSpace 홍대입구점" }
  };
  writeDB(initial);
  res.json({ success: true });
};
