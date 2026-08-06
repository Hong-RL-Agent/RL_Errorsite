import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getHubs = (req, res) => res.json(readDB().hubs);
export const getRoutesList = (req, res) => res.json(readDB().routesList);
export const getParcels = (req, res) => res.json(readDB().parcels);
export const getDeliveryLogs = (req, res) => res.json(readDB().deliveryLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchParcels = (req, res) => {
  const { hubId, status, search } = req.query;
  const db = readDB();
  let list = db.parcels;
  if (hubId && hubId !== 'ALL') list = list.filter(p => p.hubId === hubId);
  if (status && status !== 'ALL') list = list.filter(p => p.status === status);
  if (search) list = list.filter(p => p.trackingNo.includes(search) || p.recipientName.includes(search) || p.deliveryAddress.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 센터 필터('HUB-01 동서울' 3초 지연 ➔ 'HUB-02 서서울' 0.2초 완료)와 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(HUB-01)이 최신 우편물 목록을 덮어쓰고, 우편물 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (hubId === 'HUB-01') delay = 3000;
  else if (hubId === 'HUB-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateParcelRoute = (req, res) => {
  const { id } = req.params;
  const { routeId, routeName } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 배송 경로를 변경(3초 지연 완료)한 직후 배송 상태를 배달중(DELIVERING - 0.1초 완료)으로 변경하면,
  // 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 경로 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(배달중 상태와 이전 경로)을 덮어써 저장하여 새로고침 시
  // 우편물 목록의 경로와 상세 패널의 경로가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const pcl = dbSnapshot.parcels.find(p => p.id === id);
    if (pcl) {
      pcl.routeId = routeId;
      pcl.routeName = routeName;
      writeDB(dbSnapshot); // Overwrites DB, rolling back status update!
      console.log(`[DB ROUTE UPDATE] Parcel ${id} route set to ${routeName} (3s done, rolled back status update)`);
    }
    res.json({ success: true, pcl });
  }, 3000);
};

export const updateParcelStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  setTimeout(() => {
    const db = readDB();
    const pcl = db.parcels.find(p => p.id === id);
    if (pcl) {
      pcl.status = status;
      writeDB(db);
      console.log(`[DB STATUS UPDATE] Parcel ${id} status set to ${status} (0.1s done)`);
    }
    res.json({ success: true, pcl });
  }, 100);
};

export const returnParcel = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const pcl = db.parcels.find(p => p.id === id);
    if (pcl) {
      pcl.status = 'RETURNED';
      writeDB(db);
      console.log(`[DB RETURN PARCEL] Parcel ${id} status set to RETURNED (0.5s done)`);
    }
    res.json({ success: true, pcl });
  }, 500);
};

export const completeDelivery = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 반송 처리 API(0.5초 완료)를 호출한 직후 배송 완료 API를 호출(4초 지연 완료)하면,
  // 반송 처리는 성공하지만 늦게 완료된 배송 완료 요청(4초 지연)이 반송된 우편물을 다시 'COMPLETED'(완료) 상태로 바꿔버립니다.
  // 목록에서는 반송(RETURNED), 배송 로그에서는 완료(COMPLETED)로 보여야 합니다.
  setTimeout(() => {
    const db = readDB();
    const pcl = db.parcels.find(p => p.id === id);
    if (pcl) {
      pcl.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites RETURNED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated parcel ${id} back to COMPLETED status via delivery completion!`);
    }
    writeDB(db);
    res.json({ success: true, pcl });
  }, 4000);
};

export const completeDeliveryUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 배송 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '배송 완료 성공 (PARCEL DELIVERY COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] PARCEL DELIVERY COMPLETED SUCCESSFULLY for parcel ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Post hub manager role required to complete delivery" });
  }
  const db = readDB();
  const pcl = db.parcels.find(p => p.id === id);
  if (pcl) { pcl.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, pcl });
};

export const updateRecipientPartial = (req, res) => {
  const { id } = req.params;
  const { recipientName, recipientPhone, deliveryAddress } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 수취인 정보 수정 모달에서 이름, 연락처, 배송주소를 동시에 수정하면,
  // backend data.json에는 이름(recipientName)과 배송주소(deliveryAddress)만 저장하고 연락처(recipientPhone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const pcl = db.parcels.find(p => p.id === id);
  if (pcl) {
    if (recipientName) pcl.recipientName = recipientName;
    if (deliveryAddress) pcl.deliveryAddress = deliveryAddress;
    // recipientPhone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated recipientName and deliveryAddress for parcel ${id}. recipientPhone was NOT updated.`);
  }
  res.json({ success: true, pcl });
};

export const deleteDeliveryLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.deliveryLogs = db.deliveryLogs.filter(d => d.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 배송 로그를 삭제(`DELETE /api/delivery-logs/:id`) 처리하여 배송 로그 목록에서 소거하더라도,
  // postStats(센터별 처리량, 반송률, 직원별 배송 완료 수 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed delivery log ${id}. postStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-5001", name: "김우체 (동서울 분류센터장)", role: "MANAGER", dept: "동서울 우편 물류본부", handledParcels: 210 }],
    hubs: [{ id: "HUB-01", name: "동서울 우편 물류센터", region: "서울 동부", capacity: 50000, currentLoad: 32000, managerName: "김우체" }],
    routesList: [{ id: "RTE-1001", routeName: "경로 A: 동서울HUB ➔ 대전HUB ➔ 부산센터 (간선고속)", distanceKm: 385, estimatedHours: 4.5 }],
    parcels: [{ id: "PCL-3001", trackingNo: "EB-987654321-KR", senderName: "한국인쇄사", recipientName: "홍길동", recipientPhone: "010-1234-5678", deliveryAddress: "서울특별시 강남구 테헤란로 123 4층", hubId: "HUB-01", hubName: "동서울 우편 물류센터", routeId: "RTE-1001", routeName: "경로 A: 동서울HUB ➔ 대전HUB ➔ 부산센터", distanceKm: 385, registerDate: "2026-08-04 09:00", status: "TRANSIT" }],
    deliveryLogs: [{ id: "DLOG-7001", parcelId: "PCL-3001", trackingNo: "EB-987654321-KR", hubName: "동서울 우편 물류센터", action: "동서울 HUB 분류 간선 상차 완료", timestamp: "2026-08-04 13:00:00" }],
    activityLogs: [{ id: "ACT-9901", parcelId: "PCL-3001", operator: "김우체 (센터장)", action: "우편물 EB-987654321-KR 라우팅 경로 A 스캐닝 지정 완료", timestamp: "2026-08-04 15:00:00", status: "SUCCESS" }],
    postStats: { totalParcels: 60, totalHubs: 12, transitCount: 24, deliveringCount: 18, completedCount: 12, returnedCount: 6, returnRatePercent: 5.2, topHub: "대전 HUB" }
  };
  writeDB(initial);
  res.json({ success: true });
};
