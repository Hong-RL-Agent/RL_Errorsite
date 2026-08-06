import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedSchedule, setSelectedSchedule, schedules, vehicles, zones, triggerStatusVehicleRace, triggerCancelComplaintConflict, triggerPartialSave }) {
  const [plateNumber, setPlateNumber] = useState('');
  const [zoneId, setZoneId] = useState('ZONE-01');
  const [maintenanceStatus, setMaintenanceStatus] = useState('NORMAL');

  const target = selectedSchedule || schedules[0];

  useEffect(() => {
    if (target) {
      const vec = vehicles.find(v => v.id === target.vehicleId) || vehicles[0];
      if (vec) {
        setPlateNumber(vec.plateNumber || '');
        setZoneId(vec.zoneId || 'ZONE-01');
        setMaintenanceStatus(vec.maintenanceStatus || 'NORMAL');
      }
    }
  }, [target, vehicles]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚛 수거 일정 상세 & 배차 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>구역 명칭: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.zoneName}</strong></p>
            <p>예정일: <strong>{target.scheduledDate} ({target.startTime}~{target.endTime})</strong></p>
            <p>배정 차량: <strong style={{ color: 'var(--color-success)' }}>{target.vehiclePlate}</strong></p>
            <p>민원 건수: <strong style={{ color: 'var(--color-warning)' }}>{target.complaintCount}건</strong></p>
            <p>수거 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배정 차량 변경 (0.1초 완료):</label>
              <select value={target.vehicleId || ''} onChange={(e) => {
                const v = vehicles.find(x => x.id === e.target.value);
                setSelectedSchedule({ ...target, vehicleId: e.target.value, vehiclePlate: v?.plateNumber || '' });
              }}>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} ({v.zoneName})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>수거 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_PROGRESS'} onChange={(e) => setSelectedSchedule({ ...target, status: e.target.value })}>
                <option value="PENDING">접수대기 (PENDING)</option>
                <option value="ASSIGNED">차량배정 (ASSIGNED)</option>
                <option value="IN_PROGRESS">수거진행중 (IN_PROGRESS)</option>
                <option value="COMPLETED">수거완료 (COMPLETED)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusVehicleRace(target.id, target)}>
              진행중 변경 + 즉시 차량 변경 (Error 1)
            </button>
            <small className="warn-desc">* 수거 상태 변경(3초 지연) 직후 차량 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 차량 배정을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelComplaintConflict(target.id)}>
                ⚡ 수거 취소 후 민원 처리완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 수거 취소(0.5초 완료) 직후 민원 처리완료(4초 지연 완료) 시, 취소된 수거가 COMPLETED(수거완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 수거 일정을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 청소 차량 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>차량 번호:</label>
              <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
            </div>
            <div className="form-group">
              <label>담당 구역 (부분 저장 미반영):</label>
              <select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>정비 상태:</label>
              <select value={maintenanceStatus} onChange={(e) => setMaintenanceStatus(e.target.value)}>
                <option value="NORMAL">정상 (NORMAL)</option>
                <option value="CHECK_REQ">정비요망 (CHECK_REQ)</option>
                <option value="REPAIRING">수리중 (REPAIRING)</option>
              </select>
            </div>
            <button className="save-btn" onClick={() => {
              const v = vehicles.find(x => x.id === target.vehicleId) || vehicles[0];
              if (v) triggerPartialSave(v.id, plateNumber, zoneId, maintenanceStatus);
            }}>
              차량 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 차량번호/담당구역/정비상태 동시 수정 시 담당구역만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 차량을 선택하세요.</div>}
      </div>
    </aside>
  );
}
