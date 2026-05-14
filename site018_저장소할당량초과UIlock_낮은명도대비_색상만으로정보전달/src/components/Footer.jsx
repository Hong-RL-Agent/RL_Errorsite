import React from 'react';
import { Map, Phone, Shield, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo" style={{color: 'white', marginBottom: '1rem'}}>
            <Map size={28} />
            <span>TripPlanner</span>
          </div>
          <p style={{color: '#94a3b8', fontSize: '0.875rem'}}>세상의 모든 여행을 특별하게 만들어 드립니다.<br/>가장 완벽한 일정을 계획하세요.</p>
        </div>
        
        <div>
          <h4 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>고객 센터</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            <li className="flex items-center gap-2" style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}><Phone size={16} /> 1588-0000</li>
            <li className="flex items-center gap-2" style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}><Shield size={16} /> 여행자 보험 안내</li>
            <li style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}>자주 묻는 질문 (FAQ)</li>
          </ul>
        </div>
        
        <div>
          <h4 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>모바일 앱 다운로드</h4>
          <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1rem'}}>언제 어디서나 일정을 확인하세요.</p>
          <button className="btn flex items-center justify-center gap-2" style={{background: 'rgba(255,255,255,0.1)', color: 'white', width: '100%', border: '1px solid rgba(255,255,255,0.2)'}} onClick={() => alert('준비중입니다.')}>
            <Smartphone size={18} /> App Store
          </button>
          <button className="btn flex items-center justify-center gap-2" style={{background: 'rgba(255,255,255,0.1)', color: 'white', width: '100%', border: '1px solid rgba(255,255,255,0.2)', marginTop: '0.5rem'}} onClick={() => alert('준비중입니다.')}>
            <Smartphone size={18} /> Google Play
          </button>
        </div>
      </div>
      <div className="container" style={{marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b', fontSize: '0.875rem'}}>
        &copy; 2026 TripPlanner Inc. All rights reserved.
      </div>
    </footer>
  );
}
