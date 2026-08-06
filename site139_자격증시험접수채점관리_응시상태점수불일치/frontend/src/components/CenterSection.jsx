import React, { useState } from 'react';

export default function CenterSection({ examinees, subjects, examCenters, scores, activityLogs, deleteScore, testUnauthorizedPass }) {
  const [activeTab, setActiveTab] = useState('EXAMINEES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'EXAMINEES' ? 'active' : ''}`} onClick={() => setActiveTab('EXAMINEES')}>🎓 응시자 목록 (70명)</button>
        <button className={`tab-btn ${activeTab === 'CENTERS' ? 'active' : ''}`} onClick={() => setActiveTab('CENTERS')}>🏢 CBT 고사장 (12개)</button>
        <button className={`tab-btn ${activeTab === 'SCORES' ? 'active' : ''}`} onClick={() => setActiveTab('SCORES')}>📝 채점 결과 (55건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 관제 감사 이력</button>
      </div>

      {activeTab === 'EXAMINEES' && (
        <div className="widget-section">
          <h2>🎓 CertiExam 국가자격증 수험자 응시 대장 (70명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>수험자ID</th><th>수험번호</th><th>응시자 성명</th><th>응시 과목</th><th>배정 CBT 고사장</th><th>접수일</th><th>채점점수</th><th>상태</th></tr>
              </thead>
              <tbody>
                {examinees.map(exm => (
                  <tr key={exm.id}>
                    <td><strong>{exm.id}</strong></td>
                    <td><small>{exm.regCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{exm.name}</strong></td>
                    <td><small>{exm.subjectName}</small></td>
                    <td><span className="center-badge">{exm.examCenter}</span></td>
                    <td><small>{exm.regDate}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{exm.score}점</strong></td>
                    <td><span className={`status-badge ${exm.status.toLowerCase()}`}>{exm.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CENTERS' && (
        <div className="widget-section">
          <h2>🏢 권역별 CBT 전자시험장 배정 현황 (12개 고사장)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>고사장ID</th><th>시험장 명칭</th><th>소재지 주소</th><th>수용 정원</th><th>현재 배정 인원</th></tr>
              </thead>
              <tbody>
                {examCenters.map(ctr => (
                  <tr key={ctr.id}>
                    <td><strong>{ctr.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ctr.centerName}</strong></td>
                    <td><small>{ctr.location}</small></td>
                    <td><strong>{ctr.capacity}석</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ctr.assignedCount}명 배정</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SCORES' && (
        <div className="widget-section">
          <h2>📝 실시간 CBT 점수 합산 및 과목별 판정 내역 (55건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>채점ID</th><th>수험자ID</th><th>응시자 성명</th><th>시험 과목</th><th>최종 점수</th><th>합격 판정</th><th>채점관</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {scores.map(scr => (
                  <tr key={scr.id}>
                    <td><strong>{scr.id}</strong></td>
                    <td>{scr.exmId}</td>
                    <td><strong>{scr.name}</strong></td>
                    <td><small style={{ color: 'var(--color-primary)' }}>{scr.subjectName}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{scr.score}점</strong></td>
                    <td><span className="center-badge">{scr.passResult}</span></td>
                    <td><small>{scr.gradedBy}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteScore(scr.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 채점 로그 삭제 시 목록에서는 소거되나 과목별 평균 점수, 시험장 응시율, 합격률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 자격검정 본부 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>수험자ID</th><th>담당 감독관</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.exmId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedPass('EXM-3001')}>🔒 권한 없는 직원의 자격증 합격 확정 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 합격 처리 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
