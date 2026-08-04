import React from 'react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">BookHaven</div>
            <p className="footer-desc">
              책으로 연결되는 세상.<br />
              당신의 이야기를 BookHaven에서 시작하세요.<br />
              베스트셀러부터 희귀 도서까지, 모든 책이 여기에 있습니다.
            </p>
          </div>
          <div className="footer-col">
            <h4>서비스</h4>
            <ul>
              <li><a href="#">베스트셀러</a></li>
              <li><a href="#">신간 도서</a></li>
              <li><a href="#">전자책</a></li>
              <li><a href="#">오디오북</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>고객 지원</h4>
            <ul>
              <li><a href="#">자주 묻는 질문</a></li>
              <li><a href="#">주문 조회</a></li>
              <li><a href="#">반품/교환</a></li>
              <li><a href="#">고객센터</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>회사 정보</h4>
            <ul>
              <li><a href="#">회사 소개</a></li>
              <li><a href="#">채용 정보</a></li>
              <li><a href="#">이용약관</a></li>
              <li><a href="#">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 BookHaven. All rights reserved. | site001 (포트: 9220)</p>
        </div>
      </div>
    </footer>
  )
}
