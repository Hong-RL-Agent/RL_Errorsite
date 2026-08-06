import React, { useState } from 'react';

export default function CenterSection({ containers, vessels, yards, activityLogs, deleteLoadingLog, testUnauthorizedAssign }) {
  const [activeTab, setActiveTab] = useState('CONTAINERS');

  const zones = ['A구역', 'B구역', 'C구역', 'D구역', 'E구역'];

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'CONTAINERS' ? 'active' : ''}`} onClick={() => setActiveTab('CONTAINERS')}>📦 컨테이너 대장 (60개) & 선박 현황 (15척)</button>
        <button className={`tab-btn ${activeTab === 'YARD_MAP' ? 'active' : ''}`} onClick={() => setActiveTab('YARD_MAP')}>🗺️ 야드 구역별 배치도 (A~E구역 / 40블록)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 선적 작업 로그 (90건) & 직원 작업량</button>
      </div>

      {activeTab === 'CONTAINERS' && (
        <div className="widget-section">
          <h2>📦 PortStack 항만 컨테이너 선적 대장 (60개)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead><tr><th>컨테이너ID</th><th>컨테이너 번호</th><th>야드 위치</th><th>배정 선박</th><th>목적지</th><th>무게(t)</th><th>위험물</th><th>반입일시</th><th>상태</th></tr></thead>
              <tbody>
                {containers.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{c.containerNo}</strong></td>
                    <td><span className="zone-badge">{c.zone} {c.yardBlock}</span></td>
                    <td><small>{c.vesselName}</small></td>
                    <td><small>{c.destination}</small></td>
                    <td><strong>{c.weightTon}t</strong></td>
                    <td><span style={{ color: c.isDangerous ? 'var(--color-danger)' : 'var(--color-success)' }}>{c.isDangerous ? '⚠️위험' : '안전'}</span></td>
                    <td><small>{c.arrivalTime}</small></td>
                    <td><span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 style={{ marginTop: '1rem' }}>🚢 입항 예정 선박 현황 (15척)</h2>
          <div className="table-scroll-box">
            <table>
              <thead><tr><th>선박ID</th><th>선박명</th><th>선적국</th><th>수용량(TEU)</th><th>현재 적재</th><th>적재율</th><th>ETA</th><th>상태</th></tr></thead>
              <tbody>
                {vessels.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{v.vesselName}</strong></td>
                    <td><small>{v.flag}</small></td>
                    <td><strong>{v.capacity.toLocaleString()}</strong></td>
                    <td>{v.loadedCount.toLocaleString()}</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{((v.loadedCount / v.capacity) * 100).toFixed(1)}%</strong></td>
                    <td><small>{v.eta}</small></td>
                    <td><span className={`status-badge ${v.status.toLowerCase()}`}>{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'YARD_MAP' && (
        <div className="widget-section">
          <h2>🗺️ 야드 구역별 컨테이너 배치도 (A구역~E구역)</h2>
          {zones.map(zone => (
            <div key={zone} className="yard-zone-section">
              <h3 className="zone-title">{zone}</h3>
              <div className="yard-grid">
                {yards.filter(y => y.zone === zone).map(y => {
                  const rate = (y.occupied / y.capacity) * 100;
                  return (
                    <div key={y.id} className={`yard-block ${rate >= 90 ? 'critical' : rate >= 70 ? 'high' : 'normal'}`}>
                      <strong>{y.blockNo}</strong>
                      <small>{y.occupied}/{y.capacity}</small>
                      <div className="yard-bar"><div className="yard-bar-fill" style={{ width: `${rate}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 선적 작업 감사 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead><tr><th>로그ID</th><th>컨테이너ID</th><th>담당 직원</th><th>처리 내용</th><th>일시</th><th>작업</th></tr></thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.containerId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteLoadingLog(log.id)}>🗑️ 삭제 (Error 4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 선적 로그 삭제 시 로그 대장에서는 소거되나 선박별 적재율 및 야드 점유율 수치에는 남음 (Error 4)</small>
          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedAssign('CTN-1001')}>🔒 권한 없는 직원의 선박 강제 배정 시도 (Error 7)</button>
            <small className="warn-desc">* 권한 없는 직원이 선박 배정 시 HTTP 403 반환이나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
