import React from 'react';

export default function RightPanel({
  selectedReservation,
  setSelectedReservation,
  triggerTimeEquipmentRace,
  equipments,
  triggerCancelReturnConflict
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <!-- Reservation Time & Equipment adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>⏰ 회의실 예약 시간 & 신청 장비 변경</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>예약 ID: <strong>{selectedReservation.id}</strong> ({selectedReservation.empName} 사원)</p>
            <p>회의실: <strong>{selectedReservation.roomName}</strong></p>

            <div className="form-group">
              <label>추가 신청 장비 선택:</label>
              <select 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !selectedReservation.equipments?.includes(val)) {
                    setSelectedReservation({ ...selectedReservation, equipments: [...(selectedReservation.equipments || []), val] });
                  }
                }}
              >
                <option value="">장비 선택...</option>
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.name}>{eq.name}</option>
                ))}
              </select>
              <small>현재 선택 장비: {selectedReservation.equipments?.join(', ') || '없음'}</small>
            </div>

            <div className="form-group">
              <label>예약 시간대 조정:</label>
              <div className="input-row">
                <input 
                  type="date" 
                  value={selectedReservation.date || '2026-08-10'} 
                  onChange={(e) => setSelectedReservation({ ...selectedReservation, date: e.target.value })}
                />
                <select 
                  value={selectedReservation.timeSlot || '10:00-12:00'} 
                  onChange={(e) => setSelectedReservation({ ...selectedReservation, timeSlot: e.target.value })}
                >
                  <option value="09:00-10:00">09:00-10:00</option>
                  <option value="10:00-12:00">10:00-12:00</option>
                  <option value="13:00-15:00">13:00-15:00</option>
                  <option value="15:00-17:00">15:00-17:00</option>
                </select>
                <button className="save-btn" onClick={() => triggerTimeEquipmentRace(selectedReservation)}>
                  시간 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 시간 변경(3초 지연 완료) 직후 장비 추가(0.1초 완료) 시, 3초 뒤 이전 장비 목록이 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-res-btn" onClick={() => triggerCancelReturnConflict(selectedReservation)}>
                ⚡ 예약 취소 후 장비 반납 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 장비 반납(4초 지연 완료) 시, 늦은 반납 요청이 취소된 예약을 다시 사용완료 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 예약 항목을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
