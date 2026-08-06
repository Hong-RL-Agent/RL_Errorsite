import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedBooking,
  setSelectedBooking,
  hotels,
  flights,
  options,
  triggerHotelFlightRace,
  triggerCancelOptionConflict,
  triggerPartialTravelerSave,
  selectedUser
}) {
  const [passportName, setPassportName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  useEffect(() => {
    if (selectedUser) {
      setPassportName(selectedUser.passportName || '');
      setPhone(selectedUser.phone || '');
      setSpecialRequest(selectedBooking?.specialRequest || '창가석 배정 부탁드립니다.');
    }
  }, [selectedUser, selectedBooking]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Hotel & Flight Package Edit Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🧳 패키지 항공 & 숙소 구성 제어</h3>
        {selectedBooking ? (
          <div className="detail-panel">
            <p>예약 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedBooking.id}</strong> ({selectedBooking.destination})</p>
            <p>예약자: <strong>{selectedBooking.userName} 님</strong></p>

            <div className="form-group">
              <label>숙소 변경 (Error 1):</label>
              <select 
                value={selectedBooking.hotelId || 'HTL-301'} 
                onChange={(e) => {
                  const h = hotels.find(item => item.id === e.target.value);
                  setSelectedBooking({
                    ...selectedBooking,
                    hotelId: e.target.value,
                    hotelInfo: `${h?.name} - ${h?.pricePerNight.toLocaleString()}원/박`
                  });
                }}
              >
                {hotels.map(h => (
                  <option key={h.id} value={h.id}>{h.name} (₩{h.pricePerNight.toLocaleString()}/박)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>항공편 변경 (Error 1):</label>
              <select 
                value={selectedBooking.flightId || 'FLT-201'} 
                onChange={(e) => {
                  const f = flights.find(item => item.id === e.target.value);
                  setSelectedBooking({
                    ...selectedBooking,
                    flightId: e.target.value,
                    flightInfo: `${f?.airline} - ${f?.price.toLocaleString()}원`
                  });
                }}
              >
                {flights.map(f => (
                  <option key={f.id} value={f.id}>{f.airline} (₩{f.price.toLocaleString()})</option>
                ))}
              </select>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerHotelFlightRace(selectedBooking)}>
                항공/숙소 변경 확정 (Error 1)
              </button>
              <small className="warn-desc">* 숙소 변경(3초 지연) 직후 항공편 변경(0.1초 완료) 시, 3초 뒤 이전 항공편이 동봉된 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelOptionConflict(selectedBooking)}>
                ⚡ 예약 취소 후 여행 옵션 추가 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 옵션 추가(4초 지연 완료) 시, 늦은 옵션 추가 요청이 취소된 예약을 CONFIRMED 확정 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 패키지 예약 항목을 선택하세요.</div>
        )}
      </div>

      {/* Traveler Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>✈️ 예약자 여권 & 상세 정보 (Error 8)</h3>
        {selectedUser ? (
          <div className="detail-panel">
            <p>사용자 번호: <strong>{selectedUser.id}</strong> ({selectedUser.name})</p>

            <div className="form-group">
              <label>여권 영문명:</label>
              <input type="text" value={passportName} onChange={(e) => setPassportName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>연락처 (부분저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>특별 요청사항:</label>
              <input type="text" value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialTravelerSave(selectedBooking?.id || 'BKG-5001', passportName, phone, specialRequest)}
            >
              예약자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 영문명/연락처/요청사항을 동시에 수정하면 백엔드에는 연락처만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 여행자를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
