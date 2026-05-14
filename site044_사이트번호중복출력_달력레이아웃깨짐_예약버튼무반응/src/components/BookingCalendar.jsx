import React from 'react';

const BookingCalendar = () => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  
  // Generating May 2026 for demonstration (starts on Friday)
  // May 2026 has 31 days. May 1 is Friday.
  // We need 5 leading empty cells.
  // Total cells = 5 + 31 = 36. 
  // 36 cells / 7 = 5.14 weeks -> Needs 6 rows.
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const leadingEmpty = Array.from({ length: 5 }, () => null);
  const allCells = [...leadingEmpty, ...dates];

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <h3 style={{ fontSize: '1.2rem' }}>예약 가능한 일정 확인 (2026년 5월)</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ color: '#666' }}>&lt; 이전 달</button>
          <button style={{ color: '#666' }}>다음 달 &gt;</button>
        </div>
      </div>

      {/* data-bug-id="site044-bug02" is on the container with fixed height in CSS */}
      <div className="calendar-grid-container" data-bug-id="site044-bug02">
        <div className="calendar-grid">
          {days.map(d => (
            <div key={d} className="calendar-cell header-cell">{d}</div>
          ))}
          {allCells.map((date, i) => (
            <div key={i} className={`calendar-cell ${date === null ? 'inactive' : ''}`}>
              {date && (
                <>
                  <span className="date-num">{date}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="site-count">{Math.floor(Math.random() * 5)} 사이트</div>
                    <div className="calendar-price">₩45,000</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>
        * 날짜를 선택하시면 해당일의 상세 요금을 확인할 수 있습니다.
      </p>
    </div>
  );
};

export default BookingCalendar;
