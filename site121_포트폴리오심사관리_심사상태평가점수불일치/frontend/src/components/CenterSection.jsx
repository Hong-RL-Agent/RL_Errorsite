import React, { useState } from 'react';

export default function CenterSection({ applicants, evaluations, comments, activityLogs, deleteEvaluation, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('APPLICANTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'APPLICANTS' ? 'active' : ''}`} onClick={() => setActiveTab('APPLICANTS')}>👥 지원자 대장 (45명)</button>
        <button className={`tab-btn ${activeTab === 'EVALUATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('EVALUATIONS')}>📊 평가 점수표 (60건)</button>
        <button className={`tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('COMMENTS')}>💬 심사 코멘트 (80건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 감사 이력 로그 (90건)</button>
      </div>

      {activeTab === 'APPLICANTS' && (
        <div className="widget-section">
          <h2>👥 CareerReview 제출 지원자 대장 (45명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>지원자ID</th><th>성명</th><th>지원 직무</th><th>경력</th><th>연락처</th><th>제출 포트폴리오 제목</th><th>최종 점수</th><th>상태</th></tr>
              </thead>
              <tbody>
                {applicants.map(app => (
                  <tr key={app.id}>
                    <td><strong>{app.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{app.name}</strong></td>
                    <td><span className="job-badge">{app.targetJob}</span></td>
                    <td>{app.experienceYears}년차</td>
                    <td><small>{app.phone}</small></td>
                    <td><small>{app.portfolioTitle}</small></td>
                    <td><strong style={{ color: app.evalScore >= 90 ? 'var(--color-success)' : 'var(--color-dark)' }}>{app.evalScore}점</strong></td>
                    <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'EVALUATIONS' && (
        <div className="widget-section">
          <h2>📊 포트폴리오 항목별 심사 평가표 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>평가ID</th><th>지원자명</th><th>담당 심사위원</th><th>유용성(40)</th><th>비주얼(30)</th><th>논리성(30)</th><th>총점</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {evaluations.map(ev => (
                  <tr key={ev.id}>
                    <td><strong>{ev.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ev.applicantName}</strong></td>
                    <td><small>{ev.reviewerName}</small></td>
                    <td>{ev.usabilityScore}점</td>
                    <td>{ev.visualScore}점</td>
                    <td>{ev.logicScore}점</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ev.totalScore}점</strong></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteEvaluation(ev.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginTop: '0.5rem' }}>* 평가 데이터 삭제 시 목록에서는 소거되나 직무별 평균 점수 및 심사위원 처리량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>
        </div>
      )}

      {activeTab === 'COMMENTS' && (
        <div className="widget-section">
          <h2>💬 심사위원 심층 코멘트 타임라인 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>코멘트ID</th><th>지원자ID</th><th>심사위원</th><th>평가 및 피드백 내용</th><th>작성 일시</th></tr>
              </thead>
              <tbody>
                {comments.map(cmt => (
                  <tr key={cmt.id}>
                    <td><strong>{cmt.id}</strong></td>
                    <td>{cmt.applicantId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cmt.reviewerName}</strong></td>
                    <td><small>{cmt.commentText}</small></td>
                    <td><small>{cmt.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 포트폴리오 심사 종합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>지원자ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.applicantId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('APP-1001')}>🔒 권한 없는 심사위원의 최종 합격 강제 승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 최종 합격 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
