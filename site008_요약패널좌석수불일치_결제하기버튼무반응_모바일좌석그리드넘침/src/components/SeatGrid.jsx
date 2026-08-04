import React from 'react';

export default function SeatGrid({ selectedSeats, onSeatToggle }) {
  // Generate 100 seats (10x10)
  const rows = ['A','B','C','D','E','F','G','H','I','J'];
  const cols = [1,2,3,4,5,6,7,8,9,10];
  
  // Randomly make some seats taken
  const isTaken = (id) => {
    // just a deterministic pseudo-random logic
    const charCode = id.charCodeAt(0);
    const num = parseInt(id.slice(1));
    return (charCode + num) % 7 === 0;
  };

  return (
    <div className="seat-container">
      <div className="screen-curved">SCREEN</div>
      
      {/* INTENTIONAL GUI BUG: site008-bug03 target (see main.css for width: 600px) */}
      <div className="seat-grid" data-bug-id="site008-bug03">
        {rows.map(row => (
          cols.map(col => {
            const id = `${row}${col}`;
            const taken = isTaken(id);
            const selected = selectedSeats.includes(id);
            
            return (
              <button 
                key={id}
                className={`seat ${taken ? 'taken' : ''} ${selected ? 'selected' : ''}`}
                onClick={() => !taken && onSeatToggle(id)}
                disabled={taken}
                title={id}
              >
                {id}
              </button>
            );
          })
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: 'var(--seat-empty)', borderRadius: '4px' }}></div> 예매가능
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: 'var(--seat-taken)', borderRadius: '4px' }}></div> 예매완료
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: 'var(--seat-selected)', borderRadius: '4px' }}></div> 선택됨
        </span>
      </div>
    </div>
  );
}
