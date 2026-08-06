import React, { useState } from 'react';

export default function CenterSection({ requests, clients, translators, reviewComments, activityLogs, deleteReviewComment, testUnauthorizedConfirmQuote }) {
  const [activeTab, setActiveTab] = useState('REQUESTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'REQUESTS' ? 'active' : ''}`} onClick={() => setActiveTab('REQUESTS')}>📝 번역 의뢰 대장 (50건)</button>
        <button className={`tab-btn ${activeTab === 'CLIENTS' ? 'active' : ''}`} onClick={() => setActiveTab('CLIENTS')}>🏢 고객사 명단 (35명)</button>
        <button className={`tab-btn ${activeTab === 'TRANSLATORS' ? 'active' : ''}`} onClick={() => setActiveTab('TRANSLATORS')}>🌐 전문 번역가 (25명)</button>
        <button className={`tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('COMMENTS')}>💬 검수 의견 & 감사 이력</button>
      </div>

      {activeTab === 'REQUESTS' && (
        <div className="widget-section">
          <h2>📝 TransDesk 글로벌 전문 번역 프로젝트 관제 대장 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>의뢰ID</th><th>의뢰코드</th><th>의뢰 프로젝트 제목</th><th>고객사</th><th>언어쌍</th><th>분량(자)</th><th>담당 번역가</th><th>최종 견적금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td><small>{req.reqCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{req.title}</strong></td>
                    <td><small>{req.company}</small></td>
                    <td><span className="lang-badge">{req.langPair}</span></td>
                    <td><small>{req.wordCount.toLocaleString()}자</small></td>
                    <td><strong>{req.assignedTranslator}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{req.actualFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CLIENTS' && (
        <div className="widget-section">
          <h2>🏢 엔터프라이즈 번역 의뢰 고객사 대장 (35명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>고객ID</th><th>의뢰인 성명</th><th>소속 기업명</th><th>연락처</th><th>이메일</th><th>누적 의뢰 수</th></tr>
              </thead>
              <tbody>
                {clients.map(clt => (
                  <tr key={clt.id}>
                    <td><strong>{clt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{clt.clientName}</strong></td>
                    <td><span className="lang-badge">{clt.company}</span></td>
                    <td><small>{clt.phone}</small></td>
                    <td><small>{clt.email}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{clt.totalOrders}건</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TRANSLATORS' && (
        <div className="widget-section">
          <h2>🌐 글로벌 검증 전문 번역가 및 감수관 대장 (25명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>번역가ID</th><th>성명</th><th>전공 언어쌍</th><th>전문 분야</th><th>품질 평점</th><th>누적 번역량</th></tr>
              </thead>
              <tbody>
                {translators.map(trn => (
                  <tr key={trn.id}>
                    <td><strong>{trn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{trn.translatorName}</strong></td>
                    <td><span className="lang-badge">{trn.langPair}</span></td>
                    <td><small>{trn.specialty}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {trn.rating} / 5.0</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{trn.completedWords.toLocaleString()}자</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'COMMENTS' && (
        <div className="widget-section">
          <h2>💬 원문 검수 의견 및 감수 타임라인 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>의견ID</th><th>의뢰ID</th><th>검수관</th><th>검수 피드백 및 용어 수정 내역</th><th>품질 점수</th><th>일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {reviewComments.map(cmt => (
                  <tr key={cmt.id}>
                    <td><strong>{cmt.id}</strong></td>
                    <td>{cmt.reqId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cmt.reviewer}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{cmt.comment}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cmt.qualityScore}점</strong></td>
                    <td><small>{cmt.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteReviewComment(cmt.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 검수 의견 삭제 시 목록에서는 소거되나 번역가별 품질점수, 언어쌍별 평균 견적, 납품 완료율 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 번역 플랫폼 통합 관제 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>의뢰ID</th><th>담당 PM</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.reqId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirmQuote('REQ-4001')}>🔒 권한 없는 직원의 견적 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 견적 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
