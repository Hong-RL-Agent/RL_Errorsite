import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchCurators, fetchGalleries, fetchArtifacts, fetchLoanRequests, fetchActivityLogs,
  searchArtifactsApi, patchArtifactGalleryApi, patchArtifactConservationApi,
  cancelLoanApi, completeReturnApi, approveLoanUnauthorizedApi,
  patchArtifactPartialApi, deleteConservationLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [curators, setCurators] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeCurator, setActiveCurator] = useState('CUR-8001');
  const [filterGallery, setFilterGallery] = useState('ALL');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching curators (Error 6)
  const [cachedPendingLoans] = useState(8);
  const [cachedRecentArtifact] = useState('청자 상감 운학문 매병 (제3전시실 / A등급 보존)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadArtifacts(), loadGalleries(), loadLoanRequests(), loadActivityLogs()]);
  const loadArtifacts = async () => setArtifacts(await fetchArtifacts());
  const loadGalleries = async () => setGalleries(await fetchGalleries());
  const loadLoanRequests = async () => setLoanRequests(await fetchLoanRequests());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleCuratorSwitch = (curatorId) => {
    setActiveCurator(curatorId);
    showToast(`로그인 학예사를 [${curatorId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadArtifacts();
    // INTENTIONAL_ERROR: cachedPendingLoans and cachedRecentArtifact remain from previous curator session (Error 6)
  };

  const triggerSearchRace = (gallery, grade, search) => {
    // INTENTIONAL_ERROR: Error 5 - 제3전시실(3초 지연) 결과가 최신 제1전시실(0.2초) 결과를 덮어씀
    showToast(`소장품 목록 조회 중 [전시실: ${gallery} / 등급: ${grade}]...`, 'info');
    searchArtifactsApi(gallery, grade, search).then(data => {
      setArtifacts(data);
      if (gallery === 'GAL-003') {
        showToast('제3전시실 소장품 목록 수신 완료 (3초 지연 완료 ➔ 최신 전시실 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`소장품 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedArtifacts[idx] 아닌 원본 artifacts[idx] 소장품이 열림
    setSelectedIdx(idx);
    const clicked = sortedArtifacts[idx];
    if (clicked) {
      showToast(`[${clicked.name}] 상세 클릭 (우측 패널에는 원본 배열 인덱스 ${idx}번 소장품 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerGalleryConservationRace = (art) => {
    showToast('전시 위치 변경(3초 지연)과 보존등급 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchArtifactGalleryApi(art.id, art.galleryId, art.galleryName);
    setTimeout(() => {
      patchArtifactConservationApi(art.id, art.conservationGrade, art.status);
    }, 100);
    setTimeout(async () => {
      showToast('보존등급 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('전시 위치 변경 완료 (3초 완료 - 보존등급 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadArtifacts();
    }, 4000);
  };

  const triggerCancelReturnConflict = (loanId) => {
    showToast('대여 취소(0.5초 완료)와 반납 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelLoanApi(loanId);
    setTimeout(async () => {
      showToast('대여 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadLoanRequests();
    }, 600);
    completeReturnApi(loanId);
    setTimeout(async () => {
      showToast('반납 완료 처리 (4초 완료 → CANCELLED 대여를 RETURNED로 복원시킴 - Error 2)', 'danger');
      await loadLoanRequests();
      await loadArtifacts();
    }, 4500);
  };

  const triggerPartialSave = async (id, name, madeYear, conservationGrade) => {
    await patchArtifactPartialApi(id, name, madeYear, conservationGrade);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save madeYear (Error 8)
    showToast(`[${id}] 소장품 작품명/제작연도/보존등급이 성공적으로 저장되었습니다.`, 'success');
    await loadArtifacts();
  };

  const deleteLog = async (id) => {
    const data = await deleteConservationLogApi(id);
    if (data.success) {
      showToast('보존 로그 삭제 완료. (대시보드 보존등급 통계 및 학예사별 처리량에는 계속 반영됨 - Error 4)', 'warning');
      await loadActivityLogs();
    }
  };

  const testUnauthorizedApprove = async (id) => {
    const res = await approveLoanUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 대여 승인 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MuseumVault 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedArtifacts = useMemo(() => {
    let list = [...artifacts];
    if (sortOrder === 'YEAR_ASC') list.sort((a, b) => a.madeYear - b.madeYear);
    else if (sortOrder === 'GRADE_DESC') {
      const order = { S: 0, A: 1, B: 2, C: 3 };
      list.sort((a, b) => (order[a.conservationGrade] || 9) - (order[b.conservationGrade] || 9));
    }
    return list;
  }, [artifacts, sortOrder]);

  // INTENTIONAL_ERROR: selectedArtifact is based on original artifacts[] not sortedArtifacts[] (Error 3)
  const selectedArtifact = useMemo(() => artifacts[selectedIdx] || artifacts[0] || null, [artifacts, selectedIdx]);

  return (
    <div id="app">
      <Header activeCurator={activeCurator} handleCuratorSwitch={handleCuratorSwitch} cachedPendingLoans={cachedPendingLoans} cachedRecentArtifact={cachedRecentArtifact} resetSandbox={resetSandbox} />
      <div className="museumvault-grid">
        <Sidebar
          filterGallery={filterGallery} setFilterGallery={setFilterGallery}
          filterGrade={filterGrade} setFilterGrade={setFilterGrade}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          artifacts={sortedArtifacts} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          galleries={galleries}
        />
        <CenterSection artifacts={artifacts} galleries={galleries} loanRequests={loanRequests} activityLogs={activityLogs} deleteConservationLog={deleteLog} testUnauthorizedApprove={testUnauthorizedApprove} />
        <RightPanel
          selectedArtifact={selectedArtifact}
          setSelectedArtifact={(u) => setArtifacts(prev => prev.map(a => a.id === u.id ? u : a))}
          artifacts={artifacts} galleries={galleries} loanRequests={loanRequests}
          triggerGalleryConservationRace={triggerGalleryConservationRace}
          triggerCancelReturnConflict={triggerCancelReturnConflict}
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
