import React from 'react';
import { MapPin, Phone, Truck, RotateCcw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>ELITE ACADEMY</h4>
            <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.8' }}>
              서울특별시 강남구 테헤란로 123<br />
              엘리트빌딩 4-6층<br />
              대표번호: 02-123-4567
            </p>
          </div>
          
          <div className="footer-col">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} /> 위치 안내</h4>
            <ul className="footer-links">
              <li>지하철 2호선 강남역 5번 출구</li>
              <li>버스정류장: 강남역사거리 정류장</li>
              <li>주차 안내: 건물 지하 주차장 이용</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={18} /> 셔틀 안내</h4>
            <ul className="footer-links">
              <li>A노선: 반포/잠원 방향</li>
              <li>B노선: 대치/도곡 방향</li>
              <li>C노선: 역삼/논현 방향</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={18} /> 환불 규정</h4>
            <ul className="footer-links">
              <li>수업 시작 전: 전액 환불</li>
              <li>1/3 경과 전: 2/3 환불</li>
              <li>1/2 경과 전: 1/2 환불</li>
              <li>1/2 경과 후: 환불 불가</li>
            </ul>
          </div>
        </div>
        
        <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.85rem', opacity: 0.5 }}>
          © 2024 ELITE ACADEMY. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
