import React from 'react';

const CampsiteFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="filters-bar">
      <div className="filter-group">
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '5px' }}>지역</label>
        <select 
          value={filters.region} 
          onChange={(e) => onFilterChange('region', e.target.value)}
        >
          <option value="All">전체 지역</option>
          <option value="강원도">강원도</option>
          <option value="경기도">경기도</option>
          <option value="경상도">경상도</option>
          <option value="충청도">충청도</option>
        </select>
      </div>

      <div className="filter-group">
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '5px' }}>유형</label>
        <select 
          value={filters.type} 
          onChange={(e) => onFilterChange('type', e.target.value)}
        >
          <option value="All">전체 유형</option>
          <option value="오토캠핑">오토캠핑</option>
          <option value="카라반">카라반</option>
          <option value="글램핑">글램핑</option>
          <option value="백패킹">백패킹</option>
        </select>
      </div>

      <div className="filter-group">
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '5px' }}>편의시설</label>
        <select 
          value={filters.amenity} 
          onChange={(e) => onFilterChange('amenity', e.target.value)}
        >
          <option value="All">전체</option>
          <option value="전기">전기 사용</option>
          <option value="반려동물">반려동물 동반</option>
          <option value="수영장">수영장</option>
        </select>
      </div>
    </div>
  );
};

export default CampsiteFilters;
