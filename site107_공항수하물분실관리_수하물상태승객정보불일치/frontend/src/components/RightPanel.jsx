import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedBaggage,
  setSelectedBaggage,
  staffs,
  passengers,
  triggerStatusHandlerRace,
  triggerCancelLocationConflict,
  triggerPartialPassengerSave
}) {
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [requests, setRequests] = useState('');

  const targetPassenger = passengers.find(p => p.id === selectedBaggage?.passengerId) || passengers[0];

  useEffect(() => {
    if (targetPassenger) {
      setPhone(targetPassenger.phone || '');
      setDeliveryAddress(targetPassenger.deliveryAddress || '');
      setRequests(targetPassenger.requests || '');
    }
  }, [targetPassenger]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Baggage Status & Staff Handler Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🧳 수하물 상태 & 담당 핸들러 관제</h3>
        {selectedBaggage ? (
          <div className="detail-panel">
            <p>수하물 ID: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedBaggage.id}</strong> ({selectedBaggage.tagNo})</p>
            <p>승객명: <strong>{selectedBaggage.passengerName} 승객 ({selectedBaggage.flightNo})</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedBaggage.status.toLowerCase()}`}>{selectedBaggage.status}</span></p>

            <div className="form-group">
              <label>담당 핸들러 변경 (0.1초 완료):</label>
              <select 
                value={selectedBaggage.handlerName || '김수하 (수석 핸들러)'} 
                onChange={(e) => setSelectedBaggage({ ...selectedBaggage, handlerName: e.target.value })}
              >
                {staffs.map(stf => (
                  <option key={stf.id} value={stf.name}>{stf.name} ({stf.dept})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>수하물 상태 지연 변경 (Error 1 - 3초 지연):</label>
              <select 
                value={selectedBaggage.status || 'IN_TRANSIT'} 
                onChange={(e) => setSelectedBaggage({ ...selectedBaggage, status: e.target.value })}
              >
                <option value="RECEIVED">접수</option>
                <option value="LOADING">적재중</option>
                <option value="IN_TRANSIT">운송중</option>
                <option value="ARRIVED">도착</option>
                <option value="CLAIMED">수취완료</option>
                <option value="DELAYED">지연 (Error 1 - 3초 지연)</option>
                <option value="LOST_REPORTED">분실신고</option>
              </select>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerStatusHandlerRace(selectedBaggage)}>
                상태 변경 후 즉시 담당 직원의 변경 (Error 1)
              </button>
              <small className="warn-desc">* 상태 변경(3초 지연) 직후 담당자 변경(0.1초 완료) 시, 3초 뒤 이전 담당자 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelLocationConflict(selectedBaggage)}>
                ⚡ 분실 신고 취소 후 위치 갱신 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 신고 취소(0.5초 완료) 직후 위치 갱신(4초 지연 완료) 시, 늦은 위치 갱신이 취소된 신고를 LOST_REPORTED 분실신고 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 공항 수하물 항목을 선택하세요.</div>
        )}
      </div>

      {/* Passenger Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>👤 승객 수령 주소 및 요청사항 수정 (Error 8)</h3>
        {targetPassenger ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>수령 주소 (부분저장 미반영):</label>
              <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label>특별 요청사항:</label>
              <input type="text" value={requests} onChange={(e) => setRequests(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialPassengerSave(targetPassenger.id, phone, deliveryAddress, requests)}
            >
              승객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 연락처/수령주소/요청사항을 동시에 수정하면 백엔드에는 수령주소만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 승객을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
