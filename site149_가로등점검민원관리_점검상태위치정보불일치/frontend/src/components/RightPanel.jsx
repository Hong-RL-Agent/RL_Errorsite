import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedReport, setSelectedReport, reports, lights, triggerStatusLocationRace, triggerCancelCompleteConflict, triggerPartialSave }) {
  const [lightCode, setLightCode] = useState('');
  const [bulbType, setBulbType] = useState('스마트 고광율 LED 150W');
  const [location, setLocation] = useState('서울 강남구 테헤란로 123 앞');

  const target = selectedReport || reports[0];
  const targetLight = lights.find(l => l.lightCode === target?.lightCode) || lights[0];

  useEffect(() => {
    if (target) {
      setLocation(target.location || '서울 강남구 테헤란로 123 앞');
    }
    if (targetLight) {
      setLightCode(targetLight.lightCode || '');
      setBulbType(targetLight.bulbType || '스마트 고광율 LED 150W');
    }
  }, [target, targetLight]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>💡 점검 상태 & 위치 정보 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>신고 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.rptCode}</strong></p>
            <p>가로등 관리번호: <strong>{target.lightCode}</strong></p>
            <p>행정 구역: <span className="district-badge">{target.district}</span></p>
            <p>설치 위치: <small style={{ color: 'var(--color-warning)' }}>{target.location}</small></p>
            <p>고장 민원: <small>{target.issueType}</small> | 위험도: <strong style={{ color: 'var(--color-danger)' }}>{target.riskLevel}</strong></p>
            <p>담당 기사: <strong>{target.workerName}</strong> | 접수일: <small>{target.rptDate}</small></p>
            <p>점검 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>설치 위치 정보 수정 (0.1초 완료):</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="form-group">
              <label>점검 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'COMPLETED'} onChange={(e) => setSelectedReport({ ...target, status: e.target.value })}>
                <option value="REPORTED">신고접수 (REPORTED)</option>
                <option value="IN_PROGRESS">점검중 (IN_PROGRESS)</option>
                <option value="COMPLETED">조치완료 (COMPLETED)</option>
                <option value="EMERGENCY">긴급출동 (EMERGENCY)</option>
                <option value="CANCELLED">신고취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusLocationRace(target.id, target, location)}>
              조치완료 변경 + 즉시 위치 정보 수정 (Error 1)
            </button>
            <small className="warn-desc">* 조치완료 변경(3초 지연) 직후 위치 정보 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 위치를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCompleteConflict(target.id)}>
                ⚡ 신고 취소 후 점검 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 신고 취소(0.5초 완료) 직후 점검 완료(4초 지연 완료) 시, 취소된 신고가 COMPLETED(조치완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 신고를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 가로등 시설물 정보 수정 (Error 8)</h3>
        {targetLight ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>가로등 관리번호:</label>
              <input type="text" value={lightCode} onChange={(e) => setLightCode(e.target.value)} />
            </div>
            <div className="form-group">
              <label>전구 / LED 타입:</label>
              <input type="text" value={bulbType} onChange={(e) => setBulbType(e.target.value)} />
            </div>
            <div className="form-group">
              <label>상세 설치 위치 (부분 저장 미반영):</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetLight.id, lightCode, location, bulbType)}>
              가로등 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 관리번호/전구타입/설치위치 동시 수정 시 설치위치만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 가로등을 선택하세요.</div>}
      </div>
    </aside>
  );
}
