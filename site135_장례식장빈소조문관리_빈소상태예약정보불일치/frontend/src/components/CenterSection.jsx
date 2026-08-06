import React, { useState } from 'react';

export default function CenterSection({ altars, reservations, schedules, visitorGuides, activityLogs, deleteVisitorGuide, testUnauthorizedTerminate }) {
  const [activeTab, setActiveTab] = useState('ALTARS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'ALTARS' ? 'active' : ''}`} onClick={() => setActiveTab('ALTARS')}>🏛️ 빈소 배치도 (25개소)</button>
        <button className={`tab-btn ${activeTab === 'RESERVATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('RESERVATIONS')}>📝 빈소 예약 (40건)</button>
        <button className={`tab-btn ${activeTab === 'SCHEDULES' ? 'active' : ''}`} onClick={() => setActiveTab('SCHEDULES')}>🕊️ 장례 일정표 (35건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🕯️ 조문 안내 & 감사 이력</button>
      </div>

      {activeTab === 'ALTARS' && (
        <div className="widget-section">
          <h2>🏛️ MemorialDesk 층별 빈소 현황 배치도 (25개소)</h2>
          <div className="altar-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.65rem', marginTop: '0.75rem', maxHeight: '350px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            {altars.map(alt => (
              <div key={alt.id} className={`altar-grid-cell ${alt.status.toLowerCase()}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--color-dark)' }}>{alt.altarNo}</strong>
                  <span className={`status-badge ${alt.status.toLowerCase()}`}>{alt.status}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>{alt.deceasedName}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text)' }}>상주: {alt.chiefMourner}</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--color-muted)' }}>발인: {alt.funeralDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'RESERVATIONS' && (
        <div className="widget-section">
          <h2>📝 빈소 임대 예약 & 의전 특이사항 대장 (40건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>예약코드</th><th>배정 빈소</th><th>신청 상주명</th><th>연락처</th><th>의전 요청사항</th><th>입실 ➔ 발인 일정</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id}>
                    <td><strong>{res.id}</strong></td>
                    <td><small>{res.resCode}</small></td>
                    <td><span className="altar-no-badge">{res.altarNo}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{res.clientName}</strong></td>
                    <td><small>{res.phone}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{res.requests}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{res.scheduleText}</small></td>
                    <td><span className={`status-badge ${res.status.toLowerCase()}`}>{res.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SCHEDULES' && (
        <div className="widget-section">
          <h2>🕊️ 입관 · 성복제 · 발인 예배/의전 타임 스케줄 (35건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>일정ID</th><th>예약ID</th><th>빈소호수</th><th>장례 의전 행사명</th><th>진행 예정시각</th><th>의전 장소</th></tr>
              </thead>
              <tbody>
                {schedules.map(sch => (
                  <tr key={sch.id}>
                    <td><strong>{sch.id}</strong></td>
                    <td>{sch.resId}</td>
                    <td><span className="altar-no-badge">{sch.altarNo}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sch.eventTitle}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{sch.eventTime}</small></td>
                    <td><small>{sch.location}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🕯️ 1층 키오스크 조문객 안내 및 접수 로그 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>빈소호수</th><th>고인 성함</th><th>조문 단체/단체명</th><th>조문객 수</th><th>시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {visitorGuides.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.resId}</td>
                    <td><span className="altar-no-badge">{log.altarNo}</span></td>
                    <td><strong>{log.deceasedName}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.visitorGroup}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{log.visitorCount}명</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteVisitorGuide(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 조문객 안내 로그 삭제 시 목록에서는 소거되나 빈소별 방문자 수 및 직원별 처리량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 장례식장 통합 의전 운영 감사 로그 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당 지도사</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.resId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedTerminate('ALT-1001')}>🔒 권한 없는 직원의 빈소 강제종료 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 빈소 강제종료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
