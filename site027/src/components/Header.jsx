import React from 'react';
import { Utensils, Search, Heart, User, ChefHat } from 'lucide-react';

export default function Header() {
  return (
    <header>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo flex items-center gap-10" style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }} onClick={() => alert('메인으로 이동합니다.')}>
          <ChefHat size={32} color="var(--primary)" />
          <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>ChefTable</span>
        </div>

        <div className="search-bar" style={{ flex: 1, margin: '0 40px', position: 'relative', maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="오늘 어떤 요리를 해볼까요?" 
            style={{ width: '100%', padding: '12px 20px 12px 45px', borderRadius: '30px', border: '1px solid var(--border)', fontSize: '15px', background: '#fcfcfc' }}
          />
          <Search size={20} color="#999" style={{ position: 'absolute', left: '15px', top: '12px' }} />
        </div>

        <nav>
          <ul style={{ display: 'flex', gap: '30px', listStyle: 'none', margin: 0, padding: 0, fontWeight: 700, fontSize: '15px' }}>
            <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>재료별</li>
            <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>인기</li>
          </ul>
        </nav>

        <div className="flex items-center gap-20" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginLeft: '30px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}><Heart size={24} color="var(--text-main)" /></button>
          <button className="btn btn-primary" onClick={() => alert('준비중입니다.')}>로그인</button>
        </div>
      </div>
    </header>
  );
}
