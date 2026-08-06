import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getAuthors = (req, res) => res.json(readDB().authors);
export const getBooks = (req, res) => res.json(readDB().books);
export const getContracts = (req, res) => res.json(readDB().contracts);
export const getSettlements = (req, res) => res.json(readDB().settlements);
export const getSalesLogs = (req, res) => res.json(readDB().salesLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchBooks = (req, res) => {
  const { genre, status, search } = req.query;
  const db = readDB();
  let list = db.books;
  if (genre && genre !== 'ALL') list = list.filter(b => b.genre === genre);
  if (status && status !== 'ALL') list = list.filter(b => b.status === status);
  if (search) list = list.filter(b => b.title.includes(search) || b.authorName.includes(search) || b.genre.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 장르 필터('소설' 3초 지연 ➔ '인문/교양' 0.2초 완료)와 계약 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(소설)이 최신 도서 목록을 덮어쓰고, 도서 목록은 오래된 필터 결과,
  // 오른쪽 정산 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (genre === '소설') delay = 3000;
  else if (genre === '인문/교양') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateContractRoyalty = (req, res) => {
  const { id } = req.params;
  const { royaltyRate } = req.body;
  setTimeout(() => {
    const db = readDB();
    const ctr = db.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.royaltyRate = Number(royaltyRate);
      const bk = db.books.find(b => b.id === ctr.bookId);
      if (bk) bk.royaltyRate = Number(royaltyRate);
      writeDB(db);
      console.log(`[DB ROYALTY UPDATE] Contract ${id} royaltyRate set to ${royaltyRate}% (0.1s done)`);
    }
    res.json({ success: true, ctr });
  }, 100);
};

export const updateContractStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 계약 상태를 출간확정(PUBLISHED - 3초 지연 완료)으로 변경한 직후 인세율을 수정(0.1초 완료)하면,
  // 인세율 수정 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 계약 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 인세율)을 덮어써 저장하여 새로고침 시
  // 도서/계약 목록의 인세율과 상세 패널의 인세율이 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const ctr = dbSnapshot.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.status = status;
      const bk = dbSnapshot.books.find(b => b.id === ctr.bookId);
      if (bk) bk.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back royaltyRate update!
      console.log(`[DB STATUS UPDATE] Contract ${id} status set to ${status} (3s done, rolled back royaltyRate update)`);
    }
    res.json({ success: true, ctr });
  }, 3000);
};

export const cancelContract = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const ctr = db.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.status = 'CANCELLED';
      const bk = db.books.find(b => b.id === ctr.bookId);
      if (bk) bk.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL CONTRACT] Contract ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, ctr });
  }, 500);
};

export const addSalesCopies = (req, res) => {
  const { id } = req.params;
  const { copies } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 계약 해지 API(0.5초 완료)를 호출한 직후 판매량 반영 API를 호출(4초 지연 완료)하면,
  // 계약 해지는 성공하지만 늦게 완료된 판매량 반영 요청(4초 지연)이 해지된 계약을 다시 'SETTLING'(정산대기) 상태로 바꿔버립니다.
  // 계약 목록에서는 해지(CANCELLED), 정산 화면에서는 정산대기(SETTLING)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const ctr = db.contracts.find(c => c.id === id);
    if (ctr) {
      ctr.status = 'SETTLING'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to SETTLING!
      const bk = db.books.find(b => b.id === ctr.bookId);
      if (bk) {
        bk.status = 'SETTLING';
        bk.totalSalesCopies += (copies || 1000);
      }
      console.log(`[DB RESTORE STATUS] Re-activated contract ${id} back to SETTLING status via sales update!`);
    }
    writeDB(db);
    res.json({ success: true, ctr });
  }, 4000);
};

export const confirmSettlementUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 정산 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '정산확정 성공 (SETTLEMENT CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SETTLEMENT CONFIRMED SUCCESSFULLY for contract ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Finance manager role required to confirm settlement" });
  }
  const db = readDB();
  const ctr = db.contracts.find(c => c.id === id);
  if (ctr) { ctr.status = 'COMPLETED'; writeDB(db); }
  res.json({ success: true, ctr });
};

export const updateBookPartial = (req, res) => {
  const { id } = req.params;
  const { title, pubDate, royaltyRate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 도서 정보 수정 모달에서 제목, 출간일, 인세율을 동시에 수정하면,
  // backend data.json에는 제목(title)과 인세율(royaltyRate)만 저장하고 출간일(pubDate)은 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const bk = db.books.find(b => b.id === id);
  if (bk) {
    if (title) bk.title = title;
    if (royaltyRate) bk.royaltyRate = Number(royaltyRate);
    // pubDate is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and royaltyRate for book ${id}. pubDate was NOT updated.`);
  }
  res.json({ success: true, bk });
};

export const deleteSalesLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.salesLogs = db.salesLogs.filter(s => s.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 판매 로그를 삭제(`DELETE /api/sales-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // publishStats(도서별 판매량, 저자별 인세, 월별 정산 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed sales log ${id}. publishStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-3001", name: "김출판 (편집 기획 총괄 이사)", role: "MANAGER", dept: "편집 기획 본부", handledContracts: 54 }],
    authors: [{ id: "ATH-1001", name: "한강희 소설가", category: "소설/문학", totalRoyaltyPaid: 42500000, status: "ACTIVE" }],
    books: [{ id: "BK-2001", title: "바람이 불어오는 숲의 경계", authorId: "ATH-1001", authorName: "한강희 소설가", genre: "소설", priceWon: 16800, royaltyRate: 10.0, totalSalesCopies: 38500, pubDate: "2025-09-15", status: "PUBLISHED" }],
    contracts: [{ id: "CTR-4001", bookId: "BK-2001", bookTitle: "바람이 불어오는 숲의 경계", authorId: "ATH-1001", authorName: "한강희 소설가", royaltyRate: 10.0, advanceWon: 10000000, contractDate: "2025-03-10", status: "PUBLISHED" }],
    settlements: [{ id: "STL-6001", contractId: "CTR-4001", bookTitle: "바람이 불어오는 숲의 경계", authorName: "한강희 소설가", salesPeriod: "2026년 2분기 정산", soldCopies: 12500, grossSalesWon: 210000000, royaltyWon: 21000000, taxDeductionWon: 700000, netPayoutWon: 20300000, status: "COMPLETED" }],
    salesLogs: [{ id: "SLOG-8001", bookId: "BK-2001", bookTitle: "바람이 불어오는 숲의 경계", channel: "교보문고 전국 온·오프라인", copies: 3500, amountWon: 58800000, timestamp: "2026-08-01 15:30:00" }],
    activityLogs: [{ id: "ACT-7001", contractId: "CTR-4001", operator: "김출판 (기획이사)", action: "바람이 불어오는 숲의 경계 출간확정 처리 및 인세율 10.0% 정산 승인 완료", timestamp: "2025-09-15 10:00:00", status: "SUCCESS" }],
    publishStats: { totalBooks: 40, publishedCount: 32, settlingCount: 5, totalSalesCopies: 485000, totalRoyaltyPaidWon: 542000000, topGenre: "경제/경영", avgRoyaltyRate: 9.8 }
  };
  writeDB(initial);
  res.json({ success: true });
};
