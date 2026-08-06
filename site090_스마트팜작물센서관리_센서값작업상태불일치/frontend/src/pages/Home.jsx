import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import CropEditModal from '../components/CropEditModal.jsx';
import {
  fetchAdmins,
  fetchZones,
  fetchCrops,
  fetchSensors,
  fetchWorkLogs,
  fetchAlerts,
  searchSensorsApi,
  patchIrrigationVolumeApi,
  patchIrrigationTimeApi,
  cancelWorkLogApi,
  resolveAlertApi,
  irrigateCropApi,
  patchCropPartialApi,
  deleteAlertApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [zones, setZones] = useState([]);
  const [crops, setCrops] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [activeAdmin, setActiveAdmin] = useState('ADM-301');
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [selectedCropForModal, setSelectedCropForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale volume cache for Error 1
  const [previousVolumeCache, setPreviousVolumeCache] = useState(500);

  // Session stats cache (Error 6 Target)
  const [cachedAlertCount, setCachedAlertCount] = useState(5);
  const [cachedRecentSensorSummary, setCachedRecentSensorSummary] = useState('A1 온실 (온도 24.5°C / 습도 65%)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadZones();
    await loadCrops();
    await loadSensors();
    await loadWorkLogs();
    await loadAlerts();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadZones = async () => {
    const data = await fetchZones();
    setZones(data);
  };

  const loadCrops = async () => {
    const data = await fetchCrops();
    setCrops(data);
    if (data.length > 0) {
      setPreviousVolumeCache(data[0].irrigationVolume);
    }
  };

  const loadSensors = async () => {
    const data = await fetchSensors();
    setSensors(data);
  };

  const loadWorkLogs = async () => {
    const data = await fetchWorkLogs();
    setWorkLogs(data);
  };

  const loadAlerts = async () => {
    const data = await fetchAlerts();
    setAlerts(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Admin Session Switch (Error 6 Target)
  const handleAdminSwitch = (adminId) => {
    setActiveAdmin(adminId);
    showToast(`로그인 계정을 [${adminId}] 관리자로 변경합니다.`, 'info');
    loadCrops();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 관리자 A가 특정 농장 구역을 본 뒤 관리자 B로 로그인하면 구역 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 위험 알림 개수 및 최근 센서 요약 캐시(cachedAlertCount, cachedRecentSensorSummary)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Irrigation Time & Volume update race (Error 1 Trigger)
  const triggerIrrigationTimeVolumeRace = (crp) => {
    showToast('관수량 변경과 예약 시간 변경을 순차 요청합니다.', 'info');

    // 1. Irrigation Volume update (0.1s done) with STALE time cache!
    patchIrrigationVolumeApi(crp.id, crp.irrigationVolume, crp.scheduledTime);

    // 2. Irrigation Schedule Time update (3.0s delay)
    setTimeout(() => {
      patchIrrigationTimeApi(crp.id, crp.scheduledTime);
    }, 100);

    setPreviousVolumeCache(crp.irrigationVolume);

    setTimeout(async () => {
      showToast('예약 시간 변경 완료 (시간은 갱신되었으나 3초 지연 완료로 관수 공급량이 이전 용량으로 롤백 저장됨)', 'warning');
      await loadCrops();
    }, 4500);
  };

  // Zone & Sensor Type search race condition (Error 5 Trigger)
  const triggerSearchRace = (zoneId, type) => {
    showToast(`구역 센서 목록 필터를 조회합니다: [${zoneId} / ${type}]`, 'info');

    if (zoneId === 'ZN-A1') {
      searchSensorsApi('ZN-A1', type).then(data => {
        setSensors(data);
        showToast('A1 온실 구역 센서 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (zoneId === 'ZN-A2') {
      searchSensorsApi('ZN-A2', type).then(data => {
        setSensors(data);
        showToast('A2 온실 구역 센서 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchSensorsApi(zoneId, type).then(data => {
        setSensors(data);
      });
    }
  };

  // Risk Level Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 작물 목록을 위험도순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 작물이 아니라 정렬 전 원본 배열의 같은 index 작물 상세가 열리는 결함입니다.
    setSelectedCropIndex(index);
    const clickedCrop = sortedCrops[index];
    if (clickedCrop) {
      showToast(`[${clickedCrop.name}] 상세보기 표시 알림 완료 (우측 상세 패널에는 인덱스 불일치 작물 데이터가 노출됨)`, 'warning');
    }
  };

  // Cancel Work Log & Resolve Alert Conflict (Error 2 Trigger)
  const triggerCancelResolveConflict = (crp) => {
    showToast('관수 작업 취소 처리와 센서 알림 처리를 진행합니다.', 'info');

    const targetWork = workLogs.find(w => w.cropId === crp.id) || workLogs[0];

    // 1. Cancel Work Log (0.5s done)
    cancelWorkLogApi(targetWork.id);

    // 2. Resolve Alert & Re-activate (4.0s delay)
    setTimeout(async () => {
      const targetAlert = alerts[0];
      if (targetAlert) {
        await resolveAlertApi(targetAlert.id);
      }
      showToast('관수 작업 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadWorkLogs();
    }, 100);

    setTimeout(async () => {
      showToast('센서 알림 처리 완료 (4초 지연 완료: 취소된 관수 작업을 다시 IN_PROGRESS 진행중 상태로 재활성화시킴)', 'danger');
      await loadWorkLogs();
    }, 4500);
  };

  // Partial Crop Save (Error 8 Trigger)
  const triggerPartialCropSave = async (id, cropName, growthStage, manager) => {
    await patchCropPartialApi(id, cropName, growthStage, manager);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 작물 관리 모달에서 작물명, 생육 단계, 담당자를 동시에 수정하면 백엔드는 작물명과 생육 단계만 저장하고 
    // 담당자는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('작물명, 생육 단계, 담당자가 성공적으로 수정되었습니다.', 'success');
    await loadCrops();
  };

  // Delete Alert (Error 4 Target)
  const deleteAlert = async (id) => {
    const data = await deleteAlertApi(id);
    if (data.success) {
      showToast('센서 이상 알림을 삭제했습니다. (구역별 이상 발생률 및 작물 위험도 그래프 수치에는 계속 유지됨)', 'warning');
      await loadAlerts();
    }
  };

  // Test Unauthorized Irrigation (Error 7 Trigger)
  const testUnauthorizedIrrigation = async (id) => {
    try {
      const res = await irrigateCropApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (cropId, cropName, growthStage, manager) => {
    await patchCropPartialApi(cropId, cropName, growthStage, manager);
    showToast(`[${cropName}] 작물 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedCropForModal(null);
    await loadCrops();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('FarmSense 스마트팜 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedCropIndex(0);
    await loadAll();
  };

  const sortedCrops = useMemo(() => {
    let list = [...crops];
    if (filterZone !== 'ALL') {
      list = list.filter(c => c.zoneId === filterZone);
    }
    if (sortOrder === 'RISK_DESC') {
      list.sort((a, b) => b.riskLevel - a.riskLevel);
    }
    return list;
  }, [crops, filterZone, sortOrder]);

  // Selected Crop for RightPanel (Error 3 Effect)
  const selectedCropForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedCrops[selectedCropIndex] || crops[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted crops array
      return crops[selectedCropIndex] || crops[0];
    }
  }, [sortedCrops, crops, selectedCropIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAdmin={activeAdmin}
        handleAdminSwitch={handleAdminSwitch}
        cachedAlertCount={cachedAlertCount}
        cachedRecentSensorSummary={cachedRecentSensorSummary}
        resetSandbox={resetSandbox}
      />

      <div className="farmsense-grid">
        <Sidebar
          filterZone={filterZone}
          setFilterZone={setFilterZone}
          filterType={filterType}
          setFilterType={setFilterType}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          crops={sortedCrops}
          selectedCropIndex={selectedCropIndex}
          setSelectedCropIndex={setSelectedCropIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          zones={zones}
          sensors={sensors}
          workLogs={workLogs}
          alerts={alerts}
          deleteAlert={deleteAlert}
          openCropModal={(crp) => setSelectedCropForModal(crp)}
          testUnauthorizedIrrigation={testUnauthorizedIrrigation}
        />

        <RightPanel
          selectedCrop={selectedCropForPanel}
          setSelectedCrop={(updated) => {
            setCrops(prev => prev.map(c => c.id === updated.id ? updated : c));
          }}
          triggerIrrigationTimeVolumeRace={triggerIrrigationTimeVolumeRace}
          triggerCancelResolveConflict={triggerCancelResolveConflict}
          triggerPartialCropSave={triggerPartialCropSave}
        />
      </div>

      <CropEditModal
        crop={selectedCropForModal}
        onClose={() => setSelectedCropForModal(null)}
        onConfirm={handleModalConfirm}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
