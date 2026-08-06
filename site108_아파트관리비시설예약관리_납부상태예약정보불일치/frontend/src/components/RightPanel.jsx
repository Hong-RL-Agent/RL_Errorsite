import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedReservation,
  setSelectedReservation,
  units,
  bills,
  triggerTimeAttendeesRace,
  triggerCancelPaymentConflict,
  triggerPartialUnitSave
}) {
  const [phone, setPhone] = useState('');
  const [carNo, setCarNo] = useState('');
  const [note, setNote] = useState('');

  const targetUnit = units.find(u => u.id === selectedReservation?.unitId) || units[0];

  useEffect(() => {
    if (targetUnit) {
      setPhone(targetUnit.phone || '');
      setCarNo(targetUnit.carNo || '');
      setNote(targetUnit.note || '');
    }
  }, [targetUnit]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Facility Reservation Time & Attendees Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🏊 공용시설 예약 시간 & 이용 인원 관제</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>예약 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedReservation.id}</strong></p>
            <p>세대/예약자: <strong>{selectedReservation.building} {selectedReservation.room} ({selectedReservation.residentName})</strong></p>
            <p>시설: <strong>{selectedReservation.facilityType}</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedReservation.status.toLowerCase()}`}>{selectedReservation.status}</span></p>

            <div className="form-group">
              <label>이용 인원 변경 (0.1초 완료):</label>
              <input 
                type="number" 
                value={selectedReservation.attendees || 1} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, attendees: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>예약 시간대 변경 (Error 1 - 3초 지연):</label>
              <input 
                type="text" 
                value={selectedReservation.resTime || '19:00~21:00'} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, resTime: e.target.value })}
              />
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerTimeAttendeesRace(selectedReservation)}>
                예약 시간 변경 후 즉시 이용 인원 변경 (Error 1)
              </button>
              <small className="warn-desc">* 시간 변경(3초 지연) 직후 이용 인원 변경(0.1초 완료) 시, 3초 뒤 이전 인원 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelPaymentConflict(selectedReservation)}>
                ⚡ 시설 예약 취소 후 관리비 납부 갱신 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 납부 갱신(4초 지연 완료) 시, 늦은 납부 요청이 취소된 시설 예약을 CONFIRMED 예약완료 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 공용시설 예약 항목을 선택하세요.</div>
        )}
      </div>

      {/* Household Unit Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>🏢 세대 연락처 & 등록 차량 수정 (Error 8)</h3>
        {targetUnit ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>등록 차량번호 (부분저장 미반영):</label>
              <input type="text" value={carNo} onChange={(e) => setCarNo(e.target.value)} />
            </div>

            <div className="form-group">
              <label>특이사항 메모:</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialUnitSave(targetUnit.id, phone, carNo, note)}
            >
              세대 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 연락처/차량번호/메모를 동시에 수정하면 백엔드에는 차량번호만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 세대를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
