import React, { useState } from 'react';

export default function CenterSection({ inspections, zones, equipments, safetyTrainings, activityLogs, deleteTrainingLog, testUnauthorizedComplete }) {
  const [activeTab, setActiveTab] = useState('INSPECTIONS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'INSPECTIONS' ? 'active' : ''}`} onClick={() => setActiveTab('INSPECTIONS')}>🚨 안전 점검 대장 (50건)</button>
        <button className={`tab-btn ${activeTab === 'ZONE_MAP' ? 'active' : ''}`} onClick={() => setActiveTab('ZONE_MAP')}>🏗️ 현장 구역 배치도 (15개)</button>
        <button className={`tab-btn ${activeTab === 'EQUIPMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('EQUIPMENTS')}>🚜 안전 장비 목록 (35대)</button>
        <button className={`tab-btn ${activeTab === 'TRAININGS' ? 'active' : ''}`} onClick={() => setActiveTab('TRAININGS')}>🎓 안전교육 & 활동 이력</button>
      </div>

      {activeTab === 'INSPECTIONS' && (
        <div className="widget-section">
          <h2>🚨 BuildSafe 건설현장 안전 점검 대장 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>점검ID</th><th>위험요소 점검 제목</th><th>구역명</th><th>위험 등급</th><th>배정 장비</th><th>담당자</th><th>조치 마감일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {inspections.map(insp => (
                  <tr key={insp.id}>
                    <td><strong>{insp.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{insp.title}</strong></td>
                    <td><span className="zone-badge">{insp.zoneName}</span></td>
                    <td><span className={`risk-badge risk-${insp.riskGrade.toLowerCase()}`}>{insp.riskGrade}</span></td>
                    <td><small>{insp.equipmentName}</small></td>
                    <td><small>{insp.workerName}</small></td>
                    <td><small>{insp.dueDate}</small></td>
                    <td><span className={`status-badge ${insp.status.toLowerCase()}`}>{insp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ZONE_MAP' && (
        <div className="widget-section">
          <h2>🏗️ 건설 현장 구역별 위험도 배치도 (15개 구역)</h2>
          <div className="zone-grid-layout">
            {zones.map(z => (
              <div key={z.id} className={`zone-card-block risk-${z.riskLevel.toLowerCase()}`}>
                <div className="zone-card-head">
                  <strong>{z.name}</strong>
                  <span className={`risk-badge risk-${z.riskLevel.toLowerCase()}`}>{z.riskLevel}</span>
                </div>
                <div className="zone-card-body">
                  <p>상주일선 작업자: <strong>{z.activeWorkerCount}명</strong></p>
                  <p>점검 상태: <span className={`status-badge ${z.inspectStatus.toLowerCase()}`}>{z.inspectStatus}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'EQUIPMENTS' && (
        <div className="widget-section">
          <h2>🚜 건설 안전 장비 관제 (35대)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>장비ID</th><th>장비명</th><th>배정 현장 구역</th><th>점검 주기(일)</th><th>최근 점검일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {equipments.map(eqp => (
                  <tr key={eqp.id}>
                    <td><strong>{eqp.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{eqp.name}</strong></td>
                    <td><small>{eqp.zoneName}</small></td>
                    <td><strong>{eqp.inspectCycleDays}일</strong></td>
                    <td><small>{eqp.lastInspectDate}</small></td>
                    <td><span className={`status-badge ${eqp.status.toLowerCase()}`}>{eqp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TRAININGS' && (
        <div className="widget-section">
          <h2>🎓 작업자 안전교육 수료 현황 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>교육ID</th><th>작업자명</th><th>안전 교육 과정명</th><th>이수 일시</th><th>이수 상태</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {safetyTrainings.map(trn => (
                  <tr key={trn.id}>
                    <td><strong>{trn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{trn.workerName}</strong></td>
                    <td><small>{trn.courseName}</small></td>
                    <td><small>{trn.completedDate}</small></td>
                    <td><span className="status-badge normal">{trn.status}</span></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteTrainingLog(trn.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 교육 기록 삭제 시 목록에서는 소거되나 작업자 교육 이수율 및 월별 통계 수치에는 삭제 전 결과 유지 (Error 4)</small>

          <h2>📋 건설현장 안전활동 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>점검ID</th><th>담당자</th><th>조치 내용</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.inspectionId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedComplete('INSP-5001')}>🔒 권한 없는 작업자의 위험요소 강제 조치완료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 조치완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
