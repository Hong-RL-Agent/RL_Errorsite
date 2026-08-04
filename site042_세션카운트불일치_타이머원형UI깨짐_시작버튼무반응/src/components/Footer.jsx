import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>FocusHub</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              당신의 몰입을 돕는 최고의 생산성 파트너.<br />
              © 2026 FocusHub Inc.
            </p>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#" onClick={(e) => {e.preventDefault(); alert('이용 가이드 페이지로 이동합니다.');}}>이용 가이드</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); alert('단축키 안내 페이지로 이동합니다.');}}>단축키 안내</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); alert('블로그로 이동합니다.');}}>블로그</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#" onClick={(e) => {e.preventDefault(); alert('개인정보 처리방침 페이지로 이동합니다.');}}>개인정보 처리방침</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); alert('서비스 이용약관 페이지로 이동합니다.');}}>서비스 이용약관</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#" onClick={(e) => {e.preventDefault(); alert('고객센터로 이동합니다.');}}>고객센터</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); alert('자주 묻는 질문으로 이동합니다.');}}>FAQ</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
