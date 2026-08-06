import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedRepair, setSelectedRepair, repairs, customers, triggerStatusPriceRace, triggerCancelCompleteConflict, triggerPartialSave }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [storageNo, setStorageNo] = useState('STG-V-101');
  const [estimatePriceWon, setEstimatePriceWon] = useState(350000);

  const target = selectedRepair || repairs[0];
  const targetCustomer = customers.find(c => c.customerName === target?.customerName) || customers[0];

  useEffect(() => {
    if (target) {
      setEstimatePriceWon(target.estimatePriceWon || 350000);
    }
    if (targetCustomer) {
      setCustomerName(targetCustomer.customerName || '');
      setPhone(targetCustomer.phone || '');
      setStorageNo(targetCustomer.storageNo || 'STG-V-101');
    }
  }, [target, targetCustomer]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎻 수리 상태 & 견적 금액 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>접수 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.repairCode}</strong></p>
            <p>카테고리: <span className="category-badge">{target.category}</span></p>
            <p>악기명: <strong>{target.instrumentName}</strong></p>
            <p>의뢰 고객: <strong>{target.customerName}</strong>님 | 보관: <small>{target.storageNo}</small></p>
            <p>증상: <small>{target.issueDescription}</small></p>
            <p>담당 루티어: <strong>{target.workerName}</strong> | 접수일: <small>{target.rptDate}</small></p>
            <p>수리 견적금액: <strong style={{ color: 'var(--color-success)' }}>{target.estimatePriceWon.toLocaleString()}원</strong></p>
            <p>수리 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>수리 견적금액 수정 (0.1초 완료):</label>
              <input type="number" value={estimatePriceWon} onChange={(e) => setEstimatePriceWon(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>수리 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'REPAIRING'} onChange={(e) => setSelectedRepair({ ...target, status: e.target.value })}>
                <option value="RECEIVED">접수완료 (RECEIVED)</option>
                <option value="ESTIMATING">견적대기 (ESTIMATING)</option>
                <option value="REPAIRING">수리중 (REPAIRING)</option>
                <option value="COMPLETED">출고완료 (COMPLETED)</option>
                <option value="CANCELLED">수리취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusPriceRace(target.id, target, estimatePriceWon)}>
              수리중 변경 + 즉시 견적 금액 수정 (Error 1)
            </button>
            <small className="warn-desc">* 수리중 변경(3초 지연) 직후 견적 금액 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 견적 금액을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCompleteConflict(target.id)}>
                ⚡ 수리 취소 후 출고 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 수리 취소(0.5초 완료) 직후 출고 완료(4초 지연 완료) 시, 취소된 접수가 COMPLETED(출고완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 접수를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 의뢰 고객 정보 수정 (Error 8)</h3>
        {targetCustomer ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>고객 성명:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>악기 보관 랙 번호:</label>
              <input type="text" value={storageNo} onChange={(e) => setStorageNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetCustomer.id, customerName, phone, storageNo)}>
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/보관번호/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 고객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
