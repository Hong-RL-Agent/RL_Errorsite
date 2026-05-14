import React from 'react';

export default function Footer() {
  return (
    <footer style={{ marginTop: '80px', padding: '60px 0', background: '#333', color: '#ccc' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginBottom: '20px' }}>QuickEats</div>
            <p style={{ fontSize: '14px', lineHeight: 1.6 }}>맛있는 즐거움이 가득한 곳, 퀵이츠.<br/>언제 어디서나 최고의 미식 경험을 배달해 드립니다.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>고객센터</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: 2 }}>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>자주 묻는 질문</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>1:1 문의</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>배달 안내</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>분실/파손 신고</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>비즈니스</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: 2 }}>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>입점 문의</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>사장님 광장</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>라이더 지원</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>광고 문의</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>약관</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: 2 }}>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>이용약관</li>
              <li style={{ color: 'white', fontWeight: 700, cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>개인정보처리방침</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>청소년보호정책</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>운영정책</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #444', fontSize: '12px', textAlign: 'center' }}>
          &copy; 2026 QuickEats Korea. All rights reserved. 사업자번호 123-45-67890
        </div>
      </div>
    </footer>
  );
}
