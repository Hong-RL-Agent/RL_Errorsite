import React, { useState } from 'react';

export default function CenterSection({ passes, lounges, seats, passengers, checkinLogs, activityLogs, deleteCheckinLog, testUnauthorizedApproveEntry }) {
  const [activeTab, setActiveTab] = useState('PASSES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'PASSES' ? 'active' : ''}`} onClick={() => setActiveTab('PASSES')}>🎫 이용권 대장 (60개)</button>
        <button className={`tab-btn ${activeTab === 'LOUNGES' ? 'active' : ''}`} onClick={() => setActiveTab('LOUNGES')}>🏢 라운지 & 좌석</button>
        <button className={`tab-btn ${activeTab === 'PASSENGERS' ? 'active' : ''}`} onClick={() => setActiveTab('PASSENGERS')}>👨‍✈️ VIP 승객 명단</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 체크인 & 감사 이력</button>
      </div>

      {activeTab === 'PASSES' && (
        <div className="widget-section">
          <h2>🎫 LoungePass 공항 프리미엄 라운지 이용권 통합 대장 (60개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>이용권ID</th><th>이용권코드</th><th>터미널 라운지</th><th>승객 성명</th><th>항공편 번호</th><th>승객 등급</th><th>배정 좌석번호</th><th>만료 예정일시</th><th>이용료</th><th>상태</th></tr>
              </thead>
              <tbody>
                {passes.map(pss => (
                  <tr key={pss.id}>
                    <td><strong>{pss.id}</strong></td>
                    <td><small>{pss.passCode}</small></td>
                    <td><span className="terminal-badge">{pss.terminal.split(' ')[0]}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{pss.passengerName}</strong></td>
                    <td><small>{pss.flightNo}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{pss.tier}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{pss.seatNo}</strong></td>
                    <td><small>{pss.expireTime}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{pss.feeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${pss.status.toLowerCase()}`}>{pss.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOUNGES' && (
        <div className="widget-section">
          <h2>🏢 공항 터미널 라운지 및 혼잡도 현황 (10개)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>라운지ID</th><th>라운지 명칭</th><th>터미널 위치</th><th>게이트 번호</th><th>점유 좌석 / 전체</th><th>실시간 혼잡도</th></tr>
              </thead>
              <tbody>
                {lounges.map(lng => (
                  <tr key={lng.id}>
                    <td><strong>{lng.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{lng.loungeName}</strong></td>
                    <td><small>{lng.terminal}</small></td>
                    <td><small>{lng.gateNo}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{lng.occupiedSeats} / {lng.totalSeats}석</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{lng.congestion}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🤹 라운지 내부 좌석 배치도 현황 (100개 좌석)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>좌석ID</th><th>좌석 번호 & 타입</th><th>소속 라운지명</th><th>좌석 구역 (Zone)</th><th>점유 상태</th></tr>
              </thead>
              <tbody>
                {seats.map(set => (
                  <tr key={set.id}>
                    <td><strong>{set.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{set.seatNo}</strong></td>
                    <td><small>{set.loungeName}</small></td>
                    <td><span className="terminal-badge">{set.zone}</span></td>
                    <td><span className={`status-badge ${set.status.toLowerCase()}`}>{set.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PASSENGERS' && (
        <div className="widget-section">
          <h2>👨‍✈️ 공항 라운지 이용 등록 승객 명단 (50명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>승객ID</th><th>승객 성명</th><th>연락처</th><th>탑승 예정 항공편</th><th>배정 좌석번호</th><th>승객 멤버십 등급</th><th>방문 횟수</th></tr>
              </thead>
              <tbody>
                {passengers.map(psg => (
                  <tr key={psg.id}>
                    <td><strong>{psg.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{psg.passengerName}</strong></td>
                    <td><small>{psg.phone}</small></td>
                    <td><small>{psg.flightNo}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{psg.seatNo}</small></td>
                    <td><span className="terminal-badge">{psg.tier}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{psg.visitCount}회</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 승객 체크인 실시간 입장/퇴장 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>체크인로그ID</th><th>이용권ID</th><th>승객명</th><th>라운지명</th><th>좌석번호</th><th>체크인 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {checkinLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.passId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.passengerName}</strong></td>
                    <td><small>{log.loungeName}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{log.seatNo}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.checkinTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteCheckinLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 체크인 로그 삭제 시 목록에서는 소거되나 라운지별 혼잡도, 좌석 이용률, 등급별 이용 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 공항 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>이용권ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.passId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApproveEntry('PSS-7001')}>🔒 권한 없는 직원의 라운지 입장승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 입장승인 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
