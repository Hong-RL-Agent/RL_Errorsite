import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedPanel, setSelectedPanel, panels, workers, zones, maintenanceJobs, triggerStatusWorkerRace, triggerCancelCalibrateConflict, triggerPartialSave }) {
  const [installDate, setInstallDate] = useState('');
  const [grade, setGrade] = useState('S');
  const [zoneId, setZoneId] = useState('ZONE-A01');
  const target = selectedPanel || panels[0];

  useEffect(() => {
    if (target) {
      setInstallDate(target.installDate || '');
      setGrade(target.grade || 'S');
      setZoneId(target.zoneId || 'ZONE-A01');
    }
  }, [target]);

  const jobsOfTarget = maintenanceJobs.filter(j => target && j.panelId === target.id);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>⚡ 패널 상세 & 점검 작업 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>패널 번호: <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{target.panelNo}</strong></p>
            <p>구역: <strong>{target.zoneName}</strong> | 설치일: <strong>{target.installDate}</strong></p>
            <p>실시간 출력: <strong style={{ color: 'var(--color-success)' }}>{target.currentKw} kW</strong></p>
            <p>표면 온도: <strong style={{ color: target.tempC > 60 ? 'var(--color-danger)' : 'var(--color-warning)' }}>{target.tempC}℃</strong></p>
            <p>담당 작업자: <strong>{target.workerName}</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>담당 작업자 변경 (0.1초 완료):</label>
              <select value={target.workerId || ''} onChange={(e) => {
                const w = workers.find(x => x.id === e.target.value);
                setSelectedPanel({ ...target, workerId: e.target.value, workerName: w?.name || '' });
              }}>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>점검 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'NORMAL'} onChange={(e) => setSelectedPanel({ ...target, status: e.target.value })}>
                <option value="NORMAL">정상 (NORMAL)</option>
                <option value="INSPECTING">점검 진행중 (INSPECTING)</option>
                <option value="WARNING">주의 (WARNING)</option>
                <option value="HOTSPOT">핫스팟 이상 (HOTSPOT)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusWorkerRace(target)}>
              점검완료 처리 + 즉시 작업자 변경 (Error 1)
            </button>
            <small className="warn-desc">* 점검 상태 변경(3초 지연) 직후 작업자 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 작업자를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => {
                const job = jobsOfTarget[0];
                if (job) triggerCancelCalibrateConflict(job.id);
              }}>
                ⚡ 점검 취소 후 발전량 보정 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 점검 취소(0.5초 완료) 직후 발전량 보정(4초 지연 완료) 시, 취소된 작업이 INSPECTING으로 복원됨 (Error 2)</small>
            </div>

            {jobsOfTarget.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}>
                <strong style={{ color: 'var(--color-dark)' }}>점검 이력:</strong>
                {jobsOfTarget.map(j => (
                  <div key={j.id} style={{ marginTop: '0.2rem', color: 'var(--color-text)' }}>
                    ▸ {j.issueType} ({j.workerName}) <span className={`status-badge ${j.status.toLowerCase()}`}>{j.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <div className="empty-lbl-dark">관제할 패널을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 패널 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>설치일자:</label>
              <input type="date" value={installDate} onChange={(e) => setInstallDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>패널 등급 (부분 저장 미반영):</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="S">S등급 (최고효율)</option>
                <option value="A">A등급 (우수)</option>
                <option value="B">B등급 (보통)</option>
                <option value="C">C등급 (열화)</option>
              </select>
            </div>
            <div className="form-group">
              <label>관리 구역:</label>
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, installDate, grade, zoneId)}>
              패널 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 설치일/패널등급/관리구역 동시 수정 시 패널 등급만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 패널을 선택하세요.</div>}
      </div>
    </aside>
  );
}
