import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedPass, setSelectedPass, passes, passengers, triggerStatusSeatRace, triggerCancelCompleteConflict, triggerPartialSave }) {
  const [passengerName, setPassengerName] = useState('');
  const [flightNo, setFlightNo] = useState('KE-081 (인천 -> 뉴욕 JFK)');
  const [seatNo, setSeatNo] = useState('A-12 (싱글 프라이빗 리클라이너)');

  const target = selectedPass || passes[0];
  const targetPassenger = passengers.find(p => p.passengerName === target?.passengerName) || passengers[0];

  useEffect(() => {
    if (target) {
      setSeatNo(target.seatNo || 'A-12 (싱글 프라이빗 리클라이너)');
    }
    if (targetPassenger) {
      setPassengerName(targetPassenger.passengerName || '');
      setFlightNo(targetPassenger.flightNo || 'KE-081 (인천 -> 뉴욕 JFK)');
      setSeatNo(targetPassenger.seatNo || 'A-12 (싱글 프라이빗 리클라이너)');
    }
  }, [target, targetPassenger]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>✈️ 이용 상태 & 좌석 배정 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>이용권 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.passCode}</strong></p>
            <p>터미널 라운지: <span className="terminal-badge">{target.terminal}</span></p>
            <p>승객 성명: <strong>{target.passengerName}</strong>님</p>
            <p>탑승 항공편: <small>{target.flightNo}</small> | 등급: <strong style={{ color: 'var(--color-warning)' }}>{target.tier}</strong></p>
            <p>만료 예정일시: <small>{target.expireTime}</small> | 이용료: <strong style={{ color: 'var(--color-success)' }}>{target.feeWon.toLocaleString()}원</strong></p>
            <p>현재 배정 좌석: <strong style={{ color: 'var(--color-warning)' }}>{target.seatNo}</strong></p>
            <p>라운지 이용 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>좌석 번호 변경 (0.1초 완료):</label>
              <input type="text" value={seatNo} onChange={(e) => setSeatNo(e.target.value)} />
            </div>

            <div className="form-group">
              <label>라운지 이용 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_USE'} onChange={(e) => setSelectedPass({ ...target, status: e.target.value })}>
                <option value="ISSUED">발급완료 (ISSUED)</option>
                <option value="CHECKED_IN">체크인 (CHECKED_IN)</option>
                <option value="IN_USE">이용중 (IN_USE)</option>
                <option value="COMPLETED">이용완료 (COMPLETED)</option>
                <option value="CANCELLED">이용취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusSeatRace(target.id, target, seatNo)}>
              이용중 변경 + 즉시 좌석 번호 수정 (Error 1)
            </button>
            <small className="warn-desc">* 이용중 변경(3초 지연) 직후 좌석 번호 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 좌석 번호를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCompleteConflict(target.id)}>
                ⚡ 체크인 취소 후 이용 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 체크인 취소(0.5초 완료) 직후 이용 완료(4초 지연 완료) 시, 취소된 체크인이 COMPLETED(이용완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 이용권을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 승객 정보 수정 (Error 8)</h3>
        {targetPassenger ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>승객 성명:</label>
              <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>배정 좌석번호:</label>
              <input type="text" value={seatNo} onChange={(e) => setSeatNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>탑승 항공편 (부분 저장 미반영):</label>
              <input type="text" value={flightNo} onChange={(e) => setFlightNo(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetPassenger.id, passengerName, flightNo, seatNo)}>
              승객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/좌석번호/항공편 동시 수정 시 항공편만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 승객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
