import React, { useState } from 'react';

export default function CenterSection({
  projects,
  issues,
  teamMembers,
  comments,
  workLogs,
  deleteWorkLog,
  openIssueModal,
  testUnauthorizedProjectDelete
}) {
  const [activeTab, setActiveTab] = useState('KANBAN_BOARD'); // 'KANBAN_BOARD' | 'ISSUE_TABLE' | 'PROJECTS_LOGS'

  const todoIssues = issues.filter(i => i.status === 'TODO');
  const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS');
  const reviewIssues = issues.filter(i => i.status === 'REVIEW');
  const doneIssues = issues.filter(i => i.status === 'DONE');
  const holdIssues = issues.filter(i => i.status === 'HOLD');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'KANBAN_BOARD' ? 'active' : ''}`}
          onClick={() => setActiveTab('KANBAN_BOARD')}
        >
          📋 애자일 이슈 칸반보드 (5개 상태 컬럼)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ISSUE_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ISSUE_TABLE')}
        >
          📄 전체 이슈 통합 대장 (45건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'PROJECTS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PROJECTS_LOGS')}
        >
          🏗️ 프로젝트 현황 (8개) & 작업 로그 (80건)
        </button>
      </div>

      {activeTab === 'KANBAN_BOARD' && (
        <div className="widget-section">
          <h2>📋 5단계 워크플로우 이슈 칸반보드</h2>
          <div className="kanban-grid">
            {/* Column 1: TODO */}
            <div className="kanban-column">
              <div className="kanban-col-head todo">
                <span>📝 할 일 (TODO)</span>
                <span className="col-count">{todoIssues.length}</span>
              </div>
              <div className="kanban-col-body">
                {todoIssues.map(isu => (
                  <div key={isu.id} className="kanban-card">
                    <div className="kanban-card-head">
                      <span className="kanban-proj">{isu.projectName}</span>
                      <span className={`priority-badge ${isu.priority.toLowerCase()}`}>{isu.priority}</span>
                    </div>
                    <div className="kanban-card-title">{isu.title}</div>
                    <div className="kanban-card-foot">
                      <small>👤 {isu.assigneeName}</small>
                      <small>📅 {isu.dueDate}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: IN_PROGRESS */}
            <div className="kanban-column">
              <div className="kanban-col-head in-progress">
                <span>⚡ 진행 중 (IN_PROGRESS)</span>
                <span className="col-count">{inProgressIssues.length}</span>
              </div>
              <div className="kanban-col-body">
                {inProgressIssues.map(isu => (
                  <div key={isu.id} className="kanban-card">
                    <div className="kanban-card-head">
                      <span className="kanban-proj">{isu.projectName}</span>
                      <span className={`priority-badge ${isu.priority.toLowerCase()}`}>{isu.priority}</span>
                    </div>
                    <div className="kanban-card-title">{isu.title}</div>
                    <div className="kanban-card-foot">
                      <small>👤 {isu.assigneeName}</small>
                      <small>📅 {isu.dueDate}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: REVIEW */}
            <div className="kanban-column">
              <div className="kanban-col-head review">
                <span>🔍 리뷰 중 (REVIEW)</span>
                <span className="col-count">{reviewIssues.length}</span>
              </div>
              <div className="kanban-col-body">
                {reviewIssues.map(isu => (
                  <div key={isu.id} className="kanban-card">
                    <div className="kanban-card-head">
                      <span className="kanban-proj">{isu.projectName}</span>
                      <span className={`priority-badge ${isu.priority.toLowerCase()}`}>{isu.priority}</span>
                    </div>
                    <div className="kanban-card-title">{isu.title}</div>
                    <div className="kanban-card-foot">
                      <small>👤 {isu.assigneeName}</small>
                      <small>📅 {isu.dueDate}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: DONE */}
            <div className="kanban-column">
              <div className="kanban-col-head done">
                <span>✅ 완료 (DONE)</span>
                <span className="col-count">{doneIssues.length}</span>
              </div>
              <div className="kanban-col-body">
                {doneIssues.map(isu => (
                  <div key={isu.id} className="kanban-card">
                    <div className="kanban-card-head">
                      <span className="kanban-proj">{isu.projectName}</span>
                      <span className={`priority-badge ${isu.priority.toLowerCase()}`}>{isu.priority}</span>
                    </div>
                    <div className="kanban-card-title">{isu.title}</div>
                    <div className="kanban-card-foot">
                      <small>👤 {isu.assigneeName}</small>
                      <small>📅 {isu.dueDate}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 5: HOLD */}
            <div className="kanban-column">
              <div className="kanban-col-head hold">
                <span>⏸️ 보류 (HOLD)</span>
                <span className="col-count">{holdIssues.length}</span>
              </div>
              <div className="kanban-col-body">
                {holdIssues.map(isu => (
                  <div key={isu.id} className="kanban-card">
                    <div className="kanban-card-head">
                      <span className="kanban-proj">{isu.projectName}</span>
                      <span className={`priority-badge ${isu.priority.toLowerCase()}`}>{isu.priority}</span>
                    </div>
                    <div className="kanban-card-title">{isu.title}</div>
                    <div className="kanban-card-foot">
                      <small>👤 {isu.assigneeName}</small>
                      <small>📅 {isu.dueDate}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ISSUE_TABLE' && (
        <div className="widget-section">
          <h2>📄 이슈 목록 테이블 및 댓글 내역 (45건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>이슈 ID</th>
                  <th>프로젝트</th>
                  <th>이슈 제목</th>
                  <th>상태</th>
                  <th>우선순위</th>
                  <th>담당자</th>
                  <th>마감일</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(isu => (
                  <tr key={isu.id}>
                    <td><strong>{isu.id}</strong></td>
                    <td>{isu.projectName}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{isu.title}</strong></td>
                    <td><span className={`status-badge ${isu.status.toLowerCase()}`}>{isu.status}</span></td>
                    <td><span className={`priority-badge ${isu.priority.toLowerCase()}`}>{isu.priority}</span></td>
                    <td>{isu.assigneeName}</td>
                    <td><small>{isu.dueDate}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PROJECTS_LOGS' && (
        <div className="widget-section">
          <h2>🏗️ 프로젝트 현황 (8개) & 📑 이슈 작업 감사 로그 (80건)</h2>
          
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>프로젝트 ID</th>
                  <th>프로젝트명</th>
                  <th>구분</th>
                  <th>달성률</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(prj => (
                  <tr key={prj.id}>
                    <td><strong>{prj.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{prj.name}</strong></td>
                    <td>{prj.category}</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{prj.completionRate}% 완료</strong></td>
                    <td><span className="status-badge completed">{prj.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedProjectDelete('PRJ-101')}>
              🔒 일반 팀원의 프로젝트 강제 삭제 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 팀원이 프로젝트 삭제 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>📑 팀원 이슈 작업 감사 로그 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>작업자</th>
                  <th>수행 내용</th>
                  <th>일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {workLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.operator}</td>
                    <td>{log.action}</td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteWorkLog(log.id)}>
                        🗑️ 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 작업 로그 삭제(DELETE) 시 감사 대장에서는 소거되나 프로젝트 완료율 및 번다운 차트 수치에는 남음 (Error 4)</small>
        </div>
      )}
    </main>
  );
}
