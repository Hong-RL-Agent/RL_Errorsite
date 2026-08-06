import React, { useState } from 'react';

export default function CenterSection({ reports, lights, workers, locationLogs, activityLogs, deleteLocationLog, testUnauthorizedCompleteReport }) {
  const [activeTab, setActiveTab] = useState('REPORTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'REPORTS' ? 'active' : ''}`} onClick={() => setActiveTab('REPORTS')}>💡 고장 신고 (60건)</button>
        <button className={`tab-btn ${activeTab === 'LIGHTS' ? 'active' : ''}`} onClick={() => setActiveTab('LIGHTS')}>🗺️ GPS 지도 & 가로등 (90개)</button>
        <button className={`tab-btn ${activeTab === 'WORKERS' ? 'active' : ''}`} onClick={() => setActiveTab('WORKERS')}>👷 점검 작업자 (25명)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 위치 로그 & 감사 이력</button>
      </div>

      {activeTab === 'REPORTS' && (
        <div className="widget-section">
          <h2>💡 StreetLightOps 스마트 도시 가로등 고장 민원 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>신고ID</th><th>신고코드</th><th>고장 증상 및 민원 내용</th><th>행정구역</th><th>설치 위치 정보</th><th>신고 접수자</th><th>담당 기사</th><th>위험도</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reports.map(rpt => (
                  <tr key={rpt.id}>
                    <td><strong>{rpt.id}</strong></td>
                    <td><small>{rpt.rptCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rpt.issueType}</strong></td>
                    <td><span className="district-badge">{rpt.district}</span></td>
                    <td><small>{rpt.location}</small></td>
                    <td><small>{rpt.reporter}</small></td>
                    <td><strong>{rpt.workerName}</strong></td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>{rpt.riskLevel}</strong></td>
                    <td><span className={`status-badge ${rpt.status.toLowerCase()}`}>{rpt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LIGHTS' && (
        <div className="widget-section">
          <h2>🗺️ 서울특별시 스마트 도시 가로등 시설물 위치 지도 (90개 설치 지점)</h2>
          <div className="map-dummy-box">
            <svg viewBox="0 0 600 180" className="map-svg">
              <rect x="10" y="10" width="580" height="160" rx="8" fill="#0f261c" stroke="#1d4d38" />
              <circle cx="140" cy="80" r="14" fill="rgba(245,158,11,0.5)" stroke="#f59e0b" strokeWidth="2" />
              <text x="140" y="84" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">강남SL</text>
              <circle cx="300" cy="110" r="14" fill="rgba(16,185,129,0.5)" stroke="#10b981" strokeWidth="2" />
              <text x="300" y="114" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">서초SL</text>
              <circle cx="450" cy="60" r="14" fill="rgba(239,68,68,0.5)" stroke="#ef4444" strokeWidth="2" />
              <text x="450" y="64" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">송파SL</text>
            </svg>
          </div>

          <div className="table-scroll-box" style={{ marginTop: '0.75rem' }}>
            <table>
              <thead>
                <tr><th>가로등ID</th><th>관리 번호</th><th>행정 구역</th><th>상세 설치 위치</th><th>전구/LED 타입</th><th>담당 기사</th><th>상태</th></tr>
              </thead>
              <tbody>
                {lights.map(lgt => (
                  <tr key={lgt.id}>
                    <td><strong>{lgt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{lgt.lightCode}</strong></td>
                    <td><span className="district-badge">{lgt.district}</span></td>
                    <td><small>{lgt.location}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{lgt.bulbType}</small></td>
                    <td><strong>{lgt.workerName}</strong></td>
                    <td><span className={`status-badge ${lgt.status.toLowerCase()}`}>{lgt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'WORKERS' && (
        <div className="widget-section">
          <h2>👷 전문 전기점검 기사 및 조치 담당 현황 (25명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>기사ID</th><th>기사 성명</th><th>연락처</th><th>보유 국가자격증</th><th>현재 배정 작업 수</th><th>평점</th></tr>
              </thead>
              <tbody>
                {workers.map(wrk => (
                  <tr key={wrk.id}>
                    <td><strong>{wrk.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{wrk.workerName}</strong></td>
                    <td><small>{wrk.phone}</small></td>
                    <td><small>{wrk.license}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{wrk.assignedTasks}건 작업</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {wrk.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 현장 가로등 GPS 지점 위치 검증 로그 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>위치로그ID</th><th>신고ID</th><th>가로등 번호</th><th>검증 GPS 주소</th><th>수정/검증 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {locationLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rptId}</td>
                    <td><small>{log.lightCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.location}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.updatedTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteLocationLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 위치 로그 삭제 시 목록에서는 소거되나 구역별 고장률, 작업자별 처리량, 조치 완료율 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 도시 시설물 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>신고ID</th><th>담당 관제원</th><th>처리 내역</th><th>일시</th></tr>
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
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompleteReport('RPT-5001')}>🔒 권한 없는 직원의 가로등 점검 완료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 점검 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
