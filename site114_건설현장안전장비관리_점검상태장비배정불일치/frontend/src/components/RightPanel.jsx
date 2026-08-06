import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedInspection, setSelectedInspection, inspections, equipments, zones, triggerStatusEquipmentRace, triggerCancelEquipmentConflict, triggerPartialSave }) {
  const [eqpName, setEqpName] = useState('');
  const [inspectCycleDays, setInspectCycleDays] = useState(30);
  const [zoneId, setZoneId] = useState('ZONE-A1');
  const target = selectedInspection || inspections[0];

  useEffect(() => {
    if (target) {
      const eqp = equipments.find(e => e.id === target.equipmentId) || equipments[0];
      if (eqp) {
        setEqpName(eqp.name || '');
        setInspectCycleDays(eqp.inspectCycleDays || 30);
        setZoneId(eqp.zoneId || 'ZONE-A1');
      }
    }
  }, [target, equipments]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚨 안전점검 상세 & 장비 배정 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>점검 제목: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.title}</strong></p>
            <p>현장 구역: <strong>{target.zoneName}</strong></p>
            <p>위험 등급: <span className={`risk-badge risk-${target.riskGrade.toLowerCase()}`}>{target.riskGrade}</span></p>
            <p>배정 장비: <strong>{target.equipmentName}</strong></p>
            <p>담당자: <strong>{target.workerName}</strong> | 마감: <strong>{target.dueDate}</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>담당 장비 변경 (0.1초 완료):</label>
              <select value={target.equipmentId || ''} onChange={(e) => {
                const eqp = equipments.find(x => x.id === e.target.value);
                setSelectedInspection({ ...target, equipmentId: e.target.value, equipmentName: eqp?.name || '' });
              }}>
                {equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>점검 조치 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_PROGRESS'} onChange={(e) => setSelectedInspection({ ...target, status: e.target.value })}>
                <option value="IN_PROGRESS">조치 진행중 (IN_PROGRESS)</option>
                <option value="COMPLETED">조치 완료 (COMPLETED)</option>
                <option value="CANCELLED">신고 취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusEquipmentRace(target)}>
              조치완료 처리 + 즉시 장비 변경 (Error 1)
            </button>
            <small className="warn-desc">* 점검 상태 변경(3초 지연) 직후 장비 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 장비를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelEquipmentConflict(target.id)}>
                ⚡ 위험요소 신고 취소 후 장비점검 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 신고 취소(0.5초 완료) 직후 장비점검 완료(4초 지연 완료) 시, 취소된 점검이 IN_PROGRESS로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 안전점검 항목을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 장비 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>장비명:</label>
              <input type="text" value={eqpName} onChange={(e) => setEqpName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>점검 주기 (부분 저장 미반영):</label>
              <input type="number" value={inspectCycleDays} onChange={(e) => setInspectCycleDays(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>배정 현장 구역:</label>
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.equipmentId, eqpName, inspectCycleDays, zoneId)}>
              장비 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 장비명/점검주기/배정구역 동시 수정 시 점검주기만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 장비를 선택하세요.</div>}
      </div>
    </aside>
  );
}
