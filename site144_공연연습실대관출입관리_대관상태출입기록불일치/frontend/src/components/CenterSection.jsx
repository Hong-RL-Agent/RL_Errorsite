import React, { useState } from 'react';

export default function CenterSection({ bookings, rooms, users, accessLogs, equipmentLogs, activityLogs, deleteAccessLog, testUnauthorizedForceCancel }) {
  const [activeTab, setActiveTab] = useState('BOOKINGS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'BOOKINGS' ? 'active' : ''}`} onClick={() => setActiveTab('BOOKINGS')}>🎭 대관 예약 (55건)</button>
        <button className={`tab-btn ${activeTab === 'ACCESS' ? 'active' : ''}`} onClick={() => setActiveTab('ACCESS')}>🚪 출입 기록 (90건)</button>
        <button className={`tab-btn ${activeTab === 'EQUIPMENT' ? 'active' : ''}`} onClick={() => setActiveTab('EQUIPMENT')}>🎤 장비 렌탈 (50건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 대관 감사 이력</button>
      </div>

      {activeTab === 'BOOKINGS' && (
        <div className="widget-section">
          <h2>🎭 PracticeRoom 공연 연습실 실시간 대관 관제 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>예약코드</th><th>연습실 명칭</th><th>이용자 / 팀명</th><th>대관 일자</th><th>사용 시간</th><th>출입 인정 시각</th><th>대관 결제금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {bookings.map(bkg => (
                  <tr key={bkg.id}>
                    <td><strong>{bkg.id}</strong></td>
                    <td><small>{bkg.bookingCode}</small></td>
                    <td><span className="room-badge">{bkg.roomName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bkg.userName} ({bkg.teamName})</strong></td>
                    <td><small>{bkg.bookingDate}</small></td>
                    <td><small>{bkg.startTime} ~ {bkg.endTime}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{bkg.entryTime}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{bkg.totalFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${bkg.status.toLowerCase()}`}>{bkg.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ACCESS' && (
        <div className="widget-section">
          <h2>🚪 스마트 QR / 도어락 실시간 출입 기록 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>출입ID</th><th>예약ID</th><th>연습실</th><th>이용자 성명</th><th>입실 인증시각</th><th>퇴실 시각</th><th>인증 수단</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {accessLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bkgId}</td>
                    <td><span className="room-badge">{log.roomName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.userName}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.entryTime}</small></td>
                    <td><small>{log.exitTime}</small></td>
                    <td><small>{log.authType}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteAccessLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 출입 기록 삭제 시 목록에서는 소거되나 연습실별 이용률, 이용자 사용시간, 장비 사용 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>
        </div>
      )}

      {activeTab === 'EQUIPMENT' && (
        <div className="widget-section">
          <h2>🎤 음향 / 조명 / 악기 대여 장비 관리 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>장비ID</th><th>예약ID</th><th>연습실</th><th>대여 장비 품목</th><th>사용 렌탈료</th><th>상태</th></tr>
              </thead>
              <tbody>
                {equipmentLogs.map(eqp => (
                  <tr key={eqp.id}>
                    <td><strong>{eqp.id}</strong></td>
                    <td>{eqp.bkgId}</td>
                    <td><span className="room-badge">{eqp.roomName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{eqp.equipmentName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{eqp.feeWon.toLocaleString()}원</strong></td>
                    <td><span className="room-badge">{eqp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 대관 통합 센터 관제 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당 직원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bkgId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedForceCancel('BKG-6001')}>🔒 권한 없는 직원의 대관 예약 강제 취소 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 강제취소 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
