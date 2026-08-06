import React, { useState } from 'react';

export default function CenterSection({ tasks, zones, vehicles, workers, snowLogs, activityLogs, deleteSnowLog, testUnauthorizedCompleteTask }) {
  const [activeTab, setActiveTab] = useState('TASKS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'TASKS' ? 'active' : ''}`} onClick={() => setActiveTab('TASKS')}>🚛 제설 작업 (60건)</button>
        <button className={`tab-btn ${activeTab === 'MAP' ? 'active' : ''}`} onClick={() => setActiveTab('MAP')}>🗺️ 구역 & 지도 (30개)</button>
        <button className={`tab-btn ${activeTab === 'VEHICLES' ? 'active' : ''}`} onClick={() => setActiveTab('VEHICLES')}>👨‍✈️ 차량 & 운전원</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 로그 & 감사 이력</button>
      </div>

      {activeTab === 'TASKS' && (
        <div className="widget-section">
          <h2>🚛 SnowFleet 도시 제설 작업 통합 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>작업ID</th><th>작업코드</th><th>제설 구역명</th><th>투입 차량번호</th><th>담당 운전원</th><th>GPS 현재 실시간 위치</th><th>투입 염화칼슘</th><th>우선순위</th><th>상태</th></tr>
              </thead>
              <tbody>
                {tasks.map(tsk => (
                  <tr key={tsk.id}>
                    <td><strong>{tsk.id}</strong></td>
                    <td><small>{tsk.taskCode}</small></td>
                    <td><span className="zone-badge">{tsk.zoneName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{tsk.vehicleNo}</strong></td>
                    <td><strong>{tsk.workerName}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{tsk.currentLocation}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{tsk.saltAmountKg}kg</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{tsk.priority}</small></td>
                    <td><span className={`status-badge ${tsk.status.toLowerCase()}`}>{tsk.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MAP' && (
        <div className="widget-section">
          <h2>🗺️ 서울특별시 제설 구역 더미 지도 & 도로 연장 (30개 구역)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>구역ID</th><th>제설 구역명</th><th>권한 서식</th><th>우선순위</th><th>총 도로 연장 (km)</th><th>적설량 (cm)</th><th>상태</th></tr>
              </thead>
              <tbody>
                {zones.map(zon => (
                  <tr key={zon.id}>
                    <td><strong>{zon.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{zon.zoneName}</strong></td>
                    <td><small>{zon.region}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{zon.priority}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{zon.roadLengthKm}km</strong></td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>{zon.snowDepthCm}cm</strong></td>
                    <td><span className={`status-badge ${zon.status.toLowerCase()}`}>{zon.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'VEHICLES' && (
        <div className="widget-section">
          <h2>👨‍✈️ 제설 작업 특수 차량 배치 현황 (35대)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>차량ID</th><th>투입 차량번호 & 톤수</th><th>배정 제설구역</th><th>현재 실시간 위치</th><th>장비 상태</th><th>염화칼슘 적재량</th></tr>
              </thead>
              <tbody>
                {vehicles.map(vhc => (
                  <tr key={vhc.id}>
                    <td><strong>{vhc.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{vhc.vehicleNo}</strong></td>
                    <td><small>{vhc.assignedZone}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{vhc.currentLocation}</small></td>
                    <td><span className="zone-badge">{vhc.equipmentStatus}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{vhc.saltCapacityKg}kg</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>👷‍♂️ 전문 제설 운전원 현황 (40명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>작업자ID</th><th>작업자 성명</th><th>연락처</th><th>담당 차량번호</th><th>담당 구역명</th><th>교대 근무</th></tr>
              </thead>
              <tbody>
                {workers.map(wrk => (
                  <tr key={wrk.id}>
                    <td><strong>{wrk.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{wrk.workerName}</strong></td>
                    <td><small>{wrk.phone}</small></td>
                    <td><small>{wrk.vehicleNo}</small></td>
                    <td><small>{wrk.assignedZone}</small></td>
                    <td><span className="zone-badge">{wrk.shift}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 제설 차량 현장 운행 및 살포 실시간 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>제설로그ID</th><th>작업ID</th><th>구역명</th><th>차량번호</th><th>세부 제설 및 살포 작업 내역</th><th>작업 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {snowLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.taskId}</td>
                    <td><small>{log.zoneName}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.vehicleNo}</strong></td>
                    <td><small>{log.workDetail}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.logTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteSnowLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 제설 로그 삭제 시 목록에서는 소거되나 구역별 작업률, 차량별 운행거리, 염화칼슘 사용량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 재난안전 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>작업ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.taskId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompleteTask('TSK-5001')}>🔒 권한 없는 직원의 제설 작업 완료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 작업 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
