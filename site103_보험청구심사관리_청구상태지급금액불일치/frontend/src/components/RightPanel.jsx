import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedClaim,
  setSelectedClaim,
  policyholders,
  triggerStatusPayoutRace,
  triggerRejectSupplementConflict,
  triggerPartialPolicyholderSave
}) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const targetPolicyholder = policyholders.find(p => p.id === selectedClaim?.policyholderId) || policyholders[0];

  useEffect(() => {
    if (targetPolicyholder) {
      setAddress(targetPolicyholder.address || '');
      setPhone(targetPolicyholder.phone || '');
      setBankAccount(targetPolicyholder.bankAccount || '');
    }
  }, [targetPolicyholder]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Claim Status & Payout Calculation Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🛡️ 청구 상태 & 지급 예정 금액 계산 관제</h3>
        {selectedClaim ? (
          <div className="detail-panel">
            <p>청구 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedClaim.id}</strong></p>
            <p>가입자: <strong>{selectedClaim.policyholderName}</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedClaim.status.toLowerCase()}`}>{selectedClaim.status}</span></p>

            <div className="form-group">
              <label>지급 예정 금액 수정 (0.1초 완료):</label>
              <input 
                type="number" 
                value={selectedClaim.payoutAmount || 0} 
                onChange={(e) => setSelectedClaim({ ...selectedClaim, payoutAmount: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>청구 심사 상태 변경 (Error 1 - 3초 지연):</label>
              <select 
                value={selectedClaim.status || 'RECEIVED'} 
                onChange={(e) => setSelectedClaim({ ...selectedClaim, status: e.target.value })}
              >
                <option value="RECEIVED">접수</option>
                <option value="DOC_REVIEW">서류검토</option>
                <option value="UNDER_REVIEW">심사중</option>
                <option value="SUPPLEMENT_REQUEST">보완요청</option>
                <option value="PAYMENT_APPROVED">지급승인 (Error 1 - 3초 지연)</option>
                <option value="PAYMENT_COMPLETED">지급완료</option>
                <option value="REJECTED">반려</option>
              </select>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerStatusPayoutRace(selectedClaim)}>
                상태 변경 후 즉시 지급금액 수정 (Error 1)
              </button>
              <small className="warn-desc">* 상태 변경(3초 지연) 직후 지급금액 수정(0.1초 완료) 시, 3초 뒤 이전 상태 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerRejectSupplementConflict(selectedClaim)}>
                ⚡ 청구 반려 처리 후 서류 보완 연쇄 등록 (Error 2)
              </button>
              <small className="warn-desc">* 청구 반려(0.5초 완료) 직후 서류 보완 등록(4초 지연 완료) 시, 늦은 보완 완료 요청이 반려된 청구를 UNDER_REVIEW 심사중 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 보험 청구 항목을 선택하세요.</div>
        )}
      </div>

      {/* Policyholder Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>👤 가입자 인적 정보 수정 (Error 8)</h3>
        {targetPolicyholder ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>주소:</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label>연락처 (부분저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>지급 계좌번호:</label>
              <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialPolicyholderSave(targetPolicyholder.id, address, phone, bankAccount)}
            >
              가입자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 주소/연락처/계좌번호를 동시에 수정하면 백엔드에는 연락처만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 가입자를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
