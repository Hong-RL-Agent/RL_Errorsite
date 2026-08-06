import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedBooking, setSelectedBooking, bookings, seats, customers, triggerStatusSeatRace, triggerCancelKitReadyConflict, triggerPartialSave }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredWine, setPreferredWine] = useState('풀바디 레드 와인 (Cabernet)');
  const [seatNo, setSeatNo] = useState('VIP 테이블 A-1 (메인 오크관)');

  const target = selectedBooking || bookings[0];
  const targetCustomer = customers.find(c => c.customerName === target?.customerName) || customers[0];

  useEffect(() => {
    if (target) {
      setSeatNo(target.seatNo || 'VIP 테이블 A-1 (메인 오크관)');
    }
    if (targetCustomer) {
      setCustomerName(targetCustomer.customerName || '');
      setPhone(targetCustomer.phone || '');
      setPreferredWine(targetCustomer.preferredWine || '풀바디 레드 와인 (Cabernet)');
    }
  }, [target, targetCustomer]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🍷 예약 상태 & 배정 좌석 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>예약 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.bookingCode}</strong></p>
            <p>클래스: <strong>{target.className}</strong></p>
            <p>고객 성명: <strong>{target.customerName}</strong>님</p>
            <p>수강 일자: <small>{target.classDate}</small> | 결제: <strong style={{ color: 'var(--color-success)' }}>{target.priceWon.toLocaleString()}원</strong></p>
            <p>배정 좌석: <span className="seat-badge">{target.seatNo}</span></p>
            <p>키트 상태: <strong style={{ color: 'var(--color-warning)' }}>{target.kitStatus}</strong></p>
            <p>예약 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배정 좌석 변경 (0.1초 완료):</label>
              <select value={seatNo} onChange={(e) => setSeatNo(e.target.value)}>
                {seats.map(s => <option key={s.id} value={s.seatNo}>{s.seatNo}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>예약 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'CONFIRMED'} onChange={(e) => setSelectedBooking({ ...target, status: e.target.value })}>
                <option value="PENDING">예약대기 (PENDING)</option>
                <option value="CONFIRMED">예약확정 (CONFIRMED)</option>
                <option value="KIT_READY">준비완료 (KIT_READY)</option>
                <option value="ATTENDED">참석완료 (ATTENDED)</option>
                <option value="CANCELLED">예약취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusSeatRace(target.id, target, seatNo)}>
              예약확정 변경 + 즉시 좌석 변경 (Error 1)
            </button>
            <small className="warn-desc">* 예약확정 변경(3초 지연) 직후 좌석 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 좌석을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelKitReadyConflict(target.id)}>
                ⚡ 예약 취소 후 키트 준비완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 키트 준비완료(4초 지연 완료) 시, 취소된 예약이 KIT_READY(준비완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 예약을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 수강 고객 정보 수정 (Error 8)</h3>
        {targetCustomer ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>고객 성명:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>선호 와인 스타일:</label>
              <input type="text" value={preferredWine} onChange={(e) => setPreferredWine(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetCustomer.id, customerName, phone, preferredWine)}>
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/선호와인/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 고객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
