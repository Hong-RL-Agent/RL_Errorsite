import React, { useState } from 'react';

export default function CenterSection({ chargers, stations, reservations, chargeLogs, breakdownReports, activityLogs, deleteChargeLog, testUnauthorizedDisable }) {
  const [activeTab, setActiveTab] = useState('CHARGERS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'CHARGERS' ? 'active' : ''}`} onClick={() => setActiveTab('CHARGERS')}>🔌 충전기 대장 (80개)</button>
        <button className={`tab-btn ${activeTab === 'STATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('STATIONS')}>🏢 충전소 현황 (15개)</button>
        <button className={`tab-btn ${activeTab === 'RESERVATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('RESERVATIONS')}>📅 충전 예약 내역 (50건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>⚡ 충전 로그 & 장애 신고</button>
      </div>

      {activeTab === 'CHARGERS' && (
        <div className="widget-section">
          <h2>🔌 ChargeGrid 스마트 충전기 대장 (80개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>충전기ID</th><th>충전소 명칭</th><th>충전기 타입</th><th>최대출력</th><th>설치 위치</th><th>누적 충전량</th><th>점검 메모</th><th>상태</th></tr>
              </thead>
              <tbody>
                {chargers.map(chg => (
                  <tr key={chg.id}>
                    <td><strong>{chg.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{chg.stationName}</strong></td>
                    <td><span className="station-badge">{chg.chargerType}</span></td>
                    <td><strong>{chg.maxKw}kW</strong></td>
                    <td><small>{chg.locationFloor}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{chg.totalKwCharged.toLocaleString()}kWh</strong></td>
                    <td><small>{chg.inspectMemo}</small></td>
                    <td><span className={`status-badge ${chg.status.toLowerCase()}`}>{chg.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STATIONS' && (
        <div className="widget-section">
          <h2>🏢 전국 주요 EV 하이퍼 충전소 스테이션 (15개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>충전소ID</th><th>충전소 명칭</th><th>설치 주소</th><th>보유 충전기 수</th><th>총 변압 용량</th></tr>
              </thead>
              <tbody>
                {stations.map(stn => (
                  <tr key={stn.id}>
                    <td><strong>{stn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{stn.name}</strong></td>
                    <td><small>{stn.location}</small></td>
                    <td><strong>{stn.totalChargers}대</strong></td>
                    <td><strong style={{ color: 'var(--color-dark)' }}>{stn.operatingKw}kW</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RESERVATIONS' && (
        <div className="widget-section">
          <h2>📅 EV 차량 충전 사전 예약 타임라인 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>충전기ID</th><th>충전소 명칭</th><th>차량 번호 / 모델</th><th>운전자</th><th>예약일자</th><th>예약 시간</th><th>목표kWh</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reservations.map(rsv => (
                  <tr key={rsv.id}>
                    <td><strong>{rsv.id}</strong></td>
                    <td>{rsv.chargerId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rsv.stationName}</strong></td>
                    <td><small>{rsv.carNumber}</small></td>
                    <td><small>{rsv.driverName}</small></td>
                    <td><small>{rsv.reserveDate}</small></td>
                    <td><strong>{rsv.startTime} ~ {rsv.endTime}</strong></td>
                    <td>{rsv.targetKwh}kWh</td>
                    <td><span className={`status-badge ${rsv.status.toLowerCase()}`}>{rsv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>⚡ 실시간 충전 완료 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>충전기ID</th><th>충전소 명칭</th><th>차량 번호</th><th>전력 사용량</th><th>결제 금액</th><th>충전 시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {chargeLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.chargerId}</td>
                    <td><small>{log.stationName}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.carNumber}</strong></td>
                    <td><strong>{log.kwhUsed}kWh</strong></td>
                    <td>{log.amountWon.toLocaleString()}원</td>
                    <td><small>{log.chargeDurationMin}분</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteChargeLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 충전 로그 삭제 시 목록에서는 소거되나 충전소별 사용량 및 충전기별 고장률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 충전 인프라 관제 감사 로그 (80건) & 장애 신고 (35건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>충전기ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.chargerId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedDisable('CHG-1001')}>🔒 권한 없는 직원의 충전기 강제 사용중지 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 사용중지 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
