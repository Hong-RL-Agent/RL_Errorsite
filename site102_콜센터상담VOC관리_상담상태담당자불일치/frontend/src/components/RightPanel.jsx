import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedCall,
  setSelectedCall,
  agents,
  customers,
  triggerStatusAgentRace,
  triggerCompleteReopenConflict,
  triggerPartialCustomerSave
}) {
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('VIP');
  const [recentInquiry, setRecentInquiry] = useState('');

  const targetCustomer = customers.find(c => c.id === selectedCall?.customerId) || customers[0];

  useEffect(() => {
    if (targetCustomer) {
      setPhone(targetCustomer.phone || '');
      setTier(targetCustomer.tier || 'VIP');
      setRecentInquiry(targetCustomer.recentInquiry || '');
    }
  }, [targetCustomer]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Call Status & Assigned Agent Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>📞 상담 상태 & 담당 상담원 배정 관제</h3>
        {selectedCall ? (
          <div className="detail-panel">
            <p>상담 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedCall.id}</strong></p>
            <p>고객명: <strong>{selectedCall.customerName} 고객</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedCall.status.toLowerCase()}`}>{selectedCall.status}</span></p>

            <div className="form-group">
              <label>담당 상담원 배정 변경 (0.1초 완료):</label>
              <select 
                value={selectedCall.agentName || '김상담 (수석 상담원)'} 
                onChange={(e) => setSelectedCall({ ...selectedCall, agentName: e.target.value })}
              >
                {agents.map(agt => (
                  <option key={agt.id} value={agt.name}>{agt.name} ({agt.team})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>상담 상태 처리중 변경 (Error 1 - 3초 지연):</label>
              <select 
                value={selectedCall.status || 'NEW'} 
                onChange={(e) => setSelectedCall({ ...selectedCall, status: e.target.value })}
              >
                <option value="NEW">신규</option>
                <option value="UNASSIGNED">배정대기</option>
                <option value="IN_PROGRESS">처리중 (Error 1 - 3초 지연)</option>
                <option value="PENDING">보류</option>
                <option value="COMPLETED">완료</option>
                <option value="REOPENED">재문의</option>
              </select>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerStatusAgentRace(selectedCall)}>
                상태 변경 후 즉시 담당자 변경 (Error 1)
              </button>
              <small className="warn-desc">* 상태 변경(3초 지연) 직후 담당자 변경(0.1초 완료) 시, 3초 뒤 이전 담당자 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCompleteReopenConflict(selectedCall)}>
                ⚡ 상담 완료 처리 후 재문의 연쇄 등록 (Error 2)
              </button>
              <small className="warn-desc">* 상담 완료(0.5초 완료) 직후 고객 재문의 등록(4초 지연 완료) 시, 늦은 재문의 요청이 완료된 상담을 IN_PROGRESS 처리중 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 콜센터 상담 항목을 선택하세요.</div>
        )}
      </div>

      {/* Customer Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>👤 고객 인적 정보 수정 (Error 8)</h3>
        {targetCustomer ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>고객 등급 (부분저장 미반영):</label>
              <select value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="VIP">VIP (최우수)</option>
                <option value="GOLD">GOLD (우수)</option>
                <option value="SILVER">SILVER (일반)</option>
                <option value="BRONZE">BRONZE (신규)</option>
              </select>
            </div>

            <div className="form-group">
              <label>최근 문의 요약:</label>
              <input type="text" value={recentInquiry} onChange={(e) => setRecentInquiry(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialCustomerSave(targetCustomer.id, phone, tier, recentInquiry)}
            >
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 연락처/등급/최근문의를 동시에 수정하면 백엔드에는 등급만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 고객을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
