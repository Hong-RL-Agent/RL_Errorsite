import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedRental, setSelectedRental, rentals, equipments, triggerStatusTimeRace, triggerCancelReturnConflict, triggerPartialSave }) {
  const [equipmentName, setEquipmentName] = useState('');
  const [safetyGrade, setSafetyGrade] = useState('A (최우수)');
  const [storageLocation, setStorageLocation] = useState('해운대 A선착장 03번 계류장');
  const [returnTime, setReturnTime] = useState('2026-08-05 17:00');

  const target = selectedRental || rentals[0];
  const targetEquipment = equipments.find(e => e.equipmentName === target?.equipmentName) || equipments[0];

  useEffect(() => {
    if (target) {
      setReturnTime(target.returnTime || '2026-08-05 17:00');
    }
    if (targetEquipment) {
      setEquipmentName(targetEquipment.equipmentName || '');
      setSafetyGrade(targetEquipment.safetyGrade || 'A (최우수)');
      setStorageLocation(targetEquipment.storageLocation || '해운대 A선착장 03번 계류장');
    }
  }, [target, targetEquipment]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🏄 대여 상태 & 반납 예정 시간 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>대여 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.rentalCode}</strong></p>
            <p>마리나 지점: <span className="branch-badge">{target.branchName}</span></p>
            <p>대여 장비명: <strong>{target.equipmentName}</strong></p>
            <p>이용 고객: <strong>{target.customerName}</strong>님 | 계류장: <small>{target.storageLocation}</small></p>
            <p>시작 시간: <small>{target.startTime}</small> | 대여료: <strong style={{ color: 'var(--color-success)' }}>{target.feeWon.toLocaleString()}원</strong></p>
            <p>반납 예정 시각: <strong style={{ color: 'var(--color-warning)' }}>{target.returnTime}</strong></p>
            <p>장비 대여 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>반납 예정 시각 변경 (0.1초 완료):</label>
              <input type="text" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
            </div>

            <div className="form-group">
              <label>장비 대여 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_USE'} onChange={(e) => setSelectedRental({ ...target, status: e.target.value })}>
                <option value="RESERVED">예약완료 (RESERVED)</option>
                <option value="IN_USE">대여중 (IN_USE)</option>
                <option value="INSPECTING">반납검수 (INSPECTING)</option>
                <option value="COMPLETED">반납완료 (COMPLETED)</option>
                <option value="CANCELLED">대여취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusTimeRace(target.id, target, returnTime)}>
              대여중 변경 + 즉시 반납 예정 시간 수정 (Error 1)
            </button>
            <small className="warn-desc">* 대여중 변경(3초 지연) 직후 반납 예정 시간 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 반납 시간을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelReturnConflict(target.id)}>
                ⚡ 대여 취소 후 반납 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 대여 취소(0.5초 완료) 직후 반납 완료(4초 지연 완료) 시, 취소된 대여가 COMPLETED(반납완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 대여건을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 해양 장비 정보 수정 (Error 8)</h3>
        {targetEquipment ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>장비 명칭:</label>
              <input type="text" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>안전 등급:</label>
              <input type="text" value={safetyGrade} onChange={(e) => setSafetyGrade(e.target.value)} />
            </div>
            <div className="form-group">
              <label>보관위치 계류장 (부분 저장 미반영):</label>
              <input type="text" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetEquipment.id, equipmentName, storageLocation, safetyGrade)}>
              장비 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 장비명/안전등급/보관위치 동시 수정 시 보관위치만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 장비를 선택하세요.</div>}
      </div>
    </aside>
  );
}
