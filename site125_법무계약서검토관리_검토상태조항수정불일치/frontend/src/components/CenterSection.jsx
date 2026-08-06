import React, { useState } from 'react';

export default function CenterSection({ contracts, clients, comments, activityLogs, deleteComment, testUnauthorizedApprove }) {
  const [activeTab, setActiveTab] = useState('CONTRACTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'CONTRACTS' ? 'active' : ''}`} onClick={() => setActiveTab('CONTRACTS')}>📜 계약서 대장 (45건)</button>
        <button className={`tab-btn ${activeTab === 'CLIENTS' ? 'active' : ''}`} onClick={() => setActiveTab('CLIENTS')}>🏢 협력 거래처 (30개사)</button>
        <button className={`tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('COMMENTS')}>💬 법무 검토 의견 (80건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 법무 감사 로그 (90건)</button>
      </div>

      {activeTab === 'CONTRACTS' && (
        <div className="widget-section">
          <h2>📜 LegalFlow 기업 법무 계약서 검토 대장 (45건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>계약ID</th><th>계약서 명칭</th><th>상대 거래처명</th><th>핵심 리스크 조항 요약</th><th>리스크점수</th><th>만료 예정일</th><th>담당 변호사</th><th>상태</th></tr>
              </thead>
              <tbody>
                {contracts.map(ctr => (
                  <tr key={ctr.id}>
                    <td><strong>{ctr.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ctr.title}</strong></td>
                    <td><span className="client-badge">{ctr.clientName}</span></td>
                    <td><small>{ctr.clauseContent}</small></td>
                    <td><strong style={{ color: ctr.riskScore >= 80 ? 'var(--color-danger)' : 'var(--color-dark)' }}>{ctr.riskScore}점</strong></td>
                    <td><small>{ctr.expireDate}</small></td>
                    <td><small>{ctr.managerName}</small></td>
                    <td><span className={`status-badge ${ctr.status.toLowerCase()}`}>{ctr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CLIENTS' && (
        <div className="widget-section">
          <h2>🏢 주요 계약 상대 거래처 리스크 명단 (30개사)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>거래처ID</th><th>거래처 법인명</th><th>사업자등록번호</th><th>법무 리스크 등급</th><th>누적 계약 건수</th></tr>
              </thead>
              <tbody>
                {clients.map(cli => (
                  <tr key={cli.id}>
                    <td><strong>{cli.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cli.name}</strong></td>
                    <td><small>{cli.bizNo}</small></td>
                    <td><span className={`status-badge ${cli.riskLevel.toLowerCase()}`}>{cli.riskLevel}</span></td>
                    <td><strong>{cli.contractCount}건</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'COMMENTS' && (
        <div className="widget-section">
          <h2>💬 법무팀 전문 검토 의견 & 피드백 타임라인 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>의견ID</th><th>계약ID</th><th>검토 변호사/담당자</th><th>법무 자문 및 조항 수정 의견</th><th>작성 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {comments.map(cmt => (
                  <tr key={cmt.id}>
                    <td><strong>{cmt.id}</strong></td>
                    <td>{cmt.contractId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cmt.reviewerName}</strong></td>
                    <td><small>{cmt.commentText}</small></td>
                    <td><small>{cmt.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteComment(cmt.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginTop: '0.5rem' }}>* 검토 의견 삭제 시 목록에서는 소거되나 거래처별 리스크 점수 및 계약 승인율 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 기업 법무 계약 심사 종합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>계약ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.contractId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApprove('CTR-2001')}>🔒 권한 없는 직원의 계약 최종승인 강제 승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 최종승인 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
