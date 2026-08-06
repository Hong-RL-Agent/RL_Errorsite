import React, { useState } from 'react';

export default function CenterSection({ bookings, classesList, seats, customers, kitLogs, activityLogs, deleteKitLog, testUnauthorizedConfirmBooking }) {
  const [activeTab, setActiveTab] = useState('BOOKINGS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'BOOKINGS' ? 'active' : ''}`} onClick={() => setActiveTab('BOOKINGS')}>🍷 수강 예약 (55건)</button>
        <button className={`tab-btn ${activeTab === 'SEATS' ? 'active' : ''}`} onClick={() => setActiveTab('SEATS')}>🛋️ 좌석 배치 (80석)</button>
        <button className={`tab-btn ${activeTab === 'KITS' ? 'active' : ''}`} onClick={() => setActiveTab('KITS')}>🍇 시음 키트 (60건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 소믈리에 감사 이력</button>
      </div>

      {activeTab === 'BOOKINGS' && (
        <div className="widget-section">
          <h2>🍷 WineClass 와인 아카데미 실시간 수강 예약 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>예약코드</th><th>수강 클래스명</th><th>고객 성명</th><th>배정 좌석</th><th>수강 일자</th><th>시음 키트 상태</th><th>수강 결제금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {bookings.map(bkg => (
                  <tr key={bkg.id}>
                    <td><strong>{bkg.id}</strong></td>
                    <td><small>{bkg.bookingCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bkg.className}</strong></td>
                    <td><strong>{bkg.customerName}</strong></td>
                    <td><span className="seat-badge">{bkg.seatNo}</span></td>
                    <td><small>{bkg.classDate}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{bkg.kitStatus}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{bkg.priceWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${bkg.status.toLowerCase()}`}>{bkg.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SEATS' && (
        <div className="widget-section">
          <h2>🛋️ 오크관 메인 테이스팅 룸 좌석 배치 현황 (80석)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>좌석ID</th><th>좌석 번호 및 위치</th><th>테이블 구역</th><th>착석 가능 상태</th></tr>
              </thead>
              <tbody>
                {seats.map(st => (
                  <tr key={st.id}>
                    <td><strong>{st.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{st.seatNo}</strong></td>
                    <td><span className="seat-badge">{st.tableGroup}</span></td>
                    <td><span className={`status-badge ${st.status.toLowerCase()}`}>{st.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🍷 클래스별 수강 예약율 현황 (30개 클래스)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>클래스ID</th><th>수강 클래스명</th><th>담당 소믈리에</th><th>수강료</th><th>예약점유율</th></tr>
              </thead>
              <tbody>
                {classesList.map(cls => (
                  <tr key={cls.id}>
                    <td><strong>{cls.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cls.className}</strong></td>
                    <td><strong>{cls.sommelier}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cls.priceWon.toLocaleString()}원</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{cls.occupancyPercent}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'KITS' && (
        <div className="widget-section">
          <h2>🍇 소믈리에 프리미엄 와인 & 마리아주 페어링 시음 키트 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>키트ID</th><th>예약ID</th><th>클래스명</th><th>고객명</th><th>준비 키트 구성 품목</th><th>준비 완료 시각</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {kitLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bkgId}</td>
                    <td><small>{log.className}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.customerName}</strong></td>
                    <td><small>{log.kitItems}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.preparedTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteKitLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 키트 준비 로그 삭제 시 목록에서는 소거되나 클래스별 준비율, 고객별 참석률, 월별 예약 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 와인 아카데미 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당 소믈리에</th><th>처리 내역</th><th>일시</th></tr>
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
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirmBooking('BKG-3001')}>🔒 권한 없는 직원의 와인 클래스 예약 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 예약 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
