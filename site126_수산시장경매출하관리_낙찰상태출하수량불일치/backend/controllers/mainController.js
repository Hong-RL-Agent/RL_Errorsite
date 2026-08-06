import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getWholesalers = (req, res) => res.json(readDB().wholesalers);
export const getItems = (req, res) => res.json(readDB().items);
export const getAuctions = (req, res) => res.json(readDB().auctions);
export const getShipmentLogs = (req, res) => res.json(readDB().shipmentLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchAuctions = (req, res) => {
  const { origin, status, search } = req.query;
  const db = readDB();
  let list = db.auctions;
  if (origin && origin !== 'ALL') list = list.filter(a => a.origin.includes(origin));
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (search) list = list.filter(a => a.itemName.includes(search) || a.winnerName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 산지 필터('제주 서귀포' 3초 지연 ➔ '부산 자갈치' 0.2초 완료)와 품목 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(제주 서귀포)이 최신 경매 목록을 덮어쓰고, 경매 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (origin && origin.includes('제주')) delay = 3000;
  else if (origin && origin.includes('부산')) delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateAuctionQuantity = (req, res) => {
  const { id } = req.params;
  const { quantityKg } = req.body;
  setTimeout(() => {
    const db = readDB();
    const auc = db.auctions.find(a => a.id === id);
    if (auc) {
      auc.quantityKg = Number(quantityKg);
      writeDB(db);
      console.log(`[DB QTY UPDATE] Auction ${id} quantity set to ${quantityKg}kg (0.1s done)`);
    }
    res.json({ success: true, auc });
  }, 100);
};

export const updateAuctionStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 낙찰 상태를 낙찰완료(WON - 3초 지연 완료)로 변경한 직후 출하 수량을 수정(0.1초 완료)하면,
  // 수량 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 출하 수량)을 덮어써 저장하여 새로고침 시
  // 경매 목록의 수량과 상세 패널의 수량이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const auc = dbSnapshot.auctions.find(a => a.id === id);
    if (auc) {
      auc.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back quantityKg update!
      console.log(`[DB STATUS UPDATE] Auction ${id} status set to ${status} (3s done, rolled back quantityKg update)`);
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

export const confirmShipment = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 낙찰 취소 API(0.5초 완료)를 호출한 직후 출하 확정 API를 호출(4초 지연 완료)하면,
  // 낙찰 취소는 성공하지만 늦게 완료된 출하 확정 요청(4초 지연)이 취소된 낙찰을 다시 'SHIPPED'(출하완료) 상태로 바꿔버립니다.
  // 경매 목록에서는 취소됨(CANCELLED), 출하 관제에서는 출하완료(SHIPPED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const auc = db.auctions.find(a => a.id === id);
    if (auc) {
      auc.status = 'SHIPPED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SHIPPED!
      console.log(`[DB RESTORE STATUS] Re-activated auction ${id} back to SHIPPED status via shipment confirmation!`);
    }
    writeDB(db);
    res.json({ success: true, auc });
  }, 4000);
};

export const confirmWinUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 낙찰 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '낙찰 확정 성공 (AUCTION WIN CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] AUCTION WIN CONFIRMED SUCCESSFULLY for auction ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief auctioneer role required to confirm auction win" });
  }
  const db = readDB();
  const auc = db.auctions.find(a => a.id === id);
  if (auc) { auc.status = 'WON'; writeDB(db); }
  res.json({ success: true, auc });
};

export const updateItemPartial = (req, res) => {
  const { id } = req.params;
  const { itemName, origin, tempStorage } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 품목 정보 수정 모달에서 품목명, 산지, 보관온도를 동시에 수정하면,
  // backend data.json에는 품목명(itemName)과 보관온도(tempStorage)만 저장하고 산지(origin)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const itm = db.items.find(i => i.id === id);
  if (itm) {
    if (itemName) itm.itemName = itemName;
    if (tempStorage) itm.tempStorage = tempStorage;
    // origin is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated itemName and tempStorage for item ${id}. origin was NOT updated.`);
  }
  res.json({ success: true, itm });
};

export const deleteShipmentLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.shipmentLogs = db.shipmentLogs.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 출하 로그를 삭제(`DELETE /api/shipment-logs/:id`) 처리하여 출하 로그 목록에서 소거하더라도,
  // auctionStats(품목별 시세, 중도매인별 낙찰량, 일별 거래량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed shipment log ${id}. auctionStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-4001", name: "김경매 (수산물 경매 경매사)", role: "MANAGER", dept: "노량진 경매1팀", handledAuctions: 175 }],
    wholesalers: [{ id: "WHL-1001", name: "김바다 (중도매인 105호)", licenseNo: "FISH-2026-105", creditLimitWon: 200000000, status: "ACTIVE" }],
    items: [{ id: "ITM-5001", itemName: "제조도 청정 광어(넙치)", origin: "제주 서귀포", tempStorage: "-1.5℃", unit: "kg", avgPriceWon: 28000 }],
    auctions: [{ id: "AUC-2001", itemName: "제조도 청정 광어(넙치)", origin: "제주 서귀포", tempStorage: "-1.5℃", quantityKg: 450, startPriceWon: 25000, winPriceWon: 28500, winnerName: "김바다 (중도매인 105호)", status: "WON" }],
    shipmentLogs: [{ id: "SLOG-6001", auctionId: "AUC-2001", itemName: "제조도 청정 광어(넙치)", shippedKg: 450, vehicleNo: "서울 80바 4321", timestamp: "2026-08-04 05:30:00" }],
    activityLogs: [{ id: "ACT-8501", auctionId: "AUC-2001", operator: "김경매 (경매사)", action: "제주 광어 450kg 중도매인 105호 최고가 28,500원 낙찰 확정 완료", timestamp: "2026-08-04 04:30:00", status: "SUCCESS" }],
    auctionStats: { totalAuctions: 50, totalItems: 40, totalWholesalers: 30, winningCount: 32, shippedCount: 24, totalTradeAmountWon: 1850000000, topItem: "제주 광어" }
  };
  writeDB(initial);
  res.json({ success: true });
};
