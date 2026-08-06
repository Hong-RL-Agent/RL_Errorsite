import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedLivestock, setSelectedLivestock, livestocks, barns, triggerStatusFeedRace, triggerCancelHealthConflict, triggerPartialSave }) {
  const [weightKg, setWeightKg] = useState(720);
  const [healthStatus, setHealthStatus] = useState('HEALTHY');
  const [barnId, setBarnId] = useState('BARN-01');
  const [feedStockKg, setFeedStockKg] = useState(4500);

  const target = selectedLivestock || livestocks[0];

  useEffect(() => {
    if (target) {
      setWeightKg(target.weightKg || 720);
      setHealthStatus(target.healthStatus || 'HEALTHY');
      setBarnId(target.barnId || 'BARN-01');
      setFeedStockKg(target.feedStockKg || 4500);
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🐄 개체 관제 & 사료 재고 조정</h3>
        {target ? (
          <div className="detail-panel">
            <p>귀표 번호: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.earTagNo}</strong></p>
            <p>소속 축사: <strong>{target.barnName}</strong> | 월령: <strong>{target.ageMonths}개월</strong></p>
            <p>현재 체중: <strong style={{ color: 'var(--color-success)' }}>{target.weightKg}kg</strong></p>
            <p>사료 재고: <strong style={{ color: 'var(--color-dark)' }}>{target.feedStockKg}kg</strong></p>
            <p>출하 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>할당 사료 재고(kg) 차감/조정 (0.1초 완료):</label>
              <input type="number" value={feedStockKg} onChange={(e) => {
                setFeedStockKg(Number(e.target.value));
                setSelectedLivestock({ ...target, feedStockKg: Number(e.target.value) });
              }} />
            </div>

            <div className="form-group">
              <label>출하 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'SHIPMENT_CONFIRMED'} onChange={(e) => setSelectedLivestock({ ...target, status: e.target.value })}>
                <option value="RAISING">입식사육중 (RAISING)</option>
                <option value="SHIPMENT_PENDING">출하대기 (SHIPMENT_PENDING)</option>
                <option value="SHIPMENT_CONFIRMED">출하확정 (SHIPMENT_CONFIRMED)</option>
                <option value="SHIPPED">출하완료 (SHIPPED)</option>
                <option value="CANCELLED">취소/보류 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusFeedRace(target.id, target, feedStockKg)}>
              출하확정 변경 + 즉시 사료 차감 (Error 1)
            </button>
            <small className="warn-desc">* 출하 상태 변경(3초 지연) 직후 사료 차감(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 사료 재고를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelHealthConflict(target.id)}>
                ⚡ 출하 취소 후 건강 기록 등록 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 출하 취소(0.5초 완료) 직후 건강 기록 등록(4초 지연 완료) 시, 취소된 출하가 SHIPMENT_PENDING(출하대기)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 개체를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 개체 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>체중(kg):</label>
              <input type="number" step="0.5" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>건강 상태 (부분 저장 미반영):</label>
              <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)}>
                <option value="HEALTHY">양호 (HEALTHY)</option>
                <option value="OBSERVATION">관찰요망 (OBSERVATION)</option>
                <option value="TREATMENT">치료중 (TREATMENT)</option>
                <option value="RECOVERY">회복중 (RECOVERY)</option>
              </select>
            </div>
            <div className="form-group">
              <label>축사 위치:</label>
              <select value={barnId} onChange={(e) => setBarnId(e.target.value)}>
                {barns.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, weightKg, healthStatus, barnId)}>
              개체 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 체중/건강상태/축사위치 동시 수정 시 건강상태만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 개체를 선택하세요.</div>}
      </div>
    </aside>
  );
}
