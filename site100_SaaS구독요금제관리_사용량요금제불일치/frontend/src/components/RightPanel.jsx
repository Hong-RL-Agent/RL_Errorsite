import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedOrg,
  setSelectedOrg,
  plans,
  triggerPlanSeatsRace,
  triggerCancelRefreshConflict,
  triggerPartialOrgSave
}) {
  const [name, setName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [bizRegNo, setBizRegNo] = useState('');

  useEffect(() => {
    if (selectedOrg) {
      setName(selectedOrg.name || '');
      setBillingEmail(selectedOrg.billingEmail || '');
      setBizRegNo(selectedOrg.bizRegNo || '');
    }
  }, [selectedOrg]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Plan & License Seats Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>💳 요금제 플랜 & 라이선스 관제</h3>
        {selectedOrg ? (
          <div className="detail-panel">
            <p>조직 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedOrg.id}</strong></p>
            <p>조직명: <strong>{selectedOrg.name}</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedOrg.status.toLowerCase()}`}>{selectedOrg.status}</span></p>

            <div className="form-group">
              <label>요금제 변경 선택 (Error 1):</label>
              <select 
                value={selectedOrg.planId || 'PLN-PRO'} 
                onChange={(e) => {
                  const targetPlan = plans.find(p => p.id === e.target.value);
                  setSelectedOrg({ ...selectedOrg, planId: e.target.value, planName: targetPlan?.name || 'Professional Pro' });
                }}
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (월 ₩{p.monthlyFee.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>팀원 허용 라이선스 수 변경 (0.1초 완료):</label>
              <input 
                type="number"
                defaultValue={selectedOrg.seatsAllowed || 30}
                onChange={(e) => {}}
              />
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerPlanSeatsRace(selectedOrg)}>
                요금제 변경 후 즉시 라이선스 수 수정 (Error 1)
              </button>
              <small className="warn-desc">* 요금제 변경(3초 지연) 직후 라이선스 수 변경(0.1초 완료) 시, 3초 뒤 이전 라이선스 수 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelRefreshConflict(selectedOrg)}>
                ⚡ 구독 취소 후 사용량 갱신 연쇄 호출 (Error 2)
              </button>
              <small className="warn-desc">* 구독 취소(0.5초 완료) 직후 사용량 갱신(4초 지연 완료) 시, 늦은 사용량 갱신 요청이 취소된 구독을 ACTIVE 활성 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 구독 조직 항목을 선택하세요.</div>
        )}
      </div>

      {/* Org Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>🏢 조직 결제 기본 정보 수정 (Error 8)</h3>
        {selectedOrg ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>조직명:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>청구 이메일 (부분저장 미반영):</label>
              <input type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>사업자 등록번호:</label>
              <input type="text" value={bizRegNo} onChange={(e) => setBizRegNo(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialOrgSave(selectedOrg.id, name, billingEmail, bizRegNo)}
            >
              조직 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 조직명/청구이메일/사업자번호를 동시에 수정하면 백엔드에는 청구이메일만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 조직을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
