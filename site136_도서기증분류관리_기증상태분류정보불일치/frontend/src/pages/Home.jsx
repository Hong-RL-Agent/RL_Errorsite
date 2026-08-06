import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchDonors, fetchDistributors, fetchBooks, fetchClassifyLogs, fetchActivityLogs,
  searchBooksApi, patchBookDistributorApi, patchBookStatusApi,
  cancelBookApi, completeDistributionApi, completeDistributionUnauthorizedApi,
  patchBookPartialApi, deleteClassifyLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [donors, setDonors] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [books, setBooks] = useState([]);
  const [classifyLogs, setClassifyLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-6001');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingCount] = useState(18);
  const [cachedRecentBook] = useState('코스모스 (Cosmos) (자연과학 / 푸른꿈 작은도서관)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadBooks(), loadDonors(), loadDistributors(), loadClassifyLogs(), loadActivityLogs(), loadStaffs()]);
  const loadBooks = async () => setBooks(await fetchBooks());
  const loadDonors = async () => setDonors(await fetchDonors());
  const loadDistributors = async () => setDistributors(await fetchDistributors());
  const loadClassifyLogs = async () => setClassifyLogs(await fetchClassifyLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 사서를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadBooks();
    // INTENTIONAL_ERROR: cachedPendingCount and cachedRecentBook remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (category, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 인문/사회(3초 지연) 결과가 최신 자연과학(0.2초) 결과를 덮어씀
    showToast(`기증 도서 조회 중 [분야: ${category} / 상태: ${status}]...`, 'info');
    searchBooksApi(category, status, search).then(data => {
      setBooks(data);
      if (category === '인문/사회') {
        showToast('인문/사회 도서 수신 완료 (3초 지연 완료 ➔ 최신 분야 결과를 덮어썼을 수 있음)', 'warning');
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

  const triggerStatusDistributorRace = (bkId, target, distributorName) => {
    showToast('분류완료 변경(3초 지연)과 배포처 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchBookStatusApi(bkId, target.status);
    setTimeout(() => {
      patchBookDistributorApi(bkId, distributorName);
    }, 100);
    setTimeout(async () => {
      showToast('배포처 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('분류완료 변경 완료 (3초 완료 - 배포처 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadBooks();
    }, 4000);
  };

  const triggerCancelDistributionConflict = (bkId) => {
    showToast('기증 취소(0.5초 완료)와 배포 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelBookApi(bkId);
    setTimeout(async () => {
      showToast('기증 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadBooks();
    }, 600);
    completeDistributionApi(bkId);
    setTimeout(async () => {
      showToast('배포 완료 처리 (4초 완료 → CANCELLED 기증 도서를 DISTRIBUTED로 복원시킴 - Error 2)', 'danger');
      await loadBooks();
    }, 4500);
  };

  const triggerPartialSave = async (id, title, author, conditionGrade) => {
    await patchBookPartialApi(id, title, author, conditionGrade);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save author (Error 8)
    showToast(`[${id}] 제목/저자/보존등급이 성공적으로 저장되었습니다.`, 'success');
    await loadBooks();
  };

  const deleteLog = async (id) => {
    const data = await deleteClassifyLogApi(id);
    if (data.success) {
      showToast('분류 로그 삭제 완료. (대시보드 분야별 도서 수 및 배포처별 배정 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadClassifyLogs();
    }
  };

  const testUnauthorizedComplete = async (id) => {
    const res = await completeDistributionUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 배포 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('BookDonate 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedBooks = useMemo(() => {
    let list = [...books];
    if (sortOrder === 'GRADE_DESC') {
      list.sort((a, b) => a.conditionGrade.localeCompare(b.conditionGrade));
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.receivedDate.localeCompare(b.receivedDate));
    }
    return list;
  }, [books, sortOrder]);

  // INTENTIONAL_ERROR: selectedBook is based on original books[] not sortedBooks[] (Error 3)
  const selectedBook = useMemo(() => books[selectedIdx] || books[0] || null, [books, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingCount={cachedPendingCount} cachedRecentBook={cachedRecentBook} resetSandbox={resetSandbox} />
      <div className="bookdonate-grid">
        <Sidebar
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          books={sortedBooks} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          books={books} donors={donors} distributors={distributors}
          classifyLogs={classifyLogs} activityLogs={activityLogs}
          deleteClassifyLog={deleteLog} testUnauthorizedComplete={testUnauthorizedComplete}
        />
        <RightPanel
          selectedBook={selectedBook}
          setSelectedBook={(u) => setBooks(prev => prev.map(b => b.id === u.id ? u : b))}
          books={books} distributors={distributors}
          triggerStatusDistributorRace={triggerStatusDistributorRace}
          triggerCancelDistributionConflict={triggerCancelDistributionConflict}
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
