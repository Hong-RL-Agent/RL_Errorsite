import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedReservation, setSelectedReservation, reservations, treatments, designers, triggerStatusTreatmentRace, triggerCancelCompleteConflict, triggerPartialSave, clients }) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDesigner, setPreferredDesigner] = useState('엘리 원장');
  const [treatmentName, setTreatmentName] = useState('시그니처 레이어드 S컬 펌');

  const target = selectedReservation || reservations[0];
  const targetClient = clients.find(c => c.clientName === target?.clientName) || clients[0];

  useEffect(() => {
    if (target) {
      setTreatmentName(target.treatmentName || '시그니처 레이어드 S컬 펌');
    }
    if (targetClient) {
      setClientName(targetClient.clientName || '');
      setPhone(targetClient.phone || '');
      setPreferredDesigner(targetClient.preferredDesigner || '엘리 원장');
    }
  }, [target, targetClient]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>💇‍♀️ 예약 상태 & 시술 옵션 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>예약 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.resCode}</strong></p>
            <p>고객 성함: <strong style={{ fontSize: '0.88rem' }}>{target.clientName}</strong> | 담당 디자이너: <strong>{target.designerName}</strong></p>
            <p>지점: <span className="branch-badge">{target.branch}</span> | 시술시각: <small>{target.resTime}</small></p>
            <p>선택 시술 옵션: <strong style={{ color: 'var(--color-warning)' }}>{target.treatmentName}</strong></p>
            <p>시술 요금: <strong>{target.priceWon.toLocaleString()}원</strong></p>
            <p>시술 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>시술 옵션 변경 (0.1초 완료):</label>
              <select value={treatmentName} onChange={(e) => setTreatmentName(e.target.value)}>
                {treatments.map(t => <option key={t.id} value={t.treatmentName}>{t.treatmentName} ({t.priceWon.toLocaleString()}원)</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>예약/시술 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_PROGRESS'} onChange={(e) => setSelectedReservation({ ...target, status: e.target.value })}>
                <option value="RESERVED">예약확정 (RESERVED)</option>
                <option value="IN_PROGRESS">시술중 (IN_PROGRESS)</option>
                <option value="COMPLETED">시술완료 (COMPLETED)</option>
                <option value="CANCELLED">예약취소 (CANCELLED)</option>
                <option value="REFUNDED">환불 (REFUNDED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusTreatmentRace(target.id, target, treatmentName)}>
              시술중 변경 + 즉시 옵션 변경 (Error 1)
            </button>
            <small className="warn-desc">* 시술중 변경(3초 지연) 직후 옵션 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 옵션을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCompleteConflict(target.id)}>
                ⚡ 예약 취소 후 시술 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 시술 완료(4초 지연 완료) 시, 취소된 예약이 COMPLETED(시술완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 예약을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 고객 정보 수정 (Error 8)</h3>
        {targetClient ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>고객 성함:</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>선호 디자이너:</label>
              <select value={preferredDesigner} onChange={(e) => setPreferredDesigner(e.target.value)}>
                {designers.map(d => <option key={d.id} value={d.name}>{d.name} ({d.branch})</option>)}
              </select>
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetClient.id, clientName, phone, preferredDesigner)}>
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/연락처/선호 디자이너 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 고객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
