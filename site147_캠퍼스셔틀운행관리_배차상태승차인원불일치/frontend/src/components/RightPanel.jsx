import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedSchedule, setSelectedSchedule, schedules, buses, triggerStatusPassengerRace, triggerCancelBoardingConflict, triggerPartialSave }) {
  const [busNo, setBusNo] = useState('');
  const [seatCapacity, setSeatCapacity] = useState(45);
  const [driverName, setDriverName] = useState('박기사');
  const [passengerCount, setPassengerCount] = useState(42);

  const target = selectedSchedule || schedules[0];
  const targetBus = buses.find(b => b.busNo.includes(target?.busNo?.split(' ')[0] || '')) || buses[0];

  useEffect(() => {
    if (target) {
      setPassengerCount(target.passengerCount || 42);
    }
    if (targetBus) {
      setBusNo(targetBus.busNo || '');
      setSeatCapacity(targetBus.seatCapacity || 45);
      setDriverName(targetBus.driverName || '박기사');
    }
  }, [target, targetBus]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚌 배차 상태 & 승차 인원 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>배차 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.schCode}</strong></p>
            <p>노선 명칭: <span className="route-badge">{target.routeName}</span></p>
            <p>차량번호: <strong>{target.busNo}</strong> | 기사: <strong>{target.driverName}</strong></p>
            <p>시간: <small>{target.departureTime} ~ {target.arrivalTime}</small></p>
            <p>승차 인원: <strong style={{ color: 'var(--color-warning)' }}>{target.passengerCount}명</strong> / 정원 {target.seatCapacity}석</p>
            <p>혼잡도: <strong style={{ color: 'var(--color-success)' }}>{target.congestion}</strong></p>
            <p>배차 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>승차 인원 수정 (0.1초 완료):</label>
              <input type="number" value={passengerCount} onChange={(e) => setPassengerCount(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>배차 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_SERVICE'} onChange={(e) => setSelectedSchedule({ ...target, status: e.target.value })}>
                <option value="SCHEDULED">배차완료 (SCHEDULED)</option>
                <option value="IN_SERVICE">운행중 (IN_SERVICE)</option>
                <option value="COMPLETED">운행완료 (COMPLETED)</option>
                <option value="DELAYED">지연운행 (DELAYED)</option>
                <option value="CANCELLED">운행취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusPassengerRace(target.id, target, passengerCount)}>
              운행중 변경 + 즉시 승차인원 수정 (Error 1)
            </button>
            <small className="warn-desc">* 운행중 변경(3초 지연) 직후 승차인원 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 승차인원을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelBoardingConflict(target.id)}>
                ⚡ 운행 취소 후 승차 기록 등록 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 운행 취소(0.5초 완료) 직후 승차 기록 등록(4초 지연 완료) 시, 취소된 운행이 COMPLETED(운행완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 배차를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 셔틀버스 정보 수정 (Error 8)</h3>
        {targetBus ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>차량 번호:</label>
              <input type="text" value={busNo} onChange={(e) => setBusNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>담당 기사:</label>
              <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>좌석 수 (부분 저장 미반영):</label>
              <input type="number" value={seatCapacity} onChange={(e) => setSeatCapacity(Number(e.target.value))} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetBus.id, busNo, seatCapacity, driverName)}>
              버스 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 차량번호/담당기사/좌석수 동시 수정 시 좌석수만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 버스를 선택하세요.</div>}
      </div>
    </aside>
  );
}
