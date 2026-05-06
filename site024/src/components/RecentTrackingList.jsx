import React from 'react';
import { History, ArrowRight } from 'lucide-react';

export default function RecentTrackingList({ trackings, onSelect }) {
  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-10" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <History size={18} />
        <h3 style={{ fontSize: '18px', margin: 0 }}>최근 조회 내역</h3>
      </div>
      
      <div className="flex flex-col gap-10" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trackings.map(item => (
          <div 
            key={item.invoice} 
            className="flex justify-between items-center" 
            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer' }}
            onClick={() => onSelect(item.invoice)}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.invoice}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.status} • {item.time}</div>
            </div>
            <ArrowRight size={16} color="#94a3b8" />
          </div>
        ))}
      </div>
    </div>
  );
}
