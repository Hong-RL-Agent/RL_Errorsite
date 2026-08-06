import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedScene, setSelectedScene, scenes, actors, locations, triggerStatusScheduleRace, triggerCancelLogConflict, triggerPartialSave }) {
  const [sceneName, setSceneName] = useState('');
  const [location, setLocation] = useState('');
  const [shootDate, setShootDate] = useState('2026-08-05');
  const [actorName, setActorName] = useState('최민수');
  const [actorSchedule, setActorSchedule] = useState('07:30 ~ 18:00 (전일 촬영)');

  const target = selectedScene || scenes[0];

  useEffect(() => {
    if (target) {
      setSceneName(target.sceneName || '');
      setLocation(target.location || '');
      setShootDate(target.shootDate || '2026-08-05');
      setActorName(target.actorName || '최민수');
      setActorSchedule(target.actorSchedule || '07:30 ~ 18:00 (전일 촬영)');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎬 장면 촬영 & 배우 스케줄 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>씬 번호: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.sceneNo}</strong> ({target.sceneName})</p>
            <p>촬영 세트: <strong>{target.location}</strong> | 예정일: <strong>{target.shootDate}</strong></p>
            <p>주요 배우: <strong>{target.actorName}</strong> | 스케줄: <small style={{ color: 'var(--color-success)' }}>{target.actorSchedule}</small></p>
            <p>촬영 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배우 배정 & 타임 스케줄 변경 (0.1초 완료):</label>
              <select value={actorName} onChange={(e) => setActorName(e.target.value)}>
                {actors.map(a => <option key={a.id} value={a.actorName}>{a.actorName} ({a.roleName})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>배우 현장 스케줄 상세:</label>
              <input type="text" value={actorSchedule} onChange={(e) => setActorSchedule(e.target.value)} />
            </div>

            <div className="form-group">
              <label>촬영 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'COMPLETED'} onChange={(e) => setSelectedScene({ ...target, status: e.target.value })}>
                <option value="PREPARING">준비중 (PREPARING)</option>
                <option value="FILMING">촬영중 (FILMING)</option>
                <option value="COMPLETED">촬영완료 (COMPLETED)</option>
                <option value="PAUSED">일시중지 (PAUSED)</option>
                <option value="CANCELLED">촬영취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusScheduleRace(target.id, target, actorName, actorSchedule)}>
              촬영완료 변경 + 즉시 배우 스케줄 변경 (Error 1)
            </button>
            <small className="warn-desc">* 촬영완료 변경(3초 지연) 직후 배우 스케줄 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 배우 스케줄을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelLogConflict(target.id)}>
                ⚡ 촬영 취소 후 촬영 로그 작성 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 촬영 취소(0.5초 완료) 직후 촬영 로그 작성(4초 지연 완료) 시, 취소된 장면이 FILMING(촬영중)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 장면을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 장면 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>장면 콘티 명칭:</label>
              <input type="text" value={sceneName} onChange={(e) => setSceneName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>로케이션 세트장 (부분 저장 미반영):</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label>촬영 예정일:</label>
              <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, sceneName, location, shootDate)}>
              장면 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 장면명/로케이션/촬영예정일 동시 수정 시 로케이션만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 장면을 선택하세요.</div>}
      </div>
    </aside>
  );
}
