import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getDonors = (req, res) => res.json(readDB().donors);
export const getDistributors = (req, res) => res.json(readDB().distributors);
export const getBooks = (req, res) => res.json(readDB().books);
export const getClassifyLogs = (req, res) => res.json(readDB().classifyLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchBooks = (req, res) => {
  const { category, status, search } = req.query;
  const db = readDB();
  let list = db.books;
  if (category && category !== 'ALL') list = list.filter(b => b.category === category);
  if (status && status !== 'ALL') list = list.filter(b => b.status === status);
  if (search) list = list.filter(b => b.title.includes(search) || b.author.includes(search) || b.bookCode.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 분야 필터('인문/사회' 3초 지연 ➔ '자연과학' 0.2초 완료)와 기증 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(인문/사회)이 최신 도서 목록을 덮어쓰고, 도서 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (category === '인문/사회') delay = 3000;
  else if (category === '자연과학') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateBookDistributor = (req, res) => {
  const { id } = req.params;
  const { distributorName } = req.body;
  setTimeout(() => {
    const db = readDB();
    const bk = db.books.find(b => b.id === id);
    if (bk) {
      bk.distributorName = distributorName;
      writeDB(db);
      console.log(`[DB DISTRIBUTOR UPDATE] Book ${id} distributor set to ${distributorName} (0.1s done)`);
    }
    res.json({ success: true, bk });
  }, 100);
};

export const updateBookStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 기증 상태를 분류완료(CLASSIFIED - 3초 지연 완료)로 변경한 직후 배포처를 변경(0.1초 완료)하면,
  // 배포처 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 기증 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 배포처)을 덮어써 저장하여 새로고침 시
  // 기증 도서의 상태와 상세 패널의 배포처가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const bk = dbSnapshot.books.find(b => b.id === id);
    if (bk) {
      bk.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back distributorName update!
      console.log(`[DB STATUS UPDATE] Book ${id} status set to ${status} (3s done, rolled back distributorName update)`);
    }
    res.json({ success: true, bk });
  }, 3000);
};

export const cancelBook = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const bk = db.books.find(b => b.id === id);
    if (bk) {
      bk.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL BOOK] Book ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, bk });
  }, 500);
};

export const completeDistribution = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 기증 취소 API(0.5초 완료)를 호출한 직후 배포 완료 API를 호출(4초 지연 완료)하면,
  // 기증 취소는 성공하지만 늦게 완료된 배포 완료 요청(4초 지연)이 취소된 기증 도서를 다시 'DISTRIBUTED'(배포완료) 상태로 복원시켜버립니다.
  // 목록에서는 기증취소(CANCELLED), 배포 관제에서는 배포완료(DISTRIBUTED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const bk = db.books.find(b => b.id === id);
    if (bk) {
      bk.status = 'DISTRIBUTED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to DISTRIBUTED!
      console.log(`[DB RESTORE STATUS] Re-activated book ${id} back to DISTRIBUTED status via complete distribution!`);
    }
    writeDB(db);
    res.json({ success: true, bk });
  }, 4000);
};

export const completeDistributionUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'MANAGER')이 배포 완료 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 활동 감사 로그에는 '배포 완료 성공 (BOOK DISTRIBUTION COMPLETED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] BOOK DISTRIBUTION COMPLETED SUCCESSFULLY for book ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Chief librarian role required to confirm final book distribution" });
  }
  const db = readDB();
  const bk = db.books.find(b => b.id === id);
  if (bk) { bk.status = 'DISTRIBUTED'; writeDB(db); }
  res.json({ success: true, bk });
};

export const updateBookPartial = (req, res) => {
  const { id } = req.params;
  const { title, author, conditionGrade } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 도서 정보 수정 모달에서 제목, 저자, 보존등급을 동시에 수정하면,
  // backend data.json에는 제목(title)과 보존등급(conditionGrade)만 저장하고 저자(author)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const bk = db.books.find(b => b.id === id);
  if (bk) {
    if (title) bk.title = title;
    if (conditionGrade) bk.conditionGrade = conditionGrade;
    // author is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated title and conditionGrade for book ${id}. author was NOT updated.`);
  }
  res.json({ success: true, bk });
};

export const deleteClassifyLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.classifyLogs = db.classifyLogs.filter(c => c.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 분류 로그를 삭제(`DELETE /api/classify-logs/:id`) 처리하여 분류 로그 목록에서 소거하더라도,
  // donateStats(분야별 도서 수, 배포처별 배정 수, 담당자별 처리량 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed classify log ${id}. donateStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-6001", name: "김기증 (수기증 수석 사서)", role: "MANAGER", dept: "도서 수집 기증팀", handledBooks: 240 }],
    donors: [{ id: "DNR-2001", donorName: "홍길동 (개인 기증자)", phone: "010-1234-5678", donatedCount: 45, address: "서울 강남구 역삼동" }],
    distributors: [{ id: "DST-3001", orgName: "햇살 지역아동센터", category: "아동복지시설", requiredCategory: "어린이/동화", allocatedBooks: 150 }],
    books: [{ id: "BK-1001", bookCode: "BD-20260805-01", title: "코스모스 (Cosmos)", author: "칼 세이건", category: "자연과학", conditionGrade: "A등급 (양호)", donorName: "홍길동 (개인 기증자)", distributorName: "푸른꿈 작은도서관", receivedDate: "2026-08-01", status: "CLASSIFIED" }],
    classifyLogs: [{ id: "CLOG-7001", bookId: "BK-1001", title: "코스모스 (Cosmos)", category: "자연과학", kdcCode: "400 (자연과학)", assignedBy: "김기증 (사서)", timestamp: "2026-08-04 11:30:00" }],
    activityLogs: [{ id: "ACT-9201", bookId: "BK-1001", operator: "김기증 (사서)", action: "도서 BK-1001 KDC 십진분류 및 푸른꿈 작은도서관 배포처 지정 완료", timestamp: "2026-08-04 10:00:00", status: "SUCCESS" }],
    donateStats: { totalBooks: 70, totalDonors: 35, totalDistributors: 20, pendingCount: 18, classifiedCount: 26, distributedCount: 26, topCategory: "인문/사회" }
  };
  writeDB(initial);
  res.json({ success: true });
};
