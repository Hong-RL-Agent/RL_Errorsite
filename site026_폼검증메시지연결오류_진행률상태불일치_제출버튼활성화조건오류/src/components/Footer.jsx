import React from 'react';

export default function Footer() {
  return (
    <footer style={{ marginTop: '100px', padding: '60px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)', marginBottom: '20px' }}>InsightForm</div>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>당신의 데이터에 가치를 더하는 스마트 설문 플랫폼.<br/>InsightForm과 함께 세상을 읽는 통찰력을 얻으세요.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '20px' }}>제품</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', lineHeight: 2.2, color: '#64748b' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>설문 템플릿</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>API 문서</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>기업용 요금제</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '20px' }}>고객센터</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', lineHeight: 2.2, color: '#64748b' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>자주 묻는 질문</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>1:1 문의</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>이용 안내</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '20px' }}>정책</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', lineHeight: 2.2, color: '#64748b' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>이용약관</li>
              <li style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }} onClick={() => alert('준비중입니다.')}>개인정보 처리방침</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>운영 정책</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          &copy; 2026 InsightForm Inc. All rights reserved. 사업자번호 456-88-00123
        </div>
      </div>
    </footer>
  );
}
