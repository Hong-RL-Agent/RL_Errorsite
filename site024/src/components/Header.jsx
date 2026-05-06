import React from 'react';
import { Package, Bell, HelpCircle, User } from 'lucide-react';

export default function Header() {
  return (
    <header>
      <div className="container flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo flex items-center gap-10" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Package size={32} />
          <span>BLUELOGISTICS</span>
        </div>
        
        <nav>
          <ul className="flex gap-30" style={{ display: 'flex', listStyle: 'none', gap: '30px', fontWeight: 600, fontSize: '15px' }}>
            <li style={{ cursor: 'pointer', color: 'var(--primary)' }}>배송조회</li>
            <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>택배예약</li>
            <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>고객센터</li>
          </ul>
        </nav>

        <div className="flex items-center gap-20" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => alert('알림함이 비어있습니다.')}><Bell size={20} /></button>
          <button onClick={() => alert('준비중입니다.')}><HelpCircle size={20} /></button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifycenter: 'center' }}>
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
