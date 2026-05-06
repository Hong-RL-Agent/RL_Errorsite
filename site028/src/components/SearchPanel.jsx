import React from 'react';

function SearchPanel({
  pickupLocation, onPickupChange,
  pickupDate, onPickupDateChange,
  returnDate, onReturnDateChange
}) {
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const carsSection = document.getElementById('cars');
    if (carsSection) carsSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="search-section">
      <form className="search-panel" onSubmit={handleSearch}>
        <div className="search-field">
          <label htmlFor="pickup-location">
            <span className="field-icon">📍</span> 픽업 위치
          </label>
          <input
            id="pickup-location"
            type="text"
            placeholder="지점명 또는 주소 입력"
            value={pickupLocation}
            onChange={e => onPickupChange(e.target.value)}
          />
        </div>

        <div className="search-divider"></div>

        <div className="search-field">
          <label htmlFor="pickup-date">
            <span className="field-icon">📅</span> 픽업 날짜
          </label>
          <input
            id="pickup-date"
            type="date"
            min={today}
            value={pickupDate}
            onChange={e => onPickupDateChange(e.target.value)}
          />
        </div>

        <div className="search-divider"></div>

        <div className="search-field">
          <label htmlFor="return-date">
            <span className="field-icon">📅</span> 반납 날짜
          </label>
          <input
            id="return-date"
            type="date"
            min={pickupDate || today}
            value={returnDate}
            onChange={e => onReturnDateChange(e.target.value)}
          />
        </div>

        <div className="search-divider"></div>

        <div className="search-field">
          <label htmlFor="car-type-select">
            <span className="field-icon">🚗</span> 차량 유형
          </label>
          <select id="car-type-select" onChange={() => alert('준비중입니다.')}>
            <option value="">전체 차종</option>
            <option value="소형">소형</option>
            <option value="중형">중형</option>
            <option value="대형">대형</option>
            <option value="SUV">SUV</option>
            <option value="럭셔리">럭셔리</option>
          </select>
        </div>

        <button type="submit" className="btn-search">
          차량 검색
        </button>
      </form>
    </section>
  );
}

export default SearchPanel;