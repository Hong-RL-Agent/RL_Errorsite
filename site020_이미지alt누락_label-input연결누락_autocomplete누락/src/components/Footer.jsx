import React from 'react';
import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{display: 'flex', flexWrap: 'wrap', gap: '4rem'}}>
        <div style={{flex: '1 1 300px'}}>
          <div className="logo flex items-center gap-2" style={{color: 'var(--white)', marginBottom: '1rem'}}>
            <Building2 size={28} />
            <span>StayPremium</span>
          </div>
          <p style={{color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6}}>
            전 세계 50,000여 개의 럭셔리 호텔과 리조트.<br/>당신의 완벽한 휴식을 위한 프리미엄 큐레이션.
          </p>
        </div>
        
        <div style={{flex: '1 1 150px'}}>
          <h4 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--secondary)'}}>고객 지원</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>고객센터 1588-0000</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>예약 취소 정책</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>자주 묻는 질문</button></li>
          </ul>
        </div>
        
        <div style={{flex: '1 1 150px'}}>
          <h4 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--secondary)'}}>파트너십</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>호텔 파트너 등록</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>B2B 기업 제휴</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>어필리에이트 프로그램</button></li>
          </ul>
        </div>

        <div style={{flex: '1 1 200px'}}>
          <h4 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--secondary)'}}>모바일 앱</h4>
          <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1rem'}}>앱 전용 시크릿 특가를 만나보세요.</p>
          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="btn btn-outline" style={{padding: '0.5rem 1rem', borderColor: 'rgba(255,255,255,0.2)', color: 'white'}} onClick={() => alert('준비중입니다.')}>iOS 앱</button>
            <button className="btn btn-outline" style={{padding: '0.5rem 1rem', borderColor: 'rgba(255,255,255,0.2)', color: 'white'}} onClick={() => alert('준비중입니다.')}>Android 앱</button>
          </div>
        </div>
      </div>
      
      <div className="container" style={{marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b', fontSize: '0.875rem'}}>
        &copy; 2026 StayPremium. All rights reserved.
      </div>
    </footer>
  );
}
