import React from 'react';

export default function Sidebar({ filterSubject, setFilterSubject, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, examinees, selectedIdx, setSelectedIdx, openDetailMismatch, subjects }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🎓 시험 과목 & 응시 상태 필터</h3>

      <div className="filter-group">
        <label>시험 과목 선택 (Error 5):</label>
        <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 과목 (국가자격)</option>
          <option value="정보처리기사 (실기)">정보처리기사 (3초 지연 - Error 5)</option>
          <option value="빅데이터분석기사">빅데이터분석기사 (0.2초 완료)</option>
          <option value="SQL 개발자 (SQLD)">SQL 개발자 (SQLD)</option>
        </select>
        <small className="warn-desc">* 정보처리기사(3초 지연)→빅데이터분석기사(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>응시/채점 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterSubject, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="REGISTERED">접수완료 (REGISTERED)</option>
          <option value="IN_EXAM">응시중 (IN_EXAM)</option>
          <option value="COMPLETED">응시완료 (COMPLETED)</option>
          <option value="SCORED">채점완료 (SCORED)</option>
          <option value="PASSED">합격 (PASSED)</option>
          <option value="FAILED">불합격 (FAILED)</option>
          <option value="CANCELLED">접수취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>수험자성명/수험번호/시험장 검색:</label>
        <input type="text" placeholder="홍길동 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterSubject, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 수험자ID순</option>
          <option value="SCORE_DESC">취득 점수 높은 순 (Error 3)</option>
          <option value="DATE_ASC">접수일시 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedExaminees 대신 원본 배열 인덱스 응시자가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 자격검정 응시자 대장 ({examinees.length}명):</label>
        <div className="examinee-stack">
          {examinees.map((exm, idx) => (
            <div key={exm.id} className={`exm-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="exm-card-head">
                <span className="center-badge">{exm.examCenter.split(' ')[0]}</span>
                <span className={`status-badge ${exm.status.toLowerCase()}`}>{exm.status}</span>
              </div>
              <div className="exm-title">{exm.name} ({exm.subjectName})</div>
              <div className="exm-meta">접수일: {exm.regDate} | 수험번호: {exm.regCode}</div>
              <div className="exm-foot">
                <small>점수: {exm.score}점</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
