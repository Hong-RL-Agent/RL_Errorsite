import React, { useState } from 'react';

export default function CenterSection({ articles, reporters, editors, reviewComments, publishLogs, activityLogs, deletePublishLog, testUnauthorizedPublish }) {
  const [activeTab, setActiveTab] = useState('ARTICLES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'ARTICLES' ? 'active' : ''}`} onClick={() => setActiveTab('ARTICLES')}>📰 기사 대장 (55건)</button>
        <button className={`tab-btn ${activeTab === 'REPORTERS' ? 'active' : ''}`} onClick={() => setActiveTab('REPORTERS')}>✍️ 취재 기자 (25명)</button>
        <button className={`tab-btn ${activeTab === 'EDITORS' ? 'active' : ''}`} onClick={() => setActiveTab('EDITORS')}>👓 편집 에디터 (12명)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>💬 검수 & 발행 이력</button>
      </div>

      {activeTab === 'ARTICLES' && (
        <div className="widget-section">
          <h2>📰 NewsDesk 뉴스룸 기사 검수 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>기사ID</th><th>기사코드</th><th>기사 헤드라인 제목</th><th>카테고리</th><th>취재기자</th><th>담당편집자</th><th>조회수</th><th>발행예정시각</th><th>상태</th></tr>
              </thead>
              <tbody>
                {articles.map(art => (
                  <tr key={art.id}>
                    <td><strong>{art.id}</strong></td>
                    <td><small>{art.articleCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{art.title}</strong></td>
                    <td><span className="category-badge">{art.category}</span></td>
                    <td><strong>{art.reporterName}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{art.editorName}</small></td>
                    <td><small>{art.views.toLocaleString()}회</small></td>
                    <td><small>{art.scheduledTime}</small></td>
                    <td><span className={`status-badge ${art.status.toLowerCase()}`}>{art.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REPORTERS' && (
        <div className="widget-section">
          <h2>✍️ 언론사 취재 기자 라인업 (25명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>기자ID</th><th>기자 성명</th><th>소속 취재부서</th><th>이메일 주소</th><th>누적 송고 기사 수</th></tr>
              </thead>
              <tbody>
                {reporters.map(rep => (
                  <tr key={rep.id}>
                    <td><strong>{rep.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rep.reporterName}</strong></td>
                    <td><small>{rep.dept}</small></td>
                    <td><small>{rep.email}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{rep.totalArticles}건</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'EDITORS' && (
        <div className="widget-section">
          <h2>👓 편집국 데스크 에디터 현황 (12명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>에디터ID</th><th>편집자 성명</th><th>담당 부서</th><th>배정 검수 기사 수</th><th>상태</th></tr>
              </thead>
              <tbody>
                {editors.map(edt => (
                  <tr key={edt.id}>
                    <td><strong>{edt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{edt.editorName}</strong></td>
                    <td><small>{edt.dept}</small></td>
                    <td><strong>{edt.assignedCount}건</strong></td>
                    <td><span className={`status-badge ${edt.status.toLowerCase()}`}>{edt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>💬 데스크 실시간 기사 검수 의견 메모 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>의견ID</th><th>기사ID</th><th>작성 편집자</th><th>데스크 검수 의견 피드백</th><th>일시</th></tr>
              </thead>
              <tbody>
                {reviewComments.map(cmt => (
                  <tr key={cmt.id}>
                    <td><strong>{cmt.id}</strong></td>
                    <td>{cmt.articleId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cmt.editorName}</strong></td>
                    <td><small>{cmt.comment}</small></td>
                    <td><small>{cmt.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🚀 송고 기사 웹/모바일 최종 발행 이력 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>기사ID</th><th>발행 기사 제목</th><th>카테고리</th><th>최종 발행시각</th><th>조회수</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {publishLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.articleId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.title}</strong></td>
                    <td><span className="category-badge">{log.category}</span></td>
                    <td><small>{log.publishedTime}</small></td>
                    <td><small>{log.views.toLocaleString()}회</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deletePublishLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 발행 로그 삭제 시 목록에서는 소거되나 카테고리별 발행 수 및 기자별 기사 수 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 뉴스룸 프로덕션 시스템 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>기사ID</th><th>담당 에디터</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.articleId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedPublish('ART-4001')}>🔒 권한 없는 기자의 기사 최종 발행 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 최종 발행 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
