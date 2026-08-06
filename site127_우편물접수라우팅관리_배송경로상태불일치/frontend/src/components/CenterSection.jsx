import React, { useState } from 'react';

export default function CenterSection({ parcels, hubs, routesList, deliveryLogs, activityLogs, deleteDeliveryLog, testUnauthorizedComplete }) {
  const [activeTab, setActiveTab] = useState('PARCELS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'PARCELS' ? 'active' : ''}`} onClick={() => setActiveTab('PARCELS')}>📦 우편물 대장 (60건)</button>
        <button className={`tab-btn ${activeTab === 'HUBS' ? 'active' : ''}`} onClick={() => setActiveTab('HUBS')}>🏢 분류센터 현황 (12개)</button>
        <button className={`tab-btn ${activeTab === 'ROUTES' ? 'active' : ''}`} onClick={() => setActiveTab('ROUTES')}>🛤️ 라우팅 경로 (40개)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🚨 배송 & 감사 이력</button>
      </div>

      {activeTab === 'PARCELS' && (
        <div className="widget-section">
          <h2>📦 PostRoute 우편물 라우팅 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>우편ID</th><th>운송장 번호</th><th>발송인</th><th>수취인</th><th>배송 주소</th><th>관할 HUB</th><th>지정 라우팅 경로</th><th>상태</th></tr>
              </thead>
              <tbody>
                {parcels.map(pcl => (
                  <tr key={pcl.id}>
                    <td><strong>{pcl.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{pcl.trackingNo}</strong></td>
                    <td><small>{pcl.senderName}</small></td>
                    <td><strong>{pcl.recipientName}</strong></td>
                    <td><small>{pcl.deliveryAddress}</small></td>
                    <td><span className="hub-badge">{pcl.hubName}</span></td>
                    <td><small>{pcl.routeName}</small></td>
                    <td><span className={`status-badge ${pcl.status.toLowerCase()}`}>{pcl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HUBS' && (
        <div className="widget-section">
          <h2>🏢 전국 주요 우편물 분류센터 현황 (12개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>센터ID</th><th>분류센터 명칭</th><th>관할 권역</th><th>처리 용량</th><th>현재 분류 물량</th><th>센터장</th></tr>
              </thead>
              <tbody>
                {hubs.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{h.name}</strong></td>
                    <td><small>{h.region}</small></td>
                    <td>{h.capacity.toLocaleString()}건</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{h.currentLoad.toLocaleString()}건</strong></td>
                    <td><small>{h.managerName}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ROUTES' && (
        <div className="widget-section">
          <h2>🛤️ 간선 수송 라우팅 표준 경로 (40개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>경로ID</th><th>라우팅 경로 명칭</th><th>운송 거리</th><th>소요 예상 시간</th></tr>
              </thead>
              <tbody>
                {routesList.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{r.routeName}</strong></td>
                    <td><strong>{r.distanceKm}km</strong></td>
                    <td><small>{r.estimatedHours}시간</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🚨 실시간 배송 및 라우팅 스캔 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>송장번호</th><th>처리 HUB</th><th>스캔 및 라우팅 내역</th><th>시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {deliveryLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.trackingNo}</strong></td>
                    <td><small>{log.hubName}</small></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteDeliveryLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 배송 로그 삭제 시 목록에서는 소거되나 센터별 처리량 및 반송률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 우편 물류 시스템 종합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>우편ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.parcelId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedComplete('PCL-3001')}>🔒 권한 없는 직원의 배송 완료 강제 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 배송 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
