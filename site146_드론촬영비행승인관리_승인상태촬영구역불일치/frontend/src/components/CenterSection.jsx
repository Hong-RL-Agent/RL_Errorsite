import React, { useState } from 'react';

export default function CenterSection({ requests, zones, drones, pilots, flightLogs, activityLogs, deleteFlightLog, testUnauthorizedApproveFlight }) {
  const [activeTab, setActiveTab] = useState('REQUESTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'REQUESTS' ? 'active' : ''}`} onClick={() => setActiveTab('REQUESTS')}>🛸 촬영 의뢰 (50건)</button>
        <button className={`tab-btn ${activeTab === 'ZONES' ? 'active' : ''}`} onClick={() => setActiveTab('ZONES')}>🗺️ 촬영 구역 (35개)</button>
        <button className={`tab-btn ${activeTab === 'DRONES' ? 'active' : ''}`} onClick={() => setActiveTab('DRONES')}>🚁 드론 & 조종자</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 비행 로그 & 감사 이력</button>
      </div>

      {activeTab === 'REQUESTS' && (
        <div className="widget-section">
          <h2>🛸 DronePermit 드론 항공 촬영 비행 승인 대장 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>의뢰ID</th><th>의뢰코드</th><th>촬영 프로젝트명</th><th>관제 지역</th><th>설정 촬영 구역</th><th>신청 기관/기업</th><th>배정 조종자</th><th>최고고도</th><th>상태</th></tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td><small>{req.reqCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{req.title}</strong></td>
                    <td><span className="region-badge">{req.region}</span></td>
                    <td><small>{req.zoneName}</small></td>
                    <td><small>{req.requester}</small></td>
                    <td><strong>{req.pilotName}</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{req.maxAltM}m</strong></td>
                    <td><span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ZONES' && (
        <div className="widget-section">
          <h2>🗺️ 전국 드론 비행 제한/금지구역 지도 및 슬롯 현황 (35개 구역)</h2>
          <div className="map-dummy-box">
            <svg viewBox="0 0 600 180" className="map-svg">
              <rect x="10" y="10" width="580" height="160" rx="8" fill="#132338" stroke="#1f3b5e" />
              <circle cx="120" cy="90" r="50" fill="rgba(244,63,94,0.2)" stroke="#f43f5e" strokeWidth="2" />
              <text x="120" y="95" textAnchor="middle" fill="#f43f5e" fontSize="12" fontWeight="bold">서울 강남 (RESTRICTED)</text>
              <circle cx="300" cy="80" r="40" fill="rgba(238,43,105,0.3)" stroke="#ee2b69" strokeWidth="2" />
              <text x="300" y="85" textAnchor="middle" fill="#ee2b69" fontSize="11" fontWeight="bold">인천 송도 (PROHIBITED)</text>
              <circle cx="460" cy="110" r="45" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth="2" />
              <text x="460" y="115" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">경기 판교 (CAUTION)</text>
            </svg>
          </div>

          <div className="table-scroll-box" style={{ marginTop: '0.75rem' }}>
            <table>
              <thead>
                <tr><th>구역ID</th><th>촬영 구역 명칭</th><th>관제 권역</th><th>최대 허용 고도</th><th>위험도 분류</th><th>동시 동체 수</th></tr>
              </thead>
              <tbody>
                {zones.map(zon => (
                  <tr key={zon.id}>
                    <td><strong>{zon.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{zon.zoneName}</strong></td>
                    <td><span className="region-badge">{zon.region}</span></td>
                    <td><strong>{zon.maxAltitudeMeter}m</strong></td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>{zon.riskLevel}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>최대 {zon.droneLimitCount}대</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DRONES' && (
        <div className="widget-section">
          <h2>🚁 산업용 드론 기체 & 국가 자격 조종자 대장 (25대 / 20명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>드론ID</th><th>드론 모델명</th><th>시리얼 번호</th><th>배정 조종자</th><th>배터리 잔량</th><th>카메라 사양</th><th>상태</th></tr>
              </thead>
              <tbody>
                {drones.map(drn => (
                  <tr key={drn.id}>
                    <td><strong>{drn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{drn.droneName}</strong></td>
                    <td><small>{drn.serialNo}</small></td>
                    <td><strong>{drn.pilotName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{drn.batteryStatus}</strong></td>
                    <td><small>{drn.cameraType}</small></td>
                    <td><span className={`status-badge ${drn.status.toLowerCase()}`}>{drn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>👨‍✈️ 비행 조종자 자격 현황 (20명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>조종자ID</th><th>조종자 성명</th><th>연락처</th><th>자격증 번호</th><th>누적 비행시간</th><th>평점</th></tr>
              </thead>
              <tbody>
                {pilots.map(plt => (
                  <tr key={plt.id}>
                    <td><strong>{plt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{plt.pilotName}</strong></td>
                    <td><small>{plt.phone}</small></td>
                    <td><small>{plt.licenseNo}</small></td>
                    <td><strong>{plt.flightHours}시간</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {plt.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 실시간 드론 비행 블랙박스 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>의뢰ID</th><th>드론 기체</th><th>조종자</th><th>이륙시각</th><th>착륙시각</th><th>비행시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {flightLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.reqId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.droneName}</strong></td>
                    <td>{log.pilotName}</td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.takeoffTime}</small></td>
                    <td><small>{log.landingTime}</small></td>
                    <td><strong>{log.flightDurationMin}분</strong></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteFlightLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 비행 로그 삭제 시 목록에서는 소거되나 조종자별 비행시간, 지역별 승인률, 드론별 사용률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 비행 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>의뢰ID</th><th>담당 승인관</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.reqId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApproveFlight('REQ-8001')}>🔒 권한 없는 직원의 비행 승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 비행 승인 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
