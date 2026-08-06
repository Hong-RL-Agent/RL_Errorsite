import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchAuthors, fetchBooks, fetchContracts, fetchSettlements, fetchSalesLogs, fetchActivityLogs,
  searchBooksApi, patchContractRoyaltyApi, patchContractStatusApi,
  cancelContractApi, addSalesCopiesApi, confirmSettlementUnauthorizedApi,
  patchBookPartialApi, deleteSalesLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [salesLogs, setSalesLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-3001');
  const [filterGenre, setFilterGenre] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedSettlingCount] = useState(5);
  const [cachedRecentAuthor] = useState('한강희 소설가 (바람이 불어오는 숲의 경계 20,300,000원)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadBooks(), loadAuthors(), loadContracts(), loadSettlements(), loadSalesLogs(), loadActivityLogs(), loadStaffs()]);
  const loadBooks = async () => setBooks(await fetchBooks());
  const loadAuthors = async () => setAuthors(await fetchAuthors());
  const loadContracts = async () => setContracts(await fetchContracts());
  const loadSettlements = async () => setSettlements(await fetchSettlements());
  const loadSalesLogs = async () => setSalesLogs(await fetchSalesLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 직원을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadBooks();
    // INTENTIONAL_ERROR: cachedSettlingCount and cachedRecentAuthor remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (genre, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 소설(3초 지연) 결과가 최신 인문/교양(0.2초) 결과를 덮어씀
    showToast(`도서 목록 조회 중 [장르: ${genre} / 상태: ${status}]...`, 'info');
    searchBooksApi(genre, status, search).then(data => {
      setBooks(data);
      if (genre === '소설') {
        showToast('소설 도서 목록 수신 완료 (3초 지연 완료 ➔ 최신 장르 결과를 덮어썼을 수 있음)', 'warning');
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

  const triggerStatusRoyaltyRace = (ctrId, target, royaltyRate) => {
    showToast('계약 상태 변경(3초 지연)과 인세율 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchContractStatusApi(ctrId, target.status);
    setTimeout(() => {
      patchContractRoyaltyApi(ctrId, royaltyRate);
    }, 100);
    setTimeout(async () => {
      showToast('인세율 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('계약 상태 변경 완료 (3초 완료 - 인세율 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadContracts();
      await loadBooks();
    }, 4000);
  };

  const triggerCancelSalesConflict = (ctrId) => {
    showToast('계약 해지(0.5초 완료)와 판매량 반영(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelContractApi(ctrId);
    setTimeout(async () => {
      showToast('계약 해지 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadContracts();
      await loadBooks();
    }, 600);
    addSalesCopiesApi(ctrId, 2000);
    setTimeout(async () => {
      showToast('판매량 반영 처리 (4초 완료 → CANCELLED 계약을 SETTLING으로 복원시킴 - Error 2)', 'danger');
      await loadContracts();
      await loadBooks();
    }, 4500);
  };

  const triggerPartialSave = async (id, title, pubDate, royaltyRate) => {
    await patchBookPartialApi(id, title, pubDate, royaltyRate);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save pubDate (Error 8)
    showToast(`[${id}] 도서 제목/출간일/인세율이 성공적으로 저장되었습니다.`, 'success');
    await loadBooks();
  };

  const deleteLog = async (id) => {
    const data = await deleteSalesLogApi(id);
    if (data.success) {
      showToast('판매 로그 삭제 완료. (대시보드 도서별 판매량 및 저자별 인세 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadSalesLogs();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmSettlementUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 정산확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('PublishLedger 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedBooks = useMemo(() => {
    let list = [...books];
    if (sortOrder === 'SALES_DESC') {
      list.sort((a, b) => b.totalSalesCopies - a.totalSalesCopies);
    } else if (sortOrder === 'PUB_DESC') {
      list.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
    }
    return list;
  }, [books, sortOrder]);

  // INTENTIONAL_ERROR: selectedBook is based on original books[] not sortedBooks[] (Error 3)
  const selectedBook = useMemo(() => books[selectedIdx] || books[0] || null, [books, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedSettlingCount={cachedSettlingCount} cachedRecentAuthor={cachedRecentAuthor} resetSandbox={resetSandbox} />
      <div className="publishledger-grid">
        <Sidebar
          filterGenre={filterGenre} setFilterGenre={setFilterGenre}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          books={sortedBooks} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          books={books} contracts={contracts} settlements={settlements}
          salesLogs={salesLogs} activityLogs={activityLogs}
          deleteSalesLog={deleteLog} testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedBook={selectedBook}
          setSelectedBook={(u) => setBooks(prev => prev.map(b => b.id === u.id ? u : b))}
          books={books} contracts={contracts}
          triggerStatusRoyaltyRace={triggerStatusRoyaltyRace}
          triggerCancelSalesConflict={triggerCancelSalesConflict}
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
