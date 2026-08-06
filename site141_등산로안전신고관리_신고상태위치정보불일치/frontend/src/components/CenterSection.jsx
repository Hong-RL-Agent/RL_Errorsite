import React, { useState } from 'react';

export default function CenterSection({ trailSections, reports, patrolTeams, actionLogs, activityLogs, deleteActionLog, testUnauthorizedClear }) {
  const [activeTab, setActiveTab] = useState('MAP');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'MAP' ? 'active' : ''}`} onClick={() => setActiveTab('MAP')}>⛰️ 위험 구간 지도 (30개)</button>
        <button className={`tab-btn ${activeTab === 'REPORTS' ? 'active' : ''}`} onClick={() => setActiveTab('REPORTS')}>⚠️ 안전 신고 (55건)</button>
        <button className={`tab-btn ${activeTab === 'TEAMS' ? 'active' : ''}`} onClick={() => setActiveTab('TEAMS')}>🚒 산악 순찰대 (15개)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 현장 조치 & 감사 이력</button>
      </div>

      {activeTab === 'MAP' && (
        <div className="widget-section">
          <h2>⛰️ TrailSafe 국립공원 등산로 위험 구간 실시간 관제 지도 (30개)</h2>
          <div className="trail-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.65rem', marginTop: '0.75rem', maxHeight: '350px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            {trailSections.map(sec => (
              <div key={sec.id} className="trail-grid-cell" style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--color-dark)' }}>{sec.sectionName.split(' ')[0]}</strong>
                  <span className="danger-grade-badge">{sec.riskLevel}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>{sec.mountain}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text)' }}>난이도: {sec.difficulty}</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--color-warning)' }}>위험 지점 {sec.dangerZoneCount}개소</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'REPORTS' && (
        <div className="widget-section">
          <h2>⚠️ 탐방객 등산로 위험 신고 접수 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>신고ID</th><th>신고코드</th><th>산림 구역</th><th>등산로 구간</th><th>신고 위험 유형</th><th>위험 지점 위치설명</th><th>위험등급</th><th>담당 순찰팀</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reports.map(rpt => (
                  <tr key={rpt.id}>
                    <td><strong>{rpt.id}</strong></td>
                    <td><small>{rpt.rptCode}</small></td>
                    <td><small>{rpt.mountain}</small></td>
                    <td><small>{rpt.sectionName}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{rpt.reportType}</strong></td>
                    <td><small style={{ color: 'var(--color-primary)' }}>{rpt.locationDesc}</small></td>
                    <td><span className="danger-grade-badge">{rpt.dangerGrade}</span></td>
                    <td><strong>{rpt.assignedTeam}</strong></td>
                    <td><span className={`status-badge ${rpt.status.toLowerCase()}`}>{rpt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TEAMS' && (
        <div className="widget-section">
          <h2>🚒 권역별 산악 구조대 & 등산로 정비 순찰팀 (15개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>순찰팀ID</th><th>순찰대 명칭</th><th>팀장 성명</th><th>담당 국립공원</th><th>대원 수</th><th>현재 상태</th></tr>
              </thead>
              <tbody>
                {patrolTeams.map(tm => (
                  <tr key={tm.id}>
                    <td><strong>{tm.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{tm.teamName}</strong></td>
                    <td>{tm.leader}</td>
                    <td><small>{tm.mountain}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{tm.activeMembers}명</strong></td>
                    <td><span className="danger-grade-badge">{tm.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 위험 현장 안전 통제 및 응급 조치 완료 로그 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>신고ID</th><th>구역</th><th>위험 유형</th><th>담당 순찰팀</th><th>안전 조치 상세 내역</th><th>시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {actionLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rptId}</td>
                    <td><small>{log.mountain}</small></td>
                    <td><small style={{ color: 'var(--color-primary)' }}>{log.reportType}</small></td>
                    <td>{log.assignedTeam}</td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{log.actionDetail}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteActionLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 조치 로그 삭제 시 목록에서는 소거되나 구역별 신고 수, 위험도 점수, 순찰팀별 처리량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 등산로 안전 관제 시스템 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>신고ID</th><th>담당 통제관</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rptId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedClear('RPT-3001')}>🔒 권한 없는 직원의 위험구역 해제 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 위험구역 해제 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
