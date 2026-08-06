import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchMenus, fetchStudents, fetchAllergies, fetchSubMealRequests, fetchServingLogs, fetchActivityLogs,
  searchStudentsApi, patchSubMealMenuApi, patchSubMealStatusApi,
  cancelSubMealApi, completeServingApi, approveSubMealUnauthorizedApi,
  patchStudentPartialApi, deleteServingLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [menus, setMenus] = useState([]);
  const [students, setStudents] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [subMealRequests, setSubMealRequests] = useState([]);
  const [servingLogs, setServingLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-7001');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedSubPendingCount] = useState(12);
  const [cachedRecentStudent] = useState('김철수 (2학년 1반 / 갑각류/땅콩 최상위 알레르기)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadStudents(), loadMenus(), loadAllergies(), loadSubMealRequests(), loadServingLogs(), loadActivityLogs(), loadStaffs()]);
  const loadStudents = async () => setStudents(await fetchStudents());
  const loadMenus = async () => setMenus(await fetchMenus());
  const loadAllergies = async () => setAllergies(await fetchAllergies());
  const loadSubMealRequests = async () => setSubMealRequests(await fetchSubMealRequests());
  const loadServingLogs = async () => setServingLogs(await fetchServingLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 영양사를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadStudents();
    // INTENTIONAL_ERROR: cachedSubPendingCount and cachedRecentStudent remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (gradeClass, riskLevel, search) => {
    // INTENTIONAL_ERROR: Error 5 - 1학년(3초 지연) 결과가 최신 2학년(0.2초) 결과를 덮어씀
    showToast(`학생 목록 조회 중 [학년: ${gradeClass} / 위험도: ${riskLevel}]...`, 'info');
    searchStudentsApi(gradeClass, riskLevel, search).then(data => {
      setStudents(data);
      if (gradeClass.includes('1학년')) {
        showToast('1학년 학생 목록 수신 완료 (3초 지연 완료 ➔ 최신 학년 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`학생 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedStudents[idx] 아닌 원본 students[idx] 학생이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedStudents[idx];
    if (clicked) {
      showToast(`[${clicked.studentName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 학생 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusMenuRace = (subId, status, menuId, menuName, requestedSubMenu) => {
    showToast('대체식 승인(3초 지연)과 식단 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchSubMealStatusApi(subId, status);
    setTimeout(() => {
      patchSubMealMenuApi(subId, menuId, menuName, requestedSubMenu);
    }, 100);
    setTimeout(async () => {
      showToast('식단 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('대체식 승인 완료 (3초 완료 - 식단 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadSubMealRequests();
    }, 4000);
  };

  const triggerCancelServingConflict = (subId) => {
    showToast('대체식 신청 취소(0.5초 완료)와 배식 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelSubMealApi(subId);
    setTimeout(async () => {
      showToast('대체식 신청 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadSubMealRequests();
    }, 600);
    completeServingApi(subId);
    setTimeout(async () => {
      showToast('배식 완료 처리 (4초 완료 → CANCELLED 신청을 SERVED로 복원시킴 - Error 2)', 'danger');
      await loadSubMealRequests();
      await loadServingLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, studentName, gradeClass, allergies) => {
    await patchStudentPartialApi(id, studentName, gradeClass, allergies);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save gradeClass (Error 8)
    showToast(`[${id}] 이름/학년반/알레르기 항목이 성공적으로 저장되었습니다.`, 'success');
    await loadStudents();
  };

  const deleteLog = async (id) => {
    const data = await deleteServingLogApi(id);
    if (data.success) {
      showToast('배식 로그 삭제 완료. (대시보드 메뉴별 배식 수량 및 알레르기 승인율 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadServingLogs();
    }
  };

  const testUnauthorizedApprove = async (id) => {
    const res = await approveSubMealUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 대체식 승인 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MealSafe 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedStudents = useMemo(() => {
    let list = [...students];
    const riskMap = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (sortOrder === 'RISK_DESC') {
      list.sort((a, b) => (riskMap[b.riskLevel] || 0) - (riskMap[a.riskLevel] || 0));
    } else if (sortOrder === 'GRADE_ASC') {
      list.sort((a, b) => a.gradeClass.localeCompare(b.gradeClass));
    }
    return list;
  }, [students, sortOrder]);

  const grades = useMemo(() => ['1학년 1반', '1학년 2반', '1학년 3반', '2학년 1반', '3학년 4반'], []);

  // INTENTIONAL_ERROR: selectedStudent is based on original students[] not sortedStudents[] (Error 3)
  const selectedStudent = useMemo(() => students[selectedIdx] || students[0] || null, [students, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedSubPendingCount={cachedSubPendingCount} cachedRecentStudent={cachedRecentStudent} resetSandbox={resetSandbox} />
      <div className="mealsafe-grid">
        <Sidebar
          filterGrade={filterGrade} setFilterGrade={setFilterGrade}
          filterRisk={filterRisk} setFilterRisk={setFilterRisk}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          students={sortedStudents} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          grades={grades}
        />
        <CenterSection
          menus={menus} students={students} allergies={allergies}
          subMealRequests={subMealRequests} servingLogs={servingLogs}
          activityLogs={activityLogs} deleteServingLog={deleteLog}
          testUnauthorizedApprove={testUnauthorizedApprove}
        />
        <RightPanel
          selectedStudent={selectedStudent}
          setSelectedStudent={(u) => setStudents(prev => prev.map(s => s.id === u.id ? u : s))}
          students={students} menus={menus} subMealRequests={subMealRequests}
          triggerStatusMenuRace={triggerStatusMenuRace}
          triggerCancelServingConflict={triggerCancelServingConflict}
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
