import React from 'react';

export default function Sidebar({ filterGenre, setFilterGenre, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, tracks, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  const genres = ['K-POP', '발라드', '힙합/R&B', '댄스/플래시', '인디/어쿠스틱'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>🎶 음원 저작권 & 검색</h3>

      <div className="filter-group">
        <label>장르 필터 선택 (Error 5):</label>
        <select value={filterGenre} onChange={(e) => { setFilterGenre(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 음악 장르</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}{g === 'K-POP' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* K-POP(3초 지연)→발라드(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>정산 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterGenre, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="CALCULATING">집계중 (CALCULATING)</option>
          <option value="SETTLING">정산대기 (SETTLING)</option>
          <option value="CONFIRMED">정산확정 (CONFIRMED)</option>
          <option value="PAID">지급완료 (PAID)</option>
          <option value="CANCELLED">취소됨 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>음원명/창작자/장르 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterGenre, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 음원ID순</option>
          <option value="REV_DESC">음원 수익 높은순 (Error 3)</option>
          <option value="STREAM_DESC">스트리밍 재생 많은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedTracks 대신 원본 배열 인덱스 음원이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>저작권 등록 음원 목록 ({tracks.length}곡):</label>
        <div className="track-stack">
          {tracks.map((trk, idx) => (
            <div key={trk.id} className={`track-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="trk-card-head">
                <span className="genre-badge">{trk.genre}</span>
                <span className={`status-badge ${trk.status.toLowerCase()}`}>{trk.status}</span>
              </div>
              <div className="trk-title">{trk.title}</div>
              <div className="trk-meta">권리자: {trk.primaryCreatorName} | 인세율: {trk.royaltyRate}%</div>
              <div className="trk-foot">
                <small>수익: {(trk.totalRevenueWon / 10000).toLocaleString()}만원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
