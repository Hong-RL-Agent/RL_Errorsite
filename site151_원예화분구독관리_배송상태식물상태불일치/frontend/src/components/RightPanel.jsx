import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedSubscriber, setSelectedSubscriber, subscribers, plants, triggerStatusHealthRace, triggerCancelReplacementConflict, triggerPartialSave }) {
  const [plantName, setPlantName] = useState('');
  const [sunlightGrade, setSunlightGrade] = useState('양지 (밝은 반음지)');
  const [waterCycle, setWaterCycle] = useState('7일에 1회 (겉흙 마르면)');
  const [healthStatus, setHealthStatus] = useState('GOOD (양호)');

  const target = selectedSubscriber || subscribers[0];
  const targetPlant = plants.find(p => p.plantName.includes(target?.plantName?.split(' ')[0] || '')) || plants[0];

  useEffect(() => {
    if (target) {
      setHealthStatus(target.healthStatus || 'GOOD (양호)');
    }
    if (targetPlant) {
      setPlantName(targetPlant.plantName || '');
      setSunlightGrade(targetPlant.sunlightGrade || '양지 (밝은 반음지)');
      setWaterCycle(targetPlant.waterCycle || '7일에 1회 (겉흙 마르면)');
    }
  }, [target, targetPlant]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🪴 배송 상태 & 식물 건강도 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>구독 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.subCode}</strong></p>
            <p>구독 고객명: <strong>{target.subscriberName}</strong>님</p>
            <p>구독 화분: <strong>{target.plantName}</strong> (<span className="plant-badge">{target.plantType}</span>)</p>
            <p>배송지 주소: <small>{target.deliveryAddress}</small></p>
            <p>배송 일자: <small>{target.deliveryDate}</small></p>
            <p>식물 건강 상태: <strong style={{ color: 'var(--color-warning)' }}>{target.healthStatus}</strong></p>
            <p>배송 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>식물 건강 상태 수정 (0.1초 완료):</label>
              <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)}>
                <option value="EXCELLENT (최상)">EXCELLENT (최상)</option>
                <option value="GOOD (양호)">GOOD (양호)</option>
                <option value="FAIR (보통)">FAIR (보통)</option>
                <option value="POOR (시듦/주의)">POOR (시듦/주의)</option>
              </select>
            </div>

            <div className="form-group">
              <label>배송 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'DELIVERED'} onChange={(e) => setSelectedSubscriber({ ...target, status: e.target.value })}>
                <option value="PREPARING">배송준비 (PREPARING)</option>
                <option value="DELIVERING">배송중 (DELIVERING)</option>
                <option value="DELIVERED">배송완료 (DELIVERED)</option>
                <option value="REPLACING">교체진행 (REPLACING)</option>
                <option value="CANCELLED">구독취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusHealthRace(target.id, target, healthStatus)}>
              배송완료 변경 + 즉시 건강 상태 수정 (Error 1)
            </button>
            <small className="warn-desc">* 배송완료 변경(3초 지연) 직후 건강 상태 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 건강 상태를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelReplacementConflict(target.id)}>
                ⚡ 구독 취소 후 화분 교체 승인 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 구독 취소(0.5초 완료) 직후 교체 승인(4초 지연 완료) 시, 취소된 구독이 REPLACING(교체진행)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 구독 고객을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 식물 품종 생육 정보 수정 (Error 8)</h3>
        {targetPlant ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>식물 품종명:</label>
              <input type="text" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>햇빛 적정 등급:</label>
              <input type="text" value={sunlightGrade} onChange={(e) => setSunlightGrade(e.target.value)} />
            </div>
            <div className="form-group">
              <label>권장 물주기 주기 (부분 저장 미반영):</label>
              <input type="text" value={waterCycle} onChange={(e) => setWaterCycle(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetPlant.id, plantName, waterCycle, sunlightGrade)}>
              식물 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 식물명/햇빛등급/물주기 동시 수정 시 물주기만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 식물을 선택하세요.</div>}
      </div>
    </aside>
  );
}
