import React, { useState } from 'react';

export default function CenterSection({
  documents,
  employees,
  departments,
  comments,
  activityLogs,
  deleteActivityLog,
  openDocModal,
  testUnauthorizedApprove
}) {
  const [activeTab, setActiveTab] = useState('DOCUMENTS_TABLE'); // 'DOCUMENTS_TABLE' | 'EMPLOYEES_LINES' | 'COMMENTS_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'DOCUMENTS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('DOCUMENTS_TABLE')}
        >
          📄 전자결재 문서 통합 대장 (40건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'EMPLOYEES_LINES' ? 'active' : ''}`}
          onClick={() => setActiveTab('EMPLOYEES_LINES')}
        >
          👥 조직 임직원 (30명) & 결재선 설정 (35건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'COMMENTS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('COMMENTS_LOGS')}
        >
          💬 결재 의견 (60건) & 감사 활동 로그 (80건)
        </button>
      </div>

      {activeTab === 'DOCUMENTS_TABLE' && (
        <div className="widget-section">
          <h2>📄 그룹웨어 전자결재 문서 통합 관제 대장 (40건)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>문서 ID</th>
                  <th>기안 부서</th>
                  <th>기안자</th>
                  <th>문서 제목</th>
                  <th>중요도</th>
                  <th>결재 마감일</th>
                  <th>지정 결재자</th>
                  <th>결재 상태</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td><strong>{doc.id}</strong></td>
                    <td><span className="dept-badge">{doc.deptName}</span></td>
                    <td>{doc.drafterName}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{doc.title}</strong></td>
                    <td><strong style={{ color: doc.urgency === 'HIGH' ? 'var(--color-danger)' : 'var(--color-warning)' }}>[{doc.urgency}]</strong></td>
                    <td><small>{doc.dueDate}</small></td>
                    <td>{doc.approverName}</td>
                    <td><span className={`status-badge ${doc.status.toLowerCase()}`}>{doc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'EMPLOYEES_LINES' && (
        <div className="widget-section">
          <h2>👥 전사 임직원 결재 권한 명단 (30명)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>직원 ID</th>
                  <th>소속 부서</th>
                  <th>성명 (직급)</th>
                  <th>전자결재 권한</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td><strong>{emp.id}</strong></td>
                    <td><span className="dept-badge">{emp.deptName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{emp.name}</strong> ({emp.position})</td>
                    <td><span className="role-tag">{emp.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'COMMENTS_LOGS' && (
        <div className="widget-section">
          <h2>💬 결재 의견 (60건) & 📑 결재선 변경/승인 감사 로그 (80건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>문서 ID</th>
                  <th>작업 처리자</th>
                  <th>감사 수행 내용</th>
                  <th>일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.docId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td>{log.action}</td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteActivityLog(log.id)}>
                        🗑️ 감사 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 승인 완료 감사 로그 삭제(DELETE) 시 목록에서는 소거되나 부서별 결재 완료율 및 평균 처리시간 통계 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApprove('DOC-1001')}>
              🔒 권한 없는 일반 직원의 최종 승인 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 직원이 최종 승인 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
