import React, { useState } from 'react';

export default function CenterSection({ panels, zones, inverters, maintenanceJobs, powerLogs, activityLogs, deletePowerLog, testUnauthorizedCalibrate }) {
  const [activeTab, setActiveTab] = useState('PANELS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'PANELS' ? 'active' : ''}`} onClick={() => setActiveTab('PANELS')}>⚡ 패널 대장 (80개)</button>
        <button className={`tab-btn ${activeTab === 'ZONE_MAP' ? 'active' : ''}`} onClick={() => setActiveTab('ZONE_MAP')}>🗺️ 구역별 배치도 (12개)</button>
        <button className={`tab-btn ${activeTab === 'INVERTERS' ? 'active' : ''}`} onClick={() => setActiveTab('INVERTERS')}>🔌 인버터 관제 (20대)</button>
        <button className={`tab-btn ${activeTab === 'JOBS' ? 'active' : ''}`} onClick={() => setActiveTab('JOBS')}>🔧 점검 작업 & 발전 로그</button>
      </div>

      {activeTab === 'PANELS' && (
        <div className="widget-section">
          <h2>⚡ SolarOps 태양광 패널 현황 대장 (80개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>패널ID</th><th>패널 번호</th><th>구역명</th><th>현재 출력</th><th>표면 온도</th><th>등급</th><th>설치일자</th><th>담당자</th><th>상태</th></tr>
              </thead>
              <tbody>
                {panels.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{p.panelNo}</strong></td>
                    <td><span className="zone-badge">{p.zoneName}</span></td>
                    <td><strong>{p.currentKw} kW</strong></td>
                    <td><span style={{ color: p.tempC > 60 ? 'var(--color-danger)' : p.tempC > 45 ? 'var(--color-warning)' : 'var(--color-success)' }}>{p.tempC}℃</span></td>
                    <td><strong>{p.grade}등급</strong></td>
                    <td><small>{p.installDate}</small></td>
                    <td><small>{p.workerName}</small></td>
                    <td><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ZONE_MAP' && (
        <div className="widget-section">
          <h2>🗺️ 발전소 구역별 모듈 배치도 (A~D구역 12개)</h2>
          <div className="zone-grid-layout">
            {zones.map(z => {
              const eff = z.efficiency;
              return (
                <div key={z.id} className={`zone-card-block ${eff < 70 ? 'danger' : eff < 85 ? 'warning' : 'normal'}`}>
                  <div className="zone-card-head">
                    <strong>{z.name}</strong>
                    <span className={`status-badge ${z.status.toLowerCase()}`}>{z.status}</span>
                  </div>
                  <div className="zone-card-body">
                    <p>용량: <strong>{z.capacityKw} kW</strong> | 현재: <strong>{z.currentKw} kW</strong></p>
                    <p>발전 효율: <strong style={{ color: eff < 70 ? 'var(--color-danger)' : 'var(--color-primary)' }}>{eff}%</strong></p>
                    <div className="eff-bar"><div className="eff-bar-fill" style={{ width: `${eff}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'INVERTERS' && (
        <div className="widget-section">
          <h2>🔌 인버터 모듈 관제 (20대)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>인버터ID</th><th>인버터명</th><th>소속 구역</th><th>용량(kW)</th><th>실시간 출력</th><th>변환 효율</th><th>손실률</th><th>상태</th></tr>
              </thead>
              <tbody>
                {inverters.map(inv => (
                  <tr key={inv.id}>
                    <td><strong>{inv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{inv.name}</strong></td>
                    <td><small>{inv.zoneId}</small></td>
                    <td><strong>{inv.capacityKw} kW</strong></td>
                    <td>{inv.outputKw} kW</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{inv.efficiency}%</strong></td>
                    <td><span style={{ color: inv.lossRate > 5 ? 'var(--color-danger)' : 'var(--color-text)' }}>{inv.lossRate}%</span></td>
                    <td><span className={`status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'JOBS' && (
        <div className="widget-section">
          <h2>🔧 점검 작업 목록 (45건) & 발전량 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>작업ID</th><th>패널번호</th><th>구역명</th><th>담당 작업자</th><th>이상 내용</th><th>상태</th></tr>
              </thead>
              <tbody>
                {maintenanceJobs.map(job => (
                  <tr key={job.id}>
                    <td><strong>{job.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{job.panelNo}</strong></td>
                    <td><small>{job.zoneName}</small></td>
                    <td><strong>{job.workerName}</strong></td>
                    <td><small>{job.issueType}</small></td>
                    <td><span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '1rem' }}>📊 발전량 감사 로그 (100건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>구역명</th><th>발전량(kWh)</th><th>효율(%)</th><th>측정 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {powerLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.zoneName}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.kwh} kWh</strong></td>
                    <td>{log.efficiency}%</td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deletePowerLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginTop: '0.5rem' }}>* 발전량 로그 삭제 시 로그 목록에서는 소거되나 차구역별 효율 및 손실률 통계 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCalibrate('JOB-5001')}>🔒 권한 없는 직원의 발전량 강제 보정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 발전량 보정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
