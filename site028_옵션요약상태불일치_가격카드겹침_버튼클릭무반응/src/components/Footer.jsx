import React from 'react';

const noop = (e) => { e.preventDefault(); alert('준비중입니다.'); };

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-mark">◈</span> PremiRide
          </div>
          <p className="footer-tagline">프리미엄 모빌리티 서비스<br />전국 15개 지점 운영</p>
          <div className="footer-contact">
            <div>📞 1588-0000</div>
            <div>✉️ support@premiride.com</div>
            <div>⏰ 24시간 365일 운영</div>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>보험 안내</h4>
          <ul>
            <li><a href="#" onClick={noop}>기본 보험 약관</a></li>
            <li><a href="#" onClick={noop}>일반 보험 안내</a></li>
            <li><a href="#" onClick={noop}>프리미엄 보험 안내</a></li>
            <li><a href="#" onClick={noop}>사고 접수 방법</a></li>
            <li><a href="#" onClick={noop}>긴급출동 서비스</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>렌트 조건</h4>
          <ul>
            <li><a href="#" onClick={noop}>대여 자격 요건</a></li>
            <li><a href="#" onClick={noop}>연령 제한 안내</a></li>
            <li><a href="#" onClick={noop}>취소 및 환불 정책</a></li>
            <li><a href="#" onClick={noop}>유류 정책</a></li>
            <li><a href="#" onClick={noop}>이용 약관</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>지점 안내</h4>
          <ul>
            <li><a href="#" onClick={noop}>강남점</a></li>
            <li><a href="#" onClick={noop}>홍대점</a></li>
            <li><a href="#" onClick={noop}>판교점</a></li>
            <li><a href="#" onClick={noop}>서울역점</a></li>
            <li><a href="#" onClick={noop}>전국 지점 보기</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>고객센터</h4>
          <ul>
            <li><a href="#" onClick={noop}>자주 묻는 질문</a></li>
            <li><a href="#" onClick={noop}>온라인 상담</a></li>
            <li><a href="#" onClick={noop}>예약 확인/변경</a></li>
            <li><a href="#" onClick={noop}>블랙박스 서비스</a></li>
            <li><a href="#" onClick={noop}>법인 렌트 문의</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2024 PremiRide Co., Ltd. All rights reserved.</p>
        <div className="footer-legal-links">
          <a href="#" onClick={noop}>개인정보처리방침</a>
          <a href="#" onClick={noop}>서비스 이용약관</a>
          <a href="#" onClick={noop}>사업자 정보</a>
          <a href="#" onClick={noop}>쿠키 정책</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
