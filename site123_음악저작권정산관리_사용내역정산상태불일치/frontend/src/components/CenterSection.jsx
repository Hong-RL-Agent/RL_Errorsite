import React, { useState } from 'react';

export default function CenterSection({ tracks, creators, settlements, usageLogs, activityLogs, deleteUsageLog, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('TRACKS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'TRACKS' ? 'active' : ''}`} onClick={() => setActiveTab('TRACKS')}>🎵 음원 대장 (50개)</button>
        <button className={`tab-btn ${activeTab === 'CREATORS' ? 'active' : ''}`} onClick={() => setActiveTab('CREATORS')}>👤 창작자 명단 (35명)</button>
        <button className={`tab-btn ${activeTab === 'SETTLEMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('SETTLEMENTS')}>💰 인세 정산 내역 (45건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🎧 사용 로그 & 감사 이력</button>
      </div>

      {activeTab === 'TRACKS' && (
        <div className="widget-section">
          <h2>🎵 RoyaltyTune 저작권 등록 음원 대장 (50개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>음원ID</th><th>음원 제목</th><th>대표 권리자</th><th>장르</th><th>인세 배분율</th><th>누적 스트리밍</th><th>총 음원 수익</th><th>상태</th></tr>
              </thead>
              <tbody>
                {tracks.map(trk => (
                  <tr key={trk.id}>
                    <td><strong>{trk.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{trk.title}</strong></td>
                    <td><small>{trk.primaryCreatorName}</small></td>
                    <td><span className="genre-badge">{trk.genre}</span></td>
                    <td><strong style={{ color: 'var(--color-dark)' }}>{trk.royaltyRate}%</strong></td>
                    <td>{trk.streamCount.toLocaleString()}회</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{trk.totalRevenueWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${trk.status.toLowerCase()}`}>{trk.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CREATORS' && (
        <div className="widget-section">
          <h2>👤 음악 저작권자 & 창작자 명단 (35명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>창작자ID</th><th>성명 / 아티스트명</th><th>구분</th><th>누적 정산액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {creators.map(crt => (
                  <tr key={crt.id}>
                    <td><strong>{crt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{crt.name}</strong></td>
                    <td><span className="genre-badge">{crt.type}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{crt.totalRoyaltyWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${crt.status.toLowerCase()}`}>{crt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SETTLEMENTS' && (
        <div className="widget-section">
          <h2>💰 창작자 분기별 인세 정산 내역 (45건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>정산ID</th><th>음원 제목</th><th>권리자명</th><th>정산 분기</th><th>스트리밍 횟수</th><th>총 발생 매출</th><th>저작권 배분액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {settlements.map(stl => (
                  <tr key={stl.id}>
                    <td><strong>{stl.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{stl.trackTitle}</strong></td>
                    <td><small>{stl.creatorName}</small></td>
                    <td><small>{stl.salesPeriod}</small></td>
                    <td>{stl.streamCount.toLocaleString()}회</td>
                    <td>{stl.grossRevenueWon.toLocaleString()}원</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{stl.royaltyPayoutWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${stl.status.toLowerCase()}`}>{stl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🎧 음원 스트리밍 플랫폼 실시간 사용 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>음원 제목</th><th>사용 플랫폼</th><th>재생 횟수</th><th>발생 매출액</th><th>로그 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {usageLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.trackTitle}</strong></td>
                    <td><small>{log.platform}</small></td>
                    <td><strong>{log.plays.toLocaleString()}회</strong></td>
                    <td>{log.revenueWon.toLocaleString()}원</td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteUsageLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 사용 로그 삭제 시 목록에서는 소거되나 음원별 수익 및 창작자별 정산액 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 저작권 정산 분배 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>음원ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.trackId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('TRK-2001')}>🔒 권한 없는 직원의 저작권 정산 강제 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 정산 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
