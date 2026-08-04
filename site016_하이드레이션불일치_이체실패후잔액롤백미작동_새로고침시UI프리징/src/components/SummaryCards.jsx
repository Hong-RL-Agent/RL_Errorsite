import React, { useState, useEffect } from 'react';

function SummaryCards({ account }) {
  const [exchangeRate, setExchangeRate] = useState('1,340.50');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // INTENTIONAL GUI BUG: site016-bug01
    // SSR/CSR 하이드레이션 불일치 시뮬레이션
    // 초기 렌더링 시에는 서버값을 따르는 척 하다가 마운트 후 값을 변경하며 레이아웃을 틀어지게 함.
    setIsClient(true);
    setExchangeRate('1,352.20');
  }, []);

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '8px' }}>Total Balance</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          ₩ {account?.balance?.toLocaleString() || '---'}
        </div>
      </div>

      <div className="summary-card">
        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '8px' }}>Account Number</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{account?.accountNumber || '---'}</div>
      </div>

      <div className="summary-card" data-bug-id="site016-bug01">
        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '8px' }}>Today's USD Rate</div>
        
        {/* HYDRATION BUG REPRODUCTION: 
            Initially renders a simple span. After hydration, it renders an absolute positioned container
            that causes visual overlap if not handled correctly.
        */}
        <div className="buggy-hydration-container">
          {!isClient ? (
             <span>Loading rate...</span>
          ) : (
            <>
              <span style={{ color: '#10B981', fontWeight: 700 }}>USD {exchangeRate}</span>
              <span style={{ fontSize: '0.7rem', color: '#999', marginTop: '18px' }}> (Live Update)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
