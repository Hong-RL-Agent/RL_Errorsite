import React, { useState } from 'react';

export default function CenterSection({ contents, series, plans, watchLogs, activityLogs, deleteWatchLog, testUnauthorizedPublish }) {
  const [activeTab, setActiveTab] = useState('CONTENTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'CONTENTS' ? 'active' : ''}`} onClick={() => setActiveTab('CONTENTS')}>🎬 영상 콘텐츠 대장 (45개)</button>
        <button className={`tab-btn ${activeTab === 'SERIES' ? 'active' : ''}`} onClick={() => setActiveTab('SERIES')}>📺 시리즈 카탈로그 (15개)</button>
        <button className={`tab-btn ${activeTab === 'PLANS' ? 'active' : ''}`} onClick={() => setActiveTab('PLANS')}>💳 구독 요금제 등급 (5개)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📊 시청 로그 & 활동 이력</button>
      </div>

      {activeTab === 'CONTENTS' && (
        <div className="widget-section">
          <h2>🎬 StreamAdmin 영상 스트리밍 콘텐츠 대장 (45개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>콘텐츠ID</th><th>영상 제목</th><th>장르</th><th>관람등급</th><th>필요 구독권한</th><th>누적 시청수</th><th>러닝타임</th><th>공개일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {contents.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{c.title}</strong></td>
                    <td><span className="genre-badge">{c.genre}</span></td>
                    <td><small>{c.rating}</small></td>
                    <td><strong style={{ color: 'var(--color-dark)' }}>{c.requiredPlan}</strong></td>
                    <td><strong>{c.viewCount.toLocaleString()}회</strong></td>
                    <td>{c.durationMin}분</td>
                    <td><small>{c.releaseDate}</small></td>
                    <td><span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SERIES' && (
        <div className="widget-section">
          <h2>📺 등록 시리즈 카탈로그 (15개 시리즈)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>시리즈ID</th><th>시리즈 제목</th><th>대표 장르</th><th>총 에피소드 수</th></tr>
              </thead>
              <tbody>
                {series.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{s.title}</strong></td>
                    <td><span className="genre-badge">{s.genre}</span></td>
                    <td><strong>{s.episodesCount}화</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PLANS' && (
        <div className="widget-section">
          <h2>💳 OTT 플랫폼 구독 요금제 등급 (5개 등급)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>플랜ID</th><th>요금제 명칭</th><th>최대 화질</th><th>월 정액 가격</th><th>동시 접속 기기</th></tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{p.name}</strong></td>
                    <td><span className="genre-badge">{p.maxRes}</span></td>
                    <td><strong>{p.priceMonth.toLocaleString()}원</strong></td>
                    <td>{p.maxDevices}대</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📊 실시간 시청 스트리밍 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>콘텐츠 제목</th><th>사용자 권한</th><th>디바이스</th><th>시청 시간</th><th>시청 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {watchLogs.map(w => (
                  <tr key={w.id}>
                    <td><strong>{w.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{w.contentTitle}</strong></td>
                    <td><small>{w.userPlan}</small></td>
                    <td><small>{w.device}</small></td>
                    <td><strong>{w.watchedMin}분</strong></td>
                    <td><small>{w.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteWatchLog(w.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 시청 로그 삭제 시 목록에서는 소거되나 대시보드 인기 콘텐츠 순위 및 장르별 시청시간 통계에는 잔존 (Error 4)</small>

          <h2>📋 스트리밍 플랫폼 감사 활동 로그 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>콘텐츠ID</th><th>담당 관리자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.contentId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedPublish('CNT-3023')}>🔒 권한 없는 직원의 콘텐츠 강제 공개 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 콘텐츠 공개 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
