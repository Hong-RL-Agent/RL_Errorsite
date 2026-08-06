import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getFlowers = (req, res) => res.json(readDB().flowers);
export const getBuyers = (req, res) => res.json(readDB().buyers);
export const getAuctions = (req, res) => res.json(readDB().auctions);
export const getWinningBids = (req, res) => res.json(readDB().winningBids);
export const getDeliveryOrders = (req, res) => res.json(readDB().deliveryOrders);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchAuctions = (req, res) => {
  const { flowerName, status, search } = req.query;
  const db = readDB();
  let list = db.auctions;
  if (flowerName && flowerName !== 'ALL') list = list.filter(a => a.flowerName.includes(flowerName));
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (search) list = list.filter(a => a.flowerName.includes(search) || a.buyerName.includes(search) || a.auctionCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 품목 필터('장미' 3초 지연 ➔ '튤립' 0.2초 완료)와 경매 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(장미)이 최신 경매 목록을 덮어쓰고, 경매 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (flowerName && flowerName.includes('장미')) delay = 3000;
  else if (flowerName && flowerName.includes('튤립')) delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateAuctionDeliveryQty = (req, res) => {
  const { id } = req.params;
  const { deliveryQty } = req.body;
  setTimeout(() => {
    const db = readDB();
    const auc = db.auctions.find(a => a.id === id);
    if (auc) {
      auc.deliveryQty = Number(deliveryQty);
      writeDB(db);
      console.log(`[DB DELIVERY QTY UPDATE] Auction ${id} deliveryQty set to ${deliveryQty} (0.1s done)`);
    }
    res.json({ success: true, auc });
  }, 100);
};

export const updateAuctionStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 낙찰 상태를 낙찰완료(WON - 3초 지연 완료)로 변경한 직후 배송 수량을 수정(0.1초 완료)하면,
  // 배송 수량 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 낙찰 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 배송 수량)을 덮어써 저장하여 새로고침 시
  // 경매의 낙찰상태와 상세 패널의 배송 수량이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const auc = dbSnapshot.auctions.find(a => a.id === id);
    if (auc) {
      auc.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back deliveryQty update!
      console.log(`[DB STATUS UPDATE] Auction ${id} status set to ${status} (3s done, rolled back deliveryQty update)`);
    }
    res.json({ success: true, auc });
  }, 3000);
};

export const cancelAuction = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const auc = db.auctions.find(a => a.id === id);
    if (auc) {
      auc.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL AUCTION] Auction ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, auc });
  }, 500);
};

export const dispatchDelivery = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 낙찰 취소 API(0.5초 완료)를 호출한 직후 배송 지시 API를 호출(4초 지연 완료)하면,
  // 낙찰 취소는 성공하지만 늦게 완료된 배송 지시 요청(4초 지연)이 취소된 낙찰을 다시 'READY_FOR_DELIVERY'(배송준비) 상태로 복원시켜버립니다.
  // 목록에서는 낙찰취소(CANCELLED), 배송 관제에서는 배송준비(READY_FOR_DELIVERY)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const auc = db.auctions.find(a => a.id === id);
    if (auc) {
      auc.status = 'READY_FOR_DELIVERY'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to READY_FOR_DELIVERY!
      console.log(`[DB RESTORE STATUS] Re-activated auction ${id} back to READY_FOR_DELIVERY status via dispatch!`);
    }
    writeDB(db);
    res.json({ success: true, auc });
  }, 4000);
};

export const confirmAuctionUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 낙찰 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '낙찰 확정 성공 (WINNING BID CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] WINNING BID CONFIRMED SUCCESSFULLY for auction ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior auctioneer role required to confirm winning bid" });
  }
  const db = readDB();
  const auc = db.auctions.find(a => a.id === id);
  if (auc) { auc.status = 'WON'; writeDB(db); }
  res.json({ success: true, auc });
};

export const updateFlowerPartial = (req, res) => {
  const { id } = req.params;
  const { flowerName, grade, tempSetting } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 품목 정보 수정 모달에서 꽃이름, 등급, 보관온도를 동시에 수정하면,
  // backend data.json에는 꽃이름(flowerName)과 보관온도(tempSetting)만 저장하고 등급(grade)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const flw = db.flowers.find(f => f.id === id);
  if (flw) {
    if (flowerName) flw.flowerName = flowerName;
    if (tempSetting) flw.tempSetting = tempSetting;
    // grade is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated flowerName and tempSetting for flower ${id}. grade was NOT updated.`);
  }
  res.json({ success: true, flw });
};

export const deleteDeliveryOrder = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.deliveryOrders = db.deliveryOrders.filter(d => d.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 배송 로그를 삭제(`DELETE /api/delivery-orders/:id`) 처리하여 배송 로그 목록에서 소거하더라도,
  // flowerStats(품목별 판매량, 구매자별 주문량, 일별 경매 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed delivery order ${id}. flowerStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-4001", name: "김경매 (양재 화훼 공판장 수석 경매사)", role: "MANAGER", dept: "화훼 경매1팀", handledAuctions: 250 }],
    flowers: [{ id: "FLW-1001", flowerName: "빨간 장미 (하모니)", grade: "특상급", tempSetting: "4℃ 냉장보관", origin: "경남 김해 농가", stockQty: 1200 }],
    buyers: [{ id: "BUY-5001", buyerName: "강남 플라워 스튜디오 (김서연 대표)", businessNo: "120-81-45678", phone: "010-9876-5432", vipGrade: "GOLD" }],
    auctions: [{ id: "AUC-2001", auctionCode: "FB-20260805-01", flowerName: "빨간 장미 (하모니)", grade: "특상급", quantity: 300, deliveryQty: 300, startPriceWon: 15000, winningPriceWon: 28000, buyerName: "강남 플라워 스튜디오", status: "WON" }],
    winningBids: [{ id: "WIN-3001", auctionId: "AUC-2001", flowerName: "빨간 장미 (하모니)", buyerName: "강남 플라워 스튜디오", winningPriceWon: 28000, quantity: 300, status: "WON" }],
    deliveryOrders: [{ id: "DELOG-6001", auctionId: "AUC-2001", flowerName: "빨간 장미 (하모니)", buyerName: "강남 플라워 스튜디오", deliveryQty: 300, destination: "서울 강남구 압구정로 123", timestamp: "2026-08-04 13:20:00" }],
    activityLogs: [{ id: "ACT-9401", auctionId: "AUC-2001", operator: "김경매 (경매사)", action: "경매 FB-20260805-01 빨간 장미 300단 낙찰 확정 (낙찰가: 28,000원)", timestamp: "2026-08-04 10:15:00", status: "SUCCESS" }],
    flowerStats: { totalFlowers: 45, totalAuctions: 55, totalWinningBids: 45, biddingCount: 16, wonCount: 24, totalSalesWon: 14850000, topFlower: "빨간 장미 (하모니)" }
  };
  writeDB(initial);
  res.json({ success: true });
};
