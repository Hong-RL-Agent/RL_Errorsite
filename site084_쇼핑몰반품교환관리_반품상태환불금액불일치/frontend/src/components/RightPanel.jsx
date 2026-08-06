import React from 'react';

export default function RightPanel({
  selectedReturn,
  setSelectedReturn,
  triggerReasonPickupRace,
  triggerCancelApproveConflict
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <!-- Return Reason & Pickup Date adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>📦 반품 사유 & 수거 일정 변경</h3>
        {selectedReturn ? (
          <div className="detail-panel">
            <p>반품 ID: <strong>{selectedReturn.id}</strong> ({selectedReturn.customerName} 고객)</p>
            <p>환불 예정 금액: <strong style={{ color: 'var(--color-primary)' }}>{selectedReturn.refundAmount?.toLocaleString()}원</strong></p>

            <div className="form-group">
              <label>반품 사유 변경:</label>
              <select 
                value={selectedReturn.reason || '단순 변심'} 
                onChange={(e) => setSelectedReturn({ ...selectedReturn, reason: e.target.value })}
              >
                <option value="사이즈 불일치 (생각보다 큼)">사이즈 불일치 (생각보다 큼)</option>
                <option value="단순 변심 (색상 차이)">단순 변심 (색상 차이)</option>
                <option value="상품 파손/불량 (가죽 스크래치)">상품 파손/불량 (가죽 스크래치)</option>
                <option value="상품 파손/불량 (전원 작동불가)">상품 파손/불량 (전원 작동불가)</option>
              </select>
            </div>

            <div className="form-group">
              <label>택배 수거 일정 변경:</label>
              <div className="input-row">
                <input 
                  type="date" 
                  value={selectedReturn.pickupDate || '2026-08-06'} 
                  onChange={(e) => setSelectedReturn({ ...selectedReturn, pickupDate: e.target.value })}
                />
                <button className="save-btn" onClick={() => triggerReasonPickupRace(selectedReturn)}>
                  사유 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 사유 변경(3초 지연 완료) 직후 수거 일정 변경(0.1초 완료) 시, 3초 뒤 이전 수거 일정이 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-ret-btn" onClick={() => triggerCancelApproveConflict(selectedReturn)}>
                ⚡ 반품 취소 후 환불 승인 (Error 2)
              </button>
              <small className="warn-desc">* 반품 취소(0.5초 완료) 직후 환불 승인(4초 지연 완료) 시, 늦은 환불 승인 요청이 취소된 반품을 다시 환불승인 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 반품 항목을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
