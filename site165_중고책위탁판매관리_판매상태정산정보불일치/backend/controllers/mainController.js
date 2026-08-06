import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getConsignors = (req, res) => res.json(readDB().consignors);
export const getBooks = (req, res) => res.json(readDB().books);
export const getSales = (req, res) => res.json(readDB().sales);
export const getSettlements = (req, res) => res.json(readDB().settlements);
export const getInspectionLogs = (req, res) => res.json(readDB().inspectionLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchBooks = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.books;
  if (category && category !== 'ALL') list = list.filter(b => b.category === category);
  if (status && status !== 'ALL') list = list.filter(b => b.status === status);
  if (search) list = list.filter(b => b.title.includes(search) || b.author.includes(search) || b.consignorName.includes(search) || b.bookCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 카테고리 필터('인문/교양/철학' 3초 지연 ➔ '소설/에세이/시' 0.2초 완료)와 판매 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(인문/교양/철학)이 최신 도서 목록을 덮어쓰고, 도서 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (category === '인문/교양/철학') delay = 3000;
  else if (category === '소설/에세이/시') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updatePayoutAmount = (req, res) => {
  const { id } = req.params;
  const { payoutAmount } = req.body;
  setTimeout(() => {
    const db = readDB();
    const bk = db.books.find(b => b.id === id);
    if (bk) {
      bk.payoutAmount = payoutAmount;
      writeDB(db);
      console.log(`[DB PAYOUT UPDATE] Book ${id} payoutAmount set to ${payoutAmount} (0.1s done)`);
    }
    res.json({ success: true, bk });
  }, 100);
};

export const updateBookStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 판매 상태를 판매완료(SOLD - 3초 지연 완료)로 변경한 직후 정산 금액(payoutAmount)을 수정(0.1초 완료)하면,
  // 정산 금액 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 판매 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 정산 금액)을 덮어써 저장하여 새로고침 시
  // 판매 상태와 상세 패널의 정산 금액이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const bk = dbSnapshot.books.find(b => b.id === id);
    if (bk) {
      bk.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back payoutAmount update!
      console.log(`[DB STATUS UPDATE] Book ${id} status set to ${status} (3s done, rolled back payoutAmount update)`);
    }
    res.json({ success: true, bk });
  }, 3000);
};

export const cancelSale = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const bk = db.books.find(b => b.id === id);
    if (bk) {
      bk.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SALE] Book ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, bk });
  }, 500);
};

export const processSettlementComplete = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 판매 취소 API(0.5초 완료)를 호출한 직후 정산 완료 API를 호출(4초 지연 완료)하면,
  // 판매 취소는 성공하지만 늦게 완료된 정산 완료 요청(4초 지연)이 취소된 판매를 다시 'SETTLED'(정산완료) 상태로 복원시켜버립니다.
  // 목록에서는 판매취소(CANCELLED), 위탁 정산 관제에서는 정산완료(SETTLED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const bk = db.books.find(b => b.id === id);
    if (bk) {
      bk.status = 'SETTLED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SETTLED!
      console.log(`[DB RESTORE STATUS] Re-activated book ${id} back to SETTLED status via process settlement!`);
    }
    writeDB(db);
    res.json({ success: true, bk });
  }, 4000);
};

export const processSettlementUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 정산 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '중고책 위탁 판매 대금 입금 정산 완료 성공 (USED BOOK CONSIGNMENT SETTLEMENT COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] USED BOOK CONSIGNMENT SETTLEMENT COMPLETED SUCCESSFULLY for book ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Senior book consignment manager role required to process final settlement" });
  }
  const db = readDB();
  const bk = db.books.find(b => b.id === id);
  if (bk) { bk.status = 'SETTLED'; writeDB(db); }
  res.json({ success: true, bk });
};

export const updateBookPartial = (req, res) => {
  const { id } = req.params;
  const { title, author, priceWon } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 도서 정보 수정 모달에서 제목, 저자, 판매가를 동시에 수정하면,
  // backend data.json에는 제목(title)과 판매가(priceWon)만 저장하고 저자(author)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const bk = db.books.find(b => b.id === id);
  if (bk) {
    if (title) bk.title = title;
    if (priceWon) bk.priceWon = priceWon;
    // author is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and priceWon for book ${id}. author was NOT updated.`);
  }
  res.json({ success: true, bk });
};

export const deleteInspectionLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.inspectionLogs = db.inspectionLogs.filter(i => i.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 검수 로그를 삭제(`DELETE /api/inspection-logs/:id`) 처리하여 검수 로그 목록에서 소거하더라도,
  // consignStats(카테고리별 판매율, 위탁자별 정산액, 월별 판매 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed inspection log ${id}. consignStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-3301", name: "김위탁 (알라딘/YES24 위탁 정산 총괄)", role: "MANAGER", category: "인문/교양/철학", handledConsignments: 740 }],
    consignors: [{ id: "CSG-2001", consignorCode: "UBC-20260805-01", consignorName: "최독서", bankAccount: "국민은행 110-222-333333", phone: "010-3333-7777", totalBooks: 5, registeredDate: "2026-08-01" }],
    books: [{ id: "BOOK-1001", bookCode: "UBC-BK-20260805-01", title: "사피엔스 (유발 하라리 저)", author: "유발 하라리", category: "인문/교양/철학", consignorName: "최독서", priceWon: 14000, payoutAmount: 10500, qualityGrade: "S급 (최상)", consignDate: "2026-08-05", status: "SOLD" }],
    sales: [{ id: "SALE-7001", bookId: "BOOK-1001", title: "사피엔스", consignorName: "최독서", salePriceWon: 14000, payoutAmount: 10500, soldDate: "2026-08-05 15:30", status: "SOLD" }],
    settlements: [{ id: "SETTL-5001", bookId: "BOOK-1001", consignorName: "최독서", bankAccount: "국민 110-222-333333", settleAmount: 10500, settleDate: "2026-08-05 16:00", status: "PENDING" }],
    inspectionLogs: [{ id: "ILOG-6001", bookId: "BOOK-1001", title: "사피엔스", inspector: "박검수", memo: "표지 밑줄 및 형광펜 없음. 낙서 및 페이지 훼손 무. S급 판정", logTime: "2026-08-05 10:15", status: "PASSED" }],
    activityLogs: [{ id: "ACT-9930", bookId: "BOOK-1001", operator: "김위탁 (총괄)", action: "도서 BOOK-1001 사피엔스 중고 구매자 결제 완료 및 정산대기 상태 전환", timestamp: "2026-08-05 15:35:00", status: "SUCCESS" }],
    consignStats: { totalBooks: 80, totalConsignors: 50, totalSales: 60, totalSettlements: 55, totalInspectionLogs: 70, pendingSettlementCount: 7, onSaleCount: 34, avgConsignPayoutRate: 75.0 }
  };
  writeDB(initial);
  res.json({ success: true });
};
