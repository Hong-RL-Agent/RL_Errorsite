import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedRequest, setSelectedRequest, requests, zones, drones, triggerStatusZoneRace, triggerCancelShootingConflict, triggerPartialSave }) {
  const [droneName, setDroneName] = useState('');
  const [batteryStatus, setBatteryStatus] = useState('98% (정상)');
  const [pilotName, setPilotName] = useState('이조종 팀장');
  const [zoneName, setZoneName] = useState('서울 강남 영동대로 건설 현장 (섹터 A)');

  const target = selectedRequest || requests[0];
  const targetDrone = drones.find(d => d.droneName.includes(target?.droneName?.split(' ')[0] || '')) || drones[0];

  useEffect(() => {
    if (target) {
      setZoneName(target.zoneName || '서울 강남 영동대로 건설 현장 (섹터 A)');
    }
    if (targetDrone) {
      setDroneName(targetDrone.droneName || '');
      setBatteryStatus(targetDrone.batteryStatus || '98% (정상)');
      setPilotName(targetDrone.pilotName || '이조종 팀장');
    }
  }, [target, targetDrone]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🛸 비행 승인 상태 & 촬영 구역 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>의뢰 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.reqCode}</strong></p>
            <p>프로젝트명: <strong style={{ fontSize: '0.85rem' }}>{target.title}</strong></p>
            <p>관제 지역: <span className="region-badge">{target.region}</span></p>
            <p>설정 구역: <small style={{ color: 'var(--color-warning)' }}>{target.zoneName}</small></p>
            <p>신청 기관: <small>{target.requester}</small> | 고도: <strong>{target.maxAltM}m</strong></p>
            <p>배정 드론: <strong>{target.droneName}</strong> | 조종자: <strong>{target.pilotName}</strong></p>
            <p>승인 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>촬영 구역 변경 (0.1초 완료):</label>
              <select value={zoneName} onChange={(e) => setZoneName(e.target.value)}>
                {zones.map(z => <option key={z.id} value={z.zoneName}>{z.zoneName}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>비행 승인 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'APPROVED'} onChange={(e) => setSelectedRequest({ ...target, status: e.target.value })}>
                <option value="PENDING">승인대기 (PENDING)</option>
                <option value="APPROVED">승인완료 (APPROVED)</option>
                <option value="IN_FLIGHT">비행중 (IN_FLIGHT)</option>
                <option value="COMPLETED">촬영완료 (COMPLETED)</option>
                <option value="CANCELLED">승인취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusZoneRace(target.id, target, zoneName)}>
              승인완료 변경 + 즉시 촬영구역 변경 (Error 1)
            </button>
            <small className="warn-desc">* 승인완료 변경(3초 지연) 직후 촬영구역 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 촬영구역을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelShootingConflict(target.id)}>
                ⚡ 승인 취소 후 촬영 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 승인 취소(0.5초 완료) 직후 촬영 완료(4초 지연 완료) 시, 취소된 의뢰가 COMPLETED(촬영완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 의뢰를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 드론 기체 정보 수정 (Error 8)</h3>
        {targetDrone ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>드론 모델명:</label>
              <input type="text" value={droneName} onChange={(e) => setDroneName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>담당 조종자:</label>
              <input type="text" value={pilotName} onChange={(e) => setPilotName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>배터리 상태 (부분 저장 미반영):</label>
              <input type="text" value={batteryStatus} onChange={(e) => setBatteryStatus(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetDrone.id, droneName, batteryStatus, pilotName)}>
              드론 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 드론명/담당조종자/배터리상태 동시 수정 시 배터리상태만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 드론을 선택하세요.</div>}
      </div>
    </aside>
  );
}
