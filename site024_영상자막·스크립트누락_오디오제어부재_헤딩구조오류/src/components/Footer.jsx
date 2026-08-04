import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div className="logo" style={{ marginBottom: '20px' }}>BLUELOGISTICS</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>세상 모든 것을 연결하는 가장 빠른 방법. BlueLogistics가 함께합니다.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>서비스 안내</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              <li style={{ marginBottom: '10px' }}>배송 조회</li>
              <li style={{ marginBottom: '10px' }}>택배 예약</li>
              <li style={{ marginBottom: '10px' }}>편의점 택배</li>
              <li>글로벌 배송</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>고객 지원</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              <li style={{ marginBottom: '10px' }}>자주 묻는 질문</li>
              <li style={{ marginBottom: '10px' }}>1:1 문의하기</li>
              <li style={{ marginBottom: '10px' }}>분실/파손 보상</li>
              <li>영업점 안내</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>약관 및 정책</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              <li style={{ marginBottom: '10px' }}>이용약관</li>
              <li style={{ marginBottom: '10px' }}>개인정보처리방침</li>
              <li style={{ marginBottom: '10px' }}>배송정책</li>
              <li>사업자 정보</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          &copy; 2026 BlueLogistics Corp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
