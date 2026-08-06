import React, { useState } from 'react';

export default function CenterSection({ schedules, zones, vehicles, complaints, pickupLogs, activityLogs, deletePickupLog, testUnauthorizedComplete }) {
  const [activeTab, setActiveTab] = useState('SCHEDULES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'SCHEDULES' ? 'active' : ''}`} onClick={() => setActiveTab('SCHEDULES')}>🚛 수거 일정 대장 (50개)</button>
        <button className={`tab-btn ${activeTab === 'ZONES' ? 'active' : ''}`} onClick={() => setActiveTab('ZONES')}>🗺️ 수거 구역 지도 (20개)</button>
        <button className={`tab-btn ${activeTab === 'VEHICLES' ? 'active' : ''}`} onClick={() => setActiveTab('VEHICLES')}>🚚 청소 차량 배차표 (25대)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🚨 민원 & 수거 로그</button>
      </div>

      {activeTab === 'SCHEDULES' && (
        <div className="widget-section">
          <h2>🚛 CleanRoute 도시 쓰레기 수거 일정 (50개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>일정ID</th><th>수거 구역 명칭</th><th>배정 차량 번호</th><th>수거 예정일</th><th>작업 시간</th><th>민원 건수</th><th>상태</th></tr>
              </thead>
              <tbody>
                {schedules.map(sch => (
                  <tr key={sch.id}>
                    <td><strong>{sch.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sch.zoneName}</strong></td>
                    <td><span className="zone-badge">{sch.vehiclePlate}</span></td>
                    <td><small>{sch.scheduledDate}</small></td>
                    <td><strong>{sch.startTime} ~ {sch.endTime}</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{sch.complaintCount}건</strong></td>
                    <td><span className={`status-badge ${sch.status.toLowerCase()}`}>{sch.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ZONES' && (
        <div className="widget-section">
          <h2>🗺️ 지자체 지정 생활폐기물 수거 구역 (20개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>구역ID</th><th>구역 명칭</th><th>관할 자치구</th><th>폐기물 성상</th><th>일일 목표 수거량</th></tr>
              </thead>
              <tbody>
                {zones.map(zn => (
                  <tr key={zn.id}>
                    <td><strong>{zn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{zn.name}</strong></td>
                    <td><small>{zn.district}</small></td>
                    <td><span className="zone-badge">{zn.wasteType}</span></td>
                    <td><strong>{zn.dailyTargetTon}톤</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'VEHICLES' && (
        <div className="widget-section">
          <h2>🚚 자원순환 청소 차량 배차 현황 (25대)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>차량ID</th><th>차량 번호</th><th>담당 구역</th><th>적재 용량</th><th>운전 기사</th><th>정비 상태</th></tr>
              </thead>
              <tbody>
                {vehicles.map(vec => (
                  <tr key={vec.id}>
                    <td><strong>{vec.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{vec.plateNumber}</strong></td>
                    <td><small>{vec.zoneName}</small></td>
                    <td><strong>{vec.capacityTon}톤</strong></td>
                    <td><small>{vec.driverName}</small></td>
                    <td><span className={`status-badge ${vec.maintenanceStatus.toLowerCase()}`}>{vec.maintenanceStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🚨 시민 환경 민원 (45건) & 수거 실적 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>일정ID</th><th>수거 구역</th><th>실 수거량</th><th>수거 완료 시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {pickupLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.scheduleId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.zoneName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{log.collectedTon}톤</strong></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deletePickupLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 수거 로그 삭제 시 목록에서는 소거되나 구역별 수거량 및 차량별 작업량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 청소행정 배차 관제 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>일정ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.scheduleId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedComplete('SCH-3001')}>🔒 권한 없는 직원의 수거 완료 강제 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 수거 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
