import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getStores = (req, res) => res.json(readDB().stores);
export const getProducts = (req, res) => res.json(readDB().products);
export const getDiscountLogs = (req, res) => res.json(readDB().discountLogs);
export const getDisposalLogs = (req, res) => res.json(readDB().disposalLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchProducts = (req, res) => {
  const { storeName, status, search } = req.query;
  const db = readDB();
  let list = db.products;
  if (storeName && storeName !== 'ALL') list = list.filter(p => p.storeName === storeName);
  if (status && status !== 'ALL') list = list.filter(p => p.status === status);
  if (search) list = list.filter(p => p.productName.includes(search) || p.category.includes(search) || p.prodCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 매장 필터('강남본점' 3초 지연 ➔ '서초점' 0.2초 완료)와 유통기한 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(강남본점)이 최신 상품 목록을 덮어쓰고, 상품 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (storeName === '강남본점') delay = 3000;
  else if (storeName === '서초점') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateProductDiscountRate = (req, res) => {
  const { id } = req.params;
  const { discountRatePercent } = req.body;
  setTimeout(() => {
    const db = readDB();
    const prd = db.products.find(p => p.id === id);
    if (prd) {
      prd.discountRatePercent = Number(discountRatePercent);
      prd.currentPriceWon = Math.round(prd.originalPriceWon * (1 - discountRatePercent / 100));
      writeDB(db);
      console.log(`[DB DISCOUNT UPDATE] Product ${id} discountRatePercent set to ${discountRatePercent}% (0.1s done)`);
    }
    res.json({ success: true, prd });
  }, 100);
};

export const updateProductStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 폐기 상태를 폐기예정(DISPOSAL_PENDING - 3초 지연 완료)으로 변경한 직후 할인율을 수정(0.1초 완료)하면,
  // 할인율 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 할인율)을 덮어써 저장하여 새로고침 시
  // 폐기 상태와 상세 패널의 할인율이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const prd = dbSnapshot.products.find(p => p.id === id);
    if (prd) {
      prd.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back discountRatePercent update!
      console.log(`[DB STATUS UPDATE] Product ${id} status set to ${status} (3s done, rolled back discount rate update)`);
    }
    res.json({ success: true, prd });
  }, 3000);
};

export const cancelDisposal = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const prd = db.products.find(p => p.id === id);
    if (prd) {
      prd.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL DISPOSAL] Product ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, prd });
  }, 500);
};

export const completeSoldOut = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 폐기 취소 API(0.5초 완료)를 호출한 직후 판매완료 API를 호출(4초 지연 완료)하면,
  // 폐기 취소는 성공하지만 늦게 완료된 판매완료 요청(4초 지연)이 취소된 상품을 다시 'SOLD_OUT'(판매완료) 상태로 복원시켜버립니다.
  // 목록에서는 폐기취소(CANCELLED), 매대 관제에서는 판매완료(SOLD_OUT)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const prd = db.products.find(p => p.id === id);
    if (prd) {
      prd.status = 'SOLD_OUT'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SOLD_OUT!
      console.log(`[DB RESTORE STATUS] Re-activated product ${id} back to SOLD_OUT status via complete soldout!`);
    }
    writeDB(db);
    res.json({ success: true, prd });
  }, 4000);
};

export const confirmDisposalUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 폐기 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '폐기 확정 성공 (DISPOSAL CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] DISPOSAL CONFIRMED SUCCESSFULLY for product ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Store fresh food manager role required to confirm final product disposal" });
  }
  const db = readDB();
  const prd = db.products.find(p => p.id === id);
  if (prd) { prd.status = 'DISPOSED'; writeDB(db); }
  res.json({ success: true, prd });
};

export const updateProductPartial = (req, res) => {
  const { id } = req.params;
  const { productName, storageTemp, expiryDate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 상품 정보 수정 모달에서 상품명, 보관온도, 유통기한을 동시에 수정하면,
  // backend data.json에는 상품명(productName)과 유통기한(expiryDate)만 저장하고 보관온도(storageTemp)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const prd = db.products.find(p => p.id === id);
  if (prd) {
    if (productName) prd.productName = productName;
    if (expiryDate) prd.expiryDate = expiryDate;
    // storageTemp is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated productName and expiryDate for product ${id}. storageTemp was NOT updated.`);
  }
  res.json({ success: true, prd });
};

export const deleteDisposalLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.disposalLogs = db.disposalLogs.filter(d => d.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 폐기 로그를 삭제(`DELETE /api/disposal-logs/:id`) 처리하여 폐기 로그 목록에서 소거하더라도,
  // freshStats(매장별 폐기율, 카테고리별 손실금액, 일별 할인 판매 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed disposal log ${id}. freshStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-4001", name: "김신선 (신선식품 총괄 팀장)", role: "MANAGER", storeName: "강남본점", handledProducts: 380 }],
    stores: [{ id: "STR-01", storeName: "강남본점", location: "서울 강남구 테헤란로 150", freshZoneCount: 12, activeProducts: 240 }],
    products: [{ id: "PRD-5001", prodCode: "FM-20260805-01", productName: "1등급 한우 등심 구이용 (500g)", category: "축산 / 정육", storeName: "강남본점", storageTemp: "냉장 (0℃ ~ 4℃)", originalPriceWon: 45000, discountRatePercent: 30, currentPriceWon: 31500, stockQty: 12, expiryDate: "2026-08-06 22:00", status: "DISCOUNTED" }],
    discountLogs: [{ id: "DLOG-6001", prodId: "PRD-5001", productName: "1등급 한우 등심", storeName: "강남본점", prevDiscountRate: 0, newDiscountRate: 30, appliedBy: "김신선 팀장", timestamp: "2026-08-05 10:00:00" }],
    disposalLogs: [{ id: "DSP-7001", prodId: "PRD-5002", productName: "제주 생물 고등어 (2마리)", storeName: "서초점", disposedQty: 5, lossAmountWon: 30000, reason: "유통기한 마감 임박 미판매 폐기", timestamp: "2026-08-05 18:30:00" }],
    activityLogs: [{ id: "ACT-9601", prodId: "PRD-5001", operator: "김신선 (팀장)", action: "상품 PRD-5001 타임세일 30% 할인 스티커 발행 및 매대 재배치", timestamp: "2026-08-05 10:05:00", status: "SUCCESS" }],
    freshStats: { totalProducts: 70, totalStores: 10, disposalPendingCount: 18, disposedCount: 24, discountedCount: 35, totalLossAmountWon: 1850000, avgDiscountPercent: 38.5 }
  };
  writeDB(initial);
  res.json({ success: true });
};
