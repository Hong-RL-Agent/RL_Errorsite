import React, { useState } from 'react';

export default function CenterSection({ counsels, counselors, clients, followups, counselLogs, activityLogs, deleteCounselLog, testUnauthorizedViewLog }) {
  const [activeTab, setActiveTab] = useState('COUNSELS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'COUNSELS' ? 'active' : ''}`} onClick={() => setActiveTab('COUNSELS')}>🗣️ 상담 예약 (60건)</button>
        <button className={`tab-btn ${activeTab === 'COUNSELORS' ? 'active' : ''}`} onClick={() => setActiveTab('COUNSELORS')}>👨‍⚕️ 상담사/내담자</button>
        <button className={`tab-btn ${activeTab === 'FOLLOWUPS' ? 'active' : ''}`} onClick={() => setActiveTab('FOLLOWUPS')}>🗓️ 후속 일정 (40건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 기록 & 감사 이력</button>
      </div>

      {activeTab === 'COUNSELS' && (
        <div className="widget-section">
          <h2>🗣️ CounselNote 온라인 심리 상담 예약 통합 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>상담코드</th><th>내담자명</th><th>상담 주제 / 민원</th><th>담당 상담사명</th><th>상담 일시</th><th>우선순위</th><th>상담료</th><th>상태</th></tr>
              </thead>
              <tbody>
                {counsels.map(cnsl => (
                  <tr key={cnsl.id}>
                    <td><strong>{cnsl.id}</strong></td>
                    <td><small>{cnsl.counselCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cnsl.clientName}</strong></td>
                    <td><small>{cnsl.topic}</small></td>
                    <td><strong>{cnsl.counselorName}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{cnsl.counselDate}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{cnsl.priority}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cnsl.feeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${cnsl.status.toLowerCase()}`}>{cnsl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'COUNSELORS' && (
        <div className="widget-section">
          <h2>👨‍⚕️ 심리센터 전문 상담사 명단 (20명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>상담사ID</th><th>상담사 성명</th><th>연락처</th><th>보유 면허 / 자격</th><th>담당 내담자 수</th><th>내담자 평점</th></tr>
              </thead>
              <tbody>
                {counselors.map(cns => (
                  <tr key={cns.id}>
                    <td><strong>{cns.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cns.counselorName}</strong></td>
                    <td><small>{cns.phone}</small></td>
                    <td><small>{cns.license}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cns.assignedClients}명 관리</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {cns.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>👤 등록 내담자 인적사항 명단 (50명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>내담자ID</th><th>내담자 성명</th><th>연락처</th><th>주 상담 관심사</th><th>누적 회차</th><th>우선순위</th></tr>
              </thead>
              <tbody>
                {clients.map(clt => (
                  <tr key={clt.id}>
                    <td><strong>{clt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{clt.clientName}</strong></td>
                    <td><small>{clt.phone}</small></td>
                    <td><small>{clt.topic}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{clt.totalSessions}회차 진행</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{clt.priority}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FOLLOWUPS' && (
        <div className="widget-section">
          <h2>🗓️ 후속 세션 및 검사 예약 일정 현황 (40건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>후속ID</th><th>예약ID</th><th>내담자명</th><th>담당 상담사명</th><th>차기 후속 상담 일시</th><th>후속 케어 목표</th><th>상태</th></tr>
              </thead>
              <tbody>
                {followups.map(flw => (
                  <tr key={flw.id}>
                    <td><strong>{flw.id}</strong></td>
                    <td>{flw.cnslId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{flw.clientName}</strong></td>
                    <td><strong>{flw.counselorName}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{flw.nextDate}</small></td>
                    <td><small>{flw.goal}</small></td>
                    <td><span className={`status-badge ${flw.status.toLowerCase()}`}>{flw.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 세션 상담 기록 실시간 작성 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>기록로그ID</th><th>예약ID</th><th>내담자명</th><th>담당 상담사명</th><th>상담 회차 요약 및 비공개 진단 소견</th><th>작성 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {counselLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.cnslId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.clientName}</strong></td>
                    <td><strong>{log.counselorName}</strong></td>
                    <td><small>{log.sessionSummary}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.logTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteCounselLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 상담 기록 삭제 시 목록에서는 소거되나 상담사별 처리량, 주제별 상담 수, 후속 일정 비율 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 센터 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.cnslId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedViewLog('CNSL-9001')}>🔒 권한 없는 직원의 비밀 상담 기록 열람 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 상담 기록 열람 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
