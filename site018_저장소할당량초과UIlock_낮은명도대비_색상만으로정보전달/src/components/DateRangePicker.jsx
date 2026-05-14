import React, { useState } from 'react';

// A simple mock for DateRangePicker requested in the prompt
export default function DateRangePicker() {
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState({ start: '', end: '' });

  return (
    <div style={{position: 'relative', marginTop: '1rem', background: 'var(--white)', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
      <div className="flex justify-between items-center">
        <h4 style={{fontSize: '1rem'}}>일정 필터</h4>
        <button className="btn btn-outline" onClick={() => setOpen(!open)}>
          {open ? '필터 닫기' : '상세 필터 열기'}
        </button>
      </div>
      
      {open && (
        <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
          <div className="flex items-center gap-2">
            <label style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>시작일:</label>
            <input type="date" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} style={{padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px'}} />
          </div>
          <div className="flex items-center gap-2">
            <label style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>종료일:</label>
            <input type="date" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} style={{padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px'}} />
          </div>
          <button className="btn btn-primary" onClick={() => alert('준비중입니다.')}>적용</button>
        </div>
      )}
    </div>
  );
}
