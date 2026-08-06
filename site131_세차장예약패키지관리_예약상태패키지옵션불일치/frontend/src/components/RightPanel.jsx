import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedBooking, setSelectedBooking, bookings, packages, vehicles, triggerStatusOptionsRace, triggerCancelWorkConflict, triggerPartialSave }) {
  const [carNo, setCarNo] = useState('');
  const [carType, setCarType] = useState('');
  const [phone, setPhone] = useState('');
  const [packageName, setPackageName] = useState('');
  const [options, setOptions] = useState('');
  const [totalFeeWon, setTotalFeeWon] = useState(210000);

  const target = selectedBooking || bookings[0];

  useEffect(() => {
    if (target) {
      setPackageName(target.packageName || '');
      setOptions(target.options || '');
      setTotalFeeWon(target.totalFeeWon || 210000);
      const vhc = vehicles.find(v => v.carNo === target.carNo);
      if (vhc) {
        setCarNo(vhc.carNo || '');
        setCarType(vhc.carType || '');
        setPhone(vhc.phone || '');
      }
    }
  }, [target, vehicles]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚙 세차 예약 & 패키지 옵션 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>차량번호: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.carNo}</strong> ({target.carType})</p>
            <p>고객명: <strong>{target.ownerName}</strong> | 입고지점: <strong>{target.branchName}</strong></p>
            <p>선택 패키지: <strong>{target.packageName}</strong></p>
            <p>추가 옵션: <strong style={{ color: 'var(--color-warning)' }}>{target.options}</strong></p>
            <p>결제 금액: <strong style={{ color: 'var(--color-success)' }}>{target.totalFeeWon.toLocaleString()}원</strong></p>
            <p>예약/작업 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>세차 패키지 변경 (0.1초 완료):</label>
              <select value={packageName} onChange={(e) => {
                setPackageName(e.target.value);
                const p = packages.find(x => x.packageName === e.target.value);
                if (p) setTotalFeeWon(p.priceWon);
              }}>
                {packages.map(p => <option key={p.id} value={p.packageName}>{p.packageName} ({p.priceWon.toLocaleString()}원)</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>추가 세차 옵션:</label>
              <input type="text" value={options} onChange={(e) => setOptions(e.target.value)} />
            </div>

            <div className="form-group">
              <label>예약/작업 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_PROGRESS'} onChange={(e) => setSelectedBooking({ ...target, status: e.target.value })}>
                <option value="PENDING">예약대기 (PENDING)</option>
                <option value="IN_PROGRESS">작업중 (IN_PROGRESS)</option>
                <option value="COMPLETED">작업완료 (COMPLETED)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
                <option value="REFUNDED">환불됨 (REFUNDED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusOptionsRace(target.id, target, packageName, options, totalFeeWon)}>
              작업중 변경 + 즉시 패키지 옵션 변경 (Error 1)
            </button>
            <small className="warn-desc">* 작업중 변경(3초 지연) 직후 패키지 옵션 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 옵션을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelWorkConflict(target.id)}>
                ⚡ 예약 취소 후 작업 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 작업 완료(4초 지연 완료) 시, 취소된 예약이 COMPLETED(작업완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 예약을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 고객 차량 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>차량번호:</label>
              <input type="text" value={carNo} onChange={(e) => setCarNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>차종 (부분 저장 미반영):</label>
              <input type="text" value={carType} onChange={(e) => setCarType(e.target.value)} />
            </div>
            <div className="form-group">
              <label>고객 연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => {
              const vhc = vehicles.find(v => v.carNo === target.carNo) || vehicles[0];
              if (vhc) triggerPartialSave(vhc.id, carNo, carType, phone);
            }}>
              차량 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 차량번호/차종/연락처 동시 수정 시 차종만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 차량을 선택하세요.</div>}
      </div>
    </aside>
  );
}
