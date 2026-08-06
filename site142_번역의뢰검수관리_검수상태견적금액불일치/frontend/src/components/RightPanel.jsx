import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedRequest, setSelectedRequest, requests, clients, triggerStatusFeeRace, triggerCancelDeliveryConflict, triggerPartialSave }) {
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [actualFeeWon, setActualFeeWon] = useState(1850000);

  const target = selectedRequest || requests[0];
  const targetClient = clients.find(c => c.clientName === target?.clientName) || clients[0];

  useEffect(() => {
    if (target) {
      setActualFeeWon(target.actualFeeWon || 1850000);
    }
    if (targetClient) {
      setClientName(targetClient.clientName || '');
      setCompany(targetClient.company || '');
      setPhone(targetClient.phone || '');
    }
  }, [target, targetClient]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📝 검수 상태 & 견적 금액 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>의뢰 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.reqCode}</strong></p>
            <p>프로젝트: <strong style={{ fontSize: '0.85rem' }}>{target.title}</strong></p>
            <p>고객사: <strong>{target.company}</strong> ({target.clientName})</p>
            <p>언어쌍: <span className="lang-badge">{target.langPair}</span> | 분량: <strong>{target.wordCount.toLocaleString()}자</strong></p>
            <p>담당 번역가: <strong>{target.assignedTranslator}</strong></p>
            <p>최종 견적 금액: <strong style={{ color: 'var(--color-warning)' }}>{target.actualFeeWon.toLocaleString()}원</strong></p>
            <p>검수/납품 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>견적 금액 수정 (0.1초 완료):</label>
              <input type="number" value={actualFeeWon} onChange={(e) => setActualFeeWon(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>검수/납품 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_REVIEW'} onChange={(e) => setSelectedRequest({ ...target, status: e.target.value })}>
                <option value="PENDING">의뢰접수 (PENDING)</option>
                <option value="QUOTED">견적산정 (QUOTED)</option>
                <option value="IN_TRANSLATION">번역중 (IN_TRANSLATION)</option>
                <option value="IN_REVIEW">검수완료 (IN_REVIEW)</option>
                <option value="DELIVERED">납품완료 (DELIVERED)</option>
                <option value="CANCELLED">의뢰취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusFeeRace(target.id, target, actualFeeWon)}>
              검수완료 변경 + 즉시 견적 수정 (Error 1)
            </button>
            <small className="warn-desc">* 검수완료 변경(3초 지연) 직후 금액 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 금액을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelDeliveryConflict(target.id)}>
                ⚡ 의뢰 취소 후 납품 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 의뢰 취소(0.5초 완료) 직후 납품 완료(4초 지연 완료) 시, 취소된 의뢰가 DELIVERED(납품완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 의뢰를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 고객사 정보 수정 (Error 8)</h3>
        {targetClient ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>의뢰인 성명:</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>소속 기업명:</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetClient.id, clientName, phone, company)}>
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/회사명/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 고객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
