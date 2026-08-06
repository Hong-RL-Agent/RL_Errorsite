import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedLocker, setSelectedLocker, lockers, customers, triggerPeriodStatusRace, triggerTerminateInConflict, triggerPartialSave }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');

  const target = selectedLocker || lockers[0];

  useEffect(() => {
    if (target) {
      setStartDate(target.startDate || '2026-08-01');
      setEndDate(target.endDate || '2026-08-31');
      const cst = customers.find(c => c.customerName === target.customerName);
      if (cst) {
        setCustomerName(cst.customerName || '');
        setPhone(cst.phone || '');
        setMemo(cst.memo || '');
      }
    }
  }, [target, customers]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🔒 보관함 상태 & 계약 기간 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>보관함 번호: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.lockerNo}</strong> ({target.size})</p>
            <p>소속 지점: <strong>{target.branchName}</strong></p>
            <p>계약 고객: <strong>{target.customerName}</strong></p>
            <p>계약 기간: <strong style={{ color: 'var(--color-success)' }}>{target.startDate} ~ {target.endDate}</strong></p>
            <p>보관함 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>계약 기간 변경 (Error 1 - 3초 지연):</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span style={{ color: 'var(--color-muted)' }}>~</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>보관함 이용 상태 변경 (0.1초 완료):</label>
              <select value={target.status || 'IN_USE'} onChange={(e) => setSelectedLocker({ ...target, status: e.target.value })}>
                <option value="AVAILABLE">사용가능 (AVAILABLE)</option>
                <option value="IN_USE">사용중 (IN_USE)</option>
                <option value="EXPIRING_SOON">만료임박 (EXPIRING_SOON)</option>
                <option value="MAINTENANCE">점검중 (MAINTENANCE)</option>
                <option value="TERMINATED">계약종료 (TERMINATED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerPeriodStatusRace(target.id, target, startDate, endDate)}>
              사용중 변경 + 즉시 기간 변경 (Error 1)
            </button>
            <small className="warn-desc">* 계약 기간 변경(3초 지연 완료) 직후 상태 변경(0.1초 완료) 시, 3초 뒤 기간 변경이 구 DB 스냅샷으로 보관함 상태를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerTerminateInConflict(target.id)}>
                ⚡ 계약 종료 후 물품 입고 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 계약 종료(0.5초 완료) 직후 입고 처리(4초 지연 완료) 시, 종료된 계약이 IN_USE(사용중)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 보관함을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 계약 고객 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>고객 성명:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>보관품 메모:</label>
              <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => {
              const cst = customers.find(c => c.customerName === target.customerName) || customers[0];
              if (cst) triggerPartialSave(cst.id, customerName, phone, memo);
            }}>
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/연락처/보관품 메모 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 고객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
