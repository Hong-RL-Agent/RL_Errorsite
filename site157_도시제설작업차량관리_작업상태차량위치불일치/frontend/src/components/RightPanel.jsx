import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedTask, setSelectedTask, tasks, vehicles, triggerStatusLocationRace, triggerCancelSaltConflict, triggerPartialSave }) {
  const [vehicleNo, setVehicleNo] = useState('');
  const [assignedZone, setAssignedZone] = useState('강남권역 제설1구역 (테헤란로/강남대로)');
  const [equipmentStatus, setEquipmentStatus] = useState('NORMAL (정상작동)');
  const [currentLocation, setCurrentLocation] = useState('테헤란로 역삼역 사거리 (101km/h 구역)');

  const target = selectedTask || tasks[0];
  const targetVehicle = vehicles.find(v => v.vehicleNo === target?.vehicleNo) || vehicles[0];

  useEffect(() => {
    if (target) {
      setCurrentLocation(target.currentLocation || '테헤란로 역삼역 사거리 (101km/h 구역)');
    }
    if (targetVehicle) {
      setVehicleNo(targetVehicle.vehicleNo || '');
      setAssignedZone(targetVehicle.assignedZone || '강남권역 제설1구역 (테헤란로/강남대로)');
      setEquipmentStatus(targetVehicle.equipmentStatus || 'NORMAL (정상작동)');
    }
  }, [target, targetVehicle]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚛 제설 상태 & 차량 위치 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>작업 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.taskCode}</strong></p>
            <p>제설 구역: <span className="zone-badge">{target.zoneName}</span></p>
            <p>투입 차량: <strong>{target.vehicleNo}</strong></p>
            <p>담당 운전원: <strong>{target.workerName}</strong> | 긴급도: <small>{target.priority}</small></p>
            <p>시작 시간: <small>{target.startTime}</small> | 염화칼슘: <strong style={{ color: 'var(--color-success)' }}>{target.saltAmountKg}kg</strong></p>
            <p>GPS 현재 위치: <strong style={{ color: 'var(--color-warning)' }}>{target.currentLocation}</strong></p>
            <p>작업 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>차량 실시간 GPS 위치 수정 (0.1초 완료):</label>
              <input type="text" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} />
            </div>

            <div className="form-group">
              <label>제설 작업 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_PROGRESS'} onChange={(e) => setSelectedTask({ ...target, status: e.target.value })}>
                <option value="PENDING">대기중 (PENDING)</option>
                <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                <option value="SALTING">염포작업 (SALTING)</option>
                <option value="COMPLETED">작업완료 (COMPLETED)</option>
                <option value="CANCELLED">작업취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusLocationRace(target.id, target, currentLocation)}>
              진행중 변경 + 즉시 차량 위치 수정 (Error 1)
            </button>
            <small className="warn-desc">* 진행중 변경(3초 지연) 직후 차량 위치 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 차량 위치를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelSaltConflict(target.id)}>
                ⚡ 작업 취소 후 염화칼슘 사용량 등록 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 작업 취소(0.5초 완료) 직후 사용량 등록(4초 지연 완료) 시, 취소된 작업이 COMPLETED(작업완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 작업을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 제설 차량 정보 수정 (Error 8)</h3>
        {targetVehicle ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>투입 차량번호:</label>
              <input type="text" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>제설 장비 상태:</label>
              <input type="text" value={equipmentStatus} onChange={(e) => setEquipmentStatus(e.target.value)} />
            </div>
            <div className="form-group">
              <label>배정 구역명 (부분 저장 미반영):</label>
              <input type="text" value={assignedZone} onChange={(e) => setAssignedZone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetVehicle.id, vehicleNo, assignedZone, equipmentStatus)}>
              차량 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 차량번호/장비상태/담당구역 동시 수정 시 담당구역만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 차량을 선택하세요.</div>}
      </div>
    </aside>
  );
}
