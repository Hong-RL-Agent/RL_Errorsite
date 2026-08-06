import React, { useState } from 'react';

export default function CenterSection({ tickets, facilities, guardians, childrenList, usageLogs, activityLogs, deleteUsageLog, testUnauthorizedForceCheckout }) {
  const [activeTab, setActiveTab] = useState('TICKETS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'TICKETS' ? 'active' : ''}`} onClick={() => setActiveTab('TICKETS')}>🎫 입장권 (60건)</button>
        <button className={`tab-btn ${activeTab === 'FACILITIES' ? 'active' : ''}`} onClick={() => setActiveTab('FACILITIES')}>🎠 놀이시설 (20개)</button>
        <button className={`tab-btn ${activeTab === 'GUARDIANS' ? 'active' : ''}`} onClick={() => setActiveTab('GUARDIANS')}>👨‍👩‍👧‍👦 보호자/아동</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 이용 & 감사 이력</button>
      </div>

      {activeTab === 'TICKETS' && (
        <div className="widget-section">
          <h2>🎫 KidsPlay 프리미엄 키즈카페 입장 관제 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>입장권ID</th><th>입장코드</th><th>매장명</th><th>아동 이름</th><th>동반 보호자</th><th>입장 시각</th><th>기본 이용시간</th><th>남은 시간</th><th>추가요금</th><th>상태</th></tr>
              </thead>
              <tbody>
                {tickets.map(tck => (
                  <tr key={tck.id}>
                    <td><strong>{tck.id}</strong></td>
                    <td><small>{tck.ticketCode}</small></td>
                    <td><span className="store-badge">{tck.storeName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{tck.childName}</strong></td>
                    <td><strong>{tck.guardianName}</strong></td>
                    <td><small>{tck.enterTime}</small></td>
                    <td><strong>{tck.allowedHours}시간</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{tck.remainingMin}분</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{tck.extraFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${tck.status.toLowerCase()}`}>{tck.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FACILITIES' && (
        <div className="widget-section">
          <h2>🎠 키즈카페 인라인 놀이시설 & 수용 인원 정원 (20개 시설)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>시설ID</th><th>놀이시설 명칭</th><th>매장명</th><th>최대 수용 정원</th><th>현재 수용 동체 수</th><th>상태</th></tr>
              </thead>
              <tbody>
                {facilities.map(fac => (
                  <tr key={fac.id}>
                    <td><strong>{fac.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{fac.facilityName}</strong></td>
                    <td><span className="store-badge">{fac.storeName}</span></td>
                    <td><strong>최대 {fac.maxCapacity}명</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{fac.currentCount}명 이용 중</strong></td>
                    <td><span className={`status-badge ${fac.status.toLowerCase()}`}>{fac.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'GUARDIANS' && (
        <div className="widget-section">
          <h2>👨‍👩‍👧‍👦 동반 보호자 & 수강 아동 관리 대장 (50명 / 70명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>보호자ID</th><th>보호자 성명</th><th>연락처</th><th>아동과의 관계</th><th>동반 아동명</th><th>방문 횟수</th></tr>
              </thead>
              <tbody>
                {guardians.map(gdr => (
                  <tr key={gdr.id}>
                    <td><strong>{gdr.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{gdr.guardianName}</strong></td>
                    <td><small>{gdr.phone}</small></td>
                    <td><small>{gdr.relationship}</small></td>
                    <td><strong>{gdr.childName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{gdr.totalVisits}회</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 실시간 시설 놀이 이용 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>이용ID</th><th>입장권ID</th><th>아동 이름</th><th>놀이시설명</th><th>시작시각</th><th>종료시각</th><th>놀이시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {usageLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.tckId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.childName}</strong></td>
                    <td><small>{log.facilityName}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.startTime}</small></td>
                    <td><small>{log.endTime}</small></td>
                    <td><strong>{log.playMin}분</strong></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteUsageLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 이용 로그 삭제 시 목록에서는 소거되나 시설별 이용률, 시간대별 혼잡도, 매장별 입장 수 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 키즈카페 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>입장권ID</th><th>담당 스태프</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.tckId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedForceCheckout('TCK-4001')}>🔒 권한 없는 직원의 강제 퇴장 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 강제퇴장 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
