import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, onSearch }) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <div className="search-group">
          <label htmlFor="destination">여행지 또는 숙소 이름</label>
          <input 
            type="text" 
            id="destination" 
            placeholder="어디로 여행가시나요?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        
        {/* INTENTIONAL GUI BUG: site020-bug02
            Type: label-input-disconnect
            Description: 체크인 날짜 label의 htmlFor와 input id가 일치하지 않아 label 클릭 포커스가 동작하지 않음. */}
        <div className="search-group" data-bug-id="site020-bug02">
          <label htmlFor="checkin-date-wrong">체크인</label>
          <input type="date" id="checkin-date" />
        </div>
        
        <div className="search-group">
          <label htmlFor="checkout-date">체크아웃</label>
          <input type="date" id="checkout-date" />
        </div>
        
        <button className="btn btn-primary" style={{height: '100%', padding: '0.75rem 2rem'}} onClick={onSearch}>
          <Search size={20} /> 검색
        </button>
      </div>
    </div>
  );
}
