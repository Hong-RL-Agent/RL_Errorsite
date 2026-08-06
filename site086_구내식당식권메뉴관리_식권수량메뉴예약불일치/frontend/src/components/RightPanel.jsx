import React from 'react';

export default function RightPanel({
  selectedReservation,
  setSelectedReservation,
  triggerQuantityMenuRace,
  menus,
  triggerCancelTicketConflict
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <!-- Reservation Menu & Quantity adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>🍱 예약 수량 & 메뉴 항목 변경</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>예약 ID: <strong>{selectedReservation.id}</strong> ({selectedReservation.empName} 사원)</p>

            <div className="form-group">
              <label>메뉴 선택 변경:</label>
              <select 
                value={selectedReservation.menuId || 'MNU-101'} 
                onChange={(e) => {
                  const m = menus.find(mn => mn.id === e.target.value);
                  setSelectedReservation({ ...selectedReservation, menuId: e.target.value, menuName: m?.name || '' });
                }}
              >
                {menus.map(mn => (
                  <option key={mn.id} value={mn.id}>{mn.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>예약 수량 변경:</label>
              <div className="input-row">
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={selectedReservation.quantity || 1} 
                  onChange={(e) => setSelectedReservation({ ...selectedReservation, quantity: parseInt(e.target.value) })}
                />
                <button className="save-btn" onClick={() => triggerQuantityMenuRace(selectedReservation)}>
                  수량 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 수량 변경(3초 지연 완료) 직후 메뉴 변경(0.1초 완료) 시, 3초 뒤 이전 메뉴가 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-res-btn" onClick={() => triggerCancelTicketConflict(selectedReservation)}>
                ⚡ 예약 취소 후 식권 사용 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 식권 사용(4초 지연 완료) 시, 늦은 식권 사용 요청이 취소된 예약을 다시 사용완료 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 예약 항목을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
