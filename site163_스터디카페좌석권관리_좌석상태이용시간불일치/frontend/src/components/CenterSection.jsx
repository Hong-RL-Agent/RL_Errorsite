import React, { useState } from 'react';

export default function CenterSection({ seats, branches, members, tickets, entryLogs, activityLogs, deleteEntryLog, testUnauthorizedForceCheckOut }) {
  const [activeTab, setActiveTab] = useState('SEATS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'SEATS' ? 'active' : ''}`} onClick={() => setActiveTab('SEATS')}>📖 좌석 이용 (100개)</button>
        <button className={`tab-btn ${activeTab === 'BRANCHES' ? 'active' : ''}`} onClick={() => setActiveTab('BRANCHES')}>🏢 스터디 지점 현황</button>
        <button className={`tab-btn ${activeTab === 'MEMBERS' ? 'active' : ''}`} onClick={() => setActiveTab('MEMBERS')}>👤 회원 & 이용권</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 입퇴실 & 감사 이력</button>
      </div>

      {activeTab === 'SEATS' && (
        <div className="widget-section">
          <h2>📖 StudySeat 스터디카페 좌석 및 배치 관제 대장 (100개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>좌석ID</th><th>좌석 번호 & 유형</th><th>지점명</th><th>현재 이용 회원명</th><th>남은 이용시간</th><th>입실 시각</th><th>퇴실 예정 시각</th><th>상태</th></tr>
              </thead>
              <tbody>
                {seats.map(st => (
                  <tr key={st.id}>
                    <td><strong>{st.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{st.seatNo}</strong></td>
                    <td><span className="branch-badge">{st.branchName}</span></td>
                    <td><strong>{st.currentMember}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{st.remainingHours}시간</strong></td>
                    <td><small>{st.startTime}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{st.endTime}</small></td>
                    <td><span className={`status-badge ${st.status.toLowerCase()}`}>{st.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BRANCHES' && (
        <div className="widget-section">
          <h2>🏢 스터디카페 지점별 좌석 가동률 (10개 지점)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>지점ID</th><th>지점명</th><th>도로명 주소</th><th>총 좌석 수</th><th>현재 사용 중 좌석</th><th>상태</th></tr>
              </thead>
              <tbody>
                {branches.map(brn => (
                  <tr key={brn.id}>
                    <td><strong>{brn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{brn.branchName}</strong></td>
                    <td><small>{brn.address}</small></td>
                    <td><small>{brn.totalSeats}석</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{brn.occupiedSeats}석 이용 중</strong></td>
                    <td><span className={`status-badge ${brn.status.toLowerCase()}`}>{brn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MEMBERS' && (
        <div className="widget-section">
          <h2>👤 등록 회원 명단 & 이용권 보유 현황 (70명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>회원ID</th><th>회원 코드</th><th>회원 성명</th><th>연락처</th><th>보유 이용권 종류</th><th>잔여 시간</th><th>등록 지점</th></tr>
              </thead>
              <tbody>
                {members.map(mbr => (
                  <tr key={mbr.id}>
                    <td><strong>{mbr.id}</strong></td>
                    <td><small>{mbr.memberCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{mbr.memberName}</strong></td>
                    <td><small>{mbr.phone}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{mbr.ticketType}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{mbr.remainingHours}시간</strong></td>
                    <td><span className="branch-badge">{mbr.registeredBranch}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🎟️ 이용권 발급 내역 (70개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>이용권ID</th><th>이용권 코드</th><th>회원명</th><th>이용권 명칭</th><th>지점명</th><th>금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {tickets.map(tck => (
                  <tr key={tck.id}>
                    <td><strong>{tck.id}</strong></td>
                    <td><small>{tck.ticketCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{tck.memberName}</strong></td>
                    <td><small>{tck.ticketType}</small></td>
                    <td><small>{tck.branchName}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{tck.priceWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${tck.status.toLowerCase()}`}>{tck.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 키오스크 입퇴실 & 태그 실시간 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>입퇴실로그ID</th><th>좌석ID</th><th>회원명</th><th>좌석번호</th><th>지점명</th><th>구분</th><th>일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {entryLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.seatId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.memberName}</strong></td>
                    <td><small>{log.seatNo}</small></td>
                    <td><small>{log.branchName}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{log.actionType}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.logTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteEntryLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 입퇴실 로그 삭제 시 목록에서는 소거되나 지점별 이용률, 좌석별 회전율, 회원별 누적 이용시간 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 스터디카페 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>좌석ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.seatId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedForceCheckOut('SEAT-1001')}>🔒 권한 없는 직원의 강제퇴실 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 강제퇴실 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
