import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '20px' }}>NatureCamp</h2>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
              자연과 함께하는 소중한 시간,<br/>
              NatureCamp가 함께합니다.
            </p>
          </div>
          <div className="footer-col">
            <h4>고객지원</h4>
            <ul>
              <li><a href="#">자주 묻는 질문</a></li>
              <li><a href="#">1:1 문의하기</a></li>
              <li><a href="#">이용 수칙 가이드</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>약관 및 정책</h4>
            <ul>
              <li><a href="#">서비스 이용약관</a></li>
              <li><a href="#">개인정보 처리방침</a></li>
              <li><a href="#">환불 정책 안내</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>연락처</h4>
            <p style={{ fontSize: '0.9rem' }}>
              서울특별시 캠핑구 자연로 123<br/>
              Tel: 1588-0000<br/>
              Email: info@naturecamp.com
            </p>
          </div>
        </div>
        <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #444', textAlign: 'center', fontSize: '0.8rem' }}>
          &copy; 2026 NatureCamp Corp. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
