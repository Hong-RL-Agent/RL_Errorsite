import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedContainer, setSelectedContainer, containers, vessels, triggerYardVesselRace, triggerCancelLoadingConflict, triggerPartialContainerSave }) {
  const [weightTon, setWeightTon] = useState(0);
  const [isDangerous, setIsDangerous] = useState(false);
  const [destination, setDestination] = useState('');
  const target = selectedContainer || containers[0];

  useEffect(() => {
    if (target) {
      setWeightTon(target.weightTon || 0);
      setIsDangerous(target.isDangerous || false);
      setDestination(target.destination || '');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📦 야드 위치 & 선박 배정 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>컨테이너: <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>{target.containerNo}</strong></p>
            <p>현재 야드: <strong>{target.zone} {target.yardBlock}</strong></p>
            <p>배정 선박: <strong>{target.vesselName}</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배정 선박 변경 (0.1초 완료):</label>
              <select value={target.vesselId || ''} onChange={(e) => {
                const v = vessels.find(v => v.id === e.target.value);
                setSelectedContainer({ ...target, vesselId: e.target.value, vesselName: v?.vesselName || '' });
              }}>
                {vessels.map(v => <option key={v.id} value={v.id}>{v.vesselName}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>야드 블록 변경 (Error 1 - 3초 지연):</label>
              <input type="text" value={target.yardBlock || ''} onChange={(e) => setSelectedContainer({ ...target, yardBlock: e.target.value })} />
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerYardVesselRace(target)}>
                야드 변경 후 즉시 선박 배정 (Error 1)
              </button>
              <small className="warn-desc">* 야드 변경(3초 지연) 직후 선박 배정(0.1초 완료) 시, 3초 뒤 이전 야드 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelLoadingConflict(target)}>
                ⚡ 반출 취소 후 선적 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 반출 취소(0.5초 완료) 직후 선적완료(4초 지연 완료) 시, 늦은 선적완료가 취소 컨테이너를 LOADED 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 컨테이너를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 컨테이너 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>무게 (ton):</label>
              <input type="number" value={weightTon} onChange={(e) => setWeightTon(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>위험물 여부 (부분저장 미반영):</label>
              <select value={isDangerous ? 'true' : 'false'} onChange={(e) => setIsDangerous(e.target.value === 'true')}>
                <option value="false">일반화물</option>
                <option value="true">위험물</option>
              </select>
            </div>
            <div className="form-group">
              <label>목적지:</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialContainerSave(target.id, weightTon, isDangerous, destination)}>
              컨테이너 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 무게/위험물여부/목적지 동시 수정 시 백엔드에는 위험물 여부만 빼고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 컨테이너를 선택하세요.</div>}
      </div>
    </aside>
  );
}
