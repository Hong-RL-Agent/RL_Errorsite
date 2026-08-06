import React, { useState } from 'react';

export default function CenterSection({
  locations,
  inboundLogs,
  outboundLogs,
  activityLogs,
  deleteLog,
  openProductModal,
  testCancelOutbound
}) {
  const [activeTab, setActiveTab] = useState('LOCATION_MAP'); // 'LOCATION_MAP' | 'IN_OUT_LOGS' | 'ACTIVITY_LOGS'

  const zoneALocations = locations.filter(l => l.zone === 'A구역');
  const zoneBLocations = locations.filter(l => l.zone === 'B구역');
  const zoneCLocations = locations.filter(l => l.zone === 'C구역');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'LOCATION_MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('LOCATION_MAP')}
        >
          🏭 창고 랙 로케이션 그리드 맵 (50개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'IN_OUT_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('IN_OUT_LOGS')}
        >
          📥 입고 & 📤 출고 내역 대장 (70건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ACTIVITY_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTIVITY_LOGS')}
        >
          📑 창고 실사 & 감사 로그 (70건)
        </button>
      </div>

      {activeTab === 'LOCATION_MAP' && (
        <div className="widget-section">
          <h2>🏭 A / B / C 창고 랙 로케이션 현황 맵 (50개)</h2>

          <div className="rack-zones-grid">
            {/* Zone A */}
            <div className="rack-zone-block">
              <div className="zone-header">A구역 랙 (전자/자재/기계)</div>
              <div className="rack-cells-grid">
                {zoneALocations.map(loc => (
                  <div key={loc.id} className={`rack-cell ${loc.status.toLowerCase()}`}>
                    <span className="loc-id">{loc.id}</span>
                    <small className="loc-rack">{loc.rack}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone B */}
            <div className="rack-zone-block">
              <div className="zone-header">B구역 랙 (통신/소모품/안전)</div>
              <div className="rack-cells-grid">
                {zoneBLocations.map(loc => (
                  <div key={loc.id} className={`rack-cell ${loc.status.toLowerCase()}`}>
                    <span className="loc-id">{loc.id}</span>
                    <small className="loc-rack">{loc.rack}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone C */}
            <div className="rack-zone-block">
              <div className="zone-header">C구역 랙 (보관/운반/환경)</div>
              <div className="rack-cells-grid">
                {zoneCLocations.map(loc => (
                  <div key={loc.id} className={`rack-cell ${loc.status.toLowerCase()}`}>
                    <span className="loc-id">{loc.id}</span>
                    <small className="loc-rack">{loc.rack}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'IN_OUT_LOGS' && (
        <div className="widget-section">
          <h2>📥 입고 및 📤 출고 이력 대장 (입고 35건 / 출고 35건)</h2>

          <div style={{ marginBottom: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testCancelOutbound('OUT-3001', 'INB-2001')}>
              ⚡ 출고 취소 직후 입고 확정 연쇄 호출 (Error 2)
            </button>
            <small className="warn-desc">* 출고 취소(0.5초 완료) 직후 입고 확정(4초 지연 완료) 시 입고 수량이 DB 재고에 중복 합산되어 수량 불일치 발생 (Error 2)</small>
          </div>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>이력 ID</th>
                  <th>구분</th>
                  <th>상품 ID / 상품명</th>
                  <th>수량</th>
                  <th>로케이션</th>
                  <th>담당자</th>
                  <th>일시</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {inboundLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><span className="status-badge normal">입고</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.productName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>+{log.qty}</strong></td>
                    <td>{log.location}</td>
                    <td>{log.operator}</td>
                    <td><small>{log.timestamp}</small></td>
                    <td><span className="status-badge completed">{log.status}</span></td>
                  </tr>
                ))}
                {outboundLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><span className="status-badge warning">출고</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.productName}</strong></td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>-{log.qty}</strong></td>
                    <td>{log.location}</td>
                    <td>{log.operator}</td>
                    <td><small>{log.timestamp}</small></td>
                    <td><span className={`status-badge ${log.status === 'COMPLETED' ? 'completed' : 'danger'}`}>{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ACTIVITY_LOGS' && (
        <div className="widget-section">
          <h2>📑 창고 작업 감사 및 실사 활동 로그 (70건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>작업 직원</th>
                  <th>수행 작업 내용</th>
                  <th>수행 일시</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.operator}</td>
                    <td>{log.action}</td>
                    <td><small>{log.timestamp}</small></td>
                    <td><span className="status-badge completed">{log.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteLog(log.id)}>
                        🗑️ 활동 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 활동 로그 삭제(DELETE) 시 감사 대장에서는 소거되나 월별 입출고 통계 및 안전재고 미달 배지 수치에는 남음 (Error 4)</small>
        </div>
      )}
    </main>
  );
}
