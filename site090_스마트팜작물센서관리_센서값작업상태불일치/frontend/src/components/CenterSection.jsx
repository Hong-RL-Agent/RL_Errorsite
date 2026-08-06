import React, { useState } from 'react';

export default function CenterSection({
  zones,
  sensors,
  workLogs,
  alerts,
  deleteAlert,
  openCropModal,
  testUnauthorizedIrrigation
}) {
  const [activeTab, setActiveTab] = useState('ZONE_LAYOUT'); // 'ZONE_LAYOUT' | 'WORK_LOGS' | 'ALERT_NOTIFICATIONS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'ZONE_LAYOUT' ? 'active' : ''}`}
          onClick={() => setActiveTab('ZONE_LAYOUT')}
        >
          🌿 농장 구역 평면도 & 센서 (60개 센서)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'WORK_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('WORK_LOGS')}
        >
          💦 관수 작업 수행 대장 (40건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ALERT_NOTIFICATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALERT_NOTIFICATIONS')}
        >
          🚨 실시간 센서 이상 알림 (25건)
        </button>
      </div>

      {activeTab === 'ZONE_LAYOUT' && (
        <div className="widget-section">
          <h2>🌿 스마트팜 구역 평면도 (12개 구역)</h2>
          <div className="zone-grid-box">
            {zones.map(zn => (
              <div key={zn.id} className={`zone-unit-card ${zn.status.toLowerCase()}`}>
                <div className="zone-header">
                  <span>{zn.id}</span>
                  <span className="zone-tag">{zn.type}</span>
                </div>
                <div className="zone-stats">
                  온도: {zn.avgTemp}°C | 습도: {zn.avgHumid}%
                </div>
                <small>{zn.name}</small>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>📡 스마트팜 실시간 센서 측정표 (최소 60개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>센서 ID</th>
                  <th>소속 구역</th>
                  <th>센서 유형</th>
                  <th>측정 수치</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map(sn => (
                  <tr key={sn.id}>
                    <td><strong>{sn.id}</strong></td>
                    <td><span className="zone-tag">{sn.zoneId}</span></td>
                    <td>{sn.type}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sn.value}{sn.unit}</strong></td>
                    <td><span className={`status-badge ${sn.status.toLowerCase()}`}>{sn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'WORK_LOGS' && (
        <div className="widget-section">
          <h2>💦 관수 및 제어 작업 실행 대장 (최소 40개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>작업 ID</th>
                  <th>대상 작물명</th>
                  <th>소속 구역</th>
                  <th>제어 작업 내용</th>
                  <th>관수 공급량</th>
                  <th>수행 일시</th>
                  <th>작업자</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {workLogs.map(wl => (
                  <tr key={wl.id}>
                    <td><strong>{wl.id}</strong></td>
                    <td>{wl.cropName}</td>
                    <td><span className="zone-tag">{wl.zoneId}</span></td>
                    <td>{wl.action}</td>
                    <td>{wl.volume}ml</td>
                    <td><small>{wl.timestamp}</small></td>
                    <td>{wl.operator}</td>
                    <td><span className={`status-badge ${wl.status.toLowerCase()}`}>{wl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ALERT_NOTIFICATIONS' && (
        <div className="widget-section">
          <h2>🚨 센서 이상 탐지 및 위험 알림 대장 (최소 25개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>알림 ID</th>
                  <th>구역 ID</th>
                  <th>작물명</th>
                  <th>이상 유형</th>
                  <th>감지 수치</th>
                  <th>위험도</th>
                  <th>처리 상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alt => (
                  <tr key={alt.id}>
                    <td><strong>{alt.id}</strong></td>
                    <td><span className="zone-tag">{alt.zoneId}</span></td>
                    <td>{alt.cropName}</td>
                    <td>{alt.type}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{alt.value}</strong></td>
                    <td><span className={`status-badge ${alt.severity.toLowerCase()}`}>{alt.severity}</span></td>
                    <td><span className={`status-badge ${alt.status === 'RESOLVED' ? 'completed' : 'danger'}`}>{alt.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteAlert(alt.id)}>
                        🗑️ 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 이상 알림 삭제(DELETE) 시 이력 대장에서는 소거되나 구역별 이상 발생률 및 작물 위험도 그래프 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '0.85rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedIrrigation('CRP-101')}>
              🔒 일반 직원의 강제 관수 실행 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 직원이 관수 실행 시 HTTP 403 오류를 반환하나 백엔드 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
