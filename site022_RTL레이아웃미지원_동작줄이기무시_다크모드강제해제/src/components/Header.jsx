import React from 'react';
import { Search, Globe, User } from 'lucide-react';

export default function Header({ onRtlToggle, isRtl }) {
  return (
    <header>
      <div className="container flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-20" style={{ display: 'flex', gap: '20px' }}>
          <button className="btn btn-outline" onClick={() => alert('준비중입니다.')} style={{ background: 'none', border: '1px solid #ddd', cursor: 'pointer' }}>Subscribe</button>
          <div className="flex items-center gap-10" style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: 600 }}>
            <span>May 1, 2026</span>
          </div>
        </div>

        <div className="logo">GlobalNews</div>

        <div className="flex items-center gap-20" style={{ display: 'flex', gap: '20px' }}>
          <button 
            className={`btn ${isRtl ? 'btn-primary' : 'btn-outline'}`} 
            onClick={onRtlToggle}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isRtl ? '#e11d48' : 'none', color: isRtl ? 'white' : 'black', border: '1px solid #ddd' }}
          >
            <Globe size={18} /> RTL Preview
          </button>
          <button onClick={() => alert('준비중입니다.')}><Search size={22} /></button>
          <button onClick={() => alert('준비중입니다.')}><User size={22} /></button>
        </div>
      </div>
    </header>
  );
}
