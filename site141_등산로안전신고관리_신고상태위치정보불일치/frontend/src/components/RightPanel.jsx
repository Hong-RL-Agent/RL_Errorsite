import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedReport, setSelectedReport, reports, triggerStatusLocationRace, triggerCancelActionConflict, triggerPartialSave }) {
  const [reportType, setReportType] = useState('낙석/돌사면 붕괴 위험');
  const [locationDesc, setLocationDesc] = useState('백운대 정상 200m 전 데크 계단 옆 암벽');
  const [dangerGrade, setDangerGrade] = useState('HIGH (위험)');

  const target = selectedReport || reports[0];

  useEffect(() => {
    if (target) {
      setReportType(target.reportType || '낙석/돌사면 붕괴 위험');
      setLocationDesc(target.locationDesc || '백운대 정상 200m 전 데크 계단 옆 암벽');
      setDangerGrade(target.dangerGrade || 'HIGH (위험)');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🌲 신고 상태 & 위험 위치 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>신고 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.rptCode}</strong></p>
            <p>구역: <strong>{target.mountain}</strong> ({target.sectionName})</p>
            <p>신고 유형: <strong style={{ color: 'var(--color-warning)' }}>{target.reportType}</strong></p>
            <p>위험 위치: <strong style={{ color: 'var(--color-primary)' }}>{target.locationDesc}</strong></p>
            <p>위험 등급: <span className="danger-grade-badge">{target.dangerGrade}</span> | 접수: <small>{target.reportTime}</small></p>
            <p>담당 순찰팀: <strong>{target.assignedTeam}</strong></p>
            <p>신고 처리 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>위험 위치 상세 수정 (0.1초 완료):</label>
              <input type="text" value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} />
            </div>

            <div className="form-group">
              <label>신고 처리 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_ACTION'} onChange={(e) => setSelectedReport({ ...target, status: e.target.value })}>
                <option value="PENDING">신고접수 (PENDING)</option>
                <option value="INSPECTING">현장확인 (INSPECTING)</option>
                <option value="IN_ACTION">조치중 (IN_ACTION)</option>
                <option value="RESOLVED">조치완료 (RESOLVED)</option>
                <option value="CLEARED">위험구역해제 (CLEARED)</option>
                <option value="CANCELLED">신고취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusLocationRace(target.id, target, locationDesc)}>
              조치중 변경 + 즉시 위치 수정 (Error 1)
            </button>
            <small className="warn-desc">* 조치중 변경(3초 지연) 직후 위치 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 위치를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelActionConflict(target.id)}>
                ⚡ 신고 취소 후 조치 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 신고 취소(0.5초 완료) 직후 조치 완료(4초 지연 완료) 시, 취소된 신고가 RESOLVED(조치완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 신고를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 신고 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>신고 유형:</label>
              <input type="text" value={reportType} onChange={(e) => setReportType(e.target.value)} />
            </div>
            <div className="form-group">
              <label>위치 설명 (부분 저장 미반영):</label>
              <input type="text" value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} />
            </div>
            <div className="form-group">
              <label>위험 등급:</label>
              <input type="text" value={dangerGrade} onChange={(e) => setDangerGrade(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, reportType, locationDesc, dangerGrade)}>
              신고 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 신고유형/위치설명/위험등급 동시 수정 시 위치설명만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 신고를 선택하세요.</div>}
      </div>
    </aside>
  );
}
