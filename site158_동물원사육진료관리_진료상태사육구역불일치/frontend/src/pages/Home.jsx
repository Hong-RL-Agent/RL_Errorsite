import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchHabitats, fetchZookeepers, fetchAnimals, fetchMedicalRecords, fetchFeedingLogs, fetchActivityLogs,
  searchAnimalsApi, patchAnimalHabitatZoneApi, patchAnimalStatusApi,
  cancelTreatmentApi, registerFeedingLogApi, completeTreatmentUnauthorizedApi,
  patchAnimalPartialApi, deleteFeedingLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [habitats, setHabitats] = useState([]);
  const [zookeepers, setZookeepers] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [feedingLogs, setFeedingLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-9501');
  const [filterHabitatZone, setFilterHabitatZone] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedInTreatmentCount] = useState(8);
  const [cachedRecentAnimal] = useState('심바 아프리카 사자 (후지 염좌 / 영양제 처방)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadAnimals(), loadHabitats(), loadZookeepers(), loadMedicalRecords(), loadFeedingLogs(), loadActivityLogs(), loadStaffs()]);
  const loadAnimals = async () => setAnimals(await fetchAnimals());
  const loadHabitats = async () => setHabitats(await fetchHabitats());
  const loadZookeepers = async () => setZookeepers(await fetchZookeepers());
  const loadMedicalRecords = async () => setMedicalRecords(await fetchMedicalRecords());
  const loadFeedingLogs = async () => setFeedingLogs(await fetchFeedingLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 사육사를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadAnimals();
    // INTENTIONAL_ERROR: cachedInTreatmentCount and cachedRecentAnimal remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (habitatZone, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 사바나(3초 지연) 결과가 최신 유인원(0.2초) 결과를 덮어씀
    showToast(`동물 목록 조회 중 [구역: ${habitatZone} / 상태: ${status}]...`, 'info');
    searchAnimalsApi(habitatZone, status, search).then(data => {
      setAnimals(data);
      if (habitatZone === '아프리카 사바나 야생사육장') {
        showToast('사바나 사육장 수신 완료 (3초 지연 완료 ➔ 최신 구역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`동물 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedAnimals[idx] 아닌 원본 animals[idx] 동물이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedAnimals[idx];
    if (clicked) {
      showToast(`[${clicked.animalName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 동물 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusHabitatRace = (anmId, target, habitatZone) => {
    showToast('치료완료 변경(3초 지연)과 사육 구역 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchAnimalStatusApi(anmId, target.status);
    setTimeout(() => {
      patchAnimalHabitatZoneApi(anmId, habitatZone);
    }, 100);
    setTimeout(async () => {
      showToast('사육 구역 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('치료완료 변경 완료 (3초 완료 - 사육 구역 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadAnimals();
    }, 4000);
  };

  const triggerCancelFeedingConflict = (anmId) => {
    showToast('진료 취소(0.5초 완료)와 급여 기록 등록(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelTreatmentApi(anmId);
    setTimeout(async () => {
      showToast('진료 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadAnimals();
    }, 600);
    registerFeedingLogApi(anmId);
    setTimeout(async () => {
      showToast('급여 기록 등록 완료 (4초 완료 → CANCELLED 동물을 OBSERVING으로 복원시킴 - Error 2)', 'danger');
      await loadAnimals();
      await loadFeedingLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, animalName, ageYears, healthGrade) => {
    await patchAnimalPartialApi(id, animalName, 0, healthGrade);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save ageYears (Error 8)
    showToast(`[${id}] 이름/건강등급/나이가 성공적으로 저장되었습니다.`, 'success');
    await loadAnimals();
  };

  const deleteLog = async (id) => {
    const data = await deleteFeedingLogApi(id);
    if (data.success) {
      showToast('급여 로그 삭제 완료. (대시보드 종별 급여량 및 구역별 건강위험도 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadFeedingLogs();
    }
  };

  const testUnauthorizedCompleteTreatment = async (id) => {
    const res = await completeTreatmentUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 치료 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ZooCare 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedAnimals = useMemo(() => {
    let list = [...animals];
    if (sortOrder === 'RISK_DESC') {
      list.sort((a, b) => a.riskLevel.localeCompare(b.riskLevel));
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.admitDate.localeCompare(b.admitDate));
    }
    return list;
  }, [animals, sortOrder]);

  // INTENTIONAL_ERROR: selectedAnimal is based on original animals[] not sortedAnimals[] (Error 3)
  const selectedAnimal = useMemo(() => animals[selectedIdx] || animals[0] || null, [animals, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedInTreatmentCount={cachedInTreatmentCount} cachedRecentAnimal={cachedRecentAnimal} resetSandbox={resetSandbox} />
      <div className="zoocare-grid">
        <Sidebar
          filterHabitatZone={filterHabitatZone} setFilterHabitatZone={setFilterHabitatZone}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          animals={sortedAnimals} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          habitats={habitats}
        />
        <CenterSection
          animals={animals} habitats={habitats} zookeepers={zookeepers}
          medicalRecords={medicalRecords} feedingLogs={feedingLogs} activityLogs={activityLogs}
          deleteFeedingLog={deleteLog} testUnauthorizedCompleteTreatment={testUnauthorizedCompleteTreatment}
        />
        <RightPanel
          selectedAnimal={selectedAnimal}
          setSelectedAnimal={(u) => setAnimals(prev => prev.map(a => a.id === u.id ? u : a))}
          animals={animals} habitats={habitats}
          triggerStatusHabitatRace={triggerStatusHabitatRace}
          triggerCancelFeedingConflict={triggerCancelFeedingConflict}
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
