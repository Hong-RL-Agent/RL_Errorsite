import React from 'react';

export default function Sidebar({ filterJob, setFilterJob, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, applicants, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  const jobs = ['UX/UI 디자인', '프론트엔드 개발', '서비스 기획', '브랜드 디자인', '백엔드 개발'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>💼 지원자 검색 & 직무 필터</h3>

      <div className="filter-group">
        <label>지원 직무 선택 (Error 5):</label>
        <select value={filterJob} onChange={(e) => { setFilterJob(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 지원 직무</option>
          {jobs.map(j => (
            <option key={j} value={j}>{j}{j === 'UX/UI 디자인' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* UX/UI(3초 지연)→프론트엔드(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>심사 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterJob, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="SUBMITTED">제출완료 (SUBMITTED)</option>
          <option value="ASSIGNED">심사배정 (ASSIGNED)</option>
          <option value="UNDER_REVIEW">심사중 (UNDER_REVIEW)</option>
          <option value="HOLD">보류 (HOLD)</option>
          <option value="PASSED">합격 (PASSED)</option>
          <option value="FAILED">불합격 (FAILED)</option>
          <option value="CANCELLED">지원취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>지원자/포트폴리오 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterJob, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 지원자ID순</option>
          <option value="SCORE_DESC">평가 점수 높은순 (Error 3)</option>
          <option value="EXP_DESC">경력 연차 많은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedApplicants 대신 원본 배열 인덱스 지원자가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>지원자 목록 대기열 ({applicants.length}명):</label>
        <div className="applicant-stack">
          {applicants.map((app, idx) => (
            <div key={app.id} className={`applicant-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="app-card-head">
                <span className="job-badge">{app.targetJob}</span>
                <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
              </div>
              <div className="app-title">{app.name} ({app.experienceYears}년차)</div>
              <div className="app-meta">점수: {app.evalScore}점 | 제목: {app.portfolioTitle}</div>
              <div className="app-foot">
                <small>{app.phone}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
