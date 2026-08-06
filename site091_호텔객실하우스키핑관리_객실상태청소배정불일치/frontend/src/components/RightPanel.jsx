import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedRoom,
  setSelectedRoom,
  staffList,
  triggerStatusStaffRace,
  triggerCheckoutCleaningConflict,
  triggerPartialRoomSave
}) {
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState(0);
  const [cleaningNote, setCleaningNote] = useState('');

  useEffect(() => {
    if (selectedRoom) {
      setRoomType(selectedRoom.type || '');
      setPrice(selectedRoom.price || 0);
      setCleaningNote(selectedRoom.cleaningNote || '');
    }
  }, [selectedRoom]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Room Status & Housekeeping Assignment Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🧹 객실 상태 & 하우스키핑 담당 배정</h3>
        {selectedRoom ? (
          <div className="detail-panel">
            <p>객실 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedRoom.id}호</strong> ({selectedRoom.floor}층)</p>
            <p>객실 타입: <strong>{selectedRoom.type}</strong> (₩{selectedRoom.price?.toLocaleString()})</p>
            <p>현재 상태: <strong className={`status-badge ${selectedRoom.status.toLowerCase()}`}>{selectedRoom.status}</strong></p>
            <p>현재 담당: <strong>{selectedRoom.cleanerName}</strong></p>

            <div className="form-group">
              <label>하우스키핑 담당 직원 변경:</label>
              <select 
                value={selectedRoom.cleanerId || 'STF-01'} 
                onChange={(e) => {
                  const s = staffList.find(st => st.id === e.target.value);
                  setSelectedRoom({
                    ...selectedRoom,
                    cleanerId: e.target.value,
                    cleanerName: s ? s.name : selectedRoom.cleanerName
                  });
                }}
              >
                {staffList.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.shift})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>객실 상태 변경 선택:</label>
              <div className="input-row">
                <select 
                  value={selectedRoom.status || 'CHECKED_IN'} 
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, status: e.target.value })}
                >
                  <option value="CLEANING">CLEANING (청소중)</option>
                  <option value="CLEANED">CLEANED (청소완료)</option>
                  <option value="CHECKED_IN">CHECKED_IN (체크인)</option>
                  <option value="CHECKED_OUT">CHECKED_OUT (체크아웃)</option>
                  <option value="INSPECTION_NEEDED">INSPECTION_NEEDED (점검필요)</option>
                  <option value="RESERVED">RESERVED (예약중)</option>
                </select>
                <button className="save-btn" onClick={() => triggerStatusStaffRace(selectedRoom)}>
                  상태 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 상태 변경(3초 지연) 직후 직원 변경(0.1초 완료) 시, 3초 뒤 구 DB 스냅샷이 이전 직원으로 덮어써 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCheckoutCleaningConflict(selectedRoom)}>
                ⚡ 체크아웃 처리 후 청소 완료 승인 (Error 2)
              </button>
              <small className="warn-desc">* 체크아웃(0.5초 완료) 직후 청소 완료(4초 지연 완료) 시, 늦은 청소 완료 요청이 객실을 체크인 상태로 다시 바꿔버림 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 객실 항목을 선택하세요.</div>
        )}
      </div>

      {/* Room Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>🏨 객실 정보 및 숙박료 수정 (Error 8)</h3>
        {selectedRoom ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>객실 타입:</label>
              <input type="text" value={roomType} onChange={(e) => setRoomType(e.target.value)} />
            </div>

            <div className="form-group">
              <label>숙박 가격 (1박/원 - 부분저장 미반영):</label>
              <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0'))} />
            </div>

            <div className="form-group">
              <label>청소 및 특이 메모:</label>
              <input type="text" value={cleaningNote} onChange={(e) => setCleaningNote(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialRoomSave(selectedRoom.id, roomType, price, cleaningNote)}
            >
              객실 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 객실타입/숙박가격/청소메모를 동시에 수정하면 백엔드에는 가격만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 객실을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
