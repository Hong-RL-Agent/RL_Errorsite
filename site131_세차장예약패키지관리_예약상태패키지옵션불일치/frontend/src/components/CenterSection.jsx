import React, { useState } from 'react';

export default function CenterSection({ bookings, branches, packages, workLogs, activityLogs, deleteWorkLog, testUnauthorizedRefund }) {
  const [activeTab, setActiveTab] = useState('BOOKINGS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'BOOKINGS' ? 'active' : ''}`} onClick={() => setActiveTab('BOOKINGS')}>🚙 예약 대장 (50건)</button>
        <button className={`tab-btn ${activeTab === 'BRANCHES' ? 'active' : ''}`} onClick={() => setActiveTab('BRANCHES')}>🏬 지점 베이 (10개)</button>
        <button className={`tab-btn ${activeTab === 'PACKAGES' ? 'active' : ''}`} onClick={() => setActiveTab('PACKAGES')}>🧽 세차 패키지 (15개)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🧼 작업 & 감사 이력</button>
      </div>

      {activeTab === 'BOOKINGS' && (
        <div className="widget-section">
          <h2>🚙 WashBay 세차 예약 & 옵션 선택 대장 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>예약번호</th><th>지점명</th><th>차량번호</th><th>차종</th><th>고객명</th><th>선택 세차 패키지</th><th>추가 옵션</th><th>총 금액</th><th>시간</th><th>상태</th></tr>
              </thead>
              <tbody>
                {bookings.map(bkg => (
                  <tr key={bkg.id}>
                    <td><strong>{bkg.id}</strong></td>
                    <td><small>{bkg.bookingNo}</small></td>
                    <td><span className="branch-badge">{bkg.branchName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bkg.carNo}</strong></td>
                    <td><small>{bkg.carType}</small></td>
                    <td><strong>{bkg.ownerName}</strong></td>
                    <td><small>{bkg.packageName}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{bkg.options}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{bkg.totalFeeWon.toLocaleString()}원</strong></td>
                    <td><small>{bkg.bookingTime}</small></td>
                    <td><span className={`status-badge ${bkg.status.toLowerCase()}`}>{bkg.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BRANCHES' && (
        <div className="widget-section">
          <h2>🏬 수도권 주요 디테일링 지점 & 베이 보유 현황 (10개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>지점ID</th><th>지점 명칭</th><th>상세 주소</th><th>작업 베이 수</th><th>점장 / 관리자</th><th>상태</th></tr>
              </thead>
              <tbody>
                {branches.map(brn => (
                  <tr key={brn.id}>
                    <td><strong>{brn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{brn.name}</strong></td>
                    <td><small>{brn.address}</small></td>
                    <td><strong>{brn.baysCount}개 베이</strong></td>
                    <td><small>{brn.managerName}</small></td>
                    <td><span className={`status-badge ${brn.status.toLowerCase()}`}>{brn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PACKAGES' && (
        <div className="widget-section">
          <h2>🧽 세차 & 광택 케어 패키지 카탈로그 (15개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>패키지ID</th><th>세차 패키지 명칭</th><th>표준 서비스 금액</th><th>예상 소요시간</th><th>패키지 상세 구성</th></tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td><strong>{pkg.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{pkg.packageName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{pkg.priceWon.toLocaleString()}원</strong></td>
                    <td><small>{pkg.durationMinutes}분</small></td>
                    <td><small>{pkg.desc}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🧼 실시간 베이 입고 및 세차 작업 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>입고 차량번호</th><th>지점명</th><th>세차 작업 스캔 내역</th><th>시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {workLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bookingId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.carNo}</strong></td>
                    <td><small>{log.branchName}</small></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteWorkLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 작업 로그 삭제 시 목록에서는 소거되나 지점별 매출 및 패키지 선택률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 세차장 운영 및 결제 환불 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당 직원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bookingId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedRefund('BKG-1001')}>🔒 권한 없는 직원의 예약 강제 환불 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 예약 환불 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
