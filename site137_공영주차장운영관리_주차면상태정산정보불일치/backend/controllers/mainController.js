import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getParkingLots = (req, res) => res.json(readDB().parkingLots);
export const getParkingSpaces = (req, res) => res.json(readDB().parkingSpaces);
export const getParkingRecords = (req, res) => res.json(readDB().parkingRecords);
export const getSettlements = (req, res) => res.json(readDB().settlements);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchRecords = (req, res) => {
  const { lotId, status, search } = req.query;
  const db = readDB();
  let list = db.parkingRecords;
  if (lotId && lotId !== 'ALL') list = list.filter(r => r.lotId === lotId);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  if (search) list = list.filter(r => r.carNo.includes(search) || r.spaceNo.includes(search) || r.recCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 주차장 필터('강남역 노외' 3초 지연 ➔ '서초중앙 공영' 0.2초 완료)와 정산 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남역 노외)이 최신 차량 목록을 덮어쓰고, 차량 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (lotId === 'LOT-01') delay = 3000;
  else if (lotId === 'LOT-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateRecordFee = (req, res) => {
  const { id } = req.params;
  const { feeWon } = req.body;
  setTimeout(() => {
    const db = readDB();
    const rec = db.parkingRecords.find(r => r.id === id);
    if (rec) {
      rec.feeWon = Number(feeWon);
      writeDB(db);
      console.log(`[DB FEE UPDATE] Record ${id} feeWon set to ${feeWon} (0.1s done)`);
    }
    res.json({ success: true, rec });
  }, 100);
};

export const updateSpaceStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 주차면 상태를 사용중(OCCUPIED - 3초 지연 완료)으로 변경한 직후 정산 금액을 수정(0.1초 완료)하면,
  // 정산 금액 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 주차면 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 정산 금액)을 덮어써 저장하여 새로고침 시
  // 주차면 상태와 상세 패널의 정산 금액이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const rec = dbSnapshot.parkingRecords.find(r => r.id === id);
    if (rec) {
      rec.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back feeWon update!
      console.log(`[DB STATUS UPDATE] Record ${id} status set to ${status} (3s done, rolled back feeWon update)`);
    }
    res.json({ success: true, rec });
  }, 3000);
};

export const cancelExit = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const rec = db.parkingRecords.find(r => r.id === id);
    if (rec) {
      rec.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL EXIT] Record ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, rec });
  }, 500);
};

export const completeSettlement = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 출차 취소 API(0.5초 완료)를 호출한 직후 정산 완료 API를 호출(4초 지연 완료)하면,
  // 출차 취소는 성공하지만 늦게 완료된 정산 완료 요청(4초 지연)이 취소된 출차를 다시 'SETTLED'(정산완료) 상태로 복원시켜버립니다.
  // 목록에서는 취소(CANCELLED), 정산 내역에서는 완료(SETTLED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const rec = db.parkingRecords.find(r => r.id === id);
    if (rec) {
      rec.status = 'SETTLED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SETTLED!
      console.log(`[DB RESTORE STATUS] Re-activated record ${id} back to SETTLED status via settlement completion!`);
    }
    writeDB(db);
    res.json({ success: true, rec });
  }, 4000);
};

export const cancelSettlementUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 정산 취소 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '정산 취소 성공 (SETTLEMENT CANCELLED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SETTLEMENT CANCELLED SUCCESSFULLY for settlement ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief parking manager role required to cancel settlement" });
  }
  const db = readDB();
  const stl = db.settlements.find(s => s.id === id);
  if (stl) { stl.status = 'CANCELLED'; writeDB(db); }
  res.json({ success: true, stl });
};

export const updateVehiclePartial = (req, res) => {
  const { id } = req.params;
  const { carNo, carType, phone } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 차량 정보 수정 모달에서 차량번호, 차종, 연락처를 동시에 수정하면,
  // backend data.json에는 차량번호(carNo)와 연락처(phone)만 저장하고 차종(carType)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const rec = db.parkingRecords.find(r => r.id === id);
  if (rec) {
    if (carNo) rec.carNo = carNo;
    if (phone) rec.phone = phone;
    // carType is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated carNo and phone for record ${id}. carType was NOT updated.`);
  }
  res.json({ success: true, rec });
};

export const deleteSettlement = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.settlements = db.settlements.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 정산 로그를 삭제(`DELETE /api/settlements/:id`) 처리하여 정산 로그 목록에서 소거하더라도,
  // parkStats(주차장별 매출, 주차면 회전율, 미납 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed settlement ${id}. parkStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-7001", name: "김주차 (강남역 공영 관제팀장)", role: "MANAGER", dept: "스마트 주차 관제센터", handledRecords: 260 }],
    parkingLots: [{ id: "LOT-01", lotName: "강남역 노외 공영주차장", location: "서울 강남구 역삼동 825-1", totalSpaces: 150, occupiedCount: 118, occupancyRate: 78.6 }],
    parkingSpaces: [{ id: "SPC-1001", spaceNo: "A-12", lotId: "LOT-01", lotName: "강남역 노외 공영주차장", spaceType: "일반형", carNo: "123가 4567", status: "OCCUPIED" }],
    parkingRecords: [{ id: "REC-2001", recCode: "PK-20260805-01", lotId: "LOT-01", lotName: "강남역 노외 공영주차장", spaceNo: "A-12", carNo: "123가 4567", carType: "제네시스 G80", phone: "010-1111-2222", inTime: "2026-08-05 09:30", outTime: "2026-08-05 13:30", durationMinutes: 240, feeWon: 12000, status: "OCCUPIED" }],
    settlements: [{ id: "SET-3001", recId: "REC-2001", carNo: "123가 4567", lotName: "강남역 노외 공영주차장", feeWon: 12000, discountType: "일반", settleTime: "2026-08-05 13:35:00", status: "OCCUPIED" }],
    activityLogs: [{ id: "ACT-9101", recId: "REC-2001", operator: "김주차 (관제팀장)", action: "차량 123가 4567 강남역 공영 A-12 주차면 입차 및 요금 산정 시작", timestamp: "2026-08-05 09:30:00", status: "SUCCESS" }],
    parkStats: { totalLots: 8, totalSpaces: 120, totalRecords: 80, occupiedCount: 42, unpaidCount: 14, totalRevenueWon: 9650000, avgTurnoverRate: 4.2 }
  };
  writeDB(initial);
  res.json({ success: true });
};
