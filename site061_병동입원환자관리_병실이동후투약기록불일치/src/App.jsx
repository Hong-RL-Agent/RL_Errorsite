import React, { useState, useEffect } from 'react';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [medicationAlerts, setMedicationAlerts] = useState([]);
  const [exams, setExams] = useState([]);
  const [nursingLogs, setNursingLogs] = useState([]);

  // Selections & filters
  const [activePatient, setActivePatient] = useState(null);
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Nursing log stale cache ID (Error 2 Target)
  const [cachedNursingLogPatientId, setCachedNursingLogPatientId] = useState(null);

  const [toasts, setToasts] = useState([]);

  // Forms
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('남');
  const [newPatientWard, setNewPatientWard] = useState('5병동');
  const [newPatientRoom, setNewPatientRoom] = useState('501호');
  const [newPatientBed, setNewPatientBed] = useState('bed-01');
  const [newPatientReason, setNewPatientReason] = useState('');

  const [transferRoom, setTransferRoom] = useState('502호');
  const [transferBed, setTransferBed] = useState('bed-03');

  const [newNursingNote, setNewNursingNote] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadPatients();
    await loadMedications();
    await loadAlerts();
    await loadExams();
    await loadNursingLogs();
  };

  const loadPatients = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
    if (data.length > 0 && !activePatient) {
      setActivePatient(data[0]);
      setCachedNursingLogPatientId(data[0].id); // Initial align
    }
  };

  const loadMedications = async () => {
    const res = await fetch('/api/medications');
    const data = await res.json();
    setMedications(data);
  };

  const loadAlerts = async () => {
    const res = await fetch('/api/alerts');
    const data = await res.json();
    setMedicationAlerts(data);
  };

  const loadExams = async () => {
    const res = await fetch('/api/exams');
    const data = await res.json();
    setExams(data);
  };

  const loadNursingLogs = async () => {
    const res = await fetch('/api/nursing');
    const data = await res.json();
    setNursingLogs(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const resetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('WardFlow 병동 디비 데이터가 초기화되었습니다.', 'success');
    setActivePatient(null);
    setCachedNursingLogPatientId(null);
    await loadAll();
  };

  // Switch patient (Error 2 Target)
  const handlePatientSwitch = (pat) => {
    setActivePatient(pat);
    showToast(`환자 [${pat.name}] 상세 카트를 활성화합니다.`, 'info');
    
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Session
    // DESCRIPTION: 환자 상세 탭을 변경할 때 헤더 정보는 B 환자로 갱신되지만, 
    // 우측 간호 기록 작성 모듈의 캐시 ID(`cachedNursingLogPatientId`)를 함께 갱신하지 않아 
    // 이전 환자 A의 간호 기록 목록이 보이며 등록 단추를 누르면 A에게 기록되는 결함입니다.
    // Bypasses setCachedNursingLogPatientId(pat.id)!
  };

  const syncNursingLogPatient = () => {
    if (activePatient) {
      setCachedNursingLogPatientId(activePatient.id);
      showToast('간호 기록 대상 환자 세션 ID가 정상 동기화되었습니다.', 'success');
    }
  };

  // Room Transfer & Medication Race (Error 1 Target)
  const triggerRoomTransferMedicationRace = (pat, targetRoom, targetBed) => {
    showToast(`${targetRoom} (${targetBed}) 이동과 투약 저장을 동시 요청합니다.`, 'info');

    // 1. PATCH room transfer (4s delay)
    fetch(`/api/patients/${pat.id}/room`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: targetRoom, bedId: targetBed })
    });

    // 2. POST medication (1s delay)
    setTimeout(async () => {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: pat.id, drugName: '아세트아미노펜 서방정', dosage: '300mg' })
      });
      if (res.ok) {
        showToast('투약 기록 저장 완료 (1초 지연 완료)', 'success');
        await loadAll();
      }
    }, 100);

    // Optimistic update locally
    setPatients(prev => prev.map(p => p.id === pat.id ? { ...p, room: targetRoom, bedId: targetBed } : p));

    // Refresh after 4.5s to see that medication is written with old room!
    setTimeout(async () => {
      showToast('병실 이동 완료 (투약 내역 상세에는 구형 병실 호수가 매핑 기록됨)', 'warning');
      await loadAll();
    }, 4500);
  };

  // Discharge & Room Transfer Race (Error 3 Target)
  const triggerDischargeTransferConflict = (pat, targetRoom, targetBed) => {
    showToast('퇴원 처리 후 바로 타 병실 이동을 연속 호출합니다.', 'info');

    // 1. POST discharge (0.1s delay)
    fetch(`/api/patients/${pat.id}/discharge`, { method: 'POST' });

    // 2. PATCH room transfer (4.0s delay)
    setTimeout(async () => {
      const res = await fetch(`/api/patients/${pat.id}/room`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: targetRoom, bedId: targetBed })
      });
      if (res.ok) {
        showToast('병실 이동 응답 수신 (4초 지연 완료)', 'success');
        await loadAll();
      }
    }, 100);

    // Optimistic update locally (disappears)
    setPatients(prev => prev.map(p => p.id === pat.id ? { ...p, status: 'DISCHARGED', room: '퇴원 완료', bedId: null } : p));

    // Refresh after 4.5s to see patient resurrected!
    setTimeout(async () => {
      showToast('지연 처리 완료 (퇴원했던 환자가 입원 상태로 복원 기입됨)', 'danger');
      await loadAll();
    }, 4500);
  };

  // Ward Filter refresh race (Error 5 Target)
  const triggerFilterRace = () => {
    showToast('병동 필터 조회 비동기 경합을 시작합니다. (5병동 ➔ 6병동)', 'info');

    // 1. Fetch 5병동 (3s delay)
    fetch('/api/patients/filter?ward=5병동')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        showToast('5병동 필터 조회 완료 (3초 지연 오버라이트)', 'warning');
      });

    // 2. Fetch 6병동 (0.2s delay)
    setTimeout(() => {
      fetch('/api/patients/filter?ward=6병동')
        .then(res => res.json())
        .then(data => {
          setPatients(data);
          showToast('6병동 필터 조회 완료 (0.2초)', 'info');
        });
    }, 150);
  };

  // Delete patient (Error 4 Target - stats delete leak)
  const handleDeletePatient = async (id) => {
    const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('해당 환자의 입원 명단 카드가 소거되었습니다.', 'success');
      setActivePatient(null);
      await loadAll();
    }
  };

  // Add admission patient
  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatientName) return;

    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newPatientName,
        age: newPatientAge,
        gender: newPatientGender,
        ward: newPatientWard,
        room: newPatientRoom,
        bedId: newPatientBed,
        reason: newPatientReason
      })
    });
    if (res.ok) {
      showToast(`환자 [${newPatientName}] 입원 등록 완료`, 'success');
      setNewPatientName('');
      setNewPatientAge('');
      setNewPatientReason('');
      await loadAll();
    }
  };

  // Save Nursing Log (Error 2 Trigger)
  const handleSaveNursingNote = async (e) => {
    e.preventDefault();
    if (!newNursingNote || !cachedNursingLogPatientId) return;

    const res = await fetch('/api/nursing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: cachedNursingLogPatientId,
        note: newNursingNote
      })
    });
    if (res.ok) {
      showToast('간호 인계 기록 저장이 완료되었습니다.', 'success');
      setNewNursingNote('');
      await loadNursingLogs();
    }
  };

  // Calculate pending tasks total count (Error 4 Target)
  const pendingTasksTotal = exams.length + medicationAlerts.length;

  // Filtered patients list
  const filteredPatients = patients.filter(p => {
    if (selectedWard !== 'ALL' && p.ward !== selectedWard) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (searchQuery && !p.name.includes(searchQuery)) return false;
    return true;
  });

  const activeNursingLogPatient = patients.find(p => p.id === cachedNursingLogPatientId);

  return (
    <div className="wardflow-app">
      
      {/* App Header Navigation */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 14c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3H5C3.34 4 2 5.34 2 7v4c0 1.66 1.34 3 3 3" />
            <path d="M2 14v7h20v-7" />
            <path d="M6 14v4h12v-4" />
          </svg>
          <span className="logo-title">WardFlow</span>
          <span className="logo-subtitle">Wards & Patient Care Operations</span>
        </div>

        {/* Dashboard Banner widget */}
        <div className="header-dashboard">
          <div className="stat-card">
            <span>📅 예정 임상 간호 업무 총계 (SLA):</span>
            <strong className="stat-value">{pendingTasksTotal} 건</strong>
          </div>
          <small className="warn-desc">* 환자 삭제 시에도 예정 업무 수치가 잔존 유출됨 (Error 4)</small>
        </div>

        <button className="sandbox-reset-btn" onClick={resetSandbox}>
          🔄 DB 초기화
        </button>
      </header>

      {/* Grid Layout Container */}
      <div className="wardflow-grid">

        {/* Left Side: Ward List & Filters */}
        <aside className="panel-section filter-sidebar">
          <div className="sidebar-title-row">
            <h3>🏥 병동 및 상태 필터</h3>
            <button className="race-btn-sm" onClick={triggerFilterRace}>
              ⚡ 필터 경합 (Error 5)
            </button>
          </div>
          <p className="warn-desc">* 고속 필터링 시 5병동의 3초 지연 조회 결과가 덮어씌워짐 (Error 5)</p>

          <div className="filter-group">
            <label>소속 병동:</label>
            <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
              <option value="ALL">전체 병동</option>
              <option value="5병동">5병동 (정밀 전공정)</option>
              <option value="6병동">6병동 (후공정 모니터링)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>환자 상태:</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="ALL">전체 상태</option>
              <option value="STABLE">안정 (STABLE)</option>
              <option value="CRITICAL">중증 (CRITICAL)</option>
              <option value="OBSERVING">관찰 (OBSERVING)</option>
              <option value="DISCHARGED">퇴원 (DISCHARGED)</option>
            </select>
          </div>

          <div className="search-box">
            <input 
              type="text" 
              placeholder="환자 이름 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Patients scroll list */}
          <div className="patients-list-box">
            <h4>📋 환자 명단</h4>
            <div className="patients-scroll">
              {filteredPatients.map(p => (
                <div 
                  key={p.id} 
                  className={`patient-card ${activePatient?.id === p.id ? 'selected' : ''}`}
                  onClick={() => handlePatientSwitch(p)}
                >
                  <div className="meta-row">
                    <strong>{p.name} ({p.gender}, {p.age}세)</strong>
                    <span className={`status-badge ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="info-row">
                    <span>{p.ward} {p.room}</span>
                    <span className="reason-lbl">{p.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Bed layout grid of current ward/room */}
        <main className="panel-section bed-center">
          <div className="center-header">
            <h2>🛏️ 실시간 병상 배치도 (24개 이상 베드 관리)</h2>
            <span className="room-title">선택된 병실: {activePatient?.room || '501호'}</span>
          </div>

          <div className="beds-layout-grid">
            {/* Display 24 beds. Highlight patient assigned bed */}
            {Array.from({ length: 24 }).map((_, idx) => {
              const bedId = `bed-${String(idx + 1).padStart(2, '0')}`;
              const occupant = patients.find(p => p.bedId === bedId && p.status !== 'DISCHARGED');
              return (
                <div 
                  key={bedId} 
                  className={`bed-slot-card ${occupant ? 'occupied' : ''} ${activePatient?.bedId === bedId ? 'active' : ''}`}
                >
                  <span className="bed-icon">🛏️</span>
                  <strong>{idx + 1}번 병상</strong>
                  <div className="occupant-info">
                    {occupant ? (
                      <span className="name-lbl">{occupant.name}</span>
                    ) : (
                      <span className="empty-lbl">비어있음</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Medication timeline & history list */}
          <div className="medication-timeline-block">
            <h3>💊 환자별 약품 투약 내역서</h3>
            <p className="warn-desc">* 새로고침 시 B병실에 투약된 내역의 병실이 A로 남아 기록 불일치를 빚음 (Error 1)</p>
            <div className="meds-timeline">
              {medications.filter(m => m.patientId === activePatient?.id).map(m => (
                <div key={m.id} className="meds-card">
                  <div className="time-col">{m.time}</div>
                  <div className="details-col">
                    <strong>{m.drugName}</strong>
                    <span>투약량: {m.dosage} | <strong>지정 병실: {m.roomId}</strong></span>
                  </div>
                </div>
              ))}
              {medications.filter(m => m.patientId === activePatient?.id).length === 0 && (
                <div className="empty-lbl-dark">이 환자의 투약 내역 기록이 존재하지 않습니다.</div>
              )}
            </div>
          </div>
        </main>

        {/* Right Side: Selected Patient detail operations */}
        <aside className="panel-section details-sidebar">
          <h3>👤 선택 환자 상세 및 간호 조작</h3>
          
          {activePatient ? (
            <div className="patient-detail-card">
              <div className="field-group">
                <span className="label">이름 / 나이 / 성별:</span>
                <strong>{activePatient.name} ({activePatient.age}세, {activePatient.gender})</strong>
              </div>

              <div className="field-group">
                <span className="label">입원 진단 사유:</span>
                <p className="reason-text">{activePatient.reason}</p>
              </div>

              <div className="field-group">
                <span className="label">지정 소속:</span>
                <span>{activePatient.ward} {activePatient.room} ({activePatient.bedId || '병상 미지정'})</span>
              </div>

              {/* Error triggers */}
              <div className="details-operation-controls">
                <div className="transfer-box-form">
                  <label>병실 이동 대상 설정 (Error 1 & 3):</label>
                  <div className="inputs-row">
                    <input type="text" value={transferRoom} onChange={e => setTransferRoom(e.target.value)} placeholder="병실 (예: 502호)..." />
                    <input type="text" value={transferBed} onChange={e => setTransferBed(e.target.value)} placeholder="병상 (예: bed-03)..." />
                  </div>
                  <button 
                    className="race-btn"
                    onClick={() => triggerRoomTransferMedicationRace(activePatient, transferRoom, transferBed)}
                  >
                    ⚡ 병실 이동 + 투약 동시 처리 (Error 1)
                  </button>
                </div>

                <div className="discharge-box">
                  <button 
                    className="discharge-btn"
                    onClick={() => triggerDischargeTransferConflict(activePatient, transferRoom, transferBed)}
                  >
                    ⚡ 퇴원 처리 후 즉시 병실 이동 (Error 3)
                  </button>
                </div>

                <button 
                  className="delete-patient-btn"
                  onClick={() => handleDeletePatient(activePatient.id)}
                >
                  🗑️ 환자 입원 소거 처리 (Error 4)
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-lbl-dark">환자를 목록에서 선택해 주세요.</div>
          )}

          {/* Nursing logs module (Error 2 Target) */}
          <div className="nursing-logs-widget">
            <div className="widget-header">
              <h4>📋 간호 인계 기록지</h4>
              <button className="sync-btn" onClick={syncNursingLogPatient}>
                기록 환자 세션 동기화
              </button>
            </div>
            <p className="warn-desc">* 환자 카트 전환 시에도 작성 패널 타깃이 갱신되지 않고 이전 환자 A에 기록됨 (Error 2)</p>

            {activeNursingLogPatient && (
              <div className="nursing-active-target">
                <span>기록 타깃 환자:</span>
                <strong>{activeNursingLogPatient.name} (ID: {activeNursingLogPatient.id})</strong>
              </div>
            )}

            <div className="nursing-history-list">
              {nursingLogs.filter(n => n.patientId === cachedNursingLogPatientId).map(n => (
                <div key={n.id} className="nursing-history-card">
                  <small className="time-lbl">{n.time}</small>
                  <p>{n.note}</p>
                </div>
              ))}
              {nursingLogs.filter(n => n.patientId === cachedNursingLogPatientId).length === 0 && (
                <div className="empty-lbl-dark">등록된 간호 인계 기록이 없습니다.</div>
              )}
            </div>

            <form onSubmit={handleSaveNursingNote} className="nursing-note-form">
              <textarea 
                placeholder="간호 인계 사항 입력..."
                value={newNursingNote}
                onChange={e => setNewNursingNote(e.target.value)}
              />
              <button type="submit">기록지 등록</button>
            </form>
          </div>

          {/* Admission Form */}
          <div className="admission-form-widget">
            <h4>📝 신규 환자 입원 등록</h4>
            <form onSubmit={handleAddPatient} className="admission-form">
              <input type="text" placeholder="이름..." value={newPatientName} onChange={e => setNewPatientName(e.target.value)} />
              <input type="number" placeholder="나이..." value={newPatientAge} onChange={e => setNewPatientAge(e.target.value)} />
              <input type="text" placeholder="입원 진단..." value={newPatientReason} onChange={e => setNewPatientReason(e.target.value)} />
              <button type="submit">입원 수속 완료</button>
            </form>
          </div>
        </aside>

      </div>

      {/* Floating Action Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
