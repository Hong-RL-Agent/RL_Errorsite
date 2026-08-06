import React, { useState } from 'react';

export default function CenterSection({ schedules, routesList, buses, drivers, boardingLogs, activityLogs, deleteBoardingLog, testUnauthorizedCompleteSchedule }) {
  const [activeTab, setActiveTab] = useState('SCHEDULES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'SCHEDULES' ? 'active' : ''}`} onClick={() => setActiveTab('SCHEDULES')}>🚌 셔틀 운행 배차 (60건)</button>
        <button className={`tab-btn ${activeTab === 'ROUTES' ? 'active' : ''}`} onClick={() => setActiveTab('ROUTES')}>🚩 노선 & 버스 (12/25대)</button>
        <button className={`tab-btn ${activeTab === 'BOARDING' ? 'active' : ''}`} onClick={() => setActiveTab('BOARDING')}>💳 승차 태그 로그 (100건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 셔틀 감사 이력</button>
      </div>

      {activeTab === 'SCHEDULES' && (
        <div className="widget-section">
          <h2>🚌 ShuttleCampus 캠퍼스 셔틀버스 실시간 운행 관제 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>배차ID</th><th>배차코드</th><th>노선 명칭</th><th>차량번호</th><th>담당 기사</th><th>출발시각</th><th>도착시각</th><th>승차인원</th><th>혼잡도</th><th>상태</th></tr>
              </thead>
              <tbody>
                {schedules.map(sch => (
                  <tr key={sch.id}>
                    <td><strong>{sch.id}</strong></td>
                    <td><small>{sch.schCode}</small></td>
                    <td><span className="route-badge">{sch.routeName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sch.busNo}</strong></td>
                    <td><strong>{sch.driverName}</strong></td>
                    <td><small>{sch.departureTime}</small></td>
                    <td><small>{sch.arrivalTime}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{sch.passengerCount}명 / {sch.seatCapacity}석</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{sch.congestion}</strong></td>
                    <td><span className={`status-badge ${sch.status.toLowerCase()}`}>{sch.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ROUTES' && (
        <div className="widget-section">
          <h2>🚩 대학교 셔틀 노선 타임라인 & 등록 셔틀버스 (12개 노선 / 25대 버스)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>노선ID</th><th>노선 명칭</th><th>노선 유형</th><th>경유 정류장 수</th><th>배차 간격</th><th>상태</th></tr>
              </thead>
              <tbody>
                {routesList.map(rot => (
                  <tr key={rot.id}>
                    <td><strong>{rot.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rot.routeName}</strong></td>
                    <td><small>{rot.type}</small></td>
                    <td><strong>{rot.totalStops}개 정류장</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{rot.intervalMin}분 간격</strong></td>
                    <td><span className={`status-badge ${rot.status.toLowerCase()}`}>{rot.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🚌 셔틀버스 차종 및 탑승 승차 정원 (25대)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>버스ID</th><th>차량 번호</th><th>좌석 수</th><th>담당 기사</th><th>연료 및 모델</th><th>상태</th></tr>
              </thead>
              <tbody>
                {buses.map(bus => (
                  <tr key={bus.id}>
                    <td><strong>{bus.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bus.busNo}</strong></td>
                    <td><strong>{bus.seatCapacity}인승</strong></td>
                    <td><strong>{bus.driverName}</strong></td>
                    <td><small>{bus.fuelType}</small></td>
                    <td><span className={`status-badge ${bus.status.toLowerCase()}`}>{bus.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BOARDING' && (
        <div className="widget-section">
          <h2>💳 학생증 NFC & 스마트 모바일 탑승 태그 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>승차ID</th><th>배차ID</th><th>승차 정류장명</th><th>순시 승차인원</th><th>태그 승차시각</th><th>인증 카드 수단</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {boardingLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.schId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.stopName}</strong></td>
                    <td><strong>+{log.boardedCount}명</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.tagTime}</small></td>
                    <td><small>{log.cardType}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteBoardingLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 승차 기록 삭제 시 목록에서는 소거되나 노선별 혼잡도, 기사별 운행 수, 시간대별 승차 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 셔틀버스 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>배차ID</th><th>담당 관제원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.schId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompleteSchedule('SCH-9001')}>🔒 권한 없는 직원의 셔틀 운행 완료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 운행 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
