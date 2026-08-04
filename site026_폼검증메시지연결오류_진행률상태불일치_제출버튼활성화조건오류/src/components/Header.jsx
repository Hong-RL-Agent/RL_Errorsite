import React from 'react';
import { ClipboardList, Search, Bell, User, Layout } from 'lucide-react';

export default function Header() {
  return (
    <header>
      <div className="container flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo flex items-center gap-10" style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }} onClick={() => alert('메인으로 이동합니다.')}>
          <ClipboardList size={32} color="var(--primary)" />
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>InsightForm</span>
        </div>
        
        <div className="flex-1 mx-40" style={{ flex: 1, margin: '0 40px', position: 'relative', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="설문 템플릿 검색..." 
            style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '14px' }}
          />
          <Search size={18} color="#999" style={{ position: 'absolute', left: '15px', top: '10px' }} />
        </div>

        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '25px', fontWeight: 600, fontSize: '15px', padding: 0 }}>
            <li style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => alert('설문 제작 페이지는 준비중입니다.')}>만들기</li>
            <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>템플릿</li>
            <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>내 설문</li>
          </ul>
        </nav>

        <div className="flex items-center gap-20" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginLeft: '30px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => alert('알림 목록은 준비중입니다.')}><Bell size={20} /></button>
          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => alert('프로필 메뉴는 준비중입니다.')}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
