import React, { useState } from 'react';

export default function CenterSection({ inspections, equipments, alerts, waterLogs, activityLogs, deleteWaterLog, testUnauthorizedCalibrateWaterMetrics }) {
  const [activeTab, setActiveTab] = useState('INSPECTIONS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'INSPECTIONS' ? 'active' : ''}`} onClick={() => setActiveTab('INSPECTIONS')}>🌊 점검 대장 (60건)</button>
        <button className={`tab-btn ${activeTab === 'EQUIPMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('EQUIPMENTS')}>⚙️ 정수 설비 현황</button>
        <button className={`tab-btn ${activeTab === 'ALERTS' ? 'active' : ''}`} onClick={() => setActiveTab('ALERTS')}>🚨 이상 알림 (50건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 수질 로그 & 감사 이력</button>
      </div>

      {activeTab === 'INSPECTIONS' && (
        <div className="widget-section">
          <h2>🌊 WaterPlant 정수장 수질 수치 & 설비 점검 관제 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>점검ID</th><th>점검코드</th><th>정수 설비명</th><th>공정 섹션</th><th>탁도 (NTU)</th><th>pH 수치</th><th>잔류염소 (mg/L)</th><th>담당 작업자</th><th>점검 일시</th><th>상태</th></tr>
              </thead>
              <tbody>
                {inspections.map(insp => (
                  <tr key={insp.id}>
                    <td><strong>{insp.id}</strong></td>
                    <td><small>{insp.inspCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{insp.equipName}</strong></td>
                    <td><span className="section-badge">{insp.section}</span></td>
                    <td><strong style={{ color: insp.turbidityNtu > 0.3 ? 'var(--color-danger)' : 'var(--color-success)' }}>{insp.turbidityNtu} NTU</strong></td>
                    <td><small>{insp.phLevel}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{insp.residualChlorineMgL} mg/L</small></td>
                    <td><small>{insp.operatorName}</small></td>
                    <td><small>{insp.checkDate}</small></td>
                    <td><span className={`status-badge ${insp.status.toLowerCase()}`}>{insp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'EQUIPMENTS' && (
        <div className="widget-section">
          <h2>⚙️ 정수장 핵심 공정 설비 명단 (35개 설비)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>설비ID</th><th>설비 코드</th><th>설비명</th><th>공정 섹션</th><th>세부 위치</th><th>점검 주기</th><th>위험도 등급</th><th>상태</th></tr>
              </thead>
              <tbody>
                {equipments.map(eqp => (
                  <tr key={eqp.id}>
                    <td><strong>{eqp.id}</strong></td>
                    <td><small>{eqp.equipCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{eqp.equipName}</strong></td>
                    <td><small>{eqp.section}</small></td>
                    <td><small>{eqp.location}</small></td>
                    <td><small>{eqp.checkCycleDays}일 주기업데이트</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{eqp.riskLevel}</strong></td>
                    <td><span className={`status-badge ${eqp.status.toLowerCase()}`}>{eqp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ALERTS' && (
        <div className="widget-section">
          <h2>🚨 실시간 수질 기준치 초과 & 설비 이상 알림 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>알림ID</th><th>점검ID</th><th>관련 설비명</th><th>이상 경보 세부 메시지</th><th>발생 일시</th><th>상태</th></tr>
              </thead>
              <tbody>
                {alerts.map(alt => (
                  <tr key={alt.id}>
                    <td><strong>{alt.id}</strong></td>
                    <td>{alt.inspId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{alt.equipName}</strong></td>
                    <td><small style={{ color: 'var(--color-danger)' }}>{alt.alertMsg}</small></td>
                    <td><small>{alt.alertTime}</small></td>
                    <td><span className={`status-badge ${alt.status.toLowerCase()}`}>{alt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 IoT 센서 실시간 수질 측정 자동 로그 (120건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>수질로그ID</th><th>점검ID</th><th>설비 측정위치</th><th>pH 수치</th><th>탁도 (NTU)</th><th>잔류염소</th><th>측정 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {waterLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.inspId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.equipName}</strong></td>
                    <td><small>{log.phLevel}</small></td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>{log.turbidityNtu} NTU</strong></td>
                    <td><small>{log.residualChlorineMgL} mg/L</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.logTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteWaterLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 수질 로그 삭제 시 목록에서는 소거되나 일별 평균 수질, 설비별 이상률, 작업자별 처리량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 정수장 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>점검ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.inspId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCalibrateWaterMetrics('INSP-5001')}>🔒 권한 없는 직원의 수질 보정 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 수질 보정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
