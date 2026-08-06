import React from 'react';

export default function Sidebar({
  filterCategory,
  setFilterCategory,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  consultations,
  selectedCallIndex,
  setSelectedCallIndex,
  openDetailMismatch,
  vocCategories
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 VOC 카테고리 & 상담 검색</h3>

      <div className="filter-group">
        <label>VOC 카테고리 선택 (Error 5):</label>
        <select 
          value={filterCategory} 
          onChange={(e) => {
            setFilterCategory(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 VOC 카테고리 (10개)</option>
          {vocCategories.map(c => (
            <option key={c.id} value={c.name}>
              {c.name} {c.name === '배송지연' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 카테고리 필터 고속 변경 시 배송지연(3초 지연)이 결제오류 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>고객명/상담ID/문의내용 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterCategory, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>상담 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 상담ID순</option>
          <option value="WAIT_DESC">대기 시간 긴순 (Error 3)</option>
          <option value="PRIORITY_DESC">우선순위 높음순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 대기시간/우선순위 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 상담 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>상담 접수 대기열 (최소 45개):</label>
        <div className="call-stack">
          {consultations.map((call, idx) => (
            <div 
              key={call.id}
              className={`call-card-item ${selectedCallIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedCallIndex(idx)}
            >
              <div className="call-card-head">
                <span className="category-badge">{call.category}</span>
                <span className={`status-badge ${call.status.toLowerCase()}`}>{call.status}</span>
              </div>
              <div className="call-customer">{call.customerName} 고객 ({call.id})</div>
              <div className="call-text">{call.inquiryText}</div>
              <div className="call-foot">
                <small>대기: {call.waitTimeMin}분 | 담당: {call.agentName}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  상세 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
