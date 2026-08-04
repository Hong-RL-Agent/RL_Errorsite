import React, { useState } from 'react';
import { Filter } from 'lucide-react';

export default function SidebarFilter({ onApply }) {
  const [type, setType] = useState('전체');
  const [location, setLocation] = useState('');

  return (
    <div className="sidebar-filter">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <Filter size={20} />
        상세 조건 검색
      </div>

      <div className="filter-group">
        <label>매물 유형</label>
        <select className="filter-input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="전체">전체보기</option>
          <option value="아파트">아파트</option>
          <option value="오피스텔">오피스텔</option>
          <option value="빌라/주택">빌라/주택</option>
        </select>
      </div>

      <div className="filter-group">
        <label>지역 (동/구)</label>
        <input 
          type="text" 
          className="filter-input" 
          placeholder="예) 강남구, 청담동" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* INTENTIONAL GUI BUG: site006-bug01
         Type: button-no-response
         Description: "필터 적용" 버튼이 눌려도 결과가 갱신되지 않는다.
         Explanation: onClick 핸들러 누락으로 인해 onApply 함수가 호출되지 않음. */}
      <button 
        className="btn-apply"
        data-bug-id="site006-bug01"
        onClick={() => {}}
      >
        필터 적용
      </button>
    </div>
  );
}
