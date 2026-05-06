import React from 'react';
import { Search, ShoppingCart, User, MapPin, ChevronDown } from 'lucide-react';

export default function Header({ cartCount }) {
  return (
    <header>
      <div className="container flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-40" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => alert('메인으로 이동합니다.')}>QuickEats</div>
          <div className="flex items-center gap-8" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px' }} onClick={() => alert('주소지 설정 준비중입니다.')}>
            <MapPin size={18} color="var(--primary)" />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>서울특별시 강남구 테헤란로 123</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="flex-1 mx-40" style={{ flex: 1, margin: '0 40px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="맛있는 음식을 검색해보세요" 
            style={{ width: '100%', padding: '12px 20px 12px 45px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px' }}
          />
          <Search size={20} color="#999" style={{ position: 'absolute', left: '15px', top: '12px' }} />
        </div>

        <div className="flex items-center gap-25" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => alert('장바구니 패널로 이동합니다.')}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>로그인</span>
          </button>
        </div>
      </div>
    </header>
  );
}
