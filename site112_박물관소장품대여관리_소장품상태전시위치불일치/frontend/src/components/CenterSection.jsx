import React, { useState } from 'react';

export default function CenterSection({ artifacts, galleries, loanRequests, activityLogs, deleteConservationLog, testUnauthorizedApprove }) {
  const [activeTab, setActiveTab] = useState('ARTIFACTS');

  const gradeColor = { S: 'var(--color-primary)', A: 'var(--color-success)', B: 'var(--color-warning)', C: 'var(--color-danger)' };

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'ARTIFACTS' ? 'active' : ''}`} onClick={() => setActiveTab('ARTIFACTS')}>📜 소장품 대장 (55개)</button>
        <button className={`tab-btn ${activeTab === 'GALLERY_MAP' ? 'active' : ''}`} onClick={() => setActiveTab('GALLERY_MAP')}>🗺️ 전시실 배치도 (10개)</button>
        <button className={`tab-btn ${activeTab === 'LOANS' ? 'active' : ''}`} onClick={() => setActiveTab('LOANS')}>📋 대여 신청 현황 (35건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🔍 보존 로그 & 활동 이력 (80건)</button>
      </div>

      {activeTab === 'ARTIFACTS' && (
        <div className="widget-section">
          <h2>📜 MuseumVault 소장품 대장 (55개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>소장품ID</th><th>소장품명</th><th>분류</th><th>시대</th><th>제작연도</th><th>전시실</th><th>보존등급</th><th>상태</th></tr>
              </thead>
              <tbody>
                {artifacts.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{a.name}</strong></td>
                    <td><small>{a.category}</small></td>
                    <td><small>{a.era}</small></td>
                    <td><small>{a.madeYear > 0 ? `${a.madeYear}년` : `BC ${Math.abs(a.madeYear)}년`}</small></td>
                    <td><span className="gallery-badge">{a.galleryName}</span></td>
                    <td><strong style={{ color: gradeColor[a.conservationGrade] || '#fff' }}>{a.conservationGrade}</strong></td>
                    <td><span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'GALLERY_MAP' && (
        <div className="widget-section">
          <h2>🗺️ 전시실 배치도 (1F~3F & 지하 수장고)</h2>
          <div className="gallery-floor-section">
            {['1F', '2F', '3F', '지하 1F'].map(floor => (
              <div key={floor} className="floor-block">
                <div className="floor-label">{floor}</div>
                <div className="gallery-grid">
                  {galleries.filter(g => g.floor === floor).map(g => {
                    const rate = (g.current / g.capacity) * 100;
                    return (
                      <div key={g.id} className={`gallery-block ${rate >= 90 ? 'full' : rate >= 70 ? 'high' : 'normal'}`}>
                        <strong>{g.name}</strong>
                        <small>{g.theme}</small>
                        <div className="gallery-occupy">
                          <span>{g.current}/{g.capacity}</span>
                          <div className="gal-bar"><div className="gal-bar-fill" style={{ width: `${rate}%` }} /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'LOANS' && (
        <div className="widget-section">
          <h2>📋 외부 대여 신청 현황 (35건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>대여ID</th><th>소장품명</th><th>요청 기관</th><th>대여 기간</th><th>상태</th></tr>
              </thead>
              <tbody>
                {loanRequests.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{l.artifactName}</strong></td>
                    <td><small>{l.requestingOrg}</small></td>
                    <td><small>{l.startDate} ~ {l.endDate}</small></td>
                    <td><span className={`status-badge ${l.status.toLowerCase()}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApprove('LOAN-6005')}>🔒 권한 없는 직원의 대여 강제 승인 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 대여 승인 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🔍 보존 상태 로그 & 활동 이력 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>소장품ID</th><th>담당 학예사</th><th>처리 내용</th><th>일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.artifactId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.curator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteConservationLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginTop: '0.5rem' }}>* 보존 로그 삭제 시 로그 목록에서는 소거되나 대시보드 KPI(보존등급별/학예사별 통계)는 유지됨 (Error 4)</small>
        </div>
      )}
    </main>
  );
}
