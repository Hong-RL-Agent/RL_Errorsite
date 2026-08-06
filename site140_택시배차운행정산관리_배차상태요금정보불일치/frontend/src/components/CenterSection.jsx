import React, { useState } from 'react';

export default function CenterSection({ calls, drivers, vehicles, rideLogs, settlements, activityLogs, deleteRideLog, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('CALLS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'CALLS' ? 'active' : ''}`} onClick={() => setActiveTab('CALLS')}>🚖 실시간 배차 (60건)</button>
        <button className={`tab-btn ${activeTab === 'DRIVERS' ? 'active' : ''}`} onClick={() => setActiveTab('DRIVERS')}>🚕 기사 명단 (35명)</button>
        <button className={`tab-btn ${activeTab === 'VEHICLES' ? 'active' : ''}`} onClick={() => setActiveTab('VEHICLES')}>🚘 차량 관제 (35대)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>💳 운행 정산 & 감사 이력</button>
      </div>

      {activeTab === 'CALLS' && (
        <div className="widget-section">
          <h2>🚖 TaxiDispatch 실시간 승객 호출 & 배차 관제 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>호출ID</th><th>호출코드</th><th>권역</th><th>출발지 ➔ 목적지</th><th>담당 기사</th><th>차량번호</th><th>운행거리</th><th>실제요금</th><th>상태</th></tr>
              </thead>
              <tbody>
                {calls.map(cl => (
                  <tr key={cl.id}>
                    <td><strong>{cl.id}</strong></td>
                    <td><small>{cl.callCode}</small></td>
                    <td><span className="region-badge">{cl.region}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cl.origin} ➔ {cl.destination}</strong></td>
                    <td><strong>{cl.driverName}</strong></td>
                    <td><small>{cl.carNo}</small></td>
                    <td><small>{cl.distanceKm}km</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cl.actualFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${cl.status.toLowerCase()}`}>{cl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DRIVERS' && (
        <div className="widget-section">
          <h2>🚕 가맹 택시 기사 및 평점 대장 (35명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>기사ID</th><th>기사 성명</th><th>연락처</th><th>등록 차량번호</th><th>차종</th><th>친절 평점</th><th>누적 운행 횟수</th></tr>
              </thead>
              <tbody>
                {drivers.map(drv => (
                  <tr key={drv.id}>
                    <td><strong>{drv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{drv.driverName}</strong></td>
                    <td><small>{drv.phone}</small></td>
                    <td><span className="region-badge">{drv.carNo}</span></td>
                    <td><small>{drv.carModel}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {drv.rating} / 5.0</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{drv.completedRides}회</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'VEHICLES' && (
        <div className="widget-section">
          <h2>🚘 실시간 차량 GPS 현황 관제 (35대)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>차량ID</th><th>차량번호</th><th>담당 기사</th><th>연료 종류</th><th>최근 수신 GPS 위치</th><th>상태</th></tr>
              </thead>
              <tbody>
                {vehicles.map(vhc => (
                  <tr key={vhc.id}>
                    <td><strong>{vhc.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{vhc.carNo}</strong></td>
                    <td>{vhc.driverName}</td>
                    <td><small>{vhc.fuelType}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{vhc.lastLocation}</small></td>
                    <td><span className={`status-badge ${vhc.status.toLowerCase()}`}>{vhc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>💳 운행 정산 및 기사 입금 내역 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>호출ID</th><th>담당 기사</th><th>차량번호</th><th>운행 구간</th><th>미터기 요금</th><th>운행 시각</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {rideLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.callId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.driverName}</strong></td>
                    <td><small>{log.carNo}</small></td>
                    <td><small>{log.origin} ➔ {log.destination}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{log.fareWon.toLocaleString()}원</strong></td>
                    <td><small>{log.rideTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteRideLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 운행 로그 삭제 시 목록에서는 소거되나 기사별 매출, 지역별 호출 수, 월별 정산 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 스마트 택시 통합 관제 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>호출ID</th><th>담당 관제사</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.callId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('SET-8001')}>🔒 권한 없는 직원의 수수료 정산 최종 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 정산 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
