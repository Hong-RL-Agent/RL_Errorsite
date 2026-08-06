import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchConsignors, fetchBooks, fetchSales, fetchSettlements, fetchInspectionLogs, fetchActivityLogs,
  searchBooksApi, patchPayoutAmountApi, patchBookStatusApi,
  cancelSaleApi, processSettlementCompleteApi, processSettlementUnauthorizedApi,
  patchBookPartialApi, deleteInspectionLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [consignors, setConsignors] = useState([]);
  const [books, setBooks] = useState([]);
  const [sales, setSales] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [inspectionLogs, setInspectionLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-3301');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingSettlementCount] = useState(7);
  const [cachedRecentConsignor] = useState('최독서 (국민 110-222-333333 / 10,500원 정산대기)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadBooks(), loadConsignors(), loadSales(), loadSettlements(), loadInspectionLogs(), loadActivityLogs(), loadStaffs()]);
  const loadBooks = async () => setBooks(await fetchBooks());
  const loadConsignors = async () => setConsignors(await fetchConsignors());
  const loadSales = async () => setSales(await fetchSales());
  const loadSettlements = async () => setSettlements(await fetchSettlements());
  const loadInspectionLogs = async () => setInspectionLogs(await fetchInspectionLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 위탁 정산 담당자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadBooks();
    // INTENTIONAL_ERROR: cachedPendingSettlementCount and cachedRecentConsignor remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (category, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 인문/교양(3초 지연) 결과가 최신 소설/에세이(0.2초) 결과를 덮어씀
    showToast(`위탁 도서 목록 조회 중 [카테고리: ${category} / 상태: ${status}]...`, 'info');
    searchBooksApi(category, status, search).then(data => {
      setBooks(data);
      if (category === '인문/교양/철학') {
        showToast('인문/교양 목록 수신 완료 (3초 지연 완료 ➔ 최신 카테고리 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`도서 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedBooks[idx] 아닌 원본 books[idx] 도서가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedBooks[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 도서 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusPayoutRace = (bookId, target, payoutAmount) => {
    showToast('판매완료 변경(3초 지연)과 정산 금액 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchBookStatusApi(bookId, target.status);
    setTimeout(() => {
      patchPayoutAmountApi(bookId, payoutAmount);
    }, 100);
    setTimeout(async () => {
      showToast('위탁 정산 예정액 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('판매완료 변경 완료 (3초 완료 - 정산 금액 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadBooks();
    }, 4000);
  };

  const triggerCancelSettlementConflict = (bookId) => {
    showToast('판매 취소(0.5초 완료)와 정산 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelSaleApi(bookId);
    setTimeout(async () => {
      showToast('판매 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadBooks();
    }, 600);
    processSettlementCompleteApi(bookId);
    setTimeout(async () => {
      showToast('정산 완료 처리 완료 (4초 완료 → CANCELLED 판매를 SETTLED로 복원시킴 - Error 2)', 'danger');
      await loadBooks();
      await loadSettlements();
    }, 4500);
  };

  const triggerPartialSave = async (id, title, author, priceWon) => {
    await patchBookPartialApi(id, title, author, priceWon);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save author (Error 8)
    showToast(`[${id}] 도서명/판매가/저자가 성공적으로 저장되었습니다.`, 'success');
    await loadBooks();
  };

  const deleteLog = async (id) => {
    const data = await deleteInspectionLogApi(id);
    if (data.success) {
      showToast('검수 로그 삭제 완료. (대시보드 카테고리별 판매율 및 위탁자별 정산액 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadInspectionLogs();
    }
  };

  const testUnauthorizedProcessSettlement = async (id) => {
    const res = await processSettlementUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 정산 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('UsedBookConsign 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedBooks = useMemo(() => {
    let list = [...books];
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.priceWon - a.priceWon);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.consignDate.localeCompare(b.consignDate));
    }
    return list;
  }, [books, sortOrder]);

  // INTENTIONAL_ERROR: selectedBook is based on original books[] not sortedBooks[] (Error 3)
  const selectedBook = useMemo(() => books[selectedIdx] || books[0] || null, [books, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingSettlementCount={cachedPendingSettlementCount} cachedRecentConsignor={cachedRecentConsignor} resetSandbox={resetSandbox} />
      <div className="usedbookconsign-grid">
        <Sidebar
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          books={sortedBooks} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          consignors={consignors}
        />
        <CenterSection
          books={books} consignors={consignors} sales={sales}
          settlements={settlements} inspectionLogs={inspectionLogs} activityLogs={activityLogs}
          deleteInspectionLog={deleteLog} testUnauthorizedProcessSettlement={testUnauthorizedProcessSettlement}
        />
        <RightPanel
          selectedBook={selectedBook}
          setSelectedBook={(u) => setBooks(prev => prev.map(b => b.id === u.id ? u : b))}
          books={books} consignors={consignors}
          triggerStatusPayoutRace={triggerStatusPayoutRace}
          triggerCancelSettlementConflict={triggerCancelSettlementConflict}
          triggerPartialSave={triggerPartialSave}
        />
      </div>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}</span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
