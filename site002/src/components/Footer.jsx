import React from 'react';
import { Plane } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">
            <Plane size={24} />
            BlueSky
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            당신의 완벽한 여행을 위한 첫걸음.<br/>
            어디로든 떠나고 싶을 때, BlueSky와 함께하세요.
          </p>
        </div>
        <div className="footer-col">
          <h4>회사 소개</h4>
          <ul>
            <li><a href="#">BlueSky 정보</a></li>
            <li><a href="#">채용 정보</a></li>
            <li><a href="#">파트너 제휴</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>고객 지원</h4>
          <ul>
            <li><a href="#">자주 묻는 질문</a></li>
            <li><a href="#">예약 확인 및 취소</a></li>
            <li><a href="#">고객 센터 연락처</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>법적 고지</h4>
          <ul>
            <li><a href="#">이용 약관</a></li>
            <li><a href="#">개인정보 처리방침</a></li>
            <li><a href="#">쿠키 정책</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2024 BlueSky Travel. All rights reserved. | site002 (포트: 9221)
      </div>
    </footer>
  );
}
