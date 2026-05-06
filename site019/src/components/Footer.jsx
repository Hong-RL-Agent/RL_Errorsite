import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{display: 'flex', flexWrap: 'wrap', gap: '3rem'}}>
        <div style={{flex: '1 1 250px'}}>
          <div className="logo flex items-center gap-2" style={{color: 'var(--white)', marginBottom: '1rem'}}>
            <BookOpen size={28} />
            <span>EduConnect</span>
          </div>
          <p style={{color: '#94a3b8', fontSize: '0.875rem'}}>배움의 즐거움을 모두에게.<br/>가장 확실한 성장의 파트너가 되겠습니다.</p>
        </div>
        
        <div style={{flex: '1 1 150px'}}>
          <h4 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>고객 센터</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>자주 묻는 질문</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>1:1 문의</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>이용약관</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>개인정보처리방침</button></li>
          </ul>
        </div>
        
        <div style={{flex: '1 1 150px'}}>
          <h4 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>강사 지원</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>강사 지원하기</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>가이드센터</button></li>
          </ul>
        </div>

        <div style={{flex: '1 1 150px'}}>
          <h4 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>기업 교육</h4>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.875rem'}}>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>기업 교육 문의</button></li>
            <li><button onClick={() => alert('준비중입니다.')} style={{color: 'inherit'}}>b2b 제휴 안내</button></li>
          </ul>
        </div>
      </div>
      <div className="container" style={{marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b', fontSize: '0.875rem'}}>
        &copy; 2026 EduConnect. All rights reserved.
      </div>
    </footer>
  );
}
