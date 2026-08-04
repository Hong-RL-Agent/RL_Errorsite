import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="logo flex items-center gap-10" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#1a1a1a' }}>
              <BarChart3 color="#007bff" />
              <span>TECHSTORE</span>
            </div>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>최고의 전자제품 쇼핑 경험을 선사합니다. 정품 보장 및 최저가 경쟁력을 확인하세요.</p>
          </div>
          <div className="footer-section">
            <h4>고객 센터</h4>
            <ul>
              <li>1588-XXXX (평일 09:00 - 18:00)</li>
              <li>1:1 문의</li>
              <li>배송 안내</li>
              <li>A/S 안내</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>커뮤니티</h4>
            <ul>
              <li>체험단 모집</li>
              <li>제품 리뷰</li>
              <li>이벤트/기획전</li>
              <li>중고 마켓</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>기업 서비스</h4>
            <ul>
              <li>대량 구매 문의</li>
              <li>파트너십 신청</li>
              <li>채용 안내</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '12px', color: '#999', textAlign: 'center' }}>
          &copy; 2023 TechStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
