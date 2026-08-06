import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedInspection, setSelectedInspection, inspections, equipments, triggerStatusMetricsRace, triggerCancelAlertConflict, triggerPartialSave }) {
  const [equipName, setEquipName] = useState('');
  const [location, setLocation] = useState('A동 혼화지 1번 교반기');
  const [checkCycleDays, setCheckCycleDays] = useState(14);
  const [turbidityNtu, setTurbidityNtu] = useState(0.45);
  const [phLevel, setPhLevel] = useState(7.2);

  const target = selectedInspection || inspections[0];
  const targetEquip = equipments.find(e => e.equipName === target?.equipName) || equipments[0];

  useEffect(() => {
    if (target) {
      setTurbidityNtu(target.turbidityNtu || 0.45);
      setPhLevel(target.phLevel || 7.2);
    }
    if (targetEquip) {
      setEquipName(targetEquip.equipName || '');
      setLocation(targetEquip.location || 'A동 혼화지 1번 교반기');
      setCheckCycleDays(targetEquip.checkCycleDays || 14);
    }
  }, [target, targetEquip]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🌊 수질 수치 & 설비 점검 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>점검 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.inspCode}</strong></p>
            <p>설비명: <strong>{target.equipName}</strong></p>
            <p>공정 섹션: <span className="section-badge">{target.section}</span></p>
            <p>담당자: <strong>{target.operatorName}</strong> | 점검일시: <small>{target.checkDate}</small></p>
            <p>현재 측정 탁도: <strong style={{ color: turbidityNtu > 0.3 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: '1.1rem' }}>{target.turbidityNtu} NTU</strong> (pH: {target.phLevel})</p>
            <p>점검 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>탁도 수치(NTU) 현장 보정 (0.1초 완료):</label>
              <input type="number" step="0.01" min="0" value={turbidityNtu} onChange={(e) => setTurbidityNtu(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>점검 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'RESOLVED'} onChange={(e) => setSelectedInspection({ ...target, status: e.target.value })}>
                <option value="NORMAL">정상운영 (NORMAL)</option>
                <option value="PENDING">점검대기 (PENDING)</option>
                <option value="IN_PROGRESS">조치중 (IN_PROGRESS)</option>
                <option value="RESOLVED">조치완료 (RESOLVED)</option>
                <option value="CANCELLED">점검취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusMetricsRace(target.id, target, turbidityNtu, phLevel)}>
              조치완료 변경 + 즉시 탁도 수치 보정 (Error 1)
            </button>
            <small className="warn-desc">* 조치완료 변경(3초 지연) 직후 탁도 보정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 탁도 수치를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelAlertConflict(target.id)}>
                ⚡ 점검 취소 후 이상 알림 처리 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 점검 취소(0.5초 완료) 직후 알림 처리(4초 지연 완료) 시, 취소된 점검이 IN_PROGRESS(조치중)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 정수장 점검을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 설비 정보 수정 (Error 8)</h3>
        {targetEquip ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>설비명:</label>
              <input type="text" value={equipName} onChange={(e) => setEquipName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>점검 주기 (일):</label>
              <input type="number" value={checkCycleDays} onChange={(e) => setCheckCycleDays(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>설비 위치 (부분 저장 미반영):</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetEquip.id, equipName, location, checkCycleDays)}>
              설비 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 설비명/점검주기/위치 동시 수정 시 위치만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 설비를 선택하세요.</div>}
      </div>
    </aside>
  );
}
