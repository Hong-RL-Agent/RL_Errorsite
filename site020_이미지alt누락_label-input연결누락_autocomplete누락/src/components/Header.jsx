import React, { useState } from 'react';
import { Building2, User, ChevronDown } from 'lucide-react';

export default function Header() {
  const [guestsOpen, setGuestsOpen] = useState(false);

  return (
    <header className="header">
      <div className="container flex justify-between items-center">
        <div className="logo flex items-center gap-2">
          <Building2 size={28} />
          <span>StayPremium</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <button className="font-semibold text-main" onClick={() => alert('준비중입니다.')}>특가 상품</button>
          <button className="font-semibold text-main" onClick={() => alert('준비중입니다.')}>예약 확인</button>
          
          <div style={{position: 'relative'}}>
            <button 
              className="flex items-center gap-1 font-semibold text-main" 
              onClick={() => setGuestsOpen(!guestsOpen)}
            >
              인원/객실 <ChevronDown size={16} />
            </button>
            {guestsOpen && (
              <div style={{position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'white', padding: '1rem', borderRadius: '4px', boxShadow: 'var(--shadow-md)', minWidth: '200px'}}>
                <div className="flex justify-between items-center" style={{marginBottom: '0.5rem'}}>
                  <span>성인</span>
                  <div className="flex gap-2 items-center">
                    <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem'}}>-</button>
                    <span>2</span>
                    <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem'}}>+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>아동</span>
                  <div className="flex gap-2 items-center">
                    <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem'}}>-</button>
                    <span>0</span>
                    <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem'}}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button className="btn btn-outline flex items-center gap-2" onClick={() => alert('준비중입니다.')}>
            <User size={18} /> 로그인
          </button>
        </nav>
      </div>
    </header>
  );
}
