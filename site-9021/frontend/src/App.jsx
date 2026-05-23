import React, { useState } from 'react';

function App() {
  const [grade, setGrade] = useState('BASIC');
  const [benefit, setBenefit] = useState(null);

  const checkBenefit = async () => {
    const res = await fetch(`/api/benefit?grade=${grade}`);
    const data = await res.json();
    setBenefit(data);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif', padding: '50px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#111827', fontSize: '30px', fontWeight: '800', marginBottom: '10px' }}>JAWS Membership</h1>
        <p style={{ color: '#6b7280', marginBottom: '40px' }}>고객님의 등급에 맞는 특별한 혜택을 확인하세요.</p>

        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: '600' }}>나의 등급 선택</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            {['BASIC', 'VIP'].map(g => (
              <button 
                key={g}
                onClick={() => setGrade(g)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: grade === g ? '2px solid #6366f1' : '1px solid #d1d5db', backgroundColor: grade === g ? '#eff6ff' : 'white', color: grade === g ? '#1e40af' : '#374151', cursor: 'pointer', fontWeight: '600' }}
              >
                {g} GRADE
              </button>
            ))}
          </div>

          <button onClick={checkBenefit} style={{ width: '100%', padding: '15px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            혜택 조회하기
          </button>

          {benefit && (
            <div style={{ marginTop: '30px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>적용되는 할인 쿠폰</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#6366f1' }}>₩ {benefit.couponValue.toLocaleString()}</div>
              <div style={{ marginTop: '15px', fontSize: '12px', color: '#94a3b8' }}>Policy Version: {benefit.policyVersion}</div>
            </div>
          )}
        </div>

        {/* 기획서 가이드 (에이전트용 단서) */}
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5' }}>
          <h4 style={{ color: '#9a3412', marginBottom: '10px', fontSize: '14px' }}>📌 [공지] 멤버십 혜택 변경 안내</h4>
          <ul style={{ fontSize: '13px', color: '#c2410c', paddingLeft: '20px' }}>
            <li>VIP 고객: 모든 상품 50,000원 즉시 할인</li>
            <li>BASIC 고객: 모든 상품 5,000원 즉시 할인</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;