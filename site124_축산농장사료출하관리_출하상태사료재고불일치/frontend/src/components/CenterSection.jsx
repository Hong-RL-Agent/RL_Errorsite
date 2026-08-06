import React, { useState } from 'react';

export default function CenterSection({ livestocks, barns, feeds, shipments, feedLogs, activityLogs, deleteFeedLog, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('LIVESTOCKS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'LIVESTOCKS' ? 'active' : ''}`} onClick={() => setActiveTab('LIVESTOCKS')}>🐄 가축 개체 대장 (80두)</button>
        <button className={`tab-btn ${activeTab === 'BARNS' ? 'active' : ''}`} onClick={() => setActiveTab('BARNS')}>🏡 축사 배치도 (12동)</button>
        <button className={`tab-btn ${activeTab === 'FEEDS' ? 'active' : ''}`} onClick={() => setActiveTab('FEEDS')}>🌾 사료 재고 현황 (35개)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🚛 출하 & 급여 이력</button>
      </div>

      {activeTab === 'LIVESTOCKS' && (
        <div className="widget-section">
          <h2>🐄 FarmHerd 가축 개체 스마트 대장 (80두)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>개체ID</th><th>귀표 번호(EarTag)</th><th>품종</th><th>소속 축사</th><th>월령</th><th>체중(kg)</th><th>건강 상태</th><th>사료 재고</th><th>출하 상태</th></tr>
              </thead>
              <tbody>
                {livestocks.map(liv => (
                  <tr key={liv.id}>
                    <td><strong>{liv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{liv.earTagNo}</strong></td>
                    <td><small>{liv.breed}</small></td>
                    <td><span className="barn-badge">{liv.barnName}</span></td>
                    <td>{liv.ageMonths}개월</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{liv.weightKg}kg</strong></td>
                    <td><span className={`status-badge ${liv.healthStatus.toLowerCase()}`}>{liv.healthStatus}</span></td>
                    <td><strong>{liv.feedStockKg}kg</strong></td>
                    <td><span className={`status-badge ${liv.status.toLowerCase()}`}>{liv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BARNS' && (
        <div className="widget-section">
          <h2>🏡 스마트 농장 축사 구역 배치도 (12개동)</h2>
          <div className="barn-grid-map" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
            {barns.map(b => (
              <div key={b.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>{b.name}</strong>
                  <span className="barn-badge">{b.type}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text)' }}>
                  <p>수용 두수: <strong>{b.currentHead} / {b.capacity} 두</strong></p>
                  <p>담당 관리자: <strong>{b.managerName}</strong></p>
                  <div style={{ background: 'var(--bg-app)', height: '8px', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ width: `${(b.currentHead / b.capacity) * 100}%`, height: '100%', background: 'var(--color-primary)' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'FEEDS' && (
        <div className="widget-section">
          <h2>🌾 사료 재고 및 일일 배식 잔량 (35개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>사료ID</th><th>사료 명칭</th><th>사료 유형</th><th>재고 잔량</th><th>일일 소비량</th><th>공급 업체</th></tr>
              </thead>
              <tbody>
                {feeds.map(fed => (
                  <tr key={fed.id}>
                    <td><strong>{fed.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{fed.name}</strong></td>
                    <td><span className="barn-badge">{fed.feedType}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{fed.stockKg}kg</strong></td>
                    <td>{fed.dailyUsageKg}kg/일</td>
                    <td><small>{fed.supplier}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🚛 축산물 출하 일정 (45건) & 일일 사료 급여 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>개체ID</th><th>급여 사료 명칭</th><th>급여량</th><th>급여 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {feedLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.livestockId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.feedName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{log.fedAmountKg}kg</strong></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteFeedLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 급여 로그 삭제 시 목록에서는 소거되나 사료 사용량 및 개체 성장률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 축산 농장 경영 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>개체ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.livestockId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('LIV-1001')}>🔒 권한 없는 직원의 출하 확정 강제 승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 출하 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
